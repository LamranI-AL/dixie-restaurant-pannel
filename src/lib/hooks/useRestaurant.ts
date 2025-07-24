/** @format */

"use client";

import { useState, useCallback } from "react";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  deleteDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Restaurant } from "@/lib/types";
import { toast } from "sonner";

interface UseRestaurantsReturn {
  restaurants: Restaurant[];
  loading: boolean;
  error: string | null;
  addRestaurant: (
    data: Omit<Restaurant, "id" | "createdAt" | "updatedAt">,
  ) => Promise<{ success: boolean; id?: string; error?: string }>;
  getAllRestaurants: () => Promise<{
    success: boolean;
    restaurants?: Restaurant[];
    error?: string;
  }>;
  getRestaurantById: (
    id: string,
  ) => Promise<{ success: boolean; restaurant?: Restaurant; error?: string }>;
  getRestaurantsByUser: (userId: string) => Promise<{
    success: boolean;
    restaurants?: Restaurant[];
    error?: string;
  }>;
  getRestaurantsByCuisineType: (cuisineType: string) => Promise<{
    success: boolean;
    restaurants?: Restaurant[];
    error?: string;
  }>;
  updateRestaurant: (
    id: string,
    data: Partial<Restaurant>,
  ) => Promise<{ success: boolean; error?: string }>;
  deleteRestaurant: (
    id: string,
  ) => Promise<{ success: boolean; error?: string }>;
  searchRestaurantsByName: (searchTerm: string) => Promise<{
    success: boolean;
    restaurants?: Restaurant[];
    error?: string;
  }>;
  clearError: () => void;
}

export function useRestaurants(): UseRestaurantsReturn {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Utility function to serialize Firebase timestamps
  const serializeRestaurantData = useCallback((data: any): Restaurant => {
    return {
      ...data,
      createdAt: data.createdAt?.toDate
        ? data.createdAt.toDate()
        : data.createdAt || new Date(),
      updatedAt: data.updatedAt?.toDate
        ? data.updatedAt.toDate()
        : data.updatedAt || new Date(),
    } as Restaurant;
  }, []);

  /**
   * 🏪 CREATE: Ajouter un nouveau restaurant
   */
  const addRestaurant = useCallback(
    async (data: Omit<Restaurant, "id" | "createdAt" | "updatedAt">) => {
      setLoading(true);
      setError(null);
      try {
        console.log("[addRestaurant] Creating new restaurant:", data.name);

        const restaurantData = {
          name: data.name || "",
          logo: data.logo || "",
          address: data.address || "",
          phone: data.phone || "",
          email: data.email || "",
          website: data.website || "",
          cuisineTypes: data.cuisineTypes || [],
          openingHours: data.openingHours || [],
          deliveryOptions: data.deliveryOptions || [],
          packagingCharges: data.packagingCharges || 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        const restaurantRef = collection(db, "restaurants");
        const docRef = await addDoc(restaurantRef, restaurantData);

        // Update the document with its ID
        const restaurantDoc = doc(db, "restaurants", docRef.id);
        await updateDoc(restaurantDoc, { id: docRef.id });

        // Add to local state
        const newRestaurant = {
          id: docRef.id,
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as Restaurant;

        setRestaurants((prev) => [...prev, newRestaurant]);

        console.log(
          `[addRestaurant] Restaurant ${data.name} created successfully`,
        );
        return { success: true, id: docRef.id };
      } catch (err) {
        const errorMessage = (err as Error).message;
        setError(errorMessage);
        console.error("[addRestaurant] Error:", err);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  /**
   * 📋 READ: Récupérer tous les restaurants
   */
  const getAllRestaurants = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("[getAllRestaurants] Fetching all restaurants...");

      const restaurantRef = collection(db, "restaurants");
      const q = query(restaurantRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);

      const restaurantsData: Restaurant[] = [];
      querySnapshot.forEach((doc) => {
        const serializedData = serializeRestaurantData({
          id: doc.id,
          ...doc.data(),
        });
        restaurantsData.push(serializedData);
      });

      setRestaurants(restaurantsData);
      console.log(
        `[getAllRestaurants] ${restaurantsData.length} restaurants loaded`,
      );
      return { success: true, restaurants: restaurantsData };
    } catch (err) {
      const errorMessage = (err as Error).message;
      setError(errorMessage);
      console.error("[getAllRestaurants] Error:", err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [serializeRestaurantData]);

  /**
   * 🔍 READ: Récupérer un restaurant par son ID
   */
  const getRestaurantById = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      try {
        if (!id || typeof id !== "string") {
          return { success: false, error: "ID restaurant invalide" };
        }

        console.log(`[getRestaurantById] Fetching restaurant ${id}...`);

        const restaurantRef = doc(db, "restaurants", id);
        const docSnap = await getDoc(restaurantRef);

        if (docSnap.exists()) {
          const restaurantData = serializeRestaurantData({
            id: docSnap.id,
            ...docSnap.data(),
          });

          console.log(`[getRestaurantById] Restaurant ${id} found`);
          return { success: true, restaurant: restaurantData };
        } else {
          console.warn(`[getRestaurantById] Restaurant ${id} not found`);
          return { success: false, error: "Restaurant non trouvé" };
        }
      } catch (err) {
        const errorMessage = (err as Error).message;
        setError(errorMessage);
        console.error("[getRestaurantById] Error:", err);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [serializeRestaurantData],
  );

  /**
   * 👤 READ: Récupérer les restaurants d'un utilisateur spécifique
   */
  const getRestaurantsByUser = useCallback(
    async (userId: string) => {
      setLoading(true);
      setError(null);
      try {
        console.log(
          `[getRestaurantsByUser] Fetching restaurants for user ${userId}...`,
        );

        const restaurantRef = collection(db, "restaurants");
        const q = query(
          restaurantRef,
          where("userId", "==", userId),
          orderBy("createdAt", "desc"),
        );
        const querySnapshot = await getDocs(q);

        const restaurantsData: Restaurant[] = [];
        querySnapshot.forEach((doc) => {
          const serializedData = serializeRestaurantData({
            id: doc.id,
            ...doc.data(),
          });
          restaurantsData.push(serializedData);
        });

        console.log(
          `[getRestaurantsByUser] ${restaurantsData.length} restaurants found for user ${userId}`,
        );
        return { success: true, restaurants: restaurantsData };
      } catch (err) {
        const errorMessage = (err as Error).message;
        setError(errorMessage);
        console.error("[getRestaurantsByUser] Error:", err);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [serializeRestaurantData],
  );

  /**
   * 🍕 READ: Récupérer les restaurants par type de cuisine
   */
  const getRestaurantsByCuisineType = useCallback(
    async (cuisineType: string) => {
      setLoading(true);
      setError(null);
      try {
        console.log(
          `[getRestaurantsByCuisineType] Fetching restaurants for cuisine: ${cuisineType}...`,
        );

        const restaurantRef = collection(db, "restaurants");
        const q = query(
          restaurantRef,
          where("cuisineTypes", "array-contains", cuisineType),
          orderBy("createdAt", "desc"),
        );
        const querySnapshot = await getDocs(q);

        const restaurantsData: Restaurant[] = [];
        querySnapshot.forEach((doc) => {
          const serializedData = serializeRestaurantData({
            id: doc.id,
            ...doc.data(),
          });
          restaurantsData.push(serializedData);
        });

        console.log(
          `[getRestaurantsByCuisineType] ${restaurantsData.length} restaurants found for cuisine ${cuisineType}`,
        );
        return { success: true, restaurants: restaurantsData };
      } catch (err) {
        const errorMessage = (err as Error).message;
        setError(errorMessage);
        console.error("[getRestaurantsByCuisineType] Error:", err);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [serializeRestaurantData],
  );

  /**
   * ✏️ UPDATE: Mettre à jour un restaurant
   */
  const updateRestaurant = useCallback(
    async (id: string, data: Partial<Restaurant>) => {
      setLoading(true);
      setError(null);
      try {
        console.log(`[updateRestaurant] Updating restaurant ${id}...`);

        const restaurantRef = doc(db, "restaurants", id);

        // Prepare update data
        const updateData: any = {
          ...data,
          updatedAt: serverTimestamp(),
        };

        // Remove fields that shouldn't be updated
        delete updateData.id;
        delete updateData.createdAt;

        await updateDoc(restaurantRef, updateData);

        // Update local state
        setRestaurants((prev) =>
          prev.map((restaurant) =>
            restaurant.id === id
              ? { ...restaurant, ...data, updatedAt: new Date() }
              : restaurant,
          ),
        );

        console.log(`[updateRestaurant] Restaurant ${id} updated successfully`);
        return { success: true };
      } catch (err) {
        const errorMessage = (err as Error).message;
        setError(errorMessage);
        console.error("[updateRestaurant] Error:", err);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  /**
   * 🗑️ DELETE: Supprimer un restaurant
   */
  const deleteRestaurant = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      console.log(`[deleteRestaurant] Deleting restaurant ${id}...`);

      const restaurantRef = doc(db, "restaurants", id);
      await deleteDoc(restaurantRef);

      // Update local state
      setRestaurants((prev) =>
        prev.filter((restaurant) => restaurant.id !== id),
      );

      console.log(`[deleteRestaurant] Restaurant ${id} deleted successfully`);
      return { success: true };
    } catch (err) {
      const errorMessage = (err as Error).message;
      setError(errorMessage);
      console.error("[deleteRestaurant] Error:", err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 🔍 SEARCH: Rechercher des restaurants par nom
   */
  const searchRestaurantsByName = useCallback(
    async (searchTerm: string) => {
      setLoading(true);
      setError(null);
      try {
        console.log(
          `[searchRestaurantsByName] Searching for: ${searchTerm}...`,
        );

        // Note: Firestore doesn't have native LIKE or partial search
        // This implementation fetches all restaurants and filters client-side
        // For better performance, consider using Algolia or another search solution
        const restaurantRef = collection(db, "restaurants");
        const querySnapshot = await getDocs(restaurantRef);

        const restaurantsData: Restaurant[] = [];
        querySnapshot.forEach((doc) => {
          const restaurantData = serializeRestaurantData({
            id: doc.id,
            ...doc.data(),
          });

          // Filter by search term (case-insensitive)
          if (
            restaurantData.name
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            restaurantData.address
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            restaurantData.cuisineTypes?.some((cuisine) =>
              cuisine.toLowerCase().includes(searchTerm.toLowerCase()),
            )
          ) {
            restaurantsData.push(restaurantData);
          }
        });

        console.log(
          `[searchRestaurantsByName] ${restaurantsData.length} restaurants found for "${searchTerm}"`,
        );
        return { success: true, restaurants: restaurantsData };
      } catch (err) {
        const errorMessage = (err as Error).message;
        setError(errorMessage);
        console.error("[searchRestaurantsByName] Error:", err);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [serializeRestaurantData],
  );

  return {
    restaurants,
    loading,
    error,
    addRestaurant,
    getAllRestaurants,
    getRestaurantById,
    getRestaurantsByUser,
    getRestaurantsByCuisineType,
    updateRestaurant,
    deleteRestaurant,
    searchRestaurantsByName,
    clearError,
  };
}
