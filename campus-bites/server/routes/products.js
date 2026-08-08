const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { verifyUser, checkRole } = require('../middleware/auth');

const VALID_CATEGORIES = ['Snacks', 'Meals', 'Beverages', 'Combos', 'Desserts'];

const isValidUUID = (id) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

const dbRowToProduct = (row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price,
    category: row.category,
    image: row.image,
    isAvailable: row.is_available,
    isVeg: row.is_veg,
    isBestSeller: row.is_bestseller,
    isSpicy: row.is_spicy,
    isPopular: row.is_popular,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
});

// GET / - Get all products (Public)
router.get('/', async (req, res) => {
    try {
        const { category, search, isVeg, isAvailable, sort, page = 1, limit = 50 } = req.query;

        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 50));
        const offset = (pageNum - 1) * limitNum;

        let whereClauses = [];
        let params = [];
        let paramIndex = 1;

        if (category && category !== 'All' && VALID_CATEGORIES.includes(category)) {
            whereClauses.push(`category = $${paramIndex++}`);
            params.push(category);
        }

        if (search && typeof search === 'string' && search.trim()) {
            whereClauses.push(`name ILIKE '%' || $${paramIndex++} || '%'`);
            params.push(search.trim());
        }

        if (isVeg === 'true') {
            whereClauses.push(`is_veg = $${paramIndex++}`);
            params.push(true);
        } else if (isVeg === 'false') {
            whereClauses.push(`is_veg = $${paramIndex++}`);
            params.push(false);
        }

        if (isAvailable !== undefined) {
            whereClauses.push(`is_available = $${paramIndex++}`);
            params.push(isAvailable === 'true');
        }

        const whereStr = whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : '';

        let orderBy = 'ORDER BY created_at DESC';
        if (sort === 'price_asc') orderBy = 'ORDER BY price ASC';
        else if (sort === 'price_desc') orderBy = 'ORDER BY price DESC';
        else if (sort === 'name') orderBy = 'ORDER BY name ASC';

        const countQuery = `SELECT COUNT(*) FROM products ${whereStr}`;
        const countResult = await query(countQuery, params);
        const total = parseInt(countResult.rows[0].count);

        const dataQuery = `SELECT * FROM products ${whereStr} ${orderBy} LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
        const dataResult = await query(dataQuery, [...params, limitNum, offset]);

        res.json({
            products: dataResult.rows.map(dbRowToProduct),
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum),
            },
        });
    } catch (err) {
        console.error('Error fetching products:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /:id - Get single product by ID (Public)
router.get('/:id', async (req, res) => {
    try {
        if (!isValidUUID(req.params.id)) {
            return res.status(400).json({ message: 'Invalid product ID' });
        }

        const result = await query('SELECT * FROM products WHERE id = $1', [req.params.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(dbRowToProduct(result.rows[0]));
    } catch (err) {
        console.error('Error fetching product:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST / - Create product (Admin Only)
router.post('/', verifyUser, checkRole(['admin']), async (req, res) => {
    try {
        const { name, description, price, category, image, isAvailable, isVeg, isBestSeller, isSpicy, isPopular } = req.body;

        if (!name || typeof name !== 'string' || name.trim().length < 1) {
            return res.status(400).json({ message: 'Product name is required' });
        }
        if (price === undefined || typeof price !== 'number' || price < 0) {
            return res.status(400).json({ message: 'Valid price is required' });
        }
        if (!category || !VALID_CATEGORIES.includes(category)) {
            return res.status(400).json({ message: 'Valid category is required' });
        }

        const result = await query(
            `INSERT INTO products (name, description, price, category, image, is_available, is_veg, is_bestseller, is_spicy, is_popular)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
             RETURNING *`,
            [
                name.trim(),
                (description || '').trim(),
                price,
                category,
                (typeof image === 'string' && image.trim()) || '',
                typeof isAvailable === 'boolean' ? isAvailable : true,
                typeof isVeg === 'boolean' ? isVeg : false,
                typeof isBestSeller === 'boolean' ? isBestSeller : false,
                typeof isSpicy === 'boolean' ? isSpicy : false,
                typeof isPopular === 'boolean' ? isPopular : false,
            ]
        );

        res.status(201).json(dbRowToProduct(result.rows[0]));
    } catch (err) {
        console.error('Error creating product:', err.message);
        res.status(500).json({ message: 'Error creating product' });
    }
});

// PUT /:id - Update product (Admin Only)
router.put('/:id', verifyUser, checkRole(['admin']), async (req, res) => {
    try {
        if (!isValidUUID(req.params.id)) {
            return res.status(400).json({ message: 'Invalid product ID' });
        }

        const { name, description, price, category, image, isAvailable, isVeg, isBestSeller, isSpicy, isPopular } = req.body;

        const setClauses = [];
        const values = [];
        let paramIndex = 1;

        if (name !== undefined) {
            if (typeof name !== 'string' || name.trim().length < 1) {
                return res.status(400).json({ message: 'Invalid product name' });
            }
            setClauses.push(`name = $${paramIndex++}`);
            values.push(name.trim());
        }
        if (description !== undefined) {
            setClauses.push(`description = $${paramIndex++}`);
            values.push(String(description).trim());
        }
        if (price !== undefined) {
            if (typeof price !== 'number' || price < 0) {
                return res.status(400).json({ message: 'Invalid price' });
            }
            setClauses.push(`price = $${paramIndex++}`);
            values.push(price);
        }
        if (category !== undefined) {
            if (!VALID_CATEGORIES.includes(category)) {
                return res.status(400).json({ message: 'Invalid category' });
            }
            setClauses.push(`category = $${paramIndex++}`);
            values.push(category);
        }
        if (image !== undefined) {
            setClauses.push(`image = $${paramIndex++}`);
            values.push(String(image).trim());
        }
        if (isAvailable !== undefined) {
            setClauses.push(`is_available = $${paramIndex++}`);
            values.push(Boolean(isAvailable));
        }
        if (isVeg !== undefined) {
            setClauses.push(`is_veg = $${paramIndex++}`);
            values.push(Boolean(isVeg));
        }
        if (isBestSeller !== undefined) {
            setClauses.push(`is_bestseller = $${paramIndex++}`);
            values.push(Boolean(isBestSeller));
        }
        if (isSpicy !== undefined) {
            setClauses.push(`is_spicy = $${paramIndex++}`);
            values.push(Boolean(isSpicy));
        }
        if (isPopular !== undefined) {
            setClauses.push(`is_popular = $${paramIndex++}`);
            values.push(Boolean(isPopular));
        }

        if (setClauses.length === 0) {
            return res.status(400).json({ message: 'No valid fields to update' });
        }

        values.push(req.params.id);
        const result = await query(
            `UPDATE products SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
            values
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(dbRowToProduct(result.rows[0]));
    } catch (err) {
        console.error('Error updating product:', err.message);
        res.status(500).json({ message: 'Error updating product' });
    }
});

// DELETE /:id - Delete product (Admin Only)
router.delete('/:id', verifyUser, checkRole(['admin']), async (req, res) => {
    try {
        if (!isValidUUID(req.params.id)) {
            return res.status(400).json({ message: 'Invalid product ID' });
        }

        const result = await query('DELETE FROM products WHERE id = $1 RETURNING id', [req.params.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json({ message: 'Product deleted' });
    } catch (err) {
        console.error('Error deleting product:', err.message);
        res.status(500).json({ message: 'Error deleting product' });
    }
});

// POST /seed - Seed sample products (Admin Only)
router.post('/seed', verifyUser, checkRole(['admin']), async (req, res) => {
    try {
        await query('DELETE FROM order_items');
        await query('DELETE FROM products');

        const seedProducts = [
            ['Samosa', 'Crispy fried pastry with spiced potato filling', 20, 'Snacks', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&auto=format&fit=crop&q=60', true, true, false, false, false],
            ['Vada Pav', "Mumbai's favorite street food", 25, 'Snacks', 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=60', true, true, false, true, false],
            ['Vegetable Sandwich', 'Grilled vegetable sandwich', 40, 'Snacks', 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&auto=format&fit=crop&q=60', true, true, false, false, false],
            ['Chicken Fried Rice', 'Wok-fried rice with tender chicken', 100, 'Meals', 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&auto=format&fit=crop&q=60', false, false, true, false, false],
            ['Veg Thali', 'Complete meal with rice, dal, and veggies', 80, 'Meals', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60', true, true, false, false, false],
            ['Masala Chai', 'Spiced Indian tea', 15, 'Beverages', 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=500&auto=format&fit=crop&q=60', true, true, false, false, true],
            ['Cold Coffee', 'Chilled coffee with ice cream', 50, 'Beverages', 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500&auto=format&fit=crop&q=60', true, true, false, false, false],
            ['Paneer Tikka', 'Grilled paneer cubes with spices', 120, 'Snacks', 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=500&auto=format&fit=crop&q=60', true, true, true, false, false],
        ];

        for (const p of seedProducts) {
            await query(
                `INSERT INTO products (name, description, price, category, image, is_available, is_veg, is_bestseller, is_spicy, is_popular)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
                p
            );
        }

        res.json({ message: 'Data seeded successfully', count: seedProducts.length });
    } catch (err) {
        console.error('Seed error:', err.message);
        res.status(500).json({ message: 'Seed error' });
    }
});

module.exports = router;
