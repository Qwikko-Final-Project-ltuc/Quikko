// src/utlis/fcm.js
import { messaging, getToken, onMessage } from "../app/firebase-messaging";

// تسجيل Service Worker
export const registerServiceWorker = async () => {
  try {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      console.log('Service Worker registered:', registration);
      return registration;
    }
  } catch (err) {
    console.error('Service Worker registration failed:', err);
  }
};

// طلب وحفظ FCM token
export const requestAndSaveToken = async (userToken) => {
  try {
    const fcmToken = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
    });

    if (fcmToken) {
      await fetch("http://localhost:3000/api/notifications/save-fcm-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`
        },
        body: JSON.stringify({ fcmToken }),
      });
      console.log("FCM Token saved:", fcmToken);
    }
  } catch (err) {
    console.error("Error getting FCM token:", err);
  }
};

// استقبال الرسائل عند foreground
export const listenToMessages = (callback) => {
  onMessage(messaging, callback);
};
