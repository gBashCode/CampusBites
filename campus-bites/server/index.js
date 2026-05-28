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
    crossOriginResourcePolicy: false // Allow cross-origin requests
}));
app.use(cors({
    origin: function(origin, callback) {
        // Allow all origins if FRONTEND_URL not set (development/migration period)
        const allowedOrigin = process.env.FRONTEND_URL;
        if (!allowedOrigin || !origin || origin === allowedOrigin) {
            callback(null, true);
        } else {
            callback(null, true); // Temporarily allow all to avoid breaking changes
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
// Safely log the URI structure to debug parsing issues
try {
    const uriParts = mongoURI.split('@');
    if (uriParts.length > 1) {
        console.log('MongoDB URI Host:', uriParts[1].split('/')[0]); // Log just the host part
        console.log('MongoDB User:', uriParts[0].split('//')[1].split(':')[0]); // Log the username
    } else {
        console.error('ERROR: MongoDB URI does not contain an "@" symbol. Check the format.');
    }
} catch (e) {
    console.error('Error parsing MongoDB URI for logging:', e.message);
}

mongoose.connect(mongoURI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
})
    .then(async () => {
        console.log('MongoDB Connected Successfully');
        
        // Auto-seed default users on startup
        try {
            const User = require('./models/User');
            const users = [
                { name: 'Admin User', email: 'admin@bites.com', password: 'admin123', role: 'admin' },
                { name: 'Staff User', email: 'staff@bites.com', password: 'staff123', role: 'staff' },
                { name: 'Delivery Boy', email: 'delivery@bites.com', password: 'delivery123', role: 'delivery' },
                { name: 'Student User', email: 'student@bites.com', password: 'student123', role: 'student' }
            ];
            for (const u of users) {
                const exists = await User.findOne({ email: u.email });
                if (!exists) {
                    await new User(u).save();
                    console.log(`Auto-seeded ${u.role} user: ${u.email}`);
                } else {
                    // Force sync default credentials
                    exists.password = u.password;
                    exists.role = u.role;
                    await exists.save();
                }
            }
        } catch (err) {
            console.error('Auto-seeding failed:', err.message);
        }
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

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// Temporary Seed Route (Access via http://localhost:5000/api/seed)
app.get('/api/seed', async (req, res) => {
    try {
        const User = require('./models/User');
        const users = [
            { name: 'Admin User', email: 'admin@bites.com', password: 'admin123', role: 'admin' },
            { name: 'Staff User', email: 'staff@bites.com', password: 'staff123', role: 'staff' },
            { name: 'Delivery Boy', email: 'delivery@bites.com', password: 'delivery123', role: 'delivery' },
            { name: 'Student User', email: 'student@bites.com', password: 'student123', role: 'student' }
        ];
        for (const u of users) {
            const exists = await User.findOne({ email: u.email });
            if (!exists) await new User(u).save();
        }
        res.json({ message: 'Users seeded successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
