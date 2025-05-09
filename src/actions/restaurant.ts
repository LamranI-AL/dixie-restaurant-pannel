/** @format */
"use server";

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
} from "firebase/firestore";
import { db } from "@/lib/firebase/config"; // Assurez-vous que ce chemin est correct pour votre configuration
import { Restaurant } from "@/lib/types";

/**
 * CREATE: Ajouter un nouveau restaurant
 */
export async function addRestaurant(data: Restaurant) {
  try {
    const {
      name,
      logo,
      address,
      phone,
      email,
      website,
      cuisineTypes,
      openingHours,
      deliveryOptions,
      packagingCharges,
    } = data;

    const restaurantRef = collection(db, "restaurants");
    const docRef = await addDoc(restaurantRef, {
      name,
      logo,
      address,
      phone,
      email,
      website,
      cuisineTypes,
      openingHours,
      deliveryOptions,
      packagingCharges,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error adding restaurant:", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * READ: Récupérer tous les restaurants
 */
export async function getAllRestaurants() {
  try {
    const restaurantRef = collection(db, "restaurants");
    const querySnapshot = await getDocs(restaurantRef);

    const restaurants: Restaurant[] = [];
    querySnapshot.forEach((doc) => {
      restaurants.push({ id: doc.id, ...doc.data() } as Restaurant);
    });

    return { success: true, restaurants };
  } catch (error) {
    console.error("Error getting restaurants:", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * READ: Récupérer un restaurant par son ID
 */
export async function getRestaurantById(id: string) {
  try {
    const restaurantRef = doc(db, "restaurants", id);
    const docSnap = await getDoc(restaurantRef);

    if (docSnap.exists()) {
      return {
        success: true,
        restaurant: { id: docSnap.id, ...docSnap.data() } as Restaurant,
      };
    } else {
      return { success: false, error: "Restaurant not found" };
    }
  } catch (error) {
    console.error("Error getting restaurant:", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * READ: Récupérer les restaurants d'un utilisateur spécifique
 */
export async function getRestaurantsByUser(userId: string) {
  try {
    const restaurantRef = collection(db, "restaurants");
    const q = query(restaurantRef, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);

    const restaurants: Restaurant[] = [];
    querySnapshot.forEach((doc) => {
      restaurants.push({ id: doc.id, ...doc.data() } as Restaurant);
    });

    return { success: true, restaurants };
  } catch (error) {
    console.error("Error getting user restaurants:", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * READ: Récupérer les restaurants par type de cuisine
 */
export async function getRestaurantsByCuisineType(cuisineType: string) {
  try {
    const restaurantRef = collection(db, "restaurants");
    const q = query(
      restaurantRef,
      where("cuisineTypes", "array-contains", cuisineType),
    );
    const querySnapshot = await getDocs(q);

    const restaurants: Restaurant[] = [];
    querySnapshot.forEach((doc) => {
      restaurants.push({ id: doc.id, ...doc.data() } as Restaurant);
    });

    return { success: true, restaurants };
  } catch (error) {
    console.error("Error getting restaurants by cuisine type:", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * UPDATE: Mettre à jour un restaurant
 */
export async function updateRestaurant(id: string, data: Partial<Restaurant>) {
  try {
    const restaurantRef = doc(db, "restaurants", id);

    // Ajouter une date de mise à jour
    const updateData = {
      ...data,
      updatedAt: new Date(),
    };

    await updateDoc(restaurantRef, updateData);

    return { success: true };
  } catch (error) {
    console.error("Error updating restaurant:", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * DELETE: Supprimer un restaurant
 */
export async function deleteRestaurant(id: string) {
  try {
    const restaurantRef = doc(db, "restaurants", id);
    await deleteDoc(restaurantRef);

    return { success: true };
  } catch (error) {
    console.error("Error deleting restaurant:", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * READ: Rechercher des restaurants par nom
 */
export async function searchRestaurantsByName(searchTerm: string) {
  try {
    // Note: Firestore n'a pas de LIKE ou de recherche partielle native
    // Cette implémentation récupère tous les restaurants et filtre côté serveur
    // Pour une recherche plus performante, considérez Algolia ou une autre solution de recherche
    const restaurantRef = collection(db, "restaurants");
    const querySnapshot = await getDocs(restaurantRef);

    const restaurants: Restaurant[] = [];
    querySnapshot.forEach((doc) => {
      const restaurant = { id: doc.id, ...doc.data() } as Restaurant;
      if (restaurant.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        restaurants.push(restaurant);
      }
    });

    return { success: true, restaurants };
  } catch (error) {
    console.error("Error searching restaurants:", error);
    return { success: false, error: (error as Error).message };
  }
}
