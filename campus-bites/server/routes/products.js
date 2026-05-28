const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Product = require('../models/Product');
const { verifyUser, checkRole } = require('../middleware/auth');

// Get all products (Public)
router.get('/', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({ message: 'Database not connected' });
        }
        const { category } = req.query;
        let query = {};
        if (category && category !== 'All') {
            query.category = category;
        }
        const products = await Product.find(query);
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Create Product (Admin Only)
router.post('/', verifyUser, checkRole(['admin']), async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();
        res.status(201).json(product);
    } catch (err) {
        res.status(500).json({ message: 'Error creating product', error: err.message });
    }
});

// Update Product (Admin Only)
router.put('/:id', verifyUser, checkRole(['admin']), async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(product);
    } catch (err) {
        res.status(500).json({ message: 'Error updating product', error: err.message });
    }
});

// Delete Product (Admin Only)
router.delete('/:id', verifyUser, checkRole(['admin']), async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Product deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting product', error: err.message });
    }
});

// Seed Data (Public for prototype convenience, or Admin only)
router.post('/seed', async (req, res) => {
    try {
        await Product.deleteMany({});

        const seedProducts = [
            {
                name: 'Samosa',
                description: 'Crispy fried pastry with spiced potato filling',
                price: 20,
                category: 'Snacks',
                image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&auto=format&fit=crop&q=60'
            },
            {
                name: 'Vada Pav',
                description: 'Mumbai\'s favorite street food',
                price: 25,
                category: 'Snacks',
                image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=60'
            },
            {
                name: 'Vegetable Sandwich',
                description: 'Grilled vegetable sandwich',
                price: 40,
                category: 'Snacks',
                image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&auto=format&fit=crop&q=60'
            },
            {
                name: 'Veg Thali',
                description: 'Complete meal with rice, dal, and veggies',
                price: 80,
                category: 'Meals',
                image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60'
            },
            {
                name: 'Masala Chai',
                description: 'Spiced Indian tea',
                price: 15,
                category: 'Beverages',
                image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=500&auto=format&fit=crop&q=60'
            },
            {
                name: 'Cold Coffee',
                description: 'Chilled coffee with ice cream',
                price: 50,
                category: 'Beverages',
                image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500&auto=format&fit=crop&q=60'
            }
        ];

        await Product.insertMany(seedProducts);
        res.json({ message: 'Data seeded successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Seed error', error: err.message });
    }
});

module.exports = router;
