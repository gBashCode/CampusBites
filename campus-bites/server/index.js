require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { pool } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// --- Security: sanitize $ and . keys in request body/query/params ---
const DANGEROUS_KEY_RE = /^\$|__/;
const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeObject);
  const clean = {};
  for (const [key, value] of Object.entries(obj)) {
    if (DANGEROUS_KEY_RE.test(key)) continue;
    clean[key] = typeof value === 'object' ? sanitizeObject(value) : value;
  }
  return clean;
};

app.use((req, res, next) => {
  if (req.body && typeof req.body === 'object') req.body = sanitizeObject(req.body);
  if (req.query && typeof req.query === 'object') req.query = sanitizeObject(req.query);
  if (req.params && typeof req.params === 'object') req.params = sanitizeObject(req.params);
  next();
});

// --- Helmet ---
app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: false,
  hsts: { maxAge: 31536000, includeSubDomains: true },
}));

// --- CORS with strict origin allowlist ---
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map(s => s.trim())
  : [];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// --- Body parsing with size limit ---
app.use(express.json({ limit: '10kb' }));

// --- Rate limiting ---
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many authentication attempts, please try again later' },
});

app.use('/api/', generalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);
app.use('/api/auth/reset-password', authLimiter);

// --- Database connection test on startup ---
async function connectDB() {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('PostgreSQL connected:', result.rows[0].now);
  } catch (err) {
    console.error('PostgreSQL connection error:', err.message);
  }
}
connectDB();

// --- Routes ---
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Campus Bites API',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/notifications', require('./routes/notifications'));

// --- One-time migration + seed endpoint (protected by secret) ---
app.get('/admin/migrate', async (req, res) => {
  const secret = req.query.secret;
  if (!process.env.JWT_SECRET || secret !== process.env.JWT_SECRET) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  try {
    const migration = require('./migrations/001_initial');
    await migration.up(pool);
    res.json({ message: 'Migration completed' });
  } catch (err) {
    console.error('Migration error:', err);
    res.status(500).json({ message: 'Migration failed', error: err.message });
  }
});

app.get('/admin/seed', async (req, res) => {
  const secret = req.query.secret;
  if (!process.env.JWT_SECRET || secret !== process.env.JWT_SECRET) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  try {
    const bcrypt = require('bcrypt');
    const { query } = require('./db');

    const users = [
      { name: 'Admin User', email: 'admin@campusbites.com', password: 'Admin123', role: 'admin' },
      { name: 'Staff User', email: 'staff@campusbites.com', password: 'Staff123', role: 'staff' },
      { name: 'Delivery User', email: 'delivery@campusbites.com', password: 'Delivery123', role: 'delivery' },
      { name: 'Student User', email: 'student@campusbites.com', password: 'Student123', role: 'student' },
    ];

    for (const u of users) {
      const hash = await bcrypt.hash(u.password, 12);
      await query(
        `INSERT INTO users (name, email, password, role, is_verified)
         VALUES ($1, $2, $3, $4, true)
         ON CONFLICT (email) DO UPDATE SET password = $3, role = $4`,
        [u.name, u.email, hash, u.role]
      );
    }

    const products = [
      { name: 'Samosa', description: 'Crispy fried pastry with spiced potato filling', price: 20, category: 'Snacks', is_veg: true, is_bestseller: true, image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&auto=format&fit=crop&q=60' },
      { name: 'Vada Pav', description: "Mumbai's favorite street food", price: 25, category: 'Snacks', is_veg: true, is_spicy: true, image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=60' },
      { name: 'Vegetable Sandwich', description: 'Grilled vegetable sandwich', price: 40, category: 'Snacks', is_veg: true, image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&auto=format&fit=crop&q=60' },
      { name: 'Chicken Fried Rice', description: 'Wok-fried rice with tender chicken', price: 100, category: 'Meals', is_veg: false, is_bestseller: true, image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&auto=format&fit=crop&q=60' },
      { name: 'Veg Thali', description: 'Complete meal with rice, dal, and veggies', price: 80, category: 'Meals', is_veg: true, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60' },
      { name: 'Masala Chai', description: 'Spiced Indian tea', price: 15, category: 'Beverages', is_veg: true, is_popular: true, image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=500&auto=format&fit=crop&q=60' },
      { name: 'Cold Coffee', description: 'Chilled coffee with ice cream', price: 50, category: 'Beverages', is_veg: true, image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500&auto=format&fit=crop&q=60' },
      { name: 'Paneer Tikka', description: 'Grilled paneer cubes with spices', price: 120, category: 'Snacks', is_veg: true, is_bestseller: true, image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=500&auto=format&fit=crop&q=60' },
    ];

    await query('DELETE FROM products');
    for (const p of products) {
      await query(
        `INSERT INTO products (name, description, price, category, is_veg, is_bestseller, is_spicy, is_popular, image)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [p.name, p.description, p.price, p.category, p.is_veg || false, p.is_bestseller || false, p.is_spicy || false, p.is_popular || false, p.image]
      );
    }

    res.json({ message: 'Seed completed', users: users.length, products: products.length });
  } catch (err) {
    console.error('Seed error:', err);
    res.status(500).json({ message: 'Seed failed', error: err.message });
  }
});

// --- 404 handler ---
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// --- Global error handler ---
app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err);
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ message: 'Origin not allowed by CORS' });
  }
  res.status(500).json({ message: 'Internal server error' });
});

// --- Process error handlers ---
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

// --- Graceful shutdown ---
const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  try {
    await pool.end();
    console.log('PostgreSQL pool closed.');
  } catch (err) {
    console.error('Error closing PostgreSQL pool:', err.message);
  }
  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// --- Start server ---
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
