require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const bcrypt = require('bcrypt');
const { query, pool } = require('./db');

async function seed() {
  try {
    console.log('Seeding database...');

    // ── Users ───────────────────────────────────────────────────────────
    const users = [
      { name: 'Admin User', email: 'admin@campusbites.com', password: 'Admin123', role: 'admin' },
      { name: 'Staff User', email: 'staff@campusbites.com', password: 'Staff123', role: 'staff' },
      { name: 'Delivery User', email: 'delivery@campusbites.com', password: 'Delivery123', role: 'delivery' },
      { name: 'Student User', email: 'student@campusbites.com', password: 'Student123', role: 'student' },
    ];

    const saltRounds = 10;

    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, saltRounds);
      await query(
        `INSERT INTO users (name, email, password, role)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (email) DO UPDATE SET
           name = EXCLUDED.name,
           password = EXCLUDED.password,
           role = EXCLUDED.role`,
        [user.name, user.email, hashedPassword, user.role]
      );
      console.log(`  Seeded user: ${user.email} (${user.role})`);
    }

    console.log(`  ${users.length} users seeded`);

    // ── Products ────────────────────────────────────────────────────────
    const products = [
      ['Samosa', 'Crispy fried pastry with spiced potato filling', 20, 'Snacks', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&auto=format&fit=crop&q=60', true, true, false, false, false],
      ['Vada Pav', "Mumbai's favorite street food", 25, 'Snacks', 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=60', true, true, false, true, false],
      ['Vegetable Sandwich', 'Grilled vegetable sandwich', 40, 'Snacks', 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&auto=format&fit=crop&q=60', true, true, false, false, false],
      ['Chicken Fried Rice', 'Wok-fried rice with tender chicken', 100, 'Meals', 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&auto=format&fit=crop&q=60', false, false, true, false, false],
      ['Veg Thali', 'Complete meal with rice, dal, and veggies', 80, 'Meals', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60', true, true, false, false, false],
      ['Masala Chai', 'Spiced Indian tea', 15, 'Beverages', 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=500&auto=format&fit=crop&q=60', true, true, false, false, true],
      ['Cold Coffee', 'Chilled coffee with ice cream', 50, 'Beverages', 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500&auto=format&fit=crop&q=60', true, true, false, false, false],
      ['Paneer Tikka', 'Grilled paneer cubes with spices', 120, 'Snacks', 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=500&auto=format&fit=crop&q=60', true, true, true, false, false],
    ];

    for (const p of products) {
      await query(
        `INSERT INTO products (name, description, price, category, image, is_available, is_veg, is_bestseller, is_spicy, is_popular)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        p
      );
      console.log(`  Seeded product: ${p[0]}`);
    }

    console.log(`  ${products.length} products seeded`);
    console.log('Seeding completed successfully');
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();
