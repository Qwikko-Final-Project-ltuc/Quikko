import { messaging, getToken, onMessage } from "../app/firebase-messaging";

export const registerServiceWorker = async () => {
  try {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      // console.log('Service Worker registered:', registration);
      return registration;
    }
  } catch (err) {
    console.error('Service Worker registration failed:', err);
  }
};

export const requestAndSaveToken = async (userToken) => {
  try {
    const fcmToken = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
    });

    if (fcmToken) {
      await fetch("https://qwikko.onrender.com/api/notifications/save-fcm-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`
        },
        body: JSON.stringify({ fcmToken }),
      });
      // console.log("FCM Token saved:", fcmToken);
    }
  } catch (err) {
    console.error("Error getting FCM token:", err);
  }
};

export const listenToMessages = (callback) => {
  onMessage(messaging, callback);
};
