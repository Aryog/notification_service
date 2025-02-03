import { getApp, getApps, initializeApp } from "firebase/app";
import { getMessaging, getToken, isSupported } from "firebase/messaging";

// Replace the following with your app's Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyATyXRoI6UferGzYk4ijdS0W3CnACCKx0E",
  authDomain: "notification-fcm-9b9b9.firebaseapp.com",
  projectId: "notification-fcm-9b9b9",
  storageBucket: "notification-fcm-9b9b9.firebasestorage.app",
  messagingSenderId: "13707701007",
  appId: "1:13707701007:web:82b50dc96b2b759684ec7a",
  measurementId: "G-GXQS2S2HKJ"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const messaging = async () => {
  const supported = await isSupported();
  return supported ? getMessaging(app) : null;
};

export const fetchToken = async () => {
  try {
    const fcmMessaging = await messaging();
    if (fcmMessaging) {
      const token = await getToken(fcmMessaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_FCM_VAPID_KEY,
      });
      return token;
    }
    return null;
  } catch (err) {
    console.error("An error occurred while fetching the token:", err);
    return null;
  }
};

export { app, messaging };
