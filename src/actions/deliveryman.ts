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

import { revalidatePath } from "next/cache";
import { setDoc } from "firebase/firestore";

// // Fonction utilitaire pour sérialiser les objets Firebase
function serializeFirebaseData(obj: any): any {
  if (!obj) return null;

  // Si c'est une date Firebase/Firestore (avec seconds et nanoseconds)
  if (
    obj &&
    typeof obj === "object" &&
    obj.seconds !== undefined &&
    obj.nanoseconds !== undefined
  ) {
    try {
      return new Date(obj.seconds * 1000).toISOString();
    } catch (error) {
      console.error("Error converting timestamp:", error);
      return null;
    }
  }

  // Si c'est un tableau, appliquer la fonction à chaque élément
  if (Array.isArray(obj)) {
    return obj.map((item) => serializeFirebaseData(item));
  }

  // Si c'est un objet, appliquer la fonction à chaque propriété
  if (obj && typeof obj === "object" && obj !== null) {
    const newObj: Record<string, any> = {};
    Object.keys(obj).forEach((key) => {
      newObj[key] = serializeFirebaseData(obj[key]);
    });
    return newObj;
  }

  // Sinon, retourner la valeur telle quelle
  return obj;
}

// Fonction pour sérialiser un document de livreur
function serializeDeliverymanData(data: any) {
  if (!data) return null;

  const serialized = { ...data };

  // Traiter spécifiquement les champs de date connus
  if (serialized.updatedAt) {
    serialized.updatedAt = serializeFirebaseData(serialized.updatedAt);
  }
  if (serialized.createdAt) {
    serialized.createdAt = serializeFirebaseData(serialized.createdAt);
  }
  if (serialized.approvedAt) {
    serialized.approvedAt = serializeFirebaseData(serialized.approvedAt);
  }
  if (serialized.birthdate) {
    serialized.birthdate = serializeFirebaseData(serialized.birthdate);
  }

  // Vérifier les autres champs qui pourraient contenir des objets
  return serialized;
}

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
      // Sérialiser les données pour éviter les erreurs de toJSON
      const serializedData = serializeDeliverymanData({
        id: doc.id,
        ...doc.data(),
      });

      deliverymen.push(serializedData as Deliveryman);
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
      // Sérialiser les données
      const serializedData = serializeDeliverymanData({
        id: doc.id,
        ...doc.data(),
      });

      deliverymen.push(serializedData as Deliveryman);
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
      // Sérialiser les données
      const serializedData = serializeDeliverymanData({
        id: docSnap.id,
        ...docSnap.data(),
      });

      return {
        success: true,
        deliveryman: serializedData as Deliveryman,
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

// Fonction pour récupérer tous les livreurs actifs
export async function getAllActiveDeliverymen() {
  try {
    const deliverymenRef = collection(db, "deliverymen");
    const q = query(deliverymenRef);

    const querySnapshot = await getDocs(q);
    const deliverymen: Deliveryman[] = [];

    querySnapshot.forEach((doc) => {
      const rawData = doc.data();

      // Sérialiser les données pour éviter les problèmes de toJSON
      const serializedData = serializeDeliverymanData({
        ...rawData,
        id: doc.id,
      });

      deliverymen.push(serializedData as Deliveryman);
    });

    return {
      success: true,
      deliverymen,
    };
  } catch (error) {
    console.error("Error fetching active deliverymen:", error);
    return {
      success: false,
      error: "Impossible de récupérer les livreurs actifs",
    };
  }
}

// Fonction pour récupérer les candidatures de livreurs en attente d'approbation
export async function getPendingDeliverymen() {
  try {
    const applicationsRef = collection(db, "deliverymen_applications");
    const q = query(applicationsRef);

    const querySnapshot = await getDocs(q);
    const applications: Deliveryman[] = [];

    querySnapshot.forEach((doc) => {
      const rawData = doc.data();

      applications.push({
        ...rawData,
        id: doc.id,
      } as Deliveryman);
    });

    return {
      success: true,
      deliverymen: applications,
    };
  } catch (error) {
    console.error("Error fetching deliverymen applications:", error);
    return {
      success: false,
      error: "Impossible de récupérer les candidatures des livreurs",
    };
  }
}

// Fonction pour approuver un livreur
export async function approveDeliveryman(id: string) {
  try {
    // 1. Récupérer les données de la candidature
    const applicationRef = doc(db, "deliverymen_applications", id);
    const applicationSnap = await getDoc(applicationRef);

    if (!applicationSnap.exists()) {
      throw new Error("La candidature n'existe pas");
    }

    const applicationData = applicationSnap.data() as Deliveryman;

    // 2. Créer un nouveau document dans la collection deliverymen
    const deliverymanRef = doc(db, "deliverymen", id);
    await setDoc(deliverymanRef, {
      ...applicationData,
      isApproved: true,
      status: "active",
      createdAt: applicationData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      approvedAt: new Date().toISOString(),
    });

    // 4. Supprimer la candidature de la collection deliverymen_applications
    await deleteDoc(applicationRef);

    // Revalidez le chemin pour mettre à jour les données affichées
    revalidatePath("/deliverymen");

    return { success: true };
  } catch (error) {
    console.error(`Error approving deliveryman with ID ${id}:`, error);
    return {
      success: false,
      error: "Impossible d'approuver le livreur",
    };
  }
}

// Fonction pour refuser un livreur
export async function rejectDeliveryman(id: string) {
  try {
    // Simplement supprimer la candidature de la collection deliverymen_applications
    const applicationRef = doc(db, "deliverymen_applications", id);
    await deleteDoc(applicationRef);

    // Revalidez le chemin pour mettre à jour les données affichées
    revalidatePath("/deliverymen");

    return { success: true };
  } catch (error) {
    console.error(`Error rejecting deliveryman with ID ${id}:`, error);
    return {
      success: false,
      error: "Impossible de refuser le livreur",
    };
  }
}

// Fonction pour suspendre un livreur
export async function suspendDeliveryman(id: string) {
  try {
    const deliverymanRef = doc(db, "deliverymen", id);

    await updateDoc(deliverymanRef, {
      status: "suspended",
      updatedAt: new Date().toISOString(), // Utiliser ISO string au lieu de serverTimestamp()
    });

    // Revalidez le chemin pour mettre à jour les données affichées
    revalidatePath("/deliverymen");

    return {
      success: true,
    };
  } catch (error) {
    console.error(`Error suspending deliveryman with ID ${id}:`, error);
    return {
      success: false,
      error: "Impossible de suspendre le livreur",
    };
  }
}

// Fonction pour réactiver un livreur
export async function reactivateDeliveryman(id: string) {
  try {
    const deliverymanRef = doc(db, "deliverymen", id);

    await updateDoc(deliverymanRef, {
      status: "active",
      updatedAt: new Date().toISOString(), // Utiliser ISO string au lieu de serverTimestamp()
    });

    // Revalidez le chemin pour mettre à jour les données affichées
    revalidatePath("/deliverymen");

    return {
      success: true,
    };
  } catch (error) {
    console.error(`Error reactivating deliveryman with ID ${id}:`, error);
    return {
      success: false,
      error: "Impossible de réactiver le livreur",
    };
  }
}

// Fonction pour changer le statut d'un livreur
export async function updateDeliverymanStatus(
  id: string,
  status: "active" | "inactive" | "suspended",
) {
  try {
    const deliverymanRef = doc(db, "deliverymen", id);

    await updateDoc(deliverymanRef, {
      status,
      updatedAt: new Date().toISOString(), // Utiliser ISO string au lieu de serverTimestamp()
    });

    // Revalidez le chemin pour mettre à jour les données affichées
    revalidatePath("/deliverymen");

    return {
      success: true,
    };
  } catch (error) {
    console.error(
      `Error updating status for deliveryman with ID ${id}:`,
      error,
    );
    return {
      success: false,
      error: "Impossible de mettre à jour le statut du livreur",
    };
  }
}
