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
  where,
  query,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { revalidatePath } from "next/cache";
import { Coupon } from "@/lib/types";

/**
 * Crée un nouveau coupon
 * @param data Données du coupon
 */
export async function createCoupon(data: Omit<Coupon, "id" | "usesCount">) {
  try {
    // Convertir les dates en Timestamp Firestore
    const startTimestamp = Timestamp.fromDate(
      typeof data.startDate === "string"
        ? new Date(data.startDate)
        : data.startDate,
    );
    const endTimestamp = Timestamp.fromDate(
      typeof data.endDate === "string" ? new Date(data.endDate) : data.endDate,
    );

    // Préparer l'objet coupon
    const newCoupon = {
      ...data,
      startDate: startTimestamp,
      endDate: endTimestamp,
      usesCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // Enregistrer le coupon dans Firestore
    const couponsRef = collection(db, "coupons");
    const docRef = await addDoc(couponsRef, newCoupon);

    // Mettre à jour l'ID avec l'ID généré par Firestore
    const couponDoc = doc(db, "coupons", docRef.id);
    await updateDoc(couponDoc, { id: docRef.id });

    // Revalider le chemin pour mettre à jour l'UI
    revalidatePath("/admin/coupons");

    return {
      success: true,
      couponId: docRef.id,
      message: "Coupon créé avec succès",
    };
  } catch (error) {
    console.error("Erreur lors de la création du coupon:", error);
    return {
      success: false,
      error: "Une erreur est survenue lors de la création du coupon",
    };
  }
}

/**
 * Récupère tous les coupons
 */
export async function getAllCoupons() {
  try {
    const couponsRef = collection(db, "coupons");
    const querySnapshot = await getDocs(couponsRef);

    const coupons: Coupon[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();

      // Convertir les Timestamps en Date pour le front-end
      const startDate = data.startDate ? data.startDate.toDate() : new Date();
      const endDate = data.endDate ? data.endDate.toDate() : new Date();
      const createdAt = data.createdAt ? data.createdAt.toDate() : new Date();
      const updatedAt = data.updatedAt ? data.updatedAt.toDate() : new Date();

      coupons.push({
        id: doc.id,
        ...data,
        startDate,
        endDate,
        createdAt,
        updatedAt,
      } as Coupon);
    });

    return { success: true, coupons };
  } catch (error) {
    console.error("Erreur lors de la récupération des coupons:", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Récupère les coupons d'un restaurant spécifique
 * @param restaurantId ID du restaurant
 */
export async function getCouponsByRestaurant(restaurantId: string) {
  try {
    const couponsRef = collection(db, "coupons");
    const q = query(couponsRef, where("restaurantId", "==", restaurantId));
    const querySnapshot = await getDocs(q);

    const coupons: Coupon[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();

      // Convertir les Timestamps en Date
      const startDate = data.startDate ? data.startDate.toDate() : new Date();
      const endDate = data.endDate ? data.endDate.toDate() : new Date();
      const createdAt = data.createdAt ? data.createdAt.toDate() : new Date();
      const updatedAt = data.updatedAt ? data.updatedAt.toDate() : new Date();

      coupons.push({
        id: doc.id,
        ...data,
        startDate,
        endDate,
        createdAt,
        updatedAt,
      } as Coupon);
    });

    return { success: true, coupons };
  } catch (error) {
    console.error("Erreur lors de la récupération des coupons:", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Récupère un coupon par son ID
 * @param couponId ID du coupon
 */
export async function getCouponById(couponId: string) {
  try {
    const couponRef = doc(db, "coupons", couponId);
    const docSnap = await getDoc(couponRef);

    if (docSnap.exists()) {
      const data = docSnap.data();

      // Convertir les Timestamps en Date
      const startDate = data.startDate ? data.startDate.toDate() : new Date();
      const endDate = data.endDate ? data.endDate.toDate() : new Date();
      const createdAt = data.createdAt ? data.createdAt.toDate() : new Date();
      const updatedAt = data.updatedAt ? data.updatedAt.toDate() : new Date();

      return {
        success: true,
        coupon: {
          id: docSnap.id,
          ...data,
          startDate,
          endDate,
          createdAt,
          updatedAt,
        } as Coupon,
      };
    } else {
      return { success: false, error: "Coupon non trouvé" };
    }
  } catch (error) {
    console.error("Erreur lors de la récupération du coupon:", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Met à jour un coupon existant
 * @param couponId ID du coupon
 * @param data Données à mettre à jour
 */
export async function updateCoupon(couponId: string, data: Partial<Coupon>) {
  try {
    const updateData: any = { ...data, updatedAt: serverTimestamp() };

    // Convertir les dates en Timestamp si elles sont présentes
    if (data.startDate) {
      updateData.startDate = Timestamp.fromDate(
        typeof data.startDate === "string"
          ? new Date(data.startDate)
          : data.startDate,
      );
    }

    if (data.endDate) {
      updateData.endDate = Timestamp.fromDate(
        typeof data.endDate === "string"
          ? new Date(data.endDate)
          : data.endDate,
      );
    }

    const couponRef = doc(db, "coupons", couponId);
    await updateDoc(couponRef, updateData);

    // Revalider le chemin
    revalidatePath("/admin/coupons");

    return {
      success: true,
      message: "Coupon mis à jour avec succès",
    };
  } catch (error) {
    console.error("Erreur lors de la mise à jour du coupon:", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Supprime un coupon
 * @param couponId ID du coupon
 */
export async function deleteCoupon(couponId: string) {
  try {
    const couponRef = doc(db, "coupons", couponId);
    await deleteDoc(couponRef);

    // Revalider le chemin
    revalidatePath("/admin/coupons");

    return {
      success: true,
      message: "Coupon supprimé avec succès",
    };
  } catch (error) {
    console.error("Erreur lors de la suppression du coupon:", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Vérifie si un code de coupon existe déjà
 * @param code Code du coupon
 */
export async function checkCouponCodeExists(code: string) {
  try {
    const couponsRef = collection(db, "coupons");
    const q = query(couponsRef, where("code", "==", code));
    const querySnapshot = await getDocs(q);

    return {
      success: true,
      exists: !querySnapshot.empty,
    };
  } catch (error) {
    console.error("Erreur lors de la vérification du code coupon:", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Incrémente le compteur d'utilisation d'un coupon
 * @param couponId ID du coupon
 */
export async function incrementCouponUsage(couponId: string) {
  try {
    const couponRef = doc(db, "coupons", couponId);
    const couponSnap = await getDoc(couponRef);

    if (!couponSnap.exists()) {
      return { success: false, error: "Coupon non trouvé" };
    }

    const couponData = couponSnap.data();
    const currentUsesCount = couponData.usesCount || 0;

    await updateDoc(couponRef, {
      usesCount: currentUsesCount + 1,
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
      message: "Utilisation du coupon incrémentée",
    };
  } catch (error) {
    console.error(
      "Erreur lors de l'incrémentation de l'utilisation du coupon:",
      error,
    );
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Active ou désactive un coupon
 * @param couponId ID du coupon
 * @param isActive État d'activation
 */
export async function toggleCouponActive(couponId: string, isActive: boolean) {
  try {
    const couponRef = doc(db, "coupons", couponId);
    await updateDoc(couponRef, {
      isActive,
      updatedAt: serverTimestamp(),
    });

    // Revalider le chemin
    revalidatePath("/admin/coupons");

    return {
      success: true,
      message: `Coupon ${isActive ? "activé" : "désactivé"} avec succès`,
    };
  } catch (error) {
    console.error("Erreur lors de la modification de l'état du coupon:", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Vérifie la validité d'un coupon pour une commande
 * @param code Code du coupon
 * @param orderValue Montant de la commande
 * @param restaurantId ID du restaurant
 */
export async function validateCoupon(
  code: string,
  orderValue: number,
  restaurantId: string,
) {
  try {
    const couponsRef = collection(db, "coupons");
    const q = query(
      couponsRef,
      where("code", "==", code),
      where("restaurantId", "==", restaurantId),
      where("isActive", "==", true),
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return {
        success: false,
        error: "Coupon invalide ou expiré",
      };
    }

    const couponData = querySnapshot.docs[0].data();
    const couponId = querySnapshot.docs[0].id;

    // Vérifier si le coupon a atteint son nombre maximum d'utilisations
    if (couponData.maxUses && couponData.usesCount >= couponData.maxUses) {
      return {
        success: false,
        error: "Ce coupon a atteint son nombre maximum d'utilisations",
      };
    }

    // Vérifier les dates de validité
    const now = new Date();
    const startDate = couponData.startDate.toDate();
    const endDate = couponData.endDate.toDate();

    if (now < startDate || now > endDate) {
      return {
        success: false,
        error: "Ce coupon n'est pas valide pour cette période",
      };
    }

    // Vérifier le montant minimum de commande
    if (couponData.minOrderValue && orderValue < couponData.minOrderValue) {
      return {
        success: false,
        error: `Le montant minimum de la commande doit être de ${couponData.minOrderValue}€`,
      };
    }

    // Calculer le montant de la réduction
    let discountAmount = 0;

    if (couponData.discountType === "percentage") {
      discountAmount = (orderValue * couponData.discountValue) / 100;

      // Appliquer le montant maximum de réduction si défini
      if (
        couponData.maxDiscountAmount &&
        discountAmount > couponData.maxDiscountAmount
      ) {
        discountAmount = couponData.maxDiscountAmount;
      }
    } else {
      // Réduction fixe
      discountAmount = couponData.discountValue;

      // S'assurer que la réduction ne dépasse pas le montant de la commande
      if (discountAmount > orderValue) {
        discountAmount = orderValue;
      }
    }

    return {
      success: true,
      coupon: {
        id: couponId,
        ...couponData,
        startDate: startDate,
        endDate: endDate,
      } as Coupon,
      discountAmount,
    };
  } catch (error) {
    console.error("Erreur lors de la validation du coupon:", error);
    return { success: false, error: (error as Error).message };
  }
}
