/** @format */

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDu3tFrjlkzvegTcfcLkBfyrLmj1B8p18k",
  authDomain: "dixie-latestdb.firebaseapp.com",
  projectId: "dixie-latestdb",
  storageBucket: "dixie-latestdb.firebasestorage.app",
  messagingSenderId: "942778815273",
  appId: "1:942778815273:web:6d0ff3b4ed8edee1461d38",
  measurementId: "G-HQZV2WR7VW",
};
// console.log(firebaseConfig);

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
