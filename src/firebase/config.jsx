// Import the functions you need from the SDKs you need
import { initializeApp, getApps,getApp } from "firebase/app";
import {getFirestore} from "firebase/firestore";
import {getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from "firebase/auth"
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA1g0xPm8ZbgYQMsHqehCSxhNsr0Rk5O4Q",
  authDomain: "chatter-51f5b.firebaseapp.com",
  projectId: "chatter-51f5b",
  storageBucket: "chatter-51f5b.firebasestorage.app",
  messagingSenderId: "56231548438",
  appId: "1:56231548438:web:fe346acd5f1b6c900fc737"
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const storage = getStorage(app);


setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.error('Auth persistence setup failed:', err);
});


