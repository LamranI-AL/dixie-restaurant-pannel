/** @format */

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCisrJOCCLsnx_afR3ldti9G-QzjU5iEWA",
  authDomain: "dixie-restaurant-ef65f.firebaseapp.com",
  projectId: "dixie-restaurant-ef65f",
  storageBucket: "dixie-restaurant-ef65f.firebasestorage.app",
  messagingSenderId: "82689189545",
  appId: "1:82689189545:web:a6db51d93df771d827ebb8",
  measurementId: "G-TVXTHFVT4Z"
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
