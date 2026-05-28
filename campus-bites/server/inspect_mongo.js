const mongoose = require('mongoose');

async function run() {
    const conn = await mongoose.connect('mongodb://localhost:27017');
    console.log('Connected to MongoDB');

    const admin = new mongoose.mongo.Admin(mongoose.connection.db);
    const dbs = await admin.listDatabases();
    console.log('Databases:', dbs.databases);

    for (const dbInfo of dbs.databases) {
        const dbName = dbInfo.name;
        if (['admin', 'config', 'local'].includes(dbName)) continue;

        console.log(`\n--- Database: ${dbName} ---`);
        const dbConn = conn.useDb(dbName);
        const collections = await dbConn.db.listCollections().toArray();
        for (const col of collections) {
            const count = await dbConn.db.collection(col.name).countDocuments();
            console.log(`Collection: ${col.name}, Documents: ${count}`);
            if (col.name === 'orders' || col.name === 'users') {
                const docs = await dbConn.db.collection(col.name).find().limit(3).toArray();
                console.log('Sample docs:', docs.map(d => ({ _id: d._id, email: d.email, name: d.name, user: d.user, phone: d.phone, status: d.status })));
            }
        }
    }

    await mongoose.disconnect();
}

run().catch(console.error);
