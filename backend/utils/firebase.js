let admin;
try { admin = require('firebase-admin'); } catch(e) { admin = null; }
const path = require('path');
const fs = require('fs');

let firebaseInitialized = false;

if (!admin) {
    console.warn('WARNING: firebase-admin not installed. Push notifications disabled.');
} else try {
    // Try loading from serviceAccountKey.json file first (local dev)
    const keyPath = path.join(__dirname, '..', 'serviceAccountKey.json');
    if (fs.existsSync(keyPath)) {
        process.env.GOOGLE_APPLICATION_CREDENTIALS = keyPath;
        admin.initializeApp({});
        firebaseInitialized = true;
        console.log('Firebase Admin initialized via serviceAccountKey.json');
    } else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        // Production: write env var to temp file and use it
        const tmpPath = path.join(__dirname, '..', '.firebase-sa-tmp.json');
        fs.writeFileSync(tmpPath, process.env.FIREBASE_SERVICE_ACCOUNT, 'utf8');
        process.env.GOOGLE_APPLICATION_CREDENTIALS = tmpPath;
        admin.initializeApp({});
        firebaseInitialized = true;
        console.log('Firebase Admin initialized via FIREBASE_SERVICE_ACCOUNT env');
    } else {
        console.warn('WARNING: No Firebase service account found. Push notifications will not work.');
    }
} catch (err) {
    console.error('Firebase Admin initialization error:', err.message);
}

const sendPushNotification = async (fcmToken, title, body, data = {}) => {
    if (!admin || !firebaseInitialized || !fcmToken) return false;

    try {
        await admin.messaging().send({
            token: fcmToken,
            notification: { title, body },
            data,
            webpush: {
                fcm_options: {
                    link: data.link || '/dashboard/orders',
                },
                notification: {
                    title,
                    body,
                    icon: '/favicon.ico',
                    badge: '/favicon.ico',
                    tag: data.tag || 'campusbites',
                    renotify: true,
                },
            },
        });
        return true;
    } catch (err) {
        if (err.code === 'messaging/registration-token-not-registered' ||
            err.code === 'messaging/invalid-registration-token') {
            console.warn('Invalid FCM token, should be removed:', fcmToken.slice(0, 20));
            return 'INVALID';
        }
        console.error('Push notification error:', err.message);
        return false;
    }
};

const sendPushToUser = async (user, title, body, data = {}) => {
    if (!user || !user.fcmTokens || user.fcmTokens.length === 0) return;

    const results = await Promise.allSettled(
        user.fcmTokens.map(token => sendPushNotification(token, title, body, data))
    );

    // Collect invalid tokens for cleanup
    const invalidTokens = [];
    results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value === 'INVALID') {
            invalidTokens.push(user.fcmTokens[index]);
        }
    });

    // Return invalid tokens so caller can clean them up
    return invalidTokens;
};

module.exports = { admin, firebaseInitialized, sendPushNotification, sendPushToUser };
