require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet({
    crossOriginResourcePolicy: false
}));

// CORS configuration - FIXED: Restrict to specific domains
app.use(cors({
    origin: function(origin, callback) {
        const allowedOrigins = [
            process.env.FRONTEND_URL,
            'http://localhost:3000',
            'http://localhost:5173' // Vite default
        ].filter(Boolean);

        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Rate Limiting
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    message: "Too many requests from this IP, please try again after 15 minutes"
});
app.use('/api/', apiLimiter);

// Database Connection
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/campus-bites';

// Validate MongoDB URI
if (!mongoURI.startsWith('mongodb://') && !mongoURI.startsWith('mongodb+srv://')) {
    console.error('ERROR: Invalid MONGO_URI format. Must start with mongodb:// or mongodb+srv://');
    console.error('Current MONGO_URI:', mongoURI);
    process.exit(1);
}

console.log('Attempting to connect to MongoDB...');

mongoose.connect(mongoURI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
})
    .then(async () => {
        console.log('MongoDB Connected Successfully');
    })
    .catch(err => {
        console.error('MongoDB Connection Error Details:');
        console.error('Name:', err.name);
        console.error('Message:', err.message);
        console.error('Code:', err.code);
        console.error('Please check your MONGO_URI environment variable');
    });

// Routes
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
const { seedRateLimit } = require('./middleware/auth');

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// FIXED: Protect seed route - disabled in production and rate limited in development
app.get('/api/seed', seedRateLimit, async (req, res) => {
    try {
        if (process.env.NODE_ENV === 'production') {
            return res.status(403).json({ message: 'This endpoint is not available in production' });
        }

        const User = require('./models/User');
        const users = [
            { name: 'Admin User', email: 'admin@bites.com', password: 'Admin123!', role: 'admin' },
            { name: 'Staff User', email: 'staff@bites.com', password: 'Staff123!', role: 'staff' },
            { name: 'Delivery Boy', email: 'delivery@bites.com', password: 'Delivery123!', role: 'delivery' },
            { name: 'Student User', email: 'student@bites.com', password: 'Student123!', role: 'student' }
        ];
        for (const u of users) {
            const exists = await User.findOne({ email: u.email });
            if (!exists) await new User(u).save();
        }
        res.json({ message: 'Users seeded successfully (development only)' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
