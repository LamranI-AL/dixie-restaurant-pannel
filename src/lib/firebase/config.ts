/** @format */

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyC7eddeYoCqEn4au25Gs7eQbpWpuBbXVtg",
  authDomain: "dixie-solution.firebaseapp.com",
  projectId: "dixie-solution",
  storageBucket: "dixie-solution.firebasestorage.app",
  messagingSenderId: "831709659427",
  appId: "1:831709659427:web:848f5c80eb677327b20c96",
  measurementId: "G-8Z3NE5T9PV"
};
// console.log(firebaseConfig);

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
