const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { verifyUser, checkRole } = require('../middleware/auth');
const { sendWhatsAppMessage } = require('../utils/whatsapp');

// Place Order
router.post('/', verifyUser, async (req, res) => {
    try {
        const { items, totalAmount, pickupTime } = req.body;
        console.log('Placing Order - User:', req.user._id);
        console.log('Placing Order - Items:', JSON.stringify(items));
        console.log('Placing Order - Amount:', totalAmount);
        console.log('Placing Order - Pickup:', pickupTime);

        const order = new Order({
            user: req.user._id,
            items,
            totalAmount,
            pickupTime
        });

        await order.save();
        console.log('Order saved successfully:', order._id);
        res.status(201).json(order);
    } catch (err) {
        console.error('Error placing order:', err);
        res.status(500).json({ message: 'Error placing order', error: err.message });
    }
});

// Get My Orders
router.get('/mine', verifyUser, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id })
            .populate('items.product')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching orders' });
    }
});

// Get Active & Recently Completed Orders (Staff/Admin)
router.get('/staff/active', verifyUser, checkRole(['admin', 'staff']), async (req, res) => {
    try {
        // Fetch all orders that are NOT cancelled
        // This includes pending, preparing, ready, and completed (til 24h TTL deletion)
        const orders = await Order.find({
            status: { $ne: 'cancelled' }
        })
            .populate('items.product')
            .populate('user', 'name email phone cabinNumber department role')
            .sort({ createdAt: -1 }); // Newest first for easier history tracking

        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching active orders', error: err.message });
    }
});

// Update Order Status (Staff/Admin)
router.put('/:id/status', verifyUser, checkRole(['admin', 'staff']), async (req, res) => {
    try {
        const { status } = req.body;
        let update = { $set: { status } };

        // If status is completed, set it to expire in 24 hours
        if (status === 'completed') {
            update.$set.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        } else {
            // If moved away from completed (e.g. error correction), remove expiry
            update.$unset = { expiresAt: "" };
        }

        const order = await Order.findByIdAndUpdate(req.params.id, update, { new: true })
            .populate('user', 'name phone role')
            .populate('items.product', 'name');

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
                sendWhatsAppMessage(order.user.phone, message).catch(err => console.error('Error triggering status WhatsApp message:', err));
            }
        }

        res.json(order);
    } catch (err) {
        res.status(500).json({ message: 'Error updating order status', error: err.message });
    }
});

const Razorpay = require('razorpay');
const crypto = require('crypto');

let razorpay;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
    });
} else {
    console.warn('⚠️ WARNING: Razorpay keys are missing. Payment routes will not function properly.');
}

// Create Razorpay Order
router.post('/razorpay', verifyUser, async (req, res) => {
    if (!razorpay) {
        return res.status(503).json({ message: 'Payment gateway not configured' });
    }
    try {
        const { amount } = req.body;
        const options = {
            amount: Math.round(amount * 100), // amount in smallest currency unit (paise)
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);
        res.json({ ...order, key_id: process.env.RAZORPAY_KEY_ID });
    } catch (err) {
        console.error('Razorpay Error:', err);
        res.status(500).json({ message: 'Error creating payment order', error: err.message });
    }
});

// Verify Payment
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

        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest("hex");

        if (razorpay_signature === expectedSign) {
            // Payment verified, now save the order to DB
            const order = new Order({
                user: req.user._id,
                items: orderData.items,
                totalAmount: orderData.totalAmount,
                pickupTime: orderData.pickupTime,
                orderType: orderData.orderType || 'pickup',
                paymentStatus: 'paid',
                razorpayOrderId: razorpay_order_id,
                razorpayPaymentId: razorpay_payment_id,
                razorpaySignature: razorpay_signature
            });

            await order.save();

            // Populate user and items to generate message detail
            const populatedOrder = await Order.findById(order._id)
                .populate('user', 'name phone cabinNumber role')
                .populate('items.product', 'name');

            if (populatedOrder && populatedOrder.user?.phone) {
                const itemsList = populatedOrder.items.map(item => `- ${item.quantity}x ${item.product?.name || 'Item'}`).join('\n');
                const pickupText = populatedOrder.cabinNumber ? `Cabin ${populatedOrder.cabinNumber}` : populatedOrder.pickupTime;
                
                const message = `🍔 *Campus Bites - Order Placed!*\n\nHi ${populatedOrder.user.name || 'Customer'},\nYour order has been placed successfully!\n\n*Order ID*: #${populatedOrder._id.toString().slice(-6).toUpperCase()}\n*Items*:\n${itemsList}\n*Total Paid*: ₹${populatedOrder.totalAmount}\n*Delivery/Pickup Slot*: ${pickupText}\n\nWe will notify you when preparation starts. Thank you!`;
                
                sendWhatsAppMessage(populatedOrder.user.phone, message).catch(err => console.error('Error triggering verify WhatsApp message:', err));
            }

            return res.status(200).json({ message: "Payment verified successfully", order });
        } else {
            return res.status(400).json({ message: "Invalid payment signature" });
        }
    } catch (err) {
        console.error('Verification Error:', err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports = router;

// ─── Delivery Boy: Active delivery orders (ready for delivery) ───────────────
const authMid = require('../middleware/auth');

router.get('/delivery/active', authMid.verifyUser, authMid.checkRole(['delivery', 'admin', 'staff']), async (req, res) => {
    try {
        const orders = await Order.find({ status: { $in: ['ready', 'preparing', 'pending'] } })
            .populate('items.product', 'name price image category')
            .populate('user', 'name email phone cabinNumber department role')
            .sort({ createdAt: 1 }); // oldest first (FIFO delivery)
        
        // Only show orders that require cabin delivery
        const deliveryOrders = orders.filter(order => order.deliveryType === 'cabin' || (order.cabinNumber && order.cabinNumber.trim() !== ''));
        
        res.json(deliveryOrders);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching delivery orders', error: err.message });
    }
});

// Delivery boy marks order as delivered (completed)
router.put('/delivery/:id/complete', authMid.verifyUser, authMid.checkRole(['delivery', 'admin', 'staff']), async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { $set: { status: 'completed', expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) } },
            { new: true }
        ).populate('user', 'name phone role');

        if (!order) return res.status(404).json({ message: 'Order not found' });

        if (order.user?.phone) {
            const message = `✅ *Campus Bites - Delivered!*\n\nHi ${order.user.name},\nYour order #${order._id.toString().slice(-6).toUpperCase()} has been successfully delivered to Cabin ${order.cabinNumber || 'your cabin'}.\n\nEnjoy your meal!`;
            sendWhatsAppMessage(order.user.phone, message).catch(err => console.error('Error triggering delivery complete WhatsApp message:', err));
        }

        res.json({ message: 'Order marked as delivered', order });
    } catch (err) {
        res.status(500).json({ message: 'Error completing order', error: err.message });
    }
});
