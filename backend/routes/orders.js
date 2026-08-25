const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Razorpay = require('razorpay');
const { query, getClient } = require('../db');
const { verifyUser, checkRole } = require('../middleware/auth');
const { sendWhatsAppMessage } = require('../utils/whatsapp');
const { sendPushToUser } = require('../utils/firebase');

const validateUUID = (id) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

const VALID_STATUSES = ['pending', 'preparing', 'ready', 'completed', 'cancelled'];
const STATUS_TRANSITIONS = {
  pending: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['completed'],
};

// POST / - Place order
router.post('/', verifyUser, async (req, res) => {
  try {
    const { items, pickupTime, deliveryType, cabinNumber } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Items array is required and must not be empty' });
    }

    for (const item of items) {
      if (!item.product || !item.quantity || item.quantity < 1) {
        return res.status(400).json({ error: 'Each item must have a valid product ID and quantity >= 1' });
      }
    }

    const client = await getClient();
    try {
      await client.query('BEGIN');

      const productIds = items.map((i) => i.product);
      const productsResult = await client.query(
        'SELECT * FROM products WHERE id = ANY($1) AND is_available = true',
        [productIds]
      );
      const productMap = {};
      for (const p of productsResult.rows) {
        productMap[p.id] = p;
      }

      const missingProducts = productIds.filter((id) => !productMap[id]);
      if (missingProducts.length > 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: `Product(s) not found or unavailable: ${missingProducts.join(', ')}` });
      }

      let totalAmount = 0;
      const orderItems = [];
      for (const item of items) {
        const product = productMap[item.product];
        const itemPrice = product.price * item.quantity;
        totalAmount += itemPrice;
        orderItems.push({
          product: product.id,
          quantity: item.quantity,
          price: product.price,
        });
      }

      totalAmount = Math.round(totalAmount * 1.05);

      const orderResult = await client.query(
        `INSERT INTO orders (user_id, total_amount, pickup_time, delivery_type, cabin_number, status)
         VALUES ($1, $2, $3, $4, $5, 'pending') RETURNING *`,
        [req.user.id, totalAmount, pickupTime || null, deliveryType || 'pickup', cabinNumber || null]
      );
      const order = orderResult.rows[0];

      for (const item of orderItems) {
        await client.query(
          'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
          [order.id, item.product, item.quantity, item.price]
        );
      }

      await client.query('COMMIT');

      const fullOrder = await getOrderById(order.id);
      res.status(201).json(fullOrder);
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Place order error:', err);
    res.status(500).json({ error: 'Failed to place order' });
  }
});

// GET /mine - Get current user's orders
router.get('/mine', verifyUser, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const offset = (page - 1) * limit;

    const countResult = await query('SELECT COUNT(*) FROM orders WHERE user_id = $1', [req.user.id]);
    const total = parseInt(countResult.rows[0].count);

    const ordersResult = await query(
      `SELECT o.*,
        json_agg(
          json_build_object(
            'id', oi.id,
            'product', json_build_object(
              'id', p.id, 'name', p.name, 'price', p.price,
              'image', p.image, 'category', p.category, 'is_veg', p.is_veg
            ),
            'quantity', oi.quantity,
            'price', oi.price
          )
        ) AS items
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE o.user_id = $1
       GROUP BY o.id
       ORDER BY o.created_at DESC
       LIMIT $2 OFFSET $3`,
      [req.user.id, limit, offset]
    );

    const orders = ordersResult.rows.map((o) => ({
      ...o,
      items: o.items[0]?.id ? o.items : [],
    }));

    res.json({
      orders,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('Get my orders error:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// GET /staff/active - Get active orders (admin/staff only)
router.get('/staff/active', verifyUser, checkRole(['admin', 'staff']), async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;
    const { status } = req.query;

    let whereClause = "o.status != 'cancelled'";
    const params = [];

    if (status && VALID_STATUSES.includes(status)) {
      params.push(status);
      whereClause = `o.status = $${params.length}`;
    }

    const countResult = await query(
      `SELECT COUNT(*) FROM orders o WHERE ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    const queryParams = [...params, limit, offset];
    const ordersResult = await query(
      `SELECT o.*,
        json_build_object('id', u.id, 'name', u.name, 'phone', u.phone, 'email', u.email) AS user,
        json_agg(
          json_build_object(
            'id', oi.id,
            'product', json_build_object(
              'id', p.id, 'name', p.name, 'price', p.price,
              'image', p.image, 'category', p.category, 'is_veg', p.is_veg
            ),
            'quantity', oi.quantity,
            'price', oi.price
          )
        ) AS items
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       LEFT JOIN order_items oi ON o.id = oi.order_id
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE ${whereClause}
       GROUP BY o.id, u.id
       ORDER BY o.created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      queryParams
    );

    const orders = ordersResult.rows.map((o) => ({
      ...o,
      items: o.items[0]?.id ? o.items : [],
    }));

    res.json({
      orders,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('Get active orders error:', err);
    res.status(500).json({ error: 'Failed to fetch active orders' });
  }
});

// PUT /:id/status - Update order status (admin/staff only)
router.put('/:id/status', verifyUser, checkRole(['admin', 'staff']), async (req, res) => {
  try {
    const { id } = req.params;
    if (!validateUUID(id)) {
      return res.status(400).json({ error: 'Invalid order ID' });
    }

    const { status } = req.body;
    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` });
    }

    const orderResult = await query(
      `SELECT o.*, json_build_object('id', u.id, 'name', u.name, 'phone', u.phone, 'email', u.email) AS user
       FROM orders o LEFT JOIN users u ON o.user_id = u.id WHERE o.id = $1`,
      [id]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orderResult.rows[0];

    if (order.status === 'completed' || order.status === 'cancelled') {
      return res.status(400).json({ error: `Cannot change status of ${order.status} order` });
    }

    const allowed = STATUS_TRANSITIONS[order.status];
    if (!allowed || !allowed.includes(status)) {
      return res.status(400).json({
        error: `Cannot transition from '${order.status}' to '${status}'. Allowed: ${allowed ? allowed.join(', ') : 'none'}`,
      });
    }

    const client = await getClient();
    try {
      await client.query('BEGIN');

      const updatedResult = await client.query(
        'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
        [status, id]
      );
      const updatedOrder = updatedResult.rows[0];

      await client.query('COMMIT');

      const fullOrder = {
        ...updatedOrder,
        user: order.user,
      };

      // WhatsApp notification
      try {
        if (order.user && order.user.phone) {
          const statusMessages = {
            preparing: `Your order #${id.slice(0, 8)} is being prepared!`,
            ready: `Your order #${id.slice(0, 8)} is ready for pickup!`,
            completed: `Your order #${id.slice(0, 8)} has been completed. Thank you!`,
            cancelled: `Your order #${id.slice(0, 8)} has been cancelled.`,
          };
          if (statusMessages[status]) {
            await sendWhatsAppMessage(order.user.phone, statusMessages[status]);
          }
        }
      } catch (whatsappErr) {
        console.error('WhatsApp notification error:', whatsappErr);
      }

      // FCM notification
      try {
        if (order.user_id) {
          const userResult = await query('SELECT fcm_tokens FROM users WHERE id = $1', [order.user_id]);
          const user = userResult.rows[0];
          if (user && user.fcm_tokens && user.fcm_tokens.length > 0) {
            const validTokens = [];
            for (const token of user.fcm_tokens) {
              try {
                await sendPushToUser(token, {
                  title: 'Order Update',
                  body: `Your order status has changed to: ${status}`,
                  data: { orderId: id },
                });
                validTokens.push(token);
              } catch (fcmErr) {
                console.error('FCM token invalid, removing:', token, fcmErr.message);
              }
            }
            if (validTokens.length !== user.fcm_tokens.length) {
              await query('UPDATE users SET fcm_tokens = $1 WHERE id = $2', [validTokens, order.user_id]);
            }
          }
        }
      } catch (fcmErr) {
        console.error('FCM notification error:', fcmErr);
      }

      res.json(fullOrder);

      // Broadcast real-time update
      const broadcastToUser = req.app.get('broadcastToUser');
      if (broadcastToUser) {
        broadcastToUser(order.user_id, {
          type: 'ORDER_STATUS_UPDATED',
          order: {
            id: updatedOrder.id,
            status: updatedOrder.status,
            updatedAt: updatedOrder.updated_at,
          }
        });
      }
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Update order status error:', err);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// POST /:id/cancel - Cancel own order
router.post('/:id/cancel', verifyUser, async (req, res) => {
  try {
    const { id } = req.params;
    if (!validateUUID(id)) {
      return res.status(400).json({ error: 'Invalid order ID' });
    }

    const orderResult = await query('SELECT * FROM orders WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orderResult.rows[0];
    if (!['pending', 'preparing'].includes(order.status)) {
      return res.status(400).json({ error: `Cannot cancel order with status '${order.status}'` });
    }

    const updatedResult = await query(
      "UPDATE orders SET status = 'cancelled', updated_at = NOW() WHERE id = $1 RETURNING *",
      [id]
    );

    // Broadcast real-time update
    const broadcastToUser = req.app.get('broadcastToUser');
    if (broadcastToUser) {
      broadcastToUser(req.user.id, {
        type: 'ORDER_STATUS_UPDATED',
        order: {
          id: updatedResult.rows[0].id,
          status: updatedResult.rows[0].status,
          updatedAt: updatedResult.rows[0].updated_at,
        }
      });
    }

    res.json(updatedResult.rows[0]);
  } catch (err) {
    console.error('Cancel order error:', err);
    res.status(500).json({ error: 'Failed to cancel order' });
  }
});

// POST /razorpay - Create Razorpay order
router.post('/razorpay', verifyUser, async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: `rcpt_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,
    });

    res.json(order);
  } catch (err) {
    console.error('Razorpay order error:', err);
    res.status(500).json({ error: 'Failed to create Razorpay order' });
  }
});

// POST /verify - Verify Razorpay payment
router.post('/verify', verifyUser, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderData } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderData) {
      return res.status(400).json({ error: 'Missing required payment verification fields' });
    }

    // Timing-safe signature verification
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    const signatureBuffer = Buffer.from(razorpay_signature, 'hex');
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');

    if (signatureBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    // Verify and recalculate from DB (never trust client)
    const { items, pickupTime, deliveryType, cabinNumber } = orderData;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Items array is required' });
    }

    const client = await getClient();
    try {
      await client.query('BEGIN');

      const productIds = items.map((i) => i.product);
      const productsResult = await client.query(
        'SELECT * FROM products WHERE id = ANY($1) AND is_available = true',
        [productIds]
      );
      const productMap = {};
      for (const p of productsResult.rows) {
        productMap[p.id] = p;
      }

      const missingProducts = productIds.filter((id) => !productMap[id]);
      if (missingProducts.length > 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: `Product(s) not found or unavailable: ${missingProducts.join(', ')}` });
      }

      let totalAmount = 0;
      const orderItems = [];
      for (const item of items) {
        const product = productMap[item.product];
        const itemPrice = product.price * item.quantity;
        totalAmount += itemPrice;
        orderItems.push({
          product: product.id,
          quantity: item.quantity,
          price: product.price,
        });
      }

      totalAmount = Math.round(totalAmount * 1.05);

      const orderResult = await client.query(
        `INSERT INTO orders (user_id, total_amount, pickup_time, delivery_type, cabin_number, status, razorpay_order_id, razorpay_payment_id, payment_status)
         VALUES ($1, $2, $3, $4, $5, 'pending', $6, $7, 'paid') RETURNING *`,
        [req.user.id, totalAmount, pickupTime || null, deliveryType || 'pickup', cabinNumber || null, razorpay_order_id, razorpay_payment_id]
      );
      const order = orderResult.rows[0];

      for (const item of orderItems) {
        await client.query(
          'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
          [order.id, item.product, item.quantity, item.price]
        );
      }

      await client.query('COMMIT');

      // Fetch full order with user details
      const fullOrderResult = await query(
        `SELECT o.*,
          json_build_object('id', u.id, 'name', u.name, 'phone', u.phone, 'email', u.email) AS user,
          json_agg(
            json_build_object(
              'id', oi.id,
              'product', json_build_object(
                'id', p.id, 'name', p.name, 'price', p.price,
                'image', p.image, 'category', p.category, 'is_veg', p.is_veg
              ),
              'quantity', oi.quantity,
              'price', oi.price
            )
          ) AS items
         FROM orders o
         LEFT JOIN users u ON o.user_id = u.id
         LEFT JOIN order_items oi ON o.id = oi.order_id
         LEFT JOIN products p ON oi.product_id = p.id
         WHERE o.id = $1
         GROUP BY o.id, u.id`,
        [order.id]
      );

      const fullOrder = fullOrderResult.rows[0];

      // WhatsApp notification
      try {
        if (fullOrder.user && fullOrder.user.phone) {
          await sendWhatsAppMessage(
            fullOrder.user.phone,
            `Payment confirmed! Your order #${order.id.slice(0, 8)} has been placed successfully. Total: ₹${totalAmount}`
          );
        }
      } catch (whatsappErr) {
        console.error('WhatsApp notification error:', whatsappErr);
      }

      // FCM notification
      try {
        const userResult = await query('SELECT fcm_tokens FROM users WHERE id = $1', [req.user.id]);
        const user = userResult.rows[0];
        if (user && user.fcm_tokens && user.fcm_tokens.length > 0) {
          const validTokens = [];
          for (const token of user.fcm_tokens) {
            try {
              await sendPushToUser(token, {
                title: 'Order Placed',
                body: `Your order #${order.id.slice(0, 8)} has been placed successfully!`,
                data: { orderId: order.id },
              });
              validTokens.push(token);
            } catch (fcmErr) {
              console.error('FCM token invalid, removing:', token, fcmErr.message);
            }
          }
          if (validTokens.length !== user.fcm_tokens.length) {
            await query('UPDATE users SET fcm_tokens = $1 WHERE id = $2', [validTokens, req.user.id]);
          }
        }
      } catch (fcmErr) {
        console.error('FCM notification error:', fcmErr);
      }

      res.status(201).json(fullOrder);
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Verify payment error:', err);
    res.status(500).json({ error: 'Failed to verify payment and place order' });
  }
});

// GET /delivery/active - Get delivery orders
router.get('/delivery/active', verifyUser, checkRole(['delivery', 'admin', 'staff']), async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    const countResult = await query(
      "SELECT COUNT(*) FROM orders WHERE (delivery_type = 'cabin' OR cabin_number IS NOT NULL) AND status != 'cancelled'"
    );
    const total = parseInt(countResult.rows[0].count);

    const ordersResult = await query(
      `SELECT o.*,
        json_build_object('id', u.id, 'name', u.name, 'phone', u.phone, 'email', u.email) AS user,
        json_agg(
          json_build_object(
            'id', oi.id,
            'product', json_build_object(
              'id', p.id, 'name', p.name, 'price', p.price,
              'image', p.image, 'category', p.category, 'is_veg', p.is_veg
            ),
            'quantity', oi.quantity,
            'price', oi.price
          )
        ) AS items
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       LEFT JOIN order_items oi ON o.id = oi.order_id
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE (o.delivery_type = 'cabin' OR o.cabin_number IS NOT NULL) AND o.status != 'cancelled'
       GROUP BY o.id, u.id
       ORDER BY o.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const orders = ordersResult.rows.map((o) => ({
      ...o,
      items: o.items[0]?.id ? o.items : [],
    }));

    res.json({
      orders,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('Get delivery orders error:', err);
    res.status(500).json({ error: 'Failed to fetch delivery orders' });
  }
});

// PUT /delivery/:id/complete - Mark order delivered
router.put('/delivery/:id/complete', verifyUser, checkRole(['delivery', 'admin', 'staff']), async (req, res) => {
  try {
    const { id } = req.params;
    if (!validateUUID(id)) {
      return res.status(400).json({ error: 'Invalid order ID' });
    }

    const orderResult = await query('SELECT * FROM orders WHERE id = $1', [id]);
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orderResult.rows[0];
    if (order.status !== 'ready') {
      return res.status(400).json({ error: `Cannot complete order with status '${order.status}'. Must be 'ready'.` });
    }

    const updatedResult = await query(
      "UPDATE orders SET status = 'completed', updated_at = NOW() WHERE id = $1 RETURNING *",
      [id]
    );

    // Broadcast real-time update
    const broadcastToUser = req.app.get('broadcastToUser');
    if (broadcastToUser) {
      broadcastToUser(order.user_id, {
        type: 'ORDER_STATUS_UPDATED',
        order: {
          id: updatedResult.rows[0].id,
          status: updatedResult.rows[0].status,
          updatedAt: updatedResult.rows[0].updated_at,
        }
      });
    }

    res.json(updatedResult.rows[0]);
  } catch (err) {
    console.error('Complete delivery order error:', err);
    res.status(500).json({ error: 'Failed to complete order' });
  }
});

// Helper: fetch full order by ID
async function getOrderById(orderId) {
  const result = await query(
    `SELECT o.*,
      json_build_object('id', u.id, 'name', u.name, 'phone', u.phone, 'email', u.email) AS user,
      json_agg(
        json_build_object(
          'id', oi.id,
          'product', json_build_object(
            'id', p.id, 'name', p.name, 'price', p.price,
            'image', p.image, 'category', p.category, 'is_veg', p.is_veg
          ),
          'quantity', oi.quantity,
          'price', oi.price
        )
      ) AS items
     FROM orders o
     LEFT JOIN users u ON o.user_id = u.id
     LEFT JOIN order_items oi ON o.id = oi.order_id
     LEFT JOIN products p ON oi.product_id = p.id
     WHERE o.id = $1
     GROUP BY o.id, u.id`,
    [orderId]
  );
  const order = result.rows[0];
  order.items = order.items[0]?.id ? order.items : [];
  return order;
}

module.exports = router;
