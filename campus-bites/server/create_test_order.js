const mongoose = require('mongoose');
const Order = require('./models/Order');
const User = require('./models/User');
const Product = require('./models/Product');

const mongoURI = 'mongodb://localhost:27017/campus-bites';

async function run() {
    try {
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');

        const testPhone = '8050133464'; // The new number requested by the user
        const testEmail = 'test_friend_2@bites.com';

        // Find or create the user
        let testUser = await User.findOne({ email: testEmail });
        if (!testUser) {
            testUser = new User({
                name: 'Second Test Friend',
                email: testEmail,
                password: 'password123',
                phone: testPhone,
                role: 'student'
            });
            await testUser.save();
            console.log('Created new user with phone:', testPhone);
        } else {
            // Ensure the phone is correctly set
            testUser.phone = testPhone;
            await testUser.save();
            console.log('Updated existing test user with phone:', testPhone);
        }

        // Get any product
        const product = await Product.findOne({});
        if (!product) {
             console.log('No products found in DB!');
             process.exit(1);
        }

        const newOrder = new Order({
            user: testUser._id,
            items: [
                {
                    product: product._id,
                    quantity: 1,
                    price: product.price
                }
            ],
            totalAmount: product.price,
            status: 'pending',
            paymentStatus: 'paid',
            pickupTime: '02:00 PM'
        });

        const savedOrder = await newOrder.save();
        console.log('✅ New test order created successfully! Order ID:', savedOrder._id.toString());
    } catch (e) {
        console.error('Save failed:', e.message);
    } finally {
        await mongoose.disconnect();
    }
}

run();
