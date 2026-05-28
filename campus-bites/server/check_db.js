const mongoose = require('mongoose');
const Order = require('./models/Order');
const User = require('./models/User');

const mongoURI = 'mongodb://localhost:27017/campus-bites';

async function run() {
    await mongoose.connect(mongoURI);
    console.log('Connected to DB');
    
    const orders = await Order.find().populate('user');
    console.log(`Found ${orders.length} orders:`);
    for (const o of orders) {
        console.log(`Order ID: ${o._id}, User: ${o.user?.name}, Phone: "${o.user?.phone}", Status: ${o.status}, Total: ${o.totalAmount}`);
    }
    
    const users = await User.find();
    console.log(`\nFound ${users.length} users:`);
    for (const u of users) {
        console.log(`User: ${u.name}, Email: ${u.email}, Phone: "${u.phone}", Role: ${u.role}`);
    }
    
    await mongoose.disconnect();
}

run().catch(console.error);
