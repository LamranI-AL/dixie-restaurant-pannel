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
import { db } from "@/lib/firebase/config";
import { restaurantGallery } from "@/lib/types";

// CREATE: Add a new gallery item
export async function addGalleryItem(data: Omit<restaurantGallery, "id">) {
  const { category, image, description, title } = data;

  const newGalleryItem = {
    category,
    image,
    description,
    title,
    createdAt: new Date(),
  };

  try {
    const galleryRef = collection(db, "restaurantGallery");
    const docRef = await addDoc(galleryRef, newGalleryItem);

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error adding gallery item:", error);
    return { success: false, error: (error as Error).message };
  }
}

// READ: Get all gallery items
export async function getAllGalleryItems() {
  try {
    const galleryRef = collection(db, "restaurantGallery");
    const q = query(galleryRef);
    const querySnapshot = await getDocs(q);

    const galleryItems: restaurantGallery[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();

      // Convert Timestamp to ISO string
      const createdAt = data.createdAt
        ? data.createdAt.toDate().toISOString()
        : null;

      galleryItems.push({
        id: doc.id,
        ...data,
        createdAt: createdAt ? new Date(createdAt) : new Date(),
      } as restaurantGallery);
    });

    return { success: true, galleryItems };
  } catch (error) {
    console.error("Error getting gallery items:", error);
    return { success: false, error: (error as Error).message };
  }
}

// READ: Get a single gallery item by ID
export async function getGalleryItemById(id: string) {
  try {
    const galleryRef = doc(db, "restaurantGallery", id);
    const docSnap = await getDoc(galleryRef);

    if (docSnap.exists()) {
      const data = docSnap.data();

      // Convert Timestamp to ISO string
      const createdAt = data.createdAt
        ? data.createdAt.toDate().toISOString()
        : null;

      return {
        success: true,
        galleryItem: {
          id: docSnap.id,
          ...data,
          createdAt: createdAt ? new Date(createdAt) : new Date(),
        } as restaurantGallery,
      };
    } else {
      return { success: false, error: "Gallery item not found" };
    }
  } catch (error) {
    console.error("Error getting gallery item:", error);
    return { success: false, error: (error as Error).message };
  }
}

// READ: Get gallery items by category
export async function getGalleryItemsByCategory(category: string) {
  try {
    const galleryRef = collection(db, "restaurantGallery");
    const q = query(
      galleryRef,
      where("category", "==", category),
      orderBy("createdAt", "desc"),
    );
    const querySnapshot = await getDocs(q);

    const galleryItems: restaurantGallery[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();

      // Convert Timestamp to ISO string
      const createdAt = data.createdAt
        ? data.createdAt.toDate().toISOString()
        : null;

      galleryItems.push({
        id: doc.id,
        ...data,
        createdAt: createdAt ? new Date(createdAt) : new Date(),
      } as restaurantGallery);
    });

    return { success: true, galleryItems };
  } catch (error) {
    console.error("Error getting gallery items by category:", error);
    return { success: false, error: (error as Error).message };
  }
}

// UPDATE: Update a gallery item
export async function updateGalleryItem(
  id: string,
  data: Partial<Omit<restaurantGallery, "id" | "createdAt">>,
) {
  try {
    const galleryRef = doc(db, "restaurantGallery", id);
    await updateDoc(galleryRef, data);

    return { success: true };
  } catch (error) {
    console.error("Error updating gallery item:", error);
    return { success: false, error: (error as Error).message };
  }
}

// DELETE: Delete a gallery item
export async function deleteGalleryItem(id: string) {
  try {
    const galleryRef = doc(db, "restaurantGallery", id);
    await deleteDoc(galleryRef);

    return { success: true };
  } catch (error) {
    console.error("Error deleting gallery item:", error);
    return { success: false, error: (error as Error).message };
  }
}

// UTILITY: Get latest gallery items with limit
export async function getLatestGalleryItems(itemLimit: number = 6) {
  try {
    const galleryRef = collection(db, "restaurantGallery");
    const q = query(galleryRef, orderBy("createdAt", "desc"), limit(itemLimit));
    const querySnapshot = await getDocs(q);

    const galleryItems: restaurantGallery[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();

      // Convert Timestamp to ISO string
      const createdAt = data.createdAt
        ? data.createdAt.toDate().toISOString()
        : null;

      galleryItems.push({
        id: doc.id,
        ...data,
        createdAt: createdAt ? new Date(createdAt) : new Date(),
      } as restaurantGallery);
    });

    return { success: true, galleryItems };
  } catch (error) {
    console.error("Error getting latest gallery items:", error);
    return { success: false, error: (error as Error).message };
  }
}
