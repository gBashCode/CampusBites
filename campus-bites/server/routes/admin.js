const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { verifyUser, checkRole } = require('../middleware/auth');

// GET /api/admin/stats - Dashboard stats (admin only)
router.get('/stats', verifyUser, checkRole(['admin']), async (req, res) => {
  try {
    const [usersResult, productsResult, ordersResult, revenueResult, statusResult, recentResult] = await Promise.all([
      query('SELECT COUNT(*) AS count FROM users'),
      query('SELECT COUNT(*) AS count FROM products'),
      query('SELECT COUNT(*) AS count FROM orders'),
      query("SELECT COALESCE(SUM(total_amount), 0) AS total FROM orders WHERE status != 'cancelled'"),
      query(`SELECT status, COUNT(*) AS count FROM orders GROUP BY status`),
      query(`
        SELECT date_trunc('day', created_at)::date AS day, COUNT(*) AS count, COALESCE(SUM(total_amount), 0) AS revenue
        FROM orders
        WHERE created_at >= NOW() - INTERVAL '14 days'
        GROUP BY day
        ORDER BY day ASC
      `),
    ]);

    const statusMap = {};
    for (const row of statusResult.rows) {
      statusMap[row.status] = parseInt(row.count);
    }

    res.json({
      totalUsers: parseInt(usersResult.rows[0].count),
      totalProducts: parseInt(productsResult.rows[0].count),
      totalOrders: parseInt(ordersResult.rows[0].count),
      revenue: parseInt(revenueResult.rows[0].total),
      ordersByStatus: {
        pending: statusMap.pending || 0,
        preparing: statusMap.preparing || 0,
        ready: statusMap.ready || 0,
        completed: statusMap.completed || 0,
        cancelled: statusMap.cancelled || 0,
      },
      recentOrders: recentResult.rows.map((r) => ({
        day: r.day,
        count: parseInt(r.count),
        revenue: parseInt(r.revenue),
      })),
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
});

module.exports = router;
