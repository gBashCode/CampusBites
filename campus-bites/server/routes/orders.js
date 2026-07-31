const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { verifyUser, checkRole } = require('../middleware/auth');
const { validateObjectId } = require('../utils/validators');
const { sendWhatsAppMessage } = require('../utils/whatsapp');
const Razorpay = require('razorpay');
const crypto = require('crypto');

// Valid status transitions
const VALID_STATUS_TRANSITIONS = {
    pending: ['preparing', 'cancelled'],
    preparing: ['ready', 'cancelled'],
    ready: ['completed'],
    completed: [],
    cancelled: []
};

let razorpay;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
    });
} else {
    console.warn('WARNING: Razorpay keys are missing. Payment routes will not function properly.');
}

// ─── Place Order ────────────────────────────────────────────────────────────
router.post('/', verifyUser, async (req, res) => {
    try {
        const { items, pickupTime, deliveryType, cabinNumber } = req.body;

        // Validate items array
        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'Order must contain at least one item' });
        }

        // Validate and recalculate from DB prices
        let totalAmount = 0;
        const validatedItems = [];

        for (const item of items) {
            if (!item.product || !validateObjectId(item.product)) {
                return res.status(400).json({ message: 'Invalid product ID in order' });
            }
            if (!item.quantity || typeof item.quantity !== 'number' || item.quantity < 1) {
                return res.status(400).json({ message: 'Invalid quantity for product' });
            }

            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(400).json({ message: `Product not found: ${item.product}` });
            }
            if (!product.isAvailable) {
                return res.status(400).json({ message: `${product.name} is currently unavailable` });
            }

            totalAmount += product.price * item.quantity;
            validatedItems.push({
                product: product._id,
                quantity: item.quantity,
                price: product.price // Use DB price, not client price
            });
        }

        // Add 5% tax
        totalAmount = Math.round(totalAmount * 1.05);

        const order = new Order({
            user: req.user._id,
            items: validatedItems,
            totalAmount,
            pickupTime: (typeof pickupTime === 'string' && pickupTime.trim()) || undefined,
            deliveryType: deliveryType === 'cabin' ? 'cabin' : 'pickup',
            cabinNumber: (typeof cabinNumber === 'string' && cabinNumber.trim()) || ''
        });

        await order.save();
        res.status(201).json(order);
    } catch (err) {
        console.error('Error placing order:', err.message);
        res.status(500).json({ message: 'Error placing order' });
    }
});

// ─── Get My Orders ──────────────────────────────────────────────────────────
router.get('/mine', verifyUser, async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit)));

        const orders = await Order.find({ user: req.user._id })
            .populate('items.product', 'name price image category isVeg')
            .sort({ createdAt: -1 })
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum);

        const total = await Order.countDocuments({ user: req.user._id });

        res.json({
            orders,
            pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) }
        });
    } catch (err) {
        console.error('Error fetching orders:', err.message);
        res.status(500).json({ message: 'Error fetching orders' });
    }
});

// ─── Get Active Orders (Staff/Admin) ────────────────────────────────────────
router.get('/staff/active', verifyUser, checkRole(['admin', 'staff']), async (req, res) => {
    try {
        const { status, page = 1, limit = 50 } = req.query;
        let query = { status: { $ne: 'cancelled' } };
        if (status && ['pending', 'preparing', 'ready', 'completed'].includes(status)) {
            query.status = status;
        }

        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit)));

        const [orders, total] = await Promise.all([
            Order.find(query)
                .populate('items.product', 'name price image')
                .populate('user', 'name email phone cabinNumber department role')
                .sort({ createdAt: -1 })
                .skip((pageNum - 1) * limitNum)
                .limit(limitNum),
            Order.countDocuments(query)
        ]);

        res.json({
            orders,
            pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) }
        });
    } catch (err) {
        console.error('Error fetching active orders:', err.message);
        res.status(500).json({ message: 'Error fetching active orders' });
    }
});

// ─── Update Order Status (Staff/Admin) ──────────────────────────────────────
router.put('/:id/status', verifyUser, checkRole(['admin', 'staff']), async (req, res) => {
    try {
        const { status } = req.body;

        if (!status || !['pending', 'preparing', 'ready', 'completed', 'cancelled'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        if (!validateObjectId(req.params.id)) {
            return res.status(400).json({ message: 'Invalid order ID' });
        }

        const currentOrder = await Order.findById(req.params.id);
        if (!currentOrder) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Validate status transition
        const allowedTransitions = VALID_STATUS_TRANSITIONS[currentOrder.status] || [];
        if (!allowedTransitions.includes(status)) {
            return res.status(400).json({ message: `Cannot transition from ${currentOrder.status} to ${status}` });
        }

        let update = { $set: { status } };
        if (status === 'completed') {
            update.$set.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        } else {
            update.$unset = { expiresAt: "" };
        }

        const order = await Order.findByIdAndUpdate(req.params.id, update, { new: true })
            .populate('user', 'name phone role cabinNumber')
            .populate('items.product', 'name');

        // Send WhatsApp notification
        if (order && order.user?.phone) {
            let statusEmoji = '🔔';
            let statusDesc = '';

            if (status === 'preparing') {
                statusEmoji = '👨‍🍳';
                statusDesc = 'Your meal is now being prepared by our chef.';
            } else if (status === 'ready') {
                statusEmoji = '📦';
                statusDesc = order.cabinNumber
                    ? `Your order is ready and has been dispatched for delivery to Cabin ${order.cabinNumber}!`
                    : 'Your order is ready for pickup! Please head to the main canteen counter.';
            } else if (status === 'completed') {
                statusEmoji = '✅';
                statusDesc = 'Your order has been handed over. Enjoy your delicious meal!';
            } else if (status === 'cancelled') {
                statusEmoji = '❌';
                statusDesc = 'Your order has been cancelled. If this is unexpected, please contact the canteen counter.';
            }

            if (statusDesc) {
                const message = `${statusEmoji} *Campus Bites - Order Update!*\n\nOrder ID: #${order._id.toString().slice(-6).toUpperCase()}\nStatus: *${status.toUpperCase()}*\n\n${statusDesc}\n\nThank you for choosing Campus Bites!`;
                sendWhatsAppMessage(order.user.phone, message).catch(() => {});
            }
        }

        res.json(order);
    } catch (err) {
        console.error('Error updating order status:', err.message);
        res.status(500).json({ message: 'Error updating order status' });
    }
});

// ─── Cancel Order (User can cancel their own pending/preparing orders) ──────
router.post('/:id/cancel', verifyUser, async (req, res) => {
    try {
        if (!validateObjectId(req.params.id)) {
            return res.status(400).json({ message: 'Invalid order ID' });
        }

        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to cancel this order' });
        }

        if (!['pending', 'preparing'].includes(order.status)) {
            return res.status(400).json({ message: 'Order cannot be cancelled in its current status' });
        }

        order.status = 'cancelled';
        await order.save();

        res.json({ message: 'Order cancelled', order });
    } catch (err) {
        console.error('Error cancelling order:', err.message);
        res.status(500).json({ message: 'Error cancelling order' });
    }
});

// ─── Create Razorpay Order ─────────────────────────────────────────────────
router.post('/razorpay', verifyUser, async (req, res) => {
    if (!razorpay) {
        return res.status(503).json({ message: 'Payment gateway not configured' });
    }
    try {
        const { amount } = req.body;
        if (typeof amount !== 'number' || amount <= 0 || amount > 100000) {
            return res.status(400).json({ message: 'Invalid payment amount' });
        }

        const options = {
            amount: Math.round(amount * 100),
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);
        res.json({ ...order, key_id: process.env.RAZORPAY_KEY_ID });
    } catch (err) {
        console.error('Razorpay Error:', err.message);
        res.status(500).json({ message: 'Error creating payment order' });
    }
});

// ─── Verify Payment ────────────────────────────────────────────────────────
router.post('/verify', verifyUser, async (req, res) => {
    if (!razorpay) {
        return res.status(503).json({ message: 'Payment gateway not configured' });
    }
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            orderData
        } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ message: 'Missing payment verification data' });
        }

        if (!orderData || !Array.isArray(orderData.items) || orderData.items.length === 0) {
            return res.status(400).json({ message: 'Invalid order data' });
        }

        // Timing-safe signature comparison
        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest("hex");

        const expectedBuffer = Buffer.from(expectedSign, 'hex');
        const receivedBuffer = Buffer.from(razorpay_signature, 'hex');

        if (expectedBuffer.length !== receivedBuffer.length || !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)) {
            return res.status(400).json({ message: "Invalid payment signature" });
        }

        // Recalculate total from DB prices (never trust client totalAmount)
        let totalAmount = 0;
        const validatedItems = [];

        for (const item of orderData.items) {
            if (!item.product || !validateObjectId(item.product)) {
                return res.status(400).json({ message: 'Invalid product in order data' });
            }
            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(400).json({ message: `Product not found: ${item.product}` });
            }
            totalAmount += product.price * (item.quantity || 1);
            validatedItems.push({
                product: product._id,
                quantity: item.quantity || 1,
                price: product.price
            });
        }

        totalAmount = Math.round(totalAmount * 1.05);

        const order = new Order({
            user: req.user._id,
            items: validatedItems,
            totalAmount,
            pickupTime: orderData.pickupTime || '',
            deliveryType: orderData.deliveryType || 'pickup',
            cabinNumber: orderData.cabinNumber || '',
            paymentStatus: 'paid',
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature
        });

        await order.save();

        // Populate for WhatsApp notification
        const populatedOrder = await Order.findById(order._id)
            .populate('user', 'name phone cabinNumber role')
            .populate('items.product', 'name');

        if (populatedOrder && populatedOrder.user?.phone) {
            const itemsList = populatedOrder.items.map(item => `- ${item.quantity}x ${item.product?.name || 'Item'}`).join('\n');
            const pickupText = populatedOrder.cabinNumber ? `Cabin ${populatedOrder.cabinNumber}` : populatedOrder.pickupTime;

            const message = `🍔 *Campus Bites - Order Placed!*\n\nHi ${populatedOrder.user.name || 'Customer'},\nYour order has been placed successfully!\n\n*Order ID*: #${populatedOrder._id.toString().slice(-6).toUpperCase()}\n*Items*:\n${itemsList}\n*Total Paid*: ₹${populatedOrder.totalAmount}\n*Delivery/Pickup Slot*: ${pickupText}\n\nWe will notify you when preparation starts. Thank you!`;

            sendWhatsAppMessage(populatedOrder.user.phone, message).catch(() => {});
        }

        return res.status(200).json({ message: "Payment verified successfully", order });
    } catch (err) {
        console.error('Verification Error:', err.message);
        res.status(500).json({ message: "Payment verification failed" });
    }
});

// ─── Delivery: Active delivery orders ──────────────────────────────────────
router.get('/delivery/active', verifyUser, checkRole(['delivery', 'admin', 'staff']), async (req, res) => {
    try {
        const orders = await Order.find({ status: { $in: ['ready', 'preparing', 'pending'] } })
            .populate('items.product', 'name price image category')
            .populate('user', 'name email phone cabinNumber department role')
            .sort({ createdAt: 1 });

        const deliveryOrders = orders.filter(order =>
            order.deliveryType === 'cabin' ||
            (order.cabinNumber && order.cabinNumber.trim() !== '')
        );

        res.json(deliveryOrders);
    } catch (err) {
        console.error('Error fetching delivery orders:', err.message);
        res.status(500).json({ message: 'Error fetching delivery orders' });
    }
});

// ─── Delivery: Mark order as delivered ─────────────────────────────────────
router.put('/delivery/:id/complete', verifyUser, checkRole(['delivery', 'admin', 'staff']), async (req, res) => {
    try {
        if (!validateObjectId(req.params.id)) {
            return res.status(400).json({ message: 'Invalid order ID' });
        }

        const currentOrder = await Order.findById(req.params.id);
        if (!currentOrder) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (currentOrder.status !== 'ready') {
            return res.status(400).json({ message: 'Order is not ready for delivery' });
        }

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { $set: { status: 'completed', expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) } },
            { new: true }
        ).populate('user', 'name phone role cabinNumber');

        if (order.user?.phone) {
            const message = `✅ *Campus Bites - Delivered!*\n\nHi ${order.user.name},\nYour order #${order._id.toString().slice(-6).toUpperCase()} has been successfully delivered to Cabin ${order.cabinNumber || 'your cabin'}.\n\nEnjoy your meal!`;
            sendWhatsAppMessage(order.user.phone, message).catch(() => {});
        }

        res.json({ message: 'Order marked as delivered', order });
    } catch (err) {
        console.error('Error completing order:', err.message);
        res.status(500).json({ message: 'Error completing order' });
    }
});

module.exports = router;
