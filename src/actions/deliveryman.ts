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
} from "firebase/firestore";
// import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db } from "@/lib/firebase/config";
import { Deliveryman } from "@/lib/types";

// CREATE: Add a new deliveryman
export async function addDeliveryman(data: Deliveryman) {
  try {
    const {
      profileImageUrl,
      identityImageUrl,
      licenseFile,
      ...deliverymanData
    } = data;

    const deliverymanWithUrls = {
      ...deliverymanData,
      profileImageUrl: profileImageUrl || null,
      identityImageUrl: identityImageUrl || null,
      licenseFileUrl: licenseFile || null,
      createdAt: new Date().toISOString(),
    };

    // Add to Firestore
    const deliverymanRef = collection(db, "deliverymen");
    const docRef = await addDoc(deliverymanRef, deliverymanWithUrls);

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error adding deliveryman:", error);
    return { success: false, error: (error as Error).message };
  }
}

// READ: Get all deliverymen
export async function getAllDeliverymen() {
  try {
    const deliverymanRef = collection(db, "deliverymen");
    const querySnapshot = await getDocs(deliverymanRef);

    const deliverymen: Deliveryman[] = [];
    querySnapshot.forEach((doc) => {
      deliverymen.push({ id: doc.id, ...doc.data() } as Deliveryman);
    });

    return { success: true, deliverymen };
  } catch (error) {
    console.error("Error getting deliverymen:", error);
    return { success: false, error: (error as Error).message };
  }
}

// READ: Get deliverymen by user ID or other criteria
export async function getDeliverymenByFilter(
  filterField: string,
  filterValue: string,
) {
  try {
    const deliverymanRef = collection(db, "deliverymen");
    const q = query(deliverymanRef, where(filterField, "==", filterValue));
    const querySnapshot = await getDocs(q);

    const deliverymen: Deliveryman[] = [];
    querySnapshot.forEach((doc) => {
      deliverymen.push({ id: doc.id, ...doc.data() } as Deliveryman);
    });

    return { success: true, deliverymen };
  } catch (error) {
    console.error("Error getting filtered deliverymen:", error);
    return { success: false, error: (error as Error).message };
  }
}

// READ: Get a single deliveryman by ID
export async function getDeliverymanById(id: string) {
  try {
    const deliverymanRef = doc(db, "deliverymen", id);
    const docSnap = await getDoc(deliverymanRef);

    if (docSnap.exists()) {
      return {
        success: true,
        deliveryman: { id: docSnap.id, ...docSnap.data() } as Deliveryman,
      };
    } else {
      return { success: false, error: "Deliveryman not found" };
    }
  } catch (error) {
    console.error("Error getting deliveryman:", error);
    return { success: false, error: (error as Error).message };
  }
}

// UPDATE: Update a deliveryman
export async function updateDeliveryman(
  id: string,
  data: Partial<Deliveryman>,
) {
  try {
    // Extract data that might need to be processed
    const { ...deliverymanData } = data;

    // Similar to addDeliveryman, handle file uploads if needed
    // (code would be similar to the upload logic in addDeliveryman)

    const deliverymanRef = doc(db, "deliverymen", id);
    await updateDoc(deliverymanRef, deliverymanData);

    return { success: true };
  } catch (error) {
    console.error("Error updating deliveryman:", error);
    return { success: false, error: (error as Error).message };
  }
}

// DELETE: Delete a deliveryman
export async function deleteDeliveryman(id: string) {
  try {
    const deliverymanRef = doc(db, "deliverymen", id);
    await deleteDoc(deliverymanRef);

    return { success: true };
  } catch (error) {
    console.error("Error deleting deliveryman:", error);
    return { success: false, error: (error as Error).message };
  }
}
