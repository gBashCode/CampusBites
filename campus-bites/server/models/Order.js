const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true, default: 1, min: 1 },
        price: { type: Number, required: true, min: 0 }
    }],
    totalAmount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['pending', 'preparing', 'ready', 'completed', 'cancelled'], default: 'pending' },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    orderType: { type: String, enum: ['pickup', 'delivery'], default: 'pickup' },
    deliveryType: { type: String, enum: ['pickup', 'cabin'], default: 'pickup' },
    cabinNumber: { type: String, default: '' },
    pickupTime: { type: String },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    expiresAt: { type: Date }
}, { timestamps: true });

// TTL index for auto-deletion of completed orders
OrderSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
// Performance indexes
OrderSchema.index({ user: 1, createdAt: -1 });
OrderSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Order', OrderSchema);
