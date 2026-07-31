const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Product = require('../models/Product');
const { verifyUser, checkRole } = require('../middleware/auth');
const { validateObjectId } = require('../utils/validators');

// Get all products (Public) — with search, pagination, filters
router.get('/', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({ message: 'Database not connected' });
        }
        const { category, search, isVeg, isAvailable, sort, page = 1, limit = 50 } = req.query;
        let query = {};

        if (category && category !== 'All') {
            const validCategories = ['Snacks', 'Meals', 'Beverages', 'Combos', 'Desserts'];
            if (validCategories.includes(category)) {
                query.category = category;
            }
        }
        if (search && typeof search === 'string' && search.trim()) {
            query.name = { $regex: search.trim(), $options: 'i' };
        }
        if (isVeg === 'true') query.isVeg = true;
        if (isVeg === 'false') query.isVeg = false;
        if (isAvailable !== undefined) query.isAvailable = isAvailable === 'true';

        let sortOption = { createdAt: -1 };
        if (sort === 'price_asc') sortOption = { price: 1 };
        else if (sort === 'price_desc') sortOption = { price: -1 };
        else if (sort === 'name') sortOption = { name: 1 };

        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
        const skip = (pageNum - 1) * limitNum;

        const [products, total] = await Promise.all([
            Product.find(query).sort(sortOption).skip(skip).limit(limitNum),
            Product.countDocuments(query)
        ]);

        res.json({
            products,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum)
            }
        });
    } catch (err) {
        console.error('Error fetching products:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get single product by ID (Public)
router.get('/:id', async (req, res) => {
    try {
        if (!validateObjectId(req.params.id)) {
            return res.status(400).json({ message: 'Invalid product ID' });
        }
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (err) {
        console.error('Error fetching product:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create Product (Admin Only) — whitelisted fields
router.post('/', verifyUser, checkRole(['admin']), async (req, res) => {
    try {
        const { name, description, price, category, image, isAvailable, isVeg, isBestSeller, isSpicy, isPopular } = req.body;

        if (!name || typeof name !== 'string' || name.trim().length < 1) {
            return res.status(400).json({ message: 'Product name is required' });
        }
        if (price === undefined || typeof price !== 'number' || price < 0) {
            return res.status(400).json({ message: 'Valid price is required' });
        }
        const validCategories = ['Snacks', 'Meals', 'Beverages', 'Combos', 'Desserts'];
        if (!category || !validCategories.includes(category)) {
            return res.status(400).json({ message: 'Valid category is required' });
        }

        const product = new Product({
            name: name.trim(),
            description: (description || '').trim(),
            price,
            category,
            image: (typeof image === 'string' && image.trim()) || undefined,
            isAvailable: typeof isAvailable === 'boolean' ? isAvailable : true,
            isVeg: typeof isVeg === 'boolean' ? isVeg : false,
            isBestSeller: typeof isBestSeller === 'boolean' ? isBestSeller : false,
            isSpicy: typeof isSpicy === 'boolean' ? isSpicy : false,
            isPopular: typeof isPopular === 'boolean' ? isPopular : false
        });
        await product.save();
        res.status(201).json(product);
    } catch (err) {
        console.error('Error creating product:', err.message);
        res.status(500).json({ message: 'Error creating product' });
    }
});

// Update Product (Admin Only) — whitelisted fields
router.put('/:id', verifyUser, checkRole(['admin']), async (req, res) => {
    try {
        if (!validateObjectId(req.params.id)) {
            return res.status(400).json({ message: 'Invalid product ID' });
        }

        const { name, description, price, category, image, isAvailable, isVeg, isBestSeller, isSpicy, isPopular } = req.body;
        const updates = {};

        if (name !== undefined) {
            if (typeof name !== 'string' || name.trim().length < 1) {
                return res.status(400).json({ message: 'Invalid product name' });
            }
            updates.name = name.trim();
        }
        if (description !== undefined) updates.description = String(description).trim();
        if (price !== undefined) {
            if (typeof price !== 'number' || price < 0) {
                return res.status(400).json({ message: 'Invalid price' });
            }
            updates.price = price;
        }
        if (category !== undefined) {
            const validCategories = ['Snacks', 'Meals', 'Beverages', 'Combos', 'Desserts'];
            if (!validCategories.includes(category)) {
                return res.status(400).json({ message: 'Invalid category' });
            }
            updates.category = category;
        }
        if (image !== undefined) updates.image = String(image).trim();
        if (isAvailable !== undefined) updates.isAvailable = Boolean(isAvailable);
        if (isVeg !== undefined) updates.isVeg = Boolean(isVeg);
        if (isBestSeller !== undefined) updates.isBestSeller = Boolean(isBestSeller);
        if (isSpicy !== undefined) updates.isSpicy = Boolean(isSpicy);
        if (isPopular !== undefined) updates.isPopular = Boolean(isPopular);

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: 'No valid fields to update' });
        }

        const product = await Product.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (err) {
        console.error('Error updating product:', err.message);
        res.status(500).json({ message: 'Error updating product' });
    }
});

// Delete Product (Admin Only)
router.delete('/:id', verifyUser, checkRole(['admin']), async (req, res) => {
    try {
        if (!validateObjectId(req.params.id)) {
            return res.status(400).json({ message: 'Invalid product ID' });
        }
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json({ message: 'Product deleted' });
    } catch (err) {
        console.error('Error deleting product:', err.message);
        res.status(500).json({ message: 'Error deleting product' });
    }
});

// Seed Data (Admin Only — protected)
router.post('/seed', verifyUser, checkRole(['admin']), async (req, res) => {
    try {
        await Product.deleteMany({});

        const seedProducts = [
            { name: 'Samosa', description: 'Crispy fried pastry with spiced potato filling', price: 20, category: 'Snacks', isVeg: true, isBestSeller: true, image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&auto=format&fit=crop&q=60' },
            { name: 'Vada Pav', description: "Mumbai's favorite street food", price: 25, category: 'Snacks', isVeg: true, isSpicy: true, image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=60' },
            { name: 'Vegetable Sandwich', description: 'Grilled vegetable sandwich', price: 40, category: 'Snacks', isVeg: true, image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&auto=format&fit=crop&q=60' },
            { name: 'Chicken Fried Rice', description: 'Wok-fried rice with tender chicken', price: 100, category: 'Meals', isVeg: false, isBestSeller: true, image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&auto=format&fit=crop&q=60' },
            { name: 'Veg Thali', description: 'Complete meal with rice, dal, and veggies', price: 80, category: 'Meals', isVeg: true, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60' },
            { name: 'Masala Chai', description: 'Spiced Indian tea', price: 15, category: 'Beverages', isVeg: true, isPopular: true, image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=500&auto=format&fit=crop&q=60' },
            { name: 'Cold Coffee', description: 'Chilled coffee with ice cream', price: 50, category: 'Beverages', isVeg: true, image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500&auto=format&fit=crop&q=60' },
            { name: 'Paneer Tikka', description: 'Grilled paneer cubes with spices', price: 120, category: 'Snacks', isVeg: true, isBestSeller: true, image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=500&auto=format&fit=crop&q=60' }
        ];

        await Product.insertMany(seedProducts);
        res.json({ message: 'Data seeded successfully', count: seedProducts.length });
    } catch (err) {
        console.error('Seed error:', err.message);
        res.status(500).json({ message: 'Seed error' });
    }
});

module.exports = router;
