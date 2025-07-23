/** @format */

import { useState, useCallback } from "react";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Category } from "@/lib/types";

interface UseCategoriesReturn {
  categories: Category[];
  loading: boolean;
  error: string | null;
  addCategory: (
    data: Category,
  ) => Promise<{ success: boolean; id?: string; error?: string }>;
  getAllCategories: () => Promise<void>;
  getCategoryById: (
    id: string,
  ) => Promise<{ success: boolean; category?: Category; error?: string }>;
  updateCategory: (
    id: string,
    data: Partial<Category>,
  ) => Promise<{ success: boolean; error?: string }>;
  deleteCategory: (id: string) => Promise<{ success: boolean; error?: string }>;
  clearError: () => void;
}

export function useCategories(): UseCategoriesReturn {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const addCategory = useCallback(async (data: Category) => {
    try {
      setLoading(true);
      setError(null);

      const { name, image, status, userId, description, longDescription } =
        data;
      const categoryRef = collection(db, "cuisines");
      const docRef = await addDoc(categoryRef, {
        name,
        image,
        status,
        description,
        userId,
        longDescription,
      });

      // Optionnel: mettre à jour la liste locale
      const newCategory: any = { id: docRef.id, ...data };
      setCategories((prev) => [...prev, newCategory]);

      return { success: true, id: docRef.id };
    } catch (err) {
      const errorMessage = (err as Error).message;
      setError(errorMessage);
      console.error("Error adding category:", err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const getAllCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const categoryRef = collection(db, "cuisines");
      const querySnapshot = await getDocs(categoryRef);

      const categoriesData: Category[] = [];
      querySnapshot.forEach((doc) => {
        categoriesData.push({ id: doc.id, ...doc.data() } as Category);
      });

      setCategories(categoriesData);
    } catch (err) {
      const errorMessage = (err as Error).message;
      setError(errorMessage);
      console.error("Error getting categories:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getCategoryById = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const categoryRef = doc(db, "cuisines", id);
      const docSnap = await getDoc(categoryRef);

      if (docSnap.exists()) {
        const category = { id: docSnap.id, ...docSnap.data() } as Category;
        return { success: true, category };
      } else {
        return { success: false, error: "Category not found" };
      }
    } catch (err) {
      const errorMessage = (err as Error).message;
      setError(errorMessage);
      console.error("Error getting category:", err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCategory = useCallback(
    async (id: string, data: Partial<Category>) => {
      try {
        setLoading(true);
        setError(null);

        const categoryRef = doc(db, "cuisines", id);
        await updateDoc(categoryRef, data);

        // Optionnel: mettre à jour la liste locale
        setCategories((prev) =>
          prev.map((cat) => (cat.id === id ? { ...cat, ...data } : cat)),
        );

        return { success: true };
      } catch (err) {
        const errorMessage = (err as Error).message;
        setError(errorMessage);
        console.error("Error updating category:", err);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const deleteCategory = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const categoryRef = doc(db, "cuisines", id);
      await deleteDoc(categoryRef);

      // Optionnel: mettre à jour la liste locale
      setCategories((prev) => prev.filter((cat) => cat.id !== id));

      return { success: true };
    } catch (err) {
      const errorMessage = (err as Error).message;
      setError(errorMessage);
      console.error("Error deleting category:", err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    categories,
    loading,
    error,
    addCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
    clearError,
  };
}
