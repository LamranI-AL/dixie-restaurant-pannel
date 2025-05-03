/** @format */

import { useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  User,
} from "firebase/auth";
import { auth } from "@/lib/firebase/config";
// import { auth } from "@/lib/firebase";

export function useFirebaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setUser(user);
        setLoading(false);
      },
      (error) => {
        setError(error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      setUser(userCredential.user);
      return userCredential.user;
    } catch (error) {
      setError(error as Error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      setUser(userCredential.user);
      return userCredential.user;
    } catch (error) {
      setError(error as Error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      setError(null);
      await signOut(auth);
      setUser(null);
    } catch (error) {
      setError(error as Error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { user, loading, error, signUp, login, logout };
}
