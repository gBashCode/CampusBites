/**
 * One-time migration script: hashes all existing plaintext passwords with bcrypt.
 * 
 * Safe to run multiple times — skips passwords that are already bcrypt hashes.
 * 
 * Usage:
 *   node migratePasswords.js
 */
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

const SALT_ROUNDS = 10;

const migrate = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Access the raw collection to avoid triggering the pre-save hook
        const db = mongoose.connection.db;
        const usersCollection = db.collection('users');

        const allUsers = await usersCollection.find({}).toArray();
        console.log(`Found ${allUsers.length} users total`);

        let migrated = 0;
        let skipped = 0;

        for (const user of allUsers) {
            // bcrypt hashes always start with $2a$ or $2b$ — skip already-hashed passwords
            if (user.password && user.password.startsWith('$2')) {
                skipped++;
                continue;
            }

            const hashedPassword = await bcrypt.hash(user.password, SALT_ROUNDS);
            await usersCollection.updateOne(
                { _id: user._id },
                { $set: { password: hashedPassword } }
            );
            migrated++;
            console.log(`  Migrated: ${user.email} (${user.role})`);
        }

        console.log(`\nMigration complete:`);
        console.log(`  Migrated: ${migrated}`);
        console.log(`  Skipped (already hashed): ${skipped}`);
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
};

migrate();
