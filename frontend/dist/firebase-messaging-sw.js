importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyCP6CPNl3w-yWY7SliCU1IJ-GUYbcV2oWQ",
    authDomain: "campusbites-4b9f5.firebaseapp.com",
    projectId: "campusbites-4b9f5",
    storageBucket: "campusbites-4b9f5.firebasestorage.app",
    messagingSenderId: "322589352227",
    appId: "1:322589352227:web:422f88acbc2e606fd2ec96",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    const title = payload.notification?.title || 'CampusBites';
    const options = {
        body: payload.notification?.body || 'You have a new notification',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: payload.data?.tag || 'campusbites',
        renotify: true,
        data: {
            url: payload.data?.link || '/dashboard/orders',
        },
    };

    self.registration.showNotification(title, options);
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const url = event.notification.data?.url || '/dashboard/orders';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            for (const client of windowClients) {
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    client.navigate(url);
                    return client.focus();
                }
            }
            return clients.openWindow(url);
        })
    );
});
