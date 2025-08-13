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
  setDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Deliveryman } from "@/lib/types";

interface UseDeliverymenReturn {
  deliverymen: Deliveryman[];
  pendingDeliverymen: Deliveryman[];
  loading: boolean;
  error: string | null;
  addDeliveryman: (
    data: Deliveryman,
  ) => Promise<{ success: boolean; id?: string; error?: string }>;
  getAllDeliverymen: () => Promise<void>;
  getDeliverymenByFilter: (
    filterField: string,
    filterValue: string,
  ) => Promise<{
    success: boolean;
    deliverymen?: Deliveryman[];
    error?: string;
  }>;
  getDeliverymanById: (
    id: string,
  ) => Promise<{ success: boolean; deliveryman?: Deliveryman; error?: string }>;
  updateDeliveryman: (
    id: string,
    data: Partial<Deliveryman>,
  ) => Promise<{ success: boolean; error?: string }>;
  deleteDeliveryman: (
    id: string,
  ) => Promise<{ success: boolean; error?: string }>;
  getPendingDeliverymen: () => Promise<void>;
  approveDeliveryman: (
    id: string,
  ) => Promise<{ success: boolean; error?: string }>;
  rejectDeliveryman: (
    id: string,
  ) => Promise<{ success: boolean; error?: string }>;
  suspendDeliveryman: (
    id: string,
  ) => Promise<{ success: boolean; error?: string }>;
  reactivateDeliveryman: (
    id: string,
  ) => Promise<{ success: boolean; error?: string }>;
  updateDeliverymanStatus: (
    id: string,
    status: "active" | "inactive" | "suspended",
  ) => Promise<{ success: boolean; error?: string }>;
  clearError: () => void;
}

// Fonction utilitaire pour sérialiser les objets Firebase
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

  return serialized;
}

export function useDeliverymen(): UseDeliverymenReturn {
  const [deliverymen, setDeliverymen] = useState<Deliveryman[]>([]);
  const [pendingDeliverymen, setPendingDeliverymen] = useState<Deliveryman[]>(
    [],
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const addDeliveryman = useCallback(async (data: Deliveryman) => {
    try {
      setLoading(true);
      setError(null);

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

      // Mettre à jour la liste locale
      const newDeliveryman = {
        id: docRef.id,
        ...deliverymanWithUrls,
      } as any;
      setDeliverymen((prev) => [...prev, newDeliveryman]);

      return { success: true, id: docRef.id };
    } catch (err) {
      const errorMessage = (err as Error).message;
      setError(errorMessage);
      console.error("Error adding deliveryman:", err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const getAllDeliverymen = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const deliverymanRef = collection(db, "deliverymen");
      const querySnapshot = await getDocs(deliverymanRef);

      const deliverymenData: Deliveryman[] = [];
      querySnapshot.forEach((doc) => {
        // Sérialiser les données pour éviter les erreurs de toJSON
        const serializedData = serializeDeliverymanData({
          id: doc.id,
          ...doc.data(),
        });

        deliverymenData.push(serializedData as Deliveryman);
      });

      setDeliverymen(deliverymenData);
    } catch (err) {
      const errorMessage = (err as Error).message;
      setError(errorMessage);
      console.error("Error getting deliverymen:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getDeliverymenByFilter = useCallback(
    async (filterField: string, filterValue: string) => {
      try {
        setLoading(true);
        setError(null);

        const deliverymanRef = collection(db, "deliverymen");
        const q = query(deliverymanRef, where(filterField, "==", filterValue));
        const querySnapshot = await getDocs(q);

        const filteredDeliverymen: Deliveryman[] = [];
        querySnapshot.forEach((doc) => {
          // Sérialiser les données
          const serializedData = serializeDeliverymanData({
            id: doc.id,
            ...doc.data(),
          });

          filteredDeliverymen.push(serializedData as Deliveryman);
        });

        return { success: true, deliverymen: filteredDeliverymen };
      } catch (err) {
        const errorMessage = (err as Error).message;
        setError(errorMessage);
        console.error("Error getting filtered deliverymen:", err);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const getDeliverymanById = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);

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
    } catch (err) {
      const errorMessage = (err as Error).message;
      setError(errorMessage);
      console.error("Error getting deliveryman:", err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateDeliveryman = useCallback(
    async (id: string, data: Partial<Deliveryman>) => {
      try {
        setLoading(true);
        setError(null);

        const { ...deliverymanData } = data;

        const deliverymanRef = doc(db, "deliverymen", id);
        await updateDoc(deliverymanRef, deliverymanData);

        // Mettre à jour la liste locale
        setDeliverymen((prev) =>
          prev.map((deliveryman) =>
            deliveryman.id === id ? { ...deliveryman, ...data } : deliveryman,
          ),
        );

        return { success: true };
      } catch (err) {
        const errorMessage = (err as Error).message;
        setError(errorMessage);
        console.error("Error updating deliveryman:", err);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const deleteDeliveryman = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const deliverymanRef = doc(db, "deliverymen", id);
      await deleteDoc(deliverymanRef);

      // Mettre à jour la liste locale
      setDeliverymen((prev) =>
        prev.filter((deliveryman) => deliveryman.id !== id),
      );

      return { success: true };
    } catch (err) {
      const errorMessage = (err as Error).message;
      setError(errorMessage);
      console.error("Error deleting deliveryman:", err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const getPendingDeliverymen = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

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

      setPendingDeliverymen(applications);
    } catch (err) {
      const errorMessage =
        "Impossible de récupérer les candidatures des livreurs";
      setError(errorMessage);
      console.error("Error fetching deliverymen applications:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const approveDeliveryman = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      // 1. Récupérer les données de la candidature
      const applicationRef = doc(db, "deliverymen_applications", id);
      const applicationSnap = await getDoc(applicationRef);

      if (!applicationSnap.exists()) {
        throw new Error("La candidature n'existe pas");
      }

      const applicationData = applicationSnap.data() as Deliveryman;

      // 2. Créer un nouveau document dans la collection deliverymen
      const deliverymanRef = doc(db, "deliverymen", id);
      const approvedDeliveryman = {
        ...applicationData,
        isApproved: true,
        status: "active",
        createdAt: applicationData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        approvedAt: new Date().toISOString(),
      };

      await setDoc(deliverymanRef, approvedDeliveryman);

      // 3. Supprimer la candidature de la collection deliverymen_applications
      await deleteDoc(applicationRef);

      // 4. Mettre à jour les listes locales
      setDeliverymen((prev) => [
        ...prev,
        { id, ...approvedDeliveryman } as any,
      ]);
      setPendingDeliverymen((prev) => prev.filter((app) => app.id !== id));

      return { success: true };
    } catch (err) {
      const errorMessage = "Impossible d'approuver le livreur";
      setError(errorMessage);
      console.error(`Error approving deliveryman with ID ${id}:`, err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const rejectDeliveryman = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      // Supprimer la candidature de la collection deliverymen_applications
      const applicationRef = doc(db, "deliverymen_applications", id);
      await deleteDoc(applicationRef);

      // Mettre à jour la liste locale des candidatures
      setPendingDeliverymen((prev) => prev.filter((app) => app.id !== id));

      return { success: true };
    } catch (err) {
      const errorMessage = "Impossible de refuser le livreur";
      setError(errorMessage);
      console.error(`Error rejecting deliveryman with ID ${id}:`, err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const suspendDeliveryman = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const deliverymanRef = doc(db, "deliverymen", id);

      await updateDoc(deliverymanRef, {
        status: "suspended",
        updatedAt: new Date().toISOString(),
      });

      // Mettre à jour la liste locale
      setDeliverymen((prev: any) =>
        prev.map((deliveryman: any) =>
          deliveryman.id === id
            ? {
                ...deliveryman,
                status: "suspended",
                updatedAt: new Date().toISOString(),
              }
            : deliveryman,
        ),
      );

      return { success: true };
    } catch (err) {
      const errorMessage = "Impossible de suspendre le livreur";
      setError(errorMessage);
      console.error(`Error suspending deliveryman with ID ${id}:`, err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const reactivateDeliveryman = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const deliverymanRef = doc(db, "deliverymen", id);

      await updateDoc(deliverymanRef, {
        status: "active",
        updatedAt: new Date().toISOString(),
      });

      // Mettre à jour la liste locale
      setDeliverymen((prev: any) =>
        prev.map((deliveryman: any) =>
          deliveryman.id === id
            ? {
                ...deliveryman,
                status: "active",
                updatedAt: new Date().toISOString(),
              }
            : deliveryman,
        ),
      );

      return { success: true };
    } catch (err) {
      const errorMessage = "Impossible de réactiver le livreur";
      setError(errorMessage);
      console.error(`Error reactivating deliveryman with ID ${id}:`, err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateDeliverymanStatus = useCallback(
    async (id: string, status: "active" | "inactive" | "suspended") => {
      try {
        setLoading(true);
        setError(null);

        const deliverymanRef = doc(db, "deliverymen", id);

        await updateDoc(deliverymanRef, {
          status,
          updatedAt: new Date().toISOString(),
        });

        // Mettre à jour la liste locale
        setDeliverymen((prev: any) =>
          prev.map((deliveryman: any) =>
            deliveryman.id === id
              ? { ...deliveryman, status, updatedAt: new Date().toISOString() }
              : deliveryman,
          ),
        );

        return { success: true };
      } catch (err) {
        const errorMessage = "Impossible de mettre à jour le statut du livreur";
        setError(errorMessage);
        console.error(
          `Error updating status for deliveryman with ID ${id}:`,
          err,
        );
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return {
    deliverymen,
    pendingDeliverymen,
    loading,
    error,
    addDeliveryman,
    getAllDeliverymen,
    getDeliverymenByFilter,
    getDeliverymanById,
    updateDeliveryman,
    deleteDeliveryman,
    getPendingDeliverymen,
    approveDeliveryman,
    rejectDeliveryman,
    suspendDeliveryman,
    reactivateDeliveryman,
    updateDeliverymanStatus,
    clearError,
  };
}
