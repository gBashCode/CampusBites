import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let messaging = null;

const initFirebase = () => {
    try {
        const app = initializeApp(firebaseConfig);
        messaging = getMessaging(app);
        return true;
    } catch (err) {
        console.error('Firebase init error:', err);
        return false;
    }
};

const requestNotificationPermission = async () => {
    if (!messaging) return null;

    try {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
            return null;
        }

        const token = await getToken(messaging, {
            vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
        });

        return token;
    } catch (err) {
        console.error('Error getting FCM token:', err);
        return null;
    }
};

const onForegroundMessage = (callback) => {
    if (!messaging) return () => {};
    return onMessage(messaging, callback);
};

export { initFirebase, requestNotificationPermission, onForegroundMessage };
