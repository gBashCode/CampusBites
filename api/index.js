const path = require('path');

try { require('dotenv').config({ path: path.join(__dirname, '..', 'campus-bites', 'server', '.env') }); } catch(e) {}

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

app.set('trust proxy', 1);

app.use(helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: false,
    hsts: { maxAge: 31536000, includeSubDomains: true }
}));

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

app.use(express.json({ limit: '10kb' }));

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { message: 'Too many requests, please try again later' }
});
app.use('/api/', apiLimiter);

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { message: 'Too many authentication attempts' }
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);

app.get('/', (req, res) => {
    res.json({
        status: 'ok',
        service: 'Campus Bites API',
        timestamp: new Date().toISOString(),
    });
});

app.use('/api/auth', require('../campus-bites/server/routes/auth'));
app.use('/api/products', require('../campus-bites/server/routes/products'));
app.use('/api/orders', require('../campus-bites/server/routes/orders'));
app.use('/api/notifications', require('../campus-bites/server/routes/notifications'));

app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, _next) => {
    console.error('Unhandled error:', err);
    if (err.message === 'Not allowed by CORS') {
        return res.status(403).json({ message: 'Origin not allowed by CORS' });
    }
    res.status(500).json({ message: 'Internal server error' });
});

module.exports = app;
