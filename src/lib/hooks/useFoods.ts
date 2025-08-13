/** @format */

import { useState, useCallback } from "react";
import {
  collection,
  addDoc,
  getDocs,
  query,
  doc,
  getDoc,
  deleteDoc,
  updateDoc,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Food, Variation, Addon, TrendingFood } from "@/lib/types";
import {
  serializeFirebaseData,
  serializeFirebaseDocument,
} from "@/utils/serializeData";

interface UseFoodsReturn {
  foods: Food[];
  trendingFoods: TrendingFood[];
  loading: boolean;
  error: string | null;
  addFood: (
    data: Food,
  ) => Promise<{ success: boolean; id?: string; error?: string }>;
  getAllFoods: () => Promise<void>;
  getFoodsByCategory: (
    categoryId: string,
  ) => Promise<{ success: boolean; foods?: Food[]; error?: string }>;
  getFoodById: (
    id: string,
  ) => Promise<{ success: boolean; food?: Food; error?: string }>;
  getPopularFoods: () => Promise<void>;
  getTopRatedFoods: (
    limitCount?: number,
  ) => Promise<{ success: boolean; foods?: Food[]; error?: string }>;
  updateFood: (
    id: string,
    data: Partial<Food>,
  ) => Promise<{ success: boolean; error?: string }>;
  deleteFood: (id: string) => Promise<{ success: boolean; error?: string }>;
  toggleFoodAvailability: (
    id: string,
    isAvailable: boolean,
  ) => Promise<{ success: boolean; error?: string }>;
  addVariationToFood: (
    id: string,
    variation: Variation,
  ) => Promise<{ success: boolean; error?: string }>;
  addAddonToFood: (
    id: string,
    addon: Addon,
  ) => Promise<{ success: boolean; error?: string }>;
  searchFoods: (
    searchTerm: string,
  ) => Promise<{ success: boolean; foods?: Food[]; error?: string }>;
  clearError: () => void;
}

export function useFoods(): UseFoodsReturn {
  const [foods, setFoods] = useState<Food[]>([]);
  const [trendingFoods, setTrendingFoods] = useState<TrendingFood[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const addFood = useCallback(async (data: Food) => {
    try {
      setLoading(true);
      setError(null);

      const {
        name,
        description,
        image,
        price,
        discountPrice,
        images,
        cuisineId,
        isAvailable,
        preparationTime,
        variations,
        addons,
        restaurantId,
        totalSold,
        rating,
        reviewCount,
      } = data;

      const newFood = {
        name,
        description,
        image,
        price,
        discountPrice,
        images,
        cuisineId,
        isAvailable,
        preparationTime,
        variations,
        addons,
        restaurantId,
        totalSold,
        rating,
        reviewCount,
        createdAt: new Date(),
      };

      const foodRef = collection(db, "products");
      const docRef = await addDoc(foodRef, newFood);

      // Mettre à jour la liste locale
      const addedFood = { id: docRef.id, ...newFood } as Food;
      setFoods((prev) => [...prev, addedFood]);

      return { success: true, id: docRef.id };
    } catch (err) {
      const errorMessage = (err as Error).message;
      setError(errorMessage);
      console.error("Error adding food:", err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const getAllFoods = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const foodRef = collection(db, "products");
      const querySnapshot = await getDocs(foodRef);

      const foodsData: Food[] = [];
      querySnapshot.forEach((doc) => {
        // Sérialiser les données avant de les retourner
        const foodData = serializeFirebaseDocument({
          id: doc.id,
          ...doc.data(),
        });

        foodsData.push(foodData as Food);
      });

      setFoods(foodsData);
    } catch (err) {
      const errorMessage = (err as Error).message;
      setError(errorMessage);
      console.error("Error getting foods:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getFoodsByCategory = useCallback(async (categoryId: string) => {
    try {
      setLoading(true);
      setError(null);

      const foodRef = collection(db, "products");
      const q = query(foodRef, where("cuisineId", "==", categoryId));
      const querySnapshot = await getDocs(q);

      const foodsData: Food[] = [];
      querySnapshot.forEach((doc) => {
        // Sérialiser les données
        const foodData = serializeFirebaseDocument({
          id: doc.id,
          ...doc.data(),
        });

        foodsData.push(foodData as Food);
      });

      return { success: true, foods: foodsData };
    } catch (err) {
      const errorMessage = (err as Error).message;
      setError(errorMessage);
      console.error("Error getting foods by category:", err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const getFoodById = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const foodRef = doc(db, "products", id);
      const docSnap = await getDoc(foodRef);

      if (docSnap.exists()) {
        // Sérialiser les données du document
        const foodData = serializeFirebaseDocument({
          id: docSnap.id,
          ...docSnap.data(),
        });

        return {
          success: true,
          food: foodData as Food,
        };
      } else {
        return { success: false, error: "Food item not found" };
      }
    } catch (err) {
      const errorMessage = (err as Error).message;
      setError(errorMessage);
      console.error("Error getting food:", err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const getPopularFoods = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const foodRef = collection(db, "trendingItems");
      const q = query(foodRef, orderBy("discount", "desc"));
      const querySnapshot = await getDocs(q);

      const trendingFoodsData: TrendingFood[] = [];
      querySnapshot.forEach((doc) => {
        // Sérialiser les données
        const foodData = serializeFirebaseDocument({
          id: doc.id,
          ...doc.data(),
        });

        trendingFoodsData.push(foodData as TrendingFood);
      });

      setTrendingFoods(trendingFoodsData);
    } catch (err) {
      const errorMessage = (err as Error).message;
      setError(errorMessage);
      console.error("Error getting popular foods:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getTopRatedFoods = useCallback(async (limitCount: number = 10) => {
    try {
      setLoading(true);
      setError(null);

      const foodRef = collection(db, "products");
      const q = query(foodRef, orderBy("rating", "desc"), limit(limitCount));
      const querySnapshot = await getDocs(q);

      const foodsData: Food[] = [];
      querySnapshot.forEach((doc) => {
        // Sérialiser les données
        const foodData = serializeFirebaseDocument({
          id: doc.id,
          ...doc.data(),
        });

        foodsData.push(foodData as Food);
      });

      return { success: true, foods: foodsData };
    } catch (err) {
      const errorMessage = (err as Error).message;
      setError(errorMessage);
      console.error("Error getting top-rated foods:", err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateFood = useCallback(async (id: string, data: Partial<Food>) => {
    try {
      setLoading(true);
      setError(null);

      const foodRef = doc(db, "products", id);
      await updateDoc(foodRef, {
        ...data,
        updatedAt: new Date(),
      });

      // Mettre à jour la liste locale
      setFoods((prev) =>
        prev.map((food) =>
          food.id === id ? { ...food, ...data, updatedAt: new Date() } : food,
        ),
      );

      return { success: true };
    } catch (err) {
      const errorMessage = (err as Error).message;
      setError(errorMessage);
      console.error("Error updating food:", err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteFood = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const foodRef = doc(db, "products", id);
      await deleteDoc(foodRef);

      // Mettre à jour la liste locale
      setFoods((prev) => prev.filter((food) => food.id !== id));

      return { success: true };
    } catch (err) {
      const errorMessage = (err as Error).message;
      setError(errorMessage);
      console.error("Error deleting food:", err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleFoodAvailability = useCallback(
    async (id: string, isAvailable: boolean) => {
      try {
        setLoading(true);
        setError(null);

        const foodRef = doc(db, "products", id);
        await updateDoc(foodRef, {
          isAvailable: isAvailable,
          updatedAt: new Date(),
        });

        // Mettre à jour la liste locale
        setFoods((prev) =>
          prev.map((food) =>
            food.id === id
              ? { ...food, isAvailable, updatedAt: new Date() }
              : food,
          ),
        );

        return { success: true };
      } catch (err) {
        const errorMessage = (err as Error).message;
        setError(errorMessage);
        console.error("Error toggling food availability:", err);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const addVariationToFood = useCallback(
    async (id: string, variation: Variation) => {
      try {
        setLoading(true);
        setError(null);

        const foodRef = doc(db, "products", id);
        const foodSnap = await getDoc(foodRef);

        if (!foodSnap.exists()) {
          return { success: false, error: "Food item not found" };
        }

        const foodData = foodSnap.data();
        const variations = foodData.variations || [];

        await updateDoc(foodRef, {
          variations: [...variations, variation],
          updatedAt: new Date(),
        });

        // Mettre à jour la liste locale
        setFoods((prev) =>
          prev.map((food) =>
            food.id === id
              ? {
                  ...food,
                  variations: [...(food.variations || []), variation],
                  updatedAt: new Date(),
                }
              : food,
          ),
        );

        return { success: true };
      } catch (err) {
        const errorMessage = (err as Error).message;
        setError(errorMessage);
        console.error("Error adding variation to food:", err);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const addAddonToFood = useCallback(async (id: string, addon: Addon) => {
    try {
      setLoading(true);
      setError(null);

      const foodRef = doc(db, "products", id);
      const foodSnap = await getDoc(foodRef);

      if (!foodSnap.exists()) {
        return { success: false, error: "Food item not found" };
      }

      const foodData = foodSnap.data();
      const addons = foodData.addons || [];

      await updateDoc(foodRef, {
        addons: [...addons, addon],
        updatedAt: new Date(),
      });

      // Mettre à jour la liste locale
      setFoods((prev) =>
        prev.map((food) =>
          food.id === id
            ? {
                ...food,
                addons: [...(food.addons || []), addon],
                updatedAt: new Date(),
              }
            : food,
        ),
      );

      return { success: true };
    } catch (err) {
      const errorMessage = (err as Error).message;
      setError(errorMessage);
      console.error("Error adding addon to food:", err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const searchFoods = useCallback(async (searchTerm: string) => {
    try {
      setLoading(true);
      setError(null);

      const foodRef = collection(db, "products");
      const querySnapshot = await getDocs(foodRef);

      const foodsData: Food[] = [];
      querySnapshot.forEach((doc) => {
        const rawFoodData = doc.data();
        if (rawFoodData.name.toLowerCase().includes(searchTerm.toLowerCase())) {
          // Sérialiser les données
          const foodData = serializeFirebaseDocument({
            id: doc.id,
            ...rawFoodData,
          });

          foodsData.push(foodData as Food);
        }
      });

      return { success: true, foods: foodsData };
    } catch (err) {
      const errorMessage = (err as Error).message;
      setError(errorMessage);
      console.error("Error searching foods:", err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    foods,
    trendingFoods,
    loading,
    error,
    addFood,
    getAllFoods,
    getFoodsByCategory,
    getFoodById,
    getPopularFoods,
    getTopRatedFoods,
    updateFood,
    deleteFood,
    toggleFoodAvailability,
    addVariationToFood,
    addAddonToFood,
    searchFoods,
    clearError,
  };
}
