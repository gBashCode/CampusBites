const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { verifyUser } = require('../middleware/auth');
const { firebaseInitialized, sendPushNotification } = require('../utils/firebase');

// ─── Save FCM Token ───────────────────────────────────────────────────────
router.post('/fcm-token', verifyUser, async (req, res) => {
    try {
        if (!firebaseInitialized) {
            return res.status(503).json({ message: 'Push notifications not configured' });
        }

        const { token } = req.body;
        if (!token || typeof token !== 'string') {
            return res.status(400).json({ message: 'Valid FCM token is required' });
        }

        // Add token to user's array (avoid duplicates)
        await User.findByIdAndUpdate(
            req.user._id,
            { $addToSet: { fcmTokens: token } }
        );

        res.json({ message: 'FCM token saved' });
    } catch (err) {
        console.error('Error saving FCM token:', err.message);
        res.status(500).json({ message: 'Error saving FCM token' });
    }
});

// ─── Remove FCM Token (on logout) ────────────────────────────────────────
router.post('/fcm-token/remove', verifyUser, async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) return res.status(400).json({ message: 'Token required' });

        await User.findByIdAndUpdate(
            req.user._id,
            { $pull: { fcmTokens: token } }
        );

        res.json({ message: 'FCM token removed' });
    } catch (err) {
        console.error('Error removing FCM token:', err.message);
        res.status(500).json({ message: 'Error removing FCM token' });
    }
});

// ─── Send Test Notification ──────────────────────────────────────────────
router.post('/test', verifyUser, async (req, res) => {
    try {
        if (!firebaseInitialized) {
            return res.status(503).json({ message: 'Push notifications not configured' });
        }

        const user = await User.findById(req.user._id).select('+fcmTokens');
        if (!user || !user.fcmTokens || user.fcmTokens.length === 0) {
            return res.status(400).json({ message: 'No FCM tokens registered for this user' });
        }

        const results = await Promise.allSettled(
            user.fcmTokens.map(token =>
                sendPushNotification(token, 'CampusBites', 'Notifications are working!', { tag: 'test' })
            )
        );

        const successCount = results.filter(r => r.status === 'fulfilled' && r.value === true).length;

        res.json({ message: `Test notification sent to ${successCount} device(s)` });
    } catch (err) {
        console.error('Error sending test notification:', err.message);
        res.status(500).json({ message: 'Error sending test notification' });
    }
});

// ─── Check notification config status ────────────────────────────────────
router.get('/status', verifyUser, async (req, res) => {
    res.json({
        configured: firebaseInitialized,
    });
});

module.exports = router;
