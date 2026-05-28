/**
 * Standalone seed script — reads credentials from environment variables.
 * 
 * Required env vars (set in .env or pass directly):
 *   SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD
 *   SEED_STAFF_EMAIL, SEED_STAFF_PASSWORD
 *   SEED_DELIVERY_EMAIL, SEED_DELIVERY_PASSWORD
 *   SEED_STUDENT_EMAIL, SEED_STUDENT_PASSWORD
 * 
 * Usage:
 *   node seedUsers.js
 * 
 * Passwords are hashed automatically by the User model pre-save hook.
 */
const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const seedUsers = async () => {
    // Validate required env vars
    const required = [
        'SEED_ADMIN_EMAIL', 'SEED_ADMIN_PASSWORD',
        'SEED_STAFF_EMAIL', 'SEED_STAFF_PASSWORD',
        'SEED_DELIVERY_EMAIL', 'SEED_DELIVERY_PASSWORD',
        'SEED_STUDENT_EMAIL', 'SEED_STUDENT_PASSWORD'
    ];

    const missing = required.filter(key => !process.env[key]);
    if (missing.length > 0) {
        console.error('ERROR: Missing required environment variables:');
        missing.forEach(key => console.error(`  - ${key}`));
        console.error('\nSet these in your .env file or pass them directly.');
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const users = [
            {
                name: process.env.SEED_ADMIN_NAME || 'Admin User',
                email: process.env.SEED_ADMIN_EMAIL,
                password: process.env.SEED_ADMIN_PASSWORD,
                role: 'admin'
            },
            {
                name: process.env.SEED_STAFF_NAME || 'Staff User',
                email: process.env.SEED_STAFF_EMAIL,
                password: process.env.SEED_STAFF_PASSWORD,
                role: 'staff'
            },
            {
                name: process.env.SEED_DELIVERY_NAME || 'Delivery User',
                email: process.env.SEED_DELIVERY_EMAIL,
                password: process.env.SEED_DELIVERY_PASSWORD,
                role: 'delivery'
            },
            {
                name: process.env.SEED_STUDENT_NAME || 'Student User',
                email: process.env.SEED_STUDENT_EMAIL,
                password: process.env.SEED_STUDENT_PASSWORD,
                role: 'student'
            }
        ];

        for (const u of users) {
            const exists = await User.findOne({ email: u.email });
            if (!exists) {
                await new User(u).save();
                console.log(`Created ${u.role} user: ${u.email}`);
            } else {
                // Update password and role (pre-save hook will hash the new password)
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
