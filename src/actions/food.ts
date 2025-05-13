/** @format */
"use server";

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
import { db } from "@/lib/firebase/config"; // Assurez-vous que ce chemin est correct pour votre configuration
import { Food, Variation, Addon, TrendingFood } from "@/lib/types";
import {
  serializeFirebaseData,
  serializeFirebaseDocument,
} from "@/utils/serializeData";

// CREATE: Add a new food item
export async function addFood(data: Food) {
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
  const newDeliveryman = {
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
  try {
    const foodRef = collection(db, "products");
    const docRef = await addDoc(foodRef, newDeliveryman);

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error adding food:", error);
    return { success: false, error: (error as Error).message };
  }
}

// READ: Get all food items
export async function getAllFoods() {
  try {
    const foodRef = collection(db, "products");
    const querySnapshot = await getDocs(foodRef);

    const foods: Food[] = [];
    querySnapshot.forEach((doc) => {
      // Sérialiser les données avant de les retourner
      const foodData = serializeFirebaseDocument({
        id: doc.id,
        ...doc.data(),
      });

      foods.push(foodData as Food);
    });

    return { success: true, foods };
  } catch (error) {
    console.error("Error getting foods:", error);
    return { success: false, error: (error as Error).message };
  }
}

// READ: Get food items by category ID
export async function getFoodsByCategory(categoryId: string) {
  try {
    const foodRef = collection(db, "products");
    const q = query(foodRef, where("categoryId", "==", categoryId));
    const querySnapshot = await getDocs(q);

    const foods: Food[] = [];
    querySnapshot.forEach((doc) => {
      // Sérialiser les données
      const foodData = serializeFirebaseDocument({
        id: doc.id,
        ...doc.data(),
      });

      foods.push(foodData as Food);
    });

    return { success: true, foods };
  } catch (error) {
    console.error("Error getting foods by category:", error);
    return { success: false, error: (error as Error).message };
  }
}

export async function getFoodById(id: string) {
  try {
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
  } catch (error) {
    console.error("Error getting food:", error);
    return { success: false, error: (error as Error).message };
  }
}

// READ: Get popular food items
export async function getPopularFoods() {
  try {
    const foodRef = collection(db, "trendingItems");
    const q = query(foodRef, orderBy("discount", "desc"));
    const querySnapshot = await getDocs(q);

    const trindingfoods: TrendingFood[] = [];
    querySnapshot.forEach((doc) => {
      // Sérialiser les données
      const foodData = serializeFirebaseDocument({
        id: doc.id,
        ...doc.data(),
      });

      trindingfoods.push(foodData as TrendingFood);
    });

    return { success: true, trindingfoods };
  } catch (error) {
    console.error("Error getting popular foods:", error);
    return { success: false, error: (error as Error).message };
  }
}

// READ: Get top-rated food items
export async function getTopRatedFoods(limit_count: number = 10) {
  try {
    const foodRef = collection(db, "foods");
    const q = query(foodRef, orderBy("rating", "desc"), limit(limit_count));
    const querySnapshot = await getDocs(q);

    const foods: Food[] = [];
    querySnapshot.forEach((doc) => {
      // Sérialiser les données
      const foodData = serializeFirebaseDocument({
        id: doc.id,
        ...doc.data(),
      });

      foods.push(foodData as Food);
    });

    return { success: true, foods };
  } catch (error) {
    console.error("Error getting top-rated foods:", error);
    return { success: false, error: (error as Error).message };
  }
}

// UPDATE: Update a food item
export async function updateFood(id: string, data: Partial<Food>) {
  try {
    const foodRef = doc(db, "products", id);
    await updateDoc(foodRef, {
      ...data,
      updatedAt: new Date(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating food:", error);
    return { success: false, error: (error as Error).message };
  }
}

// UPDATE: Toggle food availability
export async function toggleFoodAvailability(id: string, isAvailable: boolean) {
  try {
    const foodRef = doc(db, "products", id);
    await updateDoc(foodRef, {
      isAvailable: isAvailable,
      updatedAt: new Date(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error toggling food availability:", error);
    return { success: false, error: (error as Error).message };
  }
}

// UPDATE: Add variation to food
export async function addVariationToFood(id: string, variation: Variation) {
  try {
    const foodRef = doc(db, "foods", id);
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

    return { success: true };
  } catch (error) {
    console.error("Error adding variation to food:", error);
    return { success: false, error: (error as Error).message };
  }
}

// UPDATE: Add addon to food
export async function addAddonToFood(id: string, addon: Addon) {
  try {
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

    return { success: true };
  } catch (error) {
    console.error("Error adding addon to food:", error);
    return { success: false, error: (error as Error).message };
  }
}

// DELETE: Delete a food item
export async function deleteFood(id: string) {
  try {
    const foodRef = doc(db, "products", id);
    await deleteDoc(foodRef);

    return { success: true };
  } catch (error) {
    console.error("Error deleting food:", error);
    return { success: false, error: (error as Error).message };
  }
}

// SEARCH: Search food items by name
export async function searchFoods(searchTerm: string) {
  try {
    const foodRef = collection(db, "products");
    const querySnapshot = await getDocs(foodRef);

    const foods: Food[] = [];
    querySnapshot.forEach((doc) => {
      const rawFoodData = doc.data();
      if (rawFoodData.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        // Sérialiser les données
        const foodData = serializeFirebaseDocument({
          id: doc.id,
          ...rawFoodData,
        });

        foods.push(foodData as Food);
      }
    });

    return { success: true, foods };
  } catch (error) {
    console.error("Error searching foods:", error);
    return { success: false, error: (error as Error).message };
  }
}
