// public/firebase-messaging-sw.js

// استدعاء مكتبات Firebase compat
importScripts('https://www.gstatic.com/firebasejs/10.2.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.2.0/firebase-messaging-compat.js');

// تهيئة Firebase
firebase.initializeApp({
  apiKey: "AIzaSyDoxvryUVjLKG2iF9rWl-hslQWvVByUEnQ",
  authDomain: "qwikko-b7ace.firebaseapp.com",
  projectId: "qwikko-b7ace",
  storageBucket: "qwikko-b7ace.firebasestorage.app",
  messagingSenderId: "735557421843",
  appId: "1:735557421843:web:b8d95d7fdab2ea3bf068e6",
  measurementId: "G-P3DEB6XKW9"
});

// الحصول على messaging instance
const messaging = firebase.messaging();

// استقبال الرسائل عند background
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Background message received:', payload);

  const notification = payload.notification || {};
  const title = notification.title || 'Notification';
  const body = notification.body || '';

  self.registration.showNotification(title, {
    body,
    icon: '/favicon.ico'
  });
});

// Listener عند الضغط على الإشعار
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification click received.');
  event.notification.close();

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      if (clientList.length > 0) {
        clientList[0].focus();
      } else {
        self.clients.openWindow('/');
      }
    })
  );
});
