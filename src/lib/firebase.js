import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA9GpgM5IFH6Jm4nl-W0bdZkNm_iwqPeSo",
  authDomain: "meet-up-projecktbits.firebaseapp.com",
  databaseURL: "https://meet-up-projecktbits-default-rtdb.firebaseio.com",
  projectId: "meet-up-projecktbits",
  storageBucket: "meet-up-projecktbits.firebasestorage.app",
  messagingSenderId: "762504406629",
  appId: "1:762504406629:web:b4866810571a65a572888c",
  measurementId: "G-4Z1HKSK1JR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
const database = getDatabase(app);
const auth = getAuth(app);

export { app, analytics, database, auth };

