import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyCvYxc78C6c1UYG9R9CseWuTs8umgcE7sU",
  authDomain: "chromesthesia-app.firebaseapp.com",
  projectId: "chromesthesia-app",
  storageBucket: "chromesthesia-app.firebasestorage.app",
  messagingSenderId: "893760100292",
  appId: "1:893760100292:web:bf7dcd683e011768aaf691",
  // measurementId will be available after enabling GA4 in Firebase Console
  // measurementId: "G-XXXXXXXXXX",
};

const app = initializeApp(firebaseConfig);

let analytics: Analytics | null = null;

// Initialize analytics only in supported environments
export const initFirebaseAnalytics = async (): Promise<Analytics | null> => {
  try {
    const supported = await isSupported();
    if (supported) {
      analytics = getAnalytics(app);
      return analytics;
    }
  } catch (e) {
    // Silently fail — analytics not critical
  }
  return null;
};

export const getFirebaseAnalytics = () => analytics;
export default app;
