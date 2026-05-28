const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const seedUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Clear existing users? Maybe not, just add if not exist
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
                console.log(`Created ${u.role} user: ${u.email}`);
            } else {
                // Update password and role to ensure defaults work
                exists.password = u.password;
                exists.role = u.role;
                await exists.save();
                console.log(`Updated existing ${u.role} user: ${u.email}`);
            }
        }

        console.log('User seeding complete');
        process.exit(0);
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
};

seedUsers();
