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
} from "firebase/firestore";
import { db } from "@/lib/firebase/config"; // Assurez-vous que ce chemin est correct pour votre configuration
import { Category } from "@/lib/types";
export async function addCategory(data: Category) {
  try {
    const { name, image, status, userId } = data;
    const categoryRef = collection(db, "categories");
    const docRef = await addDoc(categoryRef, {
      name,
      image,
      status,
      userId,
    });

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error adding category:", error);
    return { success: false, error: (error as Error).message };
  }
}

// READ: Get all categories
export async function getAllCategories() {
  try {
    const categoryRef = collection(db, "categories");
    const querySnapshot = await getDocs(categoryRef);

    const categories: Category[] = [];
    querySnapshot.forEach((doc) => {
      categories.push({ id: doc.id, ...doc.data() } as Category);
    });

    return { success: true, categories };
  } catch (error) {
    console.error("Error getting categories:", error);
    return { success: false, error: (error as Error).message };
  }
}

// READ: Get categories by user ID
// export async function getCategoriesByUser(userId: string) {
//   try {
//     const categoryRef = collection(db, "categories");
//     const q = query(categoryRef, where("userId", "==", userId));
//     const querySnapshot = await getDocs(q);

//     const categories: Category[] = [];
//     querySnapshot.forEach((doc) => {
//       categories.push({ id: doc.id, ...doc.data() } as Category);
//     });

//     return { success: true, categories };
//   } catch (error) {
//     console.error("Error getting user categories:", error);
//     return { success: false, error: (error as Error).message };
//   }
// }

// READ: Get a single category by ID
export async function getCategoryById(id: string) {
  try {
    const categoryRef = doc(db, "categories", id);
    const docSnap = await getDoc(categoryRef);

    if (docSnap.exists()) {
      return {
        success: true,
        category: { id: docSnap.id, ...docSnap.data() } as Category,
      };
    } else {
      return { success: false, error: "Category not found" };
    }
  } catch (error) {
    console.error("Error getting category:", error);
    return { success: false, error: (error as Error).message };
  }
}

// UPDATE: Update a category
export async function updateCategory(id: string, data: Partial<Category>) {
  try {
    const categoryRef = doc(db, "categories", id);
    await updateDoc(categoryRef, data);

    return { success: true };
  } catch (error) {
    console.error("Error updating category:", error);
    return { success: false, error: (error as Error).message };
  }
}

// DELETE: Delete a category
export async function deleteCategory(id: string) {
  try {
    const categoryRef = doc(db, "categories", id);
    await deleteDoc(categoryRef);

    return { success: true };
  } catch (error) {
    console.error("Error deleting category:", error);
    return { success: false, error: (error as Error).message };
  }
}
