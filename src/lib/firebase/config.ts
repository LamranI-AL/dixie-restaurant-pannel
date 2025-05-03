/** @format */

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCJCZHxxin3S_YPyU8nch1T0VGiYShFZJ4",
  authDomain: "dixieapp-bcb6b.firebaseapp.com",
  projectId: "dixieapp-bcb6b",
  storageBucket: "dixieapp-bcb6b.firebasestorage.app",
  messagingSenderId: "369980842371",
  appId: "1:369980842371:web:7811e7be5b8b027525d6b6",
  measurementId: "G-DLWMK369YM",
};
// console.log(firebaseConfig);

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
