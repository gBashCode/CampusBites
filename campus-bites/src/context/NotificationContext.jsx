import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { initFirebase, requestNotificationPermission, onForegroundMessage } from '../firebase';
import { useAuth } from './AuthContext';
import API_URL from '../apiConfig';

const NotificationContext = createContext(null);

const STATUS_MESSAGES = {
    pending: { title: 'Order Placed! 🍔', body: 'Your order has been placed successfully.' },
    preparing: { title: 'Being Prepared! 👨‍🍳', body: 'Your meal is now being prepared by our chef.' },
    ready: { title: 'Order Ready! 📦', body: 'Your order is ready! Please pick it up.' },
    completed: { title: 'Order Complete! ✅', body: 'Your order has been handed over. Enjoy!' },
    cancelled: { title: 'Order Cancelled ❌', body: 'Your order has been cancelled.' },
};

export const NotificationProvider = ({ children }) => {
    const { user, token } = useAuth();
    const [permission, setPermission] = useState(
        typeof Notification !== 'undefined' ? Notification.permission : 'default'
    );
    const [toast, setToast] = useState(null);
    const toastTimeout = useRef(null);

    // Initialize Firebase and request permission on login
    useEffect(() => {
        if (!user || !token) return;

        const setupNotifications = async () => {
            const initialized = initFirebase();
            if (!initialized) return;

            // Check if already granted
            if (Notification.permission === 'granted') {
                const fcmToken = await requestNotificationPermission();
                if (fcmToken) {
                    await saveToken(fcmToken);
                }
            }

            setPermission(Notification.permission);
        };

        setupNotifications();
    }, [user, token]);

    // Listen for foreground messages
    useEffect(() => {
        if (!user) return;

        const init = async () => {
            initFirebase();
            const unsubscribe = onForegroundMessage((payload) => {
                const title = payload.notification?.title || 'CampusBites';
                const body = payload.notification?.body || '';
                showToast(title, body);
            });
            return unsubscribe;
        };

        let unsub;
        init().then(u => { unsub = u; });

        return () => {
            if (unsub) unsub();
        };
    }, [user]);

    const saveToken = async (fcmToken) => {
        try {
            const storedToken = localStorage.getItem('token');
            await fetch(`${API_URL}/api/notifications/fcm-token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${storedToken}`,
                },
                body: JSON.stringify({ token: fcmToken }),
            });
        } catch (err) {
            console.error('Error saving FCM token:', err);
        }
    };

    const enableNotifications = useCallback(async () => {
        const initialized = initFirebase();
        if (!initialized) return false;

        const fcmToken = await requestNotificationPermission();
        if (fcmToken) {
            await saveToken(fcmToken);
            setPermission('granted');
            return true;
        }
        setPermission(Notification.permission);
        return false;
    }, []);

    const showToast = useCallback((title, body) => {
        if (toastTimeout.current) clearTimeout(toastTimeout.current);
        setToast({ title, body });
        toastTimeout.current = setTimeout(() => setToast(null), 5000);
    }, []);

    const dismissToast = useCallback(() => {
        if (toastTimeout.current) clearTimeout(toastTimeout.current);
        setToast(null);
    }, []);

    const sendTestNotification = useCallback(async () => {
        try {
            const storedToken = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/notifications/test`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${storedToken}`,
                },
            });
            const data = await res.json();
            showToast('Test', data.message);
        } catch (err) {
            showToast('Error', 'Failed to send test notification');
        }
    }, [showToast]);

    return (
        <NotificationContext.Provider
            value={{ permission, enableNotifications, showToast, dismissToast, toast, sendTestNotification }}
        >
            {children}
            {toast && <ToastNotification title={toast.title} body={toast.body} onDismiss={dismissToast} />}
        </NotificationContext.Provider>
    );
};

const ToastNotification = ({ title, body, onDismiss }) => {
    return (
        <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 9999,
            background: 'rgba(20, 20, 30, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '16px 20px',
            maxWidth: '360px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            animation: 'slideIn 0.3s ease-out',
            fontFamily: "'Outfit', sans-serif",
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                    <div style={{ color: '#fff', fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>{title}</div>
                    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', lineHeight: '1.4' }}>{body}</div>
                </div>
                <button
                    onClick={onDismiss}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'rgba(255,255,255,0.5)',
                        cursor: 'pointer',
                        fontSize: '18px',
                        padding: '0',
                        lineHeight: 1,
                    }}
                >
                    ×
                </button>
            </div>
            <style>{`
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export const useNotifications = () => useContext(NotificationContext);
