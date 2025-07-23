/** @format */

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyA0HdeDYIv38UHICf7tsFaXWtFNG_5WUSE",
  authDomain: "afood-a8ea4.firebaseapp.com",
  projectId: "afood-a8ea4",
  storageBucket: "afood-a8ea4.firebasestorage.app",
  messagingSenderId: "555100471697",
  appId: "1:555100471697:web:c259b06146389fa9901a30",
  measurementId: "G-8W46V6QGQV",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Utiliser getFirestore standard sans aucune configuration de cache
export const db = getFirestore(app);

export const storage = getStorage(app);

// Fonction utilitaire pour convertir les Timestamps Firestore en objets Date
export function convertTimestamps(obj: any): any {
  if (!obj) return null;

  if (Array.isArray(obj)) {
    return obj.map(convertTimestamps);
  }

  if (typeof obj === "object" && obj !== null) {
    // Si c'est un timestamp
    if (obj.seconds !== undefined && obj.nanoseconds !== undefined) {
      return new Date(obj.seconds * 1000);
    }

    // Récursion pour les objets imbriqués
    const result: Record<string, any> = {};
    for (const key in obj) {
      result[key] = convertTimestamps(obj[key]);
    }
    return result;
  }

  return obj;
}

export default app;
