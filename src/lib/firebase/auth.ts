/** @format */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  User as FirebaseUser,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "./config";
import { User } from "../types";

export const signUp = async (
  email: string,
  password: string,
  name: string,
  restaurantId: string,
  role: "admin" | "manager" | "staff" = "admin",
): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const user = userCredential.user;

    await updateProfile(user, { displayName: name });

    // Create a user document in Firestore
    const userData: User | any = {
      id: user.uid,
      email: user.email || email,

      role,
      restaurantId,
      photoURL: user.photoURL || undefined,
    };

    await setDoc(doc(db, "users", user.uid), userData);

    return userData;
  } catch (error) {
    console.error("Error signing up:", error);
    throw error;
  }
};

export const signIn = async (
  email: string,
  password: string,
): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const user = userCredential.user;

    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid));

    if (userDoc.exists()) {
      return userDoc.data() as User;
    } else {
      throw new Error("User document does not exist");
    }
  } catch (error) {
    console.error("Error signing in:", error);
    throw error;
  }
};

export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user: FirebaseUser | null) => {
        unsubscribe();

        if (user) {
          try {
            const userDoc = await getDoc(doc(db, "users", user.uid));

            if (userDoc.exists()) {
              resolve(userDoc.data() as User);
            } else {
              resolve(null);
            }
          } catch (error) {
            reject(error);
          }
        } else {
          resolve(null);
        }
      },
      reject,
    );
  });
};

export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error("Error resetting password:", error);
    throw error;
  }
};
