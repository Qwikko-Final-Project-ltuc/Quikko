// src/app/firebase-messaging.js
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyDoxvryUVjLKG2iF9rWl-hslQWvVByUEnQ",
  authDomain: "qwikko-b7ace.firebaseapp.com",
  projectId: "qwikko-b7ace",
  storageBucket: "qwikko-b7ace.firebasestorage.app",
  messagingSenderId: "735557421843",
  appId: "1:735557421843:web:b8d95d7fdab2ea3bf068e6",
  measurementId: "G-P3DEB6XKW9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export { messaging, getToken, onMessage };
