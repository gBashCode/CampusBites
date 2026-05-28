const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true, default: 1 },
        price: { type: Number, required: true } // Snapshot of price at ordering
    }],
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'preparing', 'ready', 'completed', 'cancelled'], default: 'pending' },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    orderType: { type: String, default: 'pickup' },
    deliveryType: { type: String, enum: ['pickup', 'cabin'], default: 'pickup' },
    cabinNumber: { type: String, default: '' },
    pickupTime: { type: String },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    expiresAt: { type: Date } // For TIL deletion
}, { timestamps: true });

OrderSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Order', OrderSchema);
