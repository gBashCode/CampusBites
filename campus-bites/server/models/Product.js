const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 1000 },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, enum: ['Snacks', 'Meals', 'Beverages', 'Combos', 'Desserts'] },
    image: { type: String, default: 'https://via.placeholder.com/150' },
    isAvailable: { type: Boolean, default: true },
    isVeg: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    isSpicy: { type: Boolean, default: false },
    isPopular: { type: Boolean, default: false }
}, { timestamps: true });

// Performance indexes
ProductSchema.index({ category: 1 });
ProductSchema.index({ isAvailable: 1 });
ProductSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Product', ProductSchema);
