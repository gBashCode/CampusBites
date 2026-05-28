require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Security Headers (Helmet) ──────────────────────────────────────────────
app.use(helmet({
    crossOriginResourcePolicy: false, // Allow cross-origin resource loading
    contentSecurityPolicy: false,     // Disable CSP (configure per-frontend as needed)
    hsts: { maxAge: 31536000, includeSubDomains: true } // Strict Transport Security
}));

// ─── HTTPS Redirect (Production) ────────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
    app.use((req, res, next) => {
        if (req.headers['x-forwarded-proto'] !== 'https') {
            return res.redirect(301, `https://${req.hostname}${req.originalUrl}`);
        }
        next();
    });
}

// ─── CORS — Strict Origin Allowlist ─────────────────────────────────────────
const allowedOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map(s => s.trim())
    : [];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (server-to-server, curl, mobile apps)
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
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    message: "Too many requests from this IP, please try again after 15 minutes"
});
app.use('/api/', apiLimiter);

// ─── Database Connection ────────────────────────────────────────────────────
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/campus-bites';

// Validate MongoDB URI
if (!mongoURI.startsWith('mongodb://') && !mongoURI.startsWith('mongodb+srv://')) {
    console.error('ERROR: Invalid MONGO_URI format. Must start with mongodb:// or mongodb+srv://');
    process.exit(1);
}

// Log masked URI (never expose credentials)
console.log('Attempting to connect to MongoDB...');
console.log('MongoDB URI:', mongoURI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@'));

mongoose.connect(mongoURI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
})
    .then(() => {
        console.log('MongoDB Connected Successfully');
    })
    .catch(err => {
        console.error('MongoDB Connection Error:');
        console.error('Name:', err.name);
        console.error('Message:', err.message);
        console.error('Please check your MONGO_URI environment variable');
    });

// ─── Routes ─────────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
    res.json({
        message: 'Campus Bites API is running',
        dbStatus,
        env: process.env.NODE_ENV,
        timestamp: new Date()
    });
});

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
