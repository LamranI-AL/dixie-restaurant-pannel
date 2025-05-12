/** @format */

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  initializeFirestore,
  CACHE_SIZE_UNLIMITED,
  persistentLocalCache,
  persistentSingleTabManager,
} from "firebase/firestore";
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

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Configuration avancée de Firestore avec gestion du cache
export const db = initializeFirestore(app, {
  // Utiliser un cache local persistant mais avec une meilleure gestion
  localCache: persistentLocalCache({
    tabManager: persistentSingleTabManager({}),
    // Vous pouvez définir cacheSizeBytes si nécessaire
    // cacheSizeBytes: CACHE_SIZE_UNLIMITED,
  }),
  // Ignorer les propriétés undefined pour éviter des erreurs
  ignoreUndefinedProperties: true,
});

export const storage = getStorage(app);

export default app;
