import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD5knfExC9gBeUJONpvN_wOSQwqe9gEPjQ",
  authDomain: "wiki---club-tracker.firebaseapp.com",
  projectId: "wiki---club-tracker",
  storageBucket: "wiki---club-tracker.firebasestorage.app",
  messagingSenderId: "748291565778",
  appId: "1:748291565778:web:eccf7f7b0873d76cdda50b",
  measurementId: "G-MCLY01PG7M"
};

// Initialize Firebase safely
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);