const path = require('path');

// Load env vars — gracefully skip if .env not found (Vercel uses env vars)
try { require('dotenv').config({ path: path.join(__dirname, '..', 'campus-bites', 'server', '.env') }); } catch(e) {}

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// Trust first proxy (required for rate limiter behind Vercel)
app.set('trust proxy', 1);

// ─── Security Headers (Helmet) ──────────────────────────────────────────────
app.use(helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: false,
    hsts: { maxAge: 31536000, includeSubDomains: true }
}));

// ─── CORS — Strict Origin Allowlist ─────────────────────────────────────────
const allowedOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map(s => s.trim())
    : [];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// ─── Rate Limiting ──────────────────────────────────────────────────────────
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests from this IP, please try again after 15 minutes"
});
app.use('/api/', apiLimiter);

// ─── Database Connection ────────────────────────────────────────────────────
const mongoURI = (process.env.MONGO_URI || 'mongodb://localhost:27017/campus-bites').trim();

if (mongoURI.startsWith('mongodb://') || mongoURI.startsWith('mongodb+srv://')) {
    mongoose.connect(mongoURI, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
    })
        .then(() => console.log('MongoDB Connected Successfully'))
        .catch(err => console.error('MongoDB Connection Error:', err.message));
}

// ─── Routes ─────────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
    res.json({ message: 'Campus Bites API is running', dbStatus, timestamp: new Date() });
});

const authRoutes = require('../campus-bites/server/routes/auth');
const productRoutes = require('../campus-bites/server/routes/products');
const orderRoutes = require('../campus-bites/server/routes/orders');

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// Export for Vercel serverless
module.exports = app;
