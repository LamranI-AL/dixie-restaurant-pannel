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
  serverTimestamp,
  CollectionReference,
  DocumentReference,
  collectionGroup,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { User, Order } from "@/lib/types";
import { revalidatePath } from "next/cache";

// Fonction utilitaire pour obtenir l'ID de l'utilisateur actuel (à implémenter selon votre système d'authentification)
const getCurrentUserId = () => {
  // Remplacer par votre logique d'authentification
  // Par exemple, avec Firebase Auth:
  // const auth = getAuth();
  // return auth.currentUser?.uid;
  throw new Error("getCurrentUserId non implémenté");
};

// CREATE: Add a new user
export async function addUser(data: any) {
  try {
    // Préparer l'objet utilisateur en se basant sur le type User
    const newUser = {
      uid: data.uid,
      email: data.email || "",
      displayName: data.displayName || "",
      phoneNumber: data.phoneNumber || "",
      address: data.address || "",
      role: "customer", //
      photoURL: data.photoURL || null,
      updatedAt: serverTimestamp(),
      lastLoginAt: data.lastLoginAt || serverTimestamp(),
    };

    // Enregistrer l'utilisateur dans Firebase en utilisant l'API modulaire
    const usersRef = collection(db, "users");
    const docRef = await addDoc(usersRef, newUser);

    // Mettre à jour l'ID avec l'ID généré par Firebase
    const userDoc = doc(db, "users", docRef.id);
    await updateDoc(userDoc, { id: docRef.id });

    // Revalider le chemin pour afficher les dernières données
    revalidatePath("/users");

    return {
      success: true,
      userId: docRef.id,
      message: "Utilisateur créé avec succès",
    };
  } catch (error) {
    console.error("Erreur lors de la création de l'utilisateur:", error);
    return {
      success: false,
      error: "Une erreur est survenue lors de la création de l'utilisateur",
    };
  }
}

// READ: Get all users
export async function getAllUsers() {
  try {
    const userRef = collection(db, "users");
    const q = query(userRef);
    const querySnapshot = await getDocs(q);

    const users: User[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();

      // Convertir les Timestamps en dates
      const createdAt = data.createdAt ? data.createdAt.toDate() : new Date();
      const updatedAt = data.updatedAt ? data.updatedAt.toDate() : new Date();

      users.push({
        id: doc.id,
        ...data,
        createdAt,
        updatedAt,
      } as User);
    });

    return { success: true, users };
  } catch (error) {
    console.error("Error getting users:", error);
    return { success: false, error: (error as Error).message };
  }
}

// READ: Get a single user by ID
export async function getUserByUid(uid: string) {
  try {
    // Créer une requête pour chercher l'utilisateur par son UID
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("uid", "==", uid));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return { success: false, error: "Utilisateur non trouvé avec cet UID" };
    }

    // Prendre le premier document correspondant
    const userDoc = querySnapshot.docs[0];
    const data = userDoc.data();

    // Convertir les Timestamps en Date
    const createdAt = data.createdAt ? data.createdAt.toDate() : new Date();
    const updatedAt = data.updatedAt ? data.updatedAt.toDate() : new Date();
    const lastLoginAt = data.lastLoginAt ? data.lastLoginAt.toDate() : null;

    return {
      success: true,
      user: {
        id: userDoc.id,
        ...data,
        createdAt,
        updatedAt,
        lastLoginAt,
      } as User,
    };
  } catch (error) {
    console.error(
      "Erreur lors de la récupération de l'utilisateur par UID:",
      error,
    );
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Récupère un utilisateur par son ID de document
 * (Corrigée pour éviter l'erreur de référence)
 * @param {string} id - L'ID du document utilisateur
 * @returns {Promise<{success: boolean, user?: User, error?: string}>}
 */
export async function getUserById(id: string) {
  try {
    // Vérifier que l'ID est valide
    if (!id || typeof id !== "string") {
      return { success: false, error: "ID utilisateur invalide" };
    }

    // Construire la référence du document
    const userRef = doc(db, "users", id);

    // Récupérer le document
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
      const data = docSnap.data();

      // Convertir les Timestamps en Date
      const createdAt = data.createdAt ? data.createdAt.toDate() : new Date();
      const updatedAt = data.updatedAt ? data.updatedAt.toDate() : new Date();
      const lastLoginAt = data.lastLoginAt ? data.lastLoginAt.toDate() : null;

      return {
        success: true,
        user: {
          id: docSnap.id,
          ...data,
          createdAt,
          updatedAt,
          lastLoginAt,
        } as User,
      };
    } else {
      return { success: false, error: "Utilisateur non trouvé" };
    }
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error);
    return { success: false, error: (error as Error).message };
  }
}
// READ: Get users by role
export async function getUsersByRole(role: "admin" | "manager" | "staff") {
  try {
    const userRef = collection(db, "users");
    const q = query(
      userRef,
      where("role", "==", role),
      orderBy("createdAt", "desc"),
    );
    const querySnapshot = await getDocs(q);

    const users: User[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();

      // Convertir les Timestamps en Date
      const createdAt = data.createdAt ? data.createdAt.toDate() : new Date();
      const updatedAt = data.updatedAt ? data.updatedAt.toDate() : new Date();

      users.push({
        id: doc.id,
        ...data,
        createdAt,
        updatedAt,
      } as User);
    });

    return { success: true, users };
  } catch (error) {
    console.error("Error getting users by role:", error);
    return { success: false, error: (error as Error).message };
  }
}

// READ: Get users by restaurant
export async function getUsersByRestaurant(restaurantId: string) {
  try {
    const userRef = collection(db, "users");
    const q = query(
      userRef,
      where("restaurantId", "==", restaurantId),
      orderBy("createdAt", "desc"),
    );
    const querySnapshot = await getDocs(q);

    const users: User[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();

      // Convertir les Timestamps en Date
      const createdAt = data.createdAt ? data.createdAt.toDate() : new Date();
      const updatedAt = data.updatedAt ? data.updatedAt.toDate() : new Date();

      users.push({
        id: doc.id,
        ...data,
        createdAt,
        updatedAt,
      } as User);
    });

    return { success: true, users };
  } catch (error) {
    console.error("Error getting restaurant users:", error);
    return { success: false, error: (error as Error).message };
  }
}

// UPDATE: Update a user
export async function updateUser(id: string, data: Partial<User>) {
  try {
    // Préparer les données à mettre à jour
    const updatedData: any = { ...data, updatedAt: serverTimestamp() };

    // Si createdAt est présent et c'est un objet Date, le convertir en timestamp
    if (updatedData.createdAt instanceof Date) {
      delete updatedData.createdAt; // Ne pas mettre à jour la date de création
    }

    const userRef = doc(db, "users", id);
    await updateDoc(userRef, updatedData);

    return { success: true };
  } catch (error) {
    console.error("Error updating user:", error);
    return { success: false, error: (error as Error).message };
  }
}

// DELETE: Delete a user
export async function deleteUser(id: string) {
  try {
    const userRef = doc(db, "users", id);
    await deleteDoc(userRef);

    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { success: false, error: (error as Error).message };
  }
}

// ORDERS: Create a new order for a user
export async function createOrderForUser(userId: string, orderData: any) {
  try {
    // Référence à la sous-collection 'orders' de l'utilisateur
    const ordersRef = collection(db, "users", userId, "orders");

    // Préparer l'objet de commande
    const order = {
      ...orderData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: orderData.status || "pending",
    };

    // Ajouter la commande à Firestore
    const docRef = await addDoc(ordersRef, order);

    // Mettre à jour l'ID avec l'ID généré par Firebase
    const orderDoc = doc(db, "users", userId, "orders", docRef.id);
    await updateDoc(orderDoc, { id: docRef.id });

    return {
      success: true,
      orderId: docRef.id,
      message: "Commande créée avec succès",
    };
  } catch (error) {
    console.error("Erreur lors de la création de la commande:", error);
    return {
      success: false,
      error: "Une erreur est survenue lors de la création de la commande",
    };
  }
}

// ORDERS: Create a draft order for a user
export async function createDraftOrderForUser(userId: string, orderData: any) {
  try {
    const orderDataWithStatus = {
      ...orderData,
      status: "draft",
    };

    return await createOrderForUser(userId, orderDataWithStatus);
  } catch (error) {
    console.error(
      "Erreur lors de la création de la commande provisoire:",
      error,
    );
    return {
      success: false,
      error:
        "Une erreur est survenue lors de la création de la commande provisoire",
    };
  }
}

// ORDERS: Complete a draft order
export async function completeOrder(
  userId: string,
  orderId: string,
  paymentMethod: string,
) {
  try {
    const orderDoc = doc(db, "users", userId, "orders", orderId);

    // Mettre à jour la commande
    await updateDoc(orderDoc, {
      status: "pending",
      paymentMethod,
      updatedAt: serverTimestamp(),
      orderConfirmedAt: serverTimestamp(),
    });

    return {
      success: true,
      message: `Commande ${orderId} complétée avec méthode de paiement ${paymentMethod}`,
    };
  } catch (error) {
    console.error("Erreur lors de la finalisation de la commande:", error);
    return {
      success: false,
      error: "Une erreur est survenue lors de la finalisation de la commande",
    };
  }
}

// ORDERS: Update order payment
export async function updateOrderPayment(
  userId: string,
  orderId: string,
  paymentMethod: string,
  status = "pending",
) {
  try {
    const orderRef = doc(db, "users", userId, "orders", orderId);

    await updateDoc(orderRef, {
      paymentMethod,
      status,
      paymentConfirmedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
      message: `Commande ${orderId} mise à jour avec méthode de paiement ${paymentMethod} et statut ${status}`,
    };
  } catch (error) {
    console.error("Erreur lors de la mise à jour du paiement:", error);
    return {
      success: false,
      error: "Une erreur est survenue lors de la mise à jour du paiement",
    };
  }
}

// ORDERS: Get a specific order by ID
export async function getOrderById(userId: string, orderId: string) {
  try {
    // Construire la référence au document
    const orderDoc = doc(db, "users", userId, "orders", orderId);

    // Obtenir le document
    const snapshot = await getDoc(orderDoc);

    if (snapshot.exists()) {
      const data = snapshot.data();

      // Convertir les Timestamps en Date
      const createdAt = data.createdAt ? data.createdAt.toDate() : null;
      const updatedAt = data.updatedAt ? data.updatedAt.toDate() : null;
      const orderConfirmedAt = data.orderConfirmedAt
        ? data.orderConfirmedAt.toDate()
        : null;
      const paymentConfirmedAt = data.paymentConfirmedAt
        ? data.paymentConfirmedAt.toDate()
        : null;

      return {
        success: true,
        order: {
          id: snapshot.id,
          ...data,
          createdAt,
          updatedAt,
          orderConfirmedAt,
          paymentConfirmedAt,
        } as Order,
      };
    } else {
      return { success: false, error: "Commande non trouvée" };
    }
  } catch (error) {
    console.error("Erreur lors de la récupération de la commande:", error);
    return { success: false, error: (error as Error).message };
  }
}

// ORDERS: Get all orders for a user
export async function getOrdersByUser(userId: string) {
  try {
    // Référence à la sous-collection 'orders' de l'utilisateur
    const ordersRef = collection(db, "users", userId, "orders");
    const q = query(ordersRef, orderBy("createdAt", "desc"));

    const snapshot = await getDocs(q);

    const orders: Order[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();

      // Convertir les Timestamps en Date
      const createdAt = data.createdAt ? data.createdAt.toDate() : null;
      const updatedAt = data.updatedAt ? data.updatedAt.toDate() : null;
      const orderConfirmedAt = data.orderConfirmedAt
        ? data.orderConfirmedAt.toDate()
        : null;
      const paymentConfirmedAt = data.paymentConfirmedAt
        ? data.paymentConfirmedAt.toDate()
        : null;

      orders.push({
        id: doc.id,
        ...data,
        createdAt,
        updatedAt,
        orderConfirmedAt,
        paymentConfirmedAt,
      } as Order);
    });

    return { success: true, orders };
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des commandes de l'utilisateur:",
      error,
    );
    return { success: false, error: (error as Error).message };
  }
}

// ORDERS: Get all orders from all users
export async function getAllUsersOrders() {
  try {
    const users = await getAllUsers();
    console.log(users);

    if (!users.success) {
      return {
        success: false,
        error: "Erreur lors de la récupération des utilisateurs",
      };
    }

    const allOrders: Order[] = [];

    // Pour chaque utilisateur, récupérer ses commandes
    for (const user of users.users!) {
      const userOrders = await getOrdersByUser(user.id);

      if (userOrders.success && userOrders?.orders?.length! > 0) {
        // Ajouter l'ID de l'utilisateur à chaque commande pour référence
        const ordersWithUserId = userOrders.orders?.map((order) => ({
          ...order,
          userId: user.id,
          userName: user.displayName, // Ajouter le nom de l'utilisateur pour faciliter l'identification
        }));

        allOrders.push(...(ordersWithUserId as any));
      }
    }

    // Trier les commandes par date (la plus récente en premier)
    // allOrders.sort((a, b) => {
    //   const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    //   const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    //   return dateB - dateA;
    // });

    return { success: true, orders: allOrders };
  } catch (error) {
    console.error(
      "Erreur lors de la récupération de toutes les commandes:",
      error,
    );
    return { success: false, error: (error as Error).message };
  }
}
export async function getGlobalOrderById(orderId: string) {
  try {
    // D'abord, essayer de récupérer tous les utilisateurs
    const usersRef = collection(db, "users");
    const usersSnapshot = await getDocs(usersRef);

    // Parcourir chaque utilisateur pour chercher la commande dans sa sous-collection
    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const userName = userDoc.data().name;

      // Vérifier si l'ID existe directement dans la sous-collection 'orders' de cet utilisateur
      const orderDoc = doc(db, "users", userId, "orders", orderId);
      const orderSnapshot = await getDoc(orderDoc);

      if (orderSnapshot.exists()) {
        const data = orderSnapshot.data();

        // Convertir les Timestamps en Date
        const createdAt = data.createdAt ? data.createdAt.toDate() : null;
        const updatedAt = data.updatedAt ? data.updatedAt.toDate() : null;
        const orderConfirmedAt = data.orderConfirmedAt
          ? data.orderConfirmedAt.toDate()
          : null;
        const paymentConfirmedAt = data.paymentConfirmedAt
          ? data.paymentConfirmedAt.toDate()
          : null;

        return {
          success: true,
          order: {
            id: orderSnapshot.id,
            ...data,
            userId,
            userName,
            createdAt,
            updatedAt,
            orderConfirmedAt,
            paymentConfirmedAt,
          } as Order | any,
        };
      }
    }

    // Si on arrive ici, essayons une dernière approche avec la collection principale 'orders'
    const mainOrderDoc = doc(db, "orders", orderId);
    const mainOrderSnapshot = await getDoc(mainOrderDoc);

    if (mainOrderSnapshot.exists()) {
      const data = mainOrderSnapshot.data();

      // Convertir les Timestamps
      const createdAt = data.createdAt ? data.createdAt.toDate() : null;
      const updatedAt = data.updatedAt ? data.updatedAt.toDate() : null;

      return {
        success: true,
        order: {
          id: mainOrderSnapshot.id,
          ...data,
          createdAt,
          updatedAt,
        } as Order,
      };
    }

    // Si aucune commande n'est trouvée
    return {
      success: false,
      error: `La commande avec l'ID ${orderId} n'a pas été trouvée`,
    };
  } catch (error) {
    console.error("Erreur lors de la récupération de la commande:", error);
    return {
      success: false,
      error: (error as Error).message,
    };
  }
}

export type OrderStatus = "pending" | "processing" | "delivered" | "cancelled";

export interface OrderStatistics {
  pending: number;
  processing: number;
  delivered: number;
  cancelled: number;
  total: number;
}

/**
 * Récupère les statistiques de toutes les commandes de tous les utilisateurs
 * @param {OrderStatus} orderStatus - Statut de commande à filtrer (optionnel)
 * @returns {Promise<{success: boolean, statistics?: OrderStatistics, error?: string}>}
 */
export async function getOrderStatistics(
  orderStatus?: OrderStatus,
): Promise<{ success: boolean; statistics?: OrderStatistics; error?: string }> {
  try {
    // Initialiser l'objet de statistiques avec les statuts spécifiés
    const result: OrderStatistics = {
      pending: 0,
      processing: 0,
      delivered: 0,
      cancelled: 0,
      total: 0,
    };

    // Utiliser collectionGroup pour accéder à toutes les sous-collections 'orders'
    // indépendamment de leur emplacement dans la hiérarchie
    const ordersGroupRef = collectionGroup(db, "orders");
    let ordersQuery;

    if (orderStatus) {
      // Filtrer par statut spécifique
      ordersQuery = query(ordersGroupRef, where("status", "==", orderStatus));
    } else {
      // Récupérer toutes les commandes
      ordersQuery = ordersGroupRef;
    }

    const ordersSnapshot = await getDocs(ordersQuery);
    result.total = ordersSnapshot.docs.length; // Définir le nombre total

    // Compter chaque commande par statut
    ordersSnapshot.forEach((doc) => {
      const data = doc.data();

      // Compter par statut de commande (utiliser 'status' au lieu de 'orderStatus')
      const status = data.status;
      if (status && status in result) {
        // Incrémenter le compteur pour ce statut
        result[status as keyof OrderStatistics]++;
      }
    });

    return { success: true, statistics: result };
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des statistiques de commande:",
      error,
    );
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Version alternative qui parcourt tous les utilisateurs et leurs commandes
 * si la méthode collectionGroup nécessite un index spécifique
 */
export async function getOrderStatisticsAlt(
  orderStatus?: OrderStatus,
): Promise<{ success: boolean; statistics?: OrderStatistics; error?: string }> {
  try {
    // Initialiser l'objet de statistiques
    const result: OrderStatistics = {
      pending: 0,
      processing: 0,
      delivered: 0,
      cancelled: 0,
      total: 0,
    };

    // Récupérer tous les utilisateurs
    const usersRef = collection(db, "users");
    const usersSnapshot = await getDocs(usersRef);

    // Pour chaque utilisateur, récupérer ses commandes
    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const ordersRef = collection(db, "users", userId, "orders");

      // Appliquer un filtre par statut si nécessaire
      let ordersQuery;
      if (orderStatus) {
        ordersQuery = query(ordersRef, where("status", "==", orderStatus));
      } else {
        ordersQuery = ordersRef;
      }

      const ordersSnapshot = await getDocs(ordersQuery);

      // Ajouter au total
      result.total += ordersSnapshot.docs.length;

      // Compter chaque commande par statut
      ordersSnapshot.forEach((doc) => {
        const data = doc.data();

        // Compter par statut de commande
        const status = data.status;
        if (status && status in result) {
          result[status as keyof OrderStatistics]++;
        }
      });
    }

    return { success: true, statistics: result };
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des statistiques de commande:",
      error,
    );
    return { success: false, error: (error as Error).message };
  }
}

// FAVORITES: Get all favorites from all users
export async function getAllUsersFavorites() {
  try {
    const users = await getAllUsers();

    if (!users.success) {
      return {
        success: false,
        error: "Erreur lors de la récupération des utilisateurs",
      };
    }

    const allFavorites: any[] = [];

    // Pour chaque utilisateur, récupérer ses favoris
    for (const user of users.users!) {
      const userFavorites = await getFavoritesByUser(user.id);

      if (userFavorites.success && userFavorites?.favorites?.length! > 0) {
        // Ajouter l'ID de l'utilisateur à chaque favori pour référence
        const favoritesWithUserId = userFavorites.favorites?.map(
          (favorite) => ({
            ...favorite,
            userId: user.id,
            userName: user.displayName, // Ajouter le nom de l'utilisateur
          }),
        );

        allFavorites.push(...(favoritesWithUserId as any));
      }
    }

    return { success: true, favorites: allFavorites };
  } catch (error) {
    console.error("Erreur lors de la récupération de tous les favoris:", error);
    return { success: false, error: (error as Error).message };
  }
}

// FAVORITES: Get favorites for a specific user
export async function getFavoritesByUser(userId: string) {
  try {
    // Référence à la sous-collection 'favorites' de l'utilisateur
    const favoritesRef = collection(db, "users", userId, "favorites");
    const q = query(favoritesRef);

    const snapshot = await getDocs(q);

    const favorites: any[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();

      // Convertir les Timestamps en Date
      // const createdAt = data.createdAt ? data.createdAt.toDate() : null;
      // const updatedAt = data.updatedAt ? data.updatedAt.toDate() : null;

      favorites.push({
        id: doc.id,
        ...data,
        // createdAt,
        // updatedAt,
      });
    });

    return { success: true, favorites };
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des favoris de l'utilisateur:",
      error,
    );
    return { success: false, error: (error as Error).message };
  }
}

// FAVORITES: Add a food item to user's favorites
export async function addToFavorites(userId: string, foodItem: any) {
  try {
    // Référence à la sous-collection 'favorites' de l'utilisateur
    const favoritesRef = collection(db, "users", userId, "favorites");

    // Préparer l'objet favori
    const favorite = {
      ...foodItem,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // Ajouter le favori à Firestore
    const docRef = await addDoc(favoritesRef, favorite);

    // Mettre à jour l'ID avec l'ID généré par Firebase
    const favoriteDoc = doc(db, "users", userId, "favorites", docRef.id);
    await updateDoc(favoriteDoc, { id: docRef.id });

    return {
      success: true,
      favoriteId: docRef.id,
      message: "Élément ajouté aux favoris avec succès",
    };
  } catch (error) {
    console.error("Erreur lors de l'ajout aux favoris:", error);
    return {
      success: false,
      error: "Une erreur est survenue lors de l'ajout aux favoris",
    };
  }
}

// FAVORITES: Remove a food item from user's favorites
export async function removeFromFavorites(userId: string, favoriteId: string) {
  try {
    const favoriteDoc = doc(db, "users", userId, "favorites", favoriteId);
    await deleteDoc(favoriteDoc);

    return {
      success: true,
      message: "Élément supprimé des favoris avec succès",
    };
  } catch (error) {
    console.error("Erreur lors de la suppression du favori:", error);
    return {
      success: false,
      error: "Une erreur est survenue lors de la suppression du favori",
    };
  }
}

// FAVORITES: Get specific favorite by ID
export async function getFavoriteById(userId: string, favoriteId: string) {
  try {
    // Construire la référence au document
    const favoriteDoc = doc(db, "users", userId, "favorites", favoriteId);

    // Obtenir le document
    const snapshot = await getDoc(favoriteDoc);

    if (snapshot.exists()) {
      const data = snapshot.data();

      // Convertir les Timestamps en Date
      const createdAt = data.createdAt ? data.createdAt.toDate() : null;
      const updatedAt = data.updatedAt ? data.updatedAt.toDate() : null;

      return {
        success: true,
        favorite: {
          id: snapshot.id,
          ...data,
          createdAt,
          updatedAt,
        },
      };
    } else {
      return { success: false, error: "Favori non trouvé" };
    }
  } catch (error) {
    console.error("Erreur lors de la récupération du favori:", error);
    return { success: false, error: (error as Error).message };
  }
}
