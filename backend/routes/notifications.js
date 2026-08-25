const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { verifyUser } = require('../middleware/auth');
const { firebaseInitialized, sendPushNotification } = require('../utils/firebase');

// POST /fcm-token - Save FCM token for user
router.post('/fcm-token', verifyUser, async (req, res) => {
  try {
    const { token } = req.body;

    if (!token || typeof token !== 'string' || token.trim().length === 0) {
      return res.status(400).json({ message: 'FCM token is required' });
    }

    const trimmedToken = token.trim();

    // Remove first then append to avoid duplicates
    await query(
      `UPDATE users
       SET fcm_tokens = array_remove(fcm_tokens, $1)
       WHERE id = $2`,
      [trimmedToken, req.user.id]
    );

    await query(
      `UPDATE users
       SET fcm_tokens = array_append(fcm_tokens, $1)
       WHERE id = $2`,
      [trimmedToken, req.user.id]
    );

    res.json({ message: 'FCM token saved successfully' });
  } catch (err) {
    console.error('Save FCM token error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /fcm-token/remove - Remove FCM token
router.post('/fcm-token/remove', verifyUser, async (req, res) => {
  try {
    const { token } = req.body;

    if (!token || typeof token !== 'string' || token.trim().length === 0) {
      return res.status(400).json({ message: 'FCM token is required' });
    }

    const trimmedToken = token.trim();

    await query(
      `UPDATE users
       SET fcm_tokens = array_remove(fcm_tokens, $1)
       WHERE id = $2`,
      [trimmedToken, req.user.id]
    );

    res.json({ message: 'FCM token removed successfully' });
  } catch (err) {
    console.error('Remove FCM token error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /test - Send test notification
router.post('/test', verifyUser, async (req, res) => {
  try {
    const result = await query('SELECT fcm_tokens FROM users WHERE id = $1', [req.user.id]);
    const user = result.rows[0];

    if (!user || !user.fcm_tokens || user.fcm_tokens.length === 0) {
      return res.status(400).json({ message: 'No FCM tokens registered for this user' });
    }

    const title = 'Campus Bites';
    const body = 'This is a test notification from Campus Bites!';

    let sentCount = 0;
    let failedCount = 0;

    for (const token of user.fcm_tokens) {
      const result = await sendPushNotification(token, title, body, {
        tag: 'test-notification',
        link: '/dashboard/orders',
      });
      if (result === true) {
        sentCount++;
      } else {
        failedCount++;
      }
    }

    res.json({
      message: 'Test notification sent',
      sent: sentCount,
      failed: failedCount,
    });
  } catch (err) {
    console.error('Send test notification error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /status - Check notification config
router.get('/status', verifyUser, (req, res) => {
  res.json({ configured: firebaseInitialized });
});

module.exports = router;
