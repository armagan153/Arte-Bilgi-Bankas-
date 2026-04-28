// src/firebase/config.js
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

// Daha önce initialize edilmişse yeniden oluşturma
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const db   = getFirestore(app);
export const auth = getAuth(app);
export default app;

/** Config'in gerçek değerlerle dolu olup olmadığını kontrol et */
export const isFirebaseConfigured = () =>
  Boolean(
    import.meta.env.VITE_FIREBASE_API_KEY &&
    !import.meta.env.VITE_FIREBASE_API_KEY.startsWith('YOUR_')
  );
