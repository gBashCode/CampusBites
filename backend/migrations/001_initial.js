/**
 * Initial schema migration for Campus Bites
 * Creates all core tables, indexes, triggers, and extensions.
 */

async function up(pool) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // ── Extensions ──────────────────────────────────────────────────────
    await client.query(`
      CREATE EXTENSION IF NOT EXISTS pg_trgm;
    `);

    // ── update_updated_at trigger function ──────────────────────────────
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // ── users ───────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE users (
        id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
        name                  VARCHAR(100) NOT NULL,
        email                 VARCHAR(255) NOT NULL UNIQUE,
        password              VARCHAR(128) NOT NULL,
        role                  VARCHAR(20)  NOT NULL DEFAULT 'student'
                              CHECK (role IN ('student','admin','staff','lecturer','delivery')),
        cabin_number          VARCHAR(50)  DEFAULT '',
        department            VARCHAR(100) DEFAULT '',
        phone                 VARCHAR(20)  DEFAULT '',
        is_verified           BOOLEAN      DEFAULT false,
        otp                   VARCHAR(10),
        otp_expires           TIMESTAMPTZ,
        reset_password_otp    VARCHAR(10),
        reset_password_expires TIMESTAMPTZ,
        fcm_tokens            TEXT[]       DEFAULT '{}',
        created_at            TIMESTAMPTZ  DEFAULT NOW(),
        updated_at            TIMESTAMPTZ  DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TRIGGER trg_users_updated_at
        BEFORE UPDATE ON users
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at();
    `);

    // ── products ────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE products (
        id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
        name          VARCHAR(200) NOT NULL,
        description   VARCHAR(1000) DEFAULT '',
        price         INTEGER      NOT NULL CHECK (price >= 0),
        category      VARCHAR(50)  NOT NULL
                      CHECK (category IN ('Snacks','Meals','Beverages','Combos','Desserts')),
        image         TEXT         DEFAULT '',
        is_available  BOOLEAN      DEFAULT true,
        is_veg        BOOLEAN      DEFAULT false,
        is_bestseller BOOLEAN      DEFAULT false,
        is_spicy      BOOLEAN      DEFAULT false,
        is_popular    BOOLEAN      DEFAULT false,
        created_at    TIMESTAMPTZ  DEFAULT NOW(),
        updated_at    TIMESTAMPTZ  DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE INDEX idx_products_category    ON products (category);
      CREATE INDEX idx_products_is_available ON products (is_available);
    `);

    // Trigram GIN index for full-text search on name + description
    await client.query(`
      CREATE INDEX idx_products_name_desc_trgm
        ON products
        USING GIN (
          (to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, '')))
        );
    `);

    await client.query(`
      CREATE TRIGGER trg_products_updated_at
        BEFORE UPDATE ON products
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at();
    `);

    // ── orders ──────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE orders (
        id                  UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id             UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        total_amount        INTEGER      NOT NULL CHECK (total_amount >= 0),
        status              VARCHAR(20)  DEFAULT 'pending'
                            CHECK (status IN ('pending','preparing','ready','completed','cancelled')),
        payment_status      VARCHAR(20)  DEFAULT 'pending'
                            CHECK (payment_status IN ('pending','paid','failed')),
        delivery_type       VARCHAR(20)  DEFAULT 'pickup'
                            CHECK (delivery_type IN ('pickup','cabin')),
        cabin_number        VARCHAR(50)  DEFAULT '',
        pickup_time         VARCHAR(100),
        razorpay_order_id   VARCHAR(100),
        razorpay_payment_id VARCHAR(100),
        razorpay_signature  VARCHAR(200),
        expires_at          TIMESTAMPTZ,
        created_at          TIMESTAMPTZ  DEFAULT NOW(),
        updated_at          TIMESTAMPTZ  DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE INDEX idx_orders_user_created  ON orders (user_id, created_at DESC);
      CREATE INDEX idx_orders_status_created ON orders (status, created_at DESC);
    `);

    await client.query(`
      CREATE TRIGGER trg_orders_updated_at
        BEFORE UPDATE ON orders
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at();
    `);

    // ── order_items ─────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE order_items (
        id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id    UUID    NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        product_id  UUID    NOT NULL REFERENCES products(id),
        quantity    INTEGER NOT NULL CHECK (quantity > 0),
        price       INTEGER NOT NULL CHECK (price >= 0)
      );
    `);

    await client.query(`
      CREATE INDEX idx_order_items_order_id ON order_items (order_id);
    `);

    // ── product_images ──────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE product_images (
        id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id  UUID         REFERENCES products(id) ON DELETE SET NULL,
        url         TEXT         NOT NULL,
        public_id   VARCHAR(200),
        is_primary  BOOLEAN      DEFAULT true,
        created_at  TIMESTAMPTZ  DEFAULT NOW()
      );
    `);

    await client.query('COMMIT');
    console.log('Migration 001_initial applied successfully');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration 001_initial failed:', err);
    throw err;
  } finally {
    client.release();
  }
}

async function down(pool) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query('DROP TABLE IF EXISTS product_images CASCADE;');
    await client.query('DROP TABLE IF EXISTS order_items CASCADE;');
    await client.query('DROP TABLE IF EXISTS orders CASCADE;');
    await client.query('DROP TABLE IF EXISTS products CASCADE;');
    await client.query('DROP TABLE IF EXISTS users CASCADE;');
    await client.query('DROP FUNCTION IF EXISTS update_updated_at() CASCADE;');

    // pg_trgm is shared across databases, so we don't DROP EXTENSION
    // to avoid breaking other schemas that may rely on it.

    await client.query('COMMIT');
    console.log('Migration 001_initial rolled back successfully');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Rollback 001_initial failed:', err);
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { up, down };
