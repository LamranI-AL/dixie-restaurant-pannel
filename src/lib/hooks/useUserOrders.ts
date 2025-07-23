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
  orderBy,
  limit,
  serverTimestamp,
  collectionGroup,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { User, Order } from "@/lib/types";
import { toast } from "sonner";

// Helper function to extract coordinates from different possible formats
function _getCoordinates(orderData: any) {
  // Default coordinates (can be center of city or other default)
  let coords = { latitude: 32.3373, longitude: -6.3498 }; // Default to Beni Mellal

  // Try coordinates directly
  if (orderData.coordinates) {
    if (
      typeof orderData.coordinates.latitude === "number" &&
      typeof orderData.coordinates.longitude === "number"
    ) {
      return orderData.coordinates;
    }
  }

  // Try deliveryLocation (from createOrder in customer app)
  if (orderData.deliveryLocation) {
    if (
      typeof orderData.deliveryLocation.latitude === "number" &&
      typeof orderData.deliveryLocation.longitude === "number"
    ) {
      return {
        latitude: orderData.deliveryLocation.latitude,
        longitude: orderData.deliveryLocation.longitude,
      };
    }
  }

  // Try nested address object (from createOrder)
  if (orderData.address && typeof orderData.address === "object") {
    if (
      typeof orderData.address.latitude === "number" &&
      typeof orderData.address.longitude === "number"
    ) {
      return {
        latitude: orderData.address.latitude,
        longitude: orderData.address.longitude,
      };
    }
  }

  return coords;
}

// Helper function to standardize items format
function _standardizeItems(items: any[]) {
  if (!Array.isArray(items)) return [];

  return items.map((item) => {
    return {
      id: item.id || item.productId || "",
      name: item.name || "",
      price: Number(item.price || item.priceAtPurchase || 0),
      quantity: Number(item.quantity || 1),
      image:
        item.image?.uri || (typeof item.image === "string" ? item.image : ""),
      variations: Array.isArray(item.variations)
        ? item.variations
        : Array.isArray(item.selectedVariations)
          ? item.selectedVariations
          : [],
      addons: Array.isArray(item.addons)
        ? item.addons
        : Array.isArray(item.selectedAddons)
          ? item.selectedAddons
          : [],
      subtotal: Number(item.subtotal || item.price * item.quantity || 0),
    };
  });
}

// Order fields mapping
const OrderMapper = {
  mapOrderFields(orderData: any): Order {
    return {
      // Basic fields
      id: orderData.id || "",
      userId: orderData.userId || "",
      driverId: orderData.driverId || null,

      // Customer details
      customerName: orderData.customerName || "",
      customerPhone: orderData.phoneNumber || orderData.customerPhone || "",

      // Address handling
      address:
        orderData.address?.address ||
        orderData.deliveryAddress ||
        (orderData.deliveryLocation
          ? orderData.deliveryLocation.address
          : "") ||
        "",

      // Delivery instructions
      deliveryInstructions:
        orderData.address?.instructions ||
        orderData.additionalNote ||
        orderData.deliveryLocation?.instructions ||
        orderData.notes ||
        "",

      // Coordinates
      coordinates: _getCoordinates(orderData),

      // Order status and payment
      status: orderData.status || "pending",
      paymentStatus: orderData.paymentStatus || "unpaid",
      paymentMethod: orderData.paymentMethod || "cash_on_delivery",

      // Financial details
      total: orderData.total || orderData.grandTotal || 0,
      subtotal: orderData.subtotal || 0,
      deliveryFee: orderData.deliveryFee || 0,
      tipAmount: orderData.tipAmount || 0,

      // Items
      items: _standardizeItems(orderData.items || []),

      // Additional info
      notes: orderData.notes || orderData.additionalNote || "",
      orderNumber: orderData.orderNumber || orderData.id || "",

      // Timestamps
      createdAt: orderData.createdAt?.toDate
        ? orderData.createdAt.toDate()
        : orderData.createdAt instanceof Date
          ? orderData.createdAt
          : new Date(),
      updatedAt: orderData.updatedAt?.toDate
        ? orderData.updatedAt.toDate()
        : orderData.updatedAt instanceof Date
          ? orderData.updatedAt
          : new Date(),
      orderConfirmedAt: orderData.orderConfirmedAt?.toDate
        ? orderData.orderConfirmedAt.toDate()
        : null,
      paymentConfirmedAt: orderData.paymentConfirmedAt?.toDate
        ? orderData.paymentConfirmedAt.toDate()
        : null,

      // Restaurant info
      restaurantId: orderData.restaurantId || "",
      cuisineName: orderData.cuisineName || "",

      // Order type
      orderType: orderData.orderType || orderData.deliveryOption || "delivery",

      // Additional fields for compatibility
      orderStatus: orderData.status || "pending",
      deliveryLocation: orderData.deliveryLocation || null,
      deliveryOption:
        orderData.orderType || orderData.deliveryOption || "delivery",
      discount: orderData.discount || 0,
      tax: orderData.tax || 0,
      packagingFee: orderData.packagingFee || 0,
      orderDate: orderData.createdAt?.toDate
        ? orderData.createdAt.toDate()
        : new Date(),
      deliveryDate: orderData.deliveryDate?.toDate
        ? orderData.deliveryDate.toDate()
        : null,
    } as any;
  },

  // Helper methods for display
  getStatusDisplay(status: string) {
    switch (status) {
      case "pending":
        return "En Attente";
      case "confirmed":
        return "Confirmée";
      case "accepted":
        return "Acceptée";
      case "cooking":
        return "En Préparation";
      case "ready-for-delivery":
        return "Prête pour Livraison";
      case "on-the-way":
        return "En Cours de Livraison";
      case "delivered":
        return "Livrée";
      case "dine-in":
        return "Sur Place";
      case "canceled":
        return "Annulée";
      case "refunded":
        return "Remboursée";
      default:
        return status
          ? status.charAt(0).toUpperCase() + status.slice(1)
          : "Inconnu";
    }
  },
};

interface UseUsersReturn {
  users: User[];
  orders: Order[];
  loading: boolean;
  error: string | null;
  addUser: (
    data: Partial<User>,
  ) => Promise<{ success: boolean; userId?: string; error?: string }>;
  getAllUsers: () => Promise<{
    success: boolean;
    users?: User[];
    error?: string;
  }>;
  getUserByUid: (
    uid: string,
  ) => Promise<{ success: boolean; user?: User; error?: string }>;
  getUserById: (
    id: string,
  ) => Promise<{ success: boolean; user?: User; error?: string }>;
  getUsersByRole: (
    role: "admin" | "manager" | "staff" | "customer",
  ) => Promise<{ success: boolean; users?: User[]; error?: string }>;
  getUsersByRestaurant: (
    restaurantId: string,
  ) => Promise<{ success: boolean; users?: User[]; error?: string }>;
  updateUser: (
    id: string,
    data: Partial<User>,
  ) => Promise<{ success: boolean; error?: string }>;
  deleteUser: (id: string) => Promise<{ success: boolean; error?: string }>;
  createOrderForUser: (
    userId: string,
    orderData: Partial<Order>,
  ) => Promise<{ success: boolean; orderId?: string; error?: string }>;
  createDraftOrderForUser: (
    userId: string,
    orderData: Partial<Order>,
  ) => Promise<{ success: boolean; orderId?: string; error?: string }>;
  completeOrder: (
    userId: string,
    orderId: string,
    paymentMethod: string,
  ) => Promise<{ success: boolean; message?: string; error?: string }>;
  updateOrderPayment: (
    userId: string,
    orderId: string,
    paymentMethod: string,
    status?: string,
  ) => Promise<{ success: boolean; message?: string; error?: string }>;
  getOrderById: (
    userId: string,
    orderId: string,
  ) => Promise<{ success: boolean; order?: Order; error?: string }>;
  getOrdersByUser: (
    userId: string,
  ) => Promise<{ success: boolean; orders?: Order[]; error?: string }>;
  getAllUsersOrders: () => Promise<{
    success: boolean;
    orders?: Order[];
    error?: string;
  }>;
  getUserOrderById: (
    orderId: string,
  ) => Promise<{ success: boolean; order?: Order; error?: string }>;
  updateGlobalOrder: (
    orderId: string,
    orderData: Partial<Order>,
  ) => Promise<{ success: boolean; error?: string; message?: string }>;
  deleteOrderById: (
    orderId: string,
  ) => Promise<{ success: boolean; error?: string; message?: string }>;
  updateOrderStatus: (
    userId: string,
    orderId: string,
    newStatus: string,
    additionalData?: any,
  ) => Promise<{ success: boolean; error?: string }>;
  startDelivery: (
    userId: string,
    orderId: string,
  ) => Promise<{ success: boolean; error?: string }>;
  markOrderAsDelivered: (
    userId: string,
    orderId: string,
    deliveryData?: any,
  ) => Promise<{ success: boolean; error?: string }>;
  acceptOrder: (
    userId: string,
    orderId: string,
  ) => Promise<{ success: boolean; error?: string }>;
  clearError: () => void;
}

export function useUsers(): UseUsersReturn {
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Utility function to convert Firebase Timestamps to Date objects
  const serializeUserTimestamps = (data: any): User => {
    const createdAt = data.createdAt?.toDate
      ? data.createdAt.toDate()
      : data.createdAt || new Date();
    const updatedAt = data.updatedAt?.toDate
      ? data.updatedAt.toDate()
      : data.updatedAt || new Date();
    const lastLoginAt = data.lastLoginAt?.toDate
      ? data.lastLoginAt.toDate()
      : data.lastLoginAt || null;
    return { ...data, createdAt, updatedAt, lastLoginAt } as User;
  };

  const addUser = useCallback(async (data: Partial<User | any>) => {
    setLoading(true);
    setError(null);
    try {
      const newUser = {
        email: data.email || "",
        displayName: data.displayName || "",
        phoneNumber: data.phoneNumber || "",
        address: data.address || "",
        role: data.role || "customer",
        photoURL: data.photoURL || null,
        createdAt: serverTimestamp(),
      };

      const usersRef = collection(db, "users");
      const docRef = await addDoc(usersRef, newUser);

      const userDoc = doc(db, "users", docRef.id);
      await updateDoc(userDoc, { id: docRef.id });

      const addedUser = {
        id: docRef.id,
        ...newUser,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: new Date(),
      } as any;
      setUsers((prev) => [...prev, addedUser]);

      return {
        success: true,
        userId: docRef.id,
        message: "Utilisateur créé avec succès",
      };
    } catch (err) {
      const errorMessage = (err as Error).message;
      setError(errorMessage);
      console.error("Error creating user:", err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const getAllUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const userRef = collection(db, "users");
      const q = query(userRef);
      const querySnapshot = await getDocs(q);

      const usersData: any[] = [];
      querySnapshot.forEach((doc) => {
        usersData.push({ ...serializeUserTimestamps(doc.data()) });
      });
      setUsers(usersData);
      return { success: true, users: usersData };
    } catch (err) {
      const errorMessage = (err as Error).message;
      setError(errorMessage);
      console.error("Error getting users:", err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const getUserByUid = useCallback(async (uid: string) => {
    setLoading(true);
    setError(null);
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("uid", "==", uid));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return { success: false, error: "Utilisateur non trouvé avec cet UID" };
      }

      const userDoc = querySnapshot.docs[0];
      const userData = serializeUserTimestamps(userDoc.data());

      return {
        success: true,
        user: {
          // id: userDoc.id,
          ...userData,
        },
      };
    } catch (err) {
      const errorMessage = (err as Error).message;
      setError(errorMessage);
      console.error("Error getting user by UID:", err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const getUserById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      if (!id || typeof id !== "string") {
        return { success: false, error: "ID utilisateur invalide" };
      }

      const userRef = doc(db, "users", id);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        const userData = serializeUserTimestamps(docSnap.data());
        return {
          success: true,
          user: {
            // id: docSnap.id,
            ...userData,
          },
        };
      } else {
        return { success: false, error: "Utilisateur non trouvé" };
      }
    } catch (err) {
      const errorMessage = (err as Error).message;
      setError(errorMessage);
      console.error("Error getting user:", err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const getUsersByRole = useCallback(
    async (role: "admin" | "manager" | "staff" | "customer") => {
      setLoading(true);
      setError(null);
      try {
        const userRef = collection(db, "users");
        const q = query(
          userRef,
          where("role", "==", role),
          orderBy("createdAt", "desc"),
        );
        const querySnapshot = await getDocs(q);

        const usersData: User[] = [];
        querySnapshot.forEach((doc) => {
          usersData.push({
            // id: doc.id,
            ...serializeUserTimestamps(doc.data()),
          });
        });

        return { success: true, users: usersData };
      } catch (err) {
        const errorMessage = (err as Error).message;
        setError(errorMessage);
        console.error("Error getting users by role:", err);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const getUsersByRestaurant = useCallback(async (restaurantId: string) => {
    setLoading(true);
    setError(null);
    try {
      const userRef = collection(db, "users");
      const q = query(
        userRef,
        where("restaurantId", "==", restaurantId),
        orderBy("createdAt", "desc"),
      );
      const querySnapshot = await getDocs(q);

      const usersData: User[] = [];
      querySnapshot.forEach((doc) => {
        usersData.push({ ...serializeUserTimestamps(doc.data()) });
      });

      return { success: true, users: usersData };
    } catch (err) {
      const errorMessage = (err as Error).message;
      setError(errorMessage);
      console.error("Error getting restaurant users:", err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUser = useCallback(async (id: string, data: Partial<User>) => {
    setLoading(true);
    setError(null);
    try {
      const updatedData: any = { ...data, updatedAt: serverTimestamp() };

      if (updatedData.createdAt instanceof Date) {
        delete updatedData.createdAt;
      }

      const userRef = doc(db, "users", id);
      await updateDoc(userRef, updatedData);

      // Update local state
      setUsers((prev) =>
        prev.map((user) =>
          user.id === id ? { ...user, ...data, updatedAt: new Date() } : user,
        ),
      );

      return { success: true };
    } catch (err) {
      const errorMessage = (err as Error).message;
      setError(errorMessage);
      console.error("Error updating user:", err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteUser = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const userRef = doc(db, "users", id);
      await deleteDoc(userRef);

      // Update local state
      setUsers((prev) => prev.filter((user) => user.id !== id));

      return { success: true };
    } catch (err) {
      const errorMessage = (err as Error).message;
      setError(errorMessage);
      console.error("Error deleting user:", err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const createOrderForUser = useCallback(
    async (userId: string, orderData: Partial<Order>) => {
      setLoading(true);
      setError(null);
      try {
        const ordersRef = collection(db, "users", userId, "orders");
        const order = {
          ...orderData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          status: orderData.status || "pending",
        };

        const docRef = await addDoc(ordersRef, order);
        const orderDoc = doc(db, "users", userId, "orders", docRef.id);
        await updateDoc(orderDoc, { id: docRef.id });

        return {
          success: true,
          orderId: docRef.id,
          message: "Commande créée avec succès",
        };
      } catch (err) {
        const errorMessage = (err as Error).message;
        setError(errorMessage);
        console.error("Error creating order:", err);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const createDraftOrderForUser = useCallback(
    async (userId: string, orderData: Partial<Order>) => {
      setLoading(true);
      setError(null);
      try {
        const orderDataWithStatus = {
          ...orderData,
          status: "draft",
        };
        return await createOrderForUser(userId, orderDataWithStatus);
      } catch (err) {
        const errorMessage = (err as Error).message;
        setError(errorMessage);
        console.error("Error creating draft order:", err);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [createOrderForUser],
  );

  const completeOrder = useCallback(
    async (userId: string, orderId: string, paymentMethod: string) => {
      setLoading(true);
      setError(null);
      try {
        const orderDoc = doc(db, "users", userId, "orders", orderId);
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
      } catch (err) {
        const errorMessage = (err as Error).message;
        setError(errorMessage);
        console.error("Error completing order:", err);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const updateOrderPayment = useCallback(
    async (
      userId: string,
      orderId: string,
      paymentMethod: string,
      status = "pending",
    ) => {
      setLoading(true);
      setError(null);
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
      } catch (err) {
        const errorMessage = (err as Error).message;
        setError(errorMessage);
        console.error("Error updating order payment:", err);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  /**
   * 🔧 FONCTION CORRIGÉE - getOrderById
   * Utilise collectionGroup pour trouver la commande par ID
   */
  const getOrderById = useCallback(async (userId: string, orderId: string) => {
    setLoading(true);
    setError(null);
    try {
      console.log(
        `[getOrderById] Searching for order ${orderId} for user ${userId}`,
      );

      // Méthode 1: Recherche directe si on a l'userId
      if (userId && userId !== "" && userId !== "undefined") {
        const orderRef = doc(db, "users", userId, "orders", orderId);
        const orderSnap = await getDoc(orderRef);

        if (orderSnap.exists()) {
          const data = orderSnap.data();
          const mappedOrder = OrderMapper.mapOrderFields({
            ...data,
            id: orderId,
            userId,
          });

          console.log(`[getOrderById] Order found via direct search`);
          return { success: true, order: mappedOrder };
        }
      }

      // Méthode 2: Fallback avec collectionGroup
      console.log(
        `[getOrderById] Direct search failed, using collectionGroup fallback`,
      );
      const ordersQuery = query(collectionGroup(db, "orders"));
      const snapshot = await getDocs(ordersQuery);

      for (const docSnap of snapshot.docs) {
        if (docSnap.id === orderId) {
          const data = docSnap.data();
          const pathSegments = docSnap.ref.path.split("/");
          const foundUserId = pathSegments[1];

          const mappedOrder = OrderMapper.mapOrderFields({
            ...data,
            id: orderId,
            userId: foundUserId,
          });

          console.log(`[getOrderById] Order found via collectionGroup`);
          return { success: true, order: mappedOrder };
        }
      }

      console.error(`[getOrderById] Order ${orderId} not found`);
      return { success: false, error: "Commande non trouvée" };
    } catch (err) {
      const errorMessage = (err as Error).message;
      setError(errorMessage);
      console.error("[getOrderById] Error:", err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const getOrdersByUser = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const ordersRef = collection(db, "users", userId, "orders");
      const q = query(ordersRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);

      const ordersData: Order[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        const mappedOrder = OrderMapper.mapOrderFields({
          ...data,
          id: doc.id,
          userId,
        });
        ordersData.push(mappedOrder);
      });

      setOrders(ordersData); // Update local state for orders
      return { success: true, orders: ordersData };
    } catch (err) {
      const errorMessage = (err as Error).message;
      setError(errorMessage);
      console.error("Error getting user orders:", err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get all orders from user subcollections - Optimized version like orderService
   */
  const getAllUsersOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log(
        "[getAllUsersOrders] Loading all orders from user subcollections...",
      );

      let allOrders: Order[] = [];

      try {
        // TENTATIVE 1: Sans orderBy pour éviter l'erreur d'index
        const ordersQuery = query(collectionGroup(db, "orders"));
        const snapshot = await getDocs(ordersQuery);

        const orders = snapshot.docs.map((doc) => {
          const data = doc.data();
          // Extract userId from reference path
          const pathSegments = doc.ref.path.split("/");
          const userId = pathSegments[1]; // users/{userId}/orders/{orderId}

          return OrderMapper.mapOrderFields({
            ...data,
            id: doc.id,
            userId: userId,
          });
        });

        // Tri côté client par date de création (plus récent en premier)
        orders.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });

        allOrders = orders;
        console.log(`[getAllUsersOrders] ${allOrders.length} orders loaded`);
      } catch (indexError) {
        console.error(
          "[getAllUsersOrders] Error with collectionGroup:",
          indexError,
        );
        throw indexError;
      }

      // Enrichir avec les noms d'utilisateurs si possible
      if (allOrders.length > 0) {
        try {
          const usersRef = collection(db, "users");
          const usersSnapshot = await getDocs(usersRef);

          const usersMap = new Map<string, any>();
          usersSnapshot.forEach((userDoc) => {
            const userData = userDoc.data();
            usersMap.set(userDoc.id, {
              displayName:
                userData.displayName || userData.email || "Utilisateur inconnu",
              customerName:
                userData.displayName || userData.email || "Utilisateur inconnu",
              email: userData.email || "",
              phone: userData.phoneNumber || userData.phone || "",
            });
          });

          // Enrichir les commandes avec les informations utilisateurs
          allOrders.forEach((order) => {
            if (order.userId && usersMap.has(order.userId)) {
              const userInfo = usersMap.get(order.userId);
              (order as any).userName = userInfo.displayName;
              (order as any).customerName = userInfo.customerName;
              // Utiliser les infos utilisateur si pas déjà dans la commande
              if (!order.customerPhone && userInfo.phone) {
                (order as any).customerPhone = userInfo.phone;
              }
            }
          });

          console.log(
            `[getAllUsersOrders] Orders enriched with user information`,
          );
        } catch (enrichmentError) {
          console.warn(
            "Warning: Could not enrich orders with user information:",
            enrichmentError,
          );
        }
      }

      setOrders(allOrders);
      return { success: true, orders: allOrders };
    } catch (err) {
      const errorMessage = (err as Error).message;
      setError(errorMessage);
      console.error("Error getting all users' orders:", err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 🔧 FONCTION CORRIGÉE - getUserOrderById
   * Recherche optimisée par collectionGroup
   */
  const getUserOrderById = useCallback(async (orderId: string) => {
    setLoading(true);
    setError(null);
    try {
      console.log(`[getUserOrderById] Searching for order ${orderId} globally`);

      // Utiliser collectionGroup pour une recherche optimisée
      const ordersQuery = query(collectionGroup(db, "orders"));
      const snapshot = await getDocs(ordersQuery);

      // Chercher la commande avec l'ID spécifique
      for (const docSnap of snapshot.docs) {
        if (docSnap.id === orderId) {
          const data = docSnap.data();
          const pathSegments = docSnap.ref.path.split("/");
          const foundUserId = pathSegments[1]; // users/{userId}/orders/{orderId}

          const mappedOrder = OrderMapper.mapOrderFields({
            ...data,
            id: orderId,
            userId: foundUserId,
          });

          // Enrichir avec les infos utilisateur si possible
          try {
            const userRef = doc(db, "users", foundUserId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              const userData = userSnap.data();
              (mappedOrder as any).userName =
                userData.displayName || userData.email || "Utilisateur inconnu";
              (mappedOrder as any).customerName =
                userData.displayName || userData.email || "Utilisateur inconnu";
            }
          } catch (userError) {
            console.warn("Could not fetch user data:", userError);
          }

          console.log(
            `[getUserOrderById] Order ${orderId} found for user ${foundUserId}`,
          );
          return { success: true, order: mappedOrder };
        }
      }

      console.error(`[getUserOrderById] Order ${orderId} not found globally`);
      return {
        success: false,
        error: `La commande avec l'ID ${orderId} n'a pas été trouvée`,
      };
    } catch (err) {
      const errorMessage = (err as Error).message;
      setError(errorMessage);
      console.error("[getUserOrderById] Error:", err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 🔧 FONCTION CORRIGÉE - updateGlobalOrder
   * Utilise collectionGroup pour trouver et mettre à jour la commande
   */
  const updateGlobalOrder = useCallback(
    async (orderId: string, orderData: Partial<Order>) => {
      setLoading(true);
      setError(null);
      try {
        console.log(
          `[updateGlobalOrder] Searching for order ${orderId} to update`,
        );

        let orderDocRef = null;
        let foundUserId = null;

        // Utiliser collectionGroup pour trouver la commande
        const ordersQuery = query(collectionGroup(db, "orders"));
        const snapshot = await getDocs(ordersQuery);

        for (const docSnap of snapshot.docs) {
          if (docSnap.id === orderId) {
            const pathSegments = docSnap.ref.path.split("/");
            foundUserId = pathSegments[1]; // users/{userId}/orders/{orderId}
            orderDocRef = doc(db, "users", foundUserId, "orders", orderId);
            console.log(
              `[updateGlobalOrder] Order ${orderId} found for user ${foundUserId}`,
            );
            break;
          }
        }

        // Si pas trouvé via collectionGroup, essayer la collection principale
        if (!orderDocRef) {
          const mainOrderDocRef = doc(db, "orders", orderId);
          const mainOrderSnapshot = await getDoc(mainOrderDocRef);
          if (mainOrderSnapshot.exists()) {
            orderDocRef = mainOrderDocRef;
            console.log(
              `[updateGlobalOrder] Order ${orderId} found in main orders collection`,
            );
          }
        }

        if (!orderDocRef) {
          const errorMessage = `Commande avec l'ID ${orderId} non trouvée pour la mise à jour.`;
          setError(errorMessage);
          console.error(`[updateGlobalOrder] ${errorMessage}`);
          return { success: false, error: errorMessage };
        }

        // Préparer les données pour la mise à jour
        const dataToUpdate: any = {
          ...orderData,
          updatedAt: serverTimestamp(),
        };

        // Empêcher la mise à jour de createdAt
        if (dataToUpdate.createdAt instanceof Date) {
          delete dataToUpdate.createdAt;
        }

        // Effectuer la mise à jour
        await updateDoc(orderDocRef, dataToUpdate);
        console.log(
          `[updateGlobalOrder] Order ${orderId} updated successfully`,
        );

        // Mettre à jour l'état local
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId
              ? { ...order, ...orderData, updatedAt: new Date() }
              : order,
          ),
        );

        return { success: true, message: "Commande mise à jour avec succès." };
      } catch (err) {
        const errorMessage = (err as Error).message;
        setError(errorMessage);
        console.error("[updateGlobalOrder] Error:", err);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  /**
   * 🔧 FONCTION CORRIGÉE - updateOrderStatus
   * Utilise collectionGroup pour trouver la commande si userId pas fourni
   */
  const updateOrderStatus = useCallback(
    async (
      userId: string,
      orderId: string,
      newStatus: string,
      additionalData: any = {},
    ) => {
      setLoading(true);
      setError(null);
      try {
        console.log(
          `[updateOrderStatus] Updating order ${orderId} to status: ${newStatus}`,
        );

        let orderRef = null;
        let actualUserId = userId;

        // Si userId fourni, essayer directement
        if (userId && userId !== "" && userId !== "undefined") {
          orderRef = doc(db, "users", userId, "orders", orderId);
          const orderSnap = await getDoc(orderRef);

          if (!orderSnap.exists()) {
            console.warn(
              `[updateOrderStatus] Order not found with provided userId ${userId}, searching globally...`,
            );
            orderRef = null;
          }
        }

        // Si pas trouvé directement, utiliser collectionGroup
        if (!orderRef) {
          const ordersQuery = query(collectionGroup(db, "orders"));
          const snapshot = await getDocs(ordersQuery);

          for (const docSnap of snapshot.docs) {
            if (docSnap.id === orderId) {
              const pathSegments = docSnap.ref.path.split("/");
              actualUserId = pathSegments[1];
              orderRef = doc(db, "users", actualUserId, "orders", orderId);
              console.log(
                `[updateOrderStatus] Order ${orderId} found for user ${actualUserId}`,
              );
              break;
            }
          }
        }

        if (!orderRef) {
          const errorMessage = `Commande ${orderId} non trouvée`;
          console.error(`[updateOrderStatus] ${errorMessage}`);
          return { success: false, error: errorMessage };
        }

        // Préparer les données de mise à jour
        const updateData = {
          status: newStatus,
          updatedAt: serverTimestamp(),
          ...additionalData,
        };

        await updateDoc(orderRef, updateData);
        console.log(
          `[updateOrderStatus] Order status updated successfully to ${newStatus}`,
        );

        // Mettre à jour l'état local
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId
              ? {
                  ...order,
                  status: newStatus,
                  updatedAt: new Date(),
                  ...additionalData,
                }
              : order,
          ),
        );

        return { success: true };
      } catch (err) {
        const errorMessage = (err as Error).message;
        setError(errorMessage);
        console.error("[updateOrderStatus] Error:", err);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  /**
   * Mark an order as in-progress (driver started delivery) - Like orderService
   */
  const startDelivery = useCallback(
    async (userId: string, orderId: string) => {
      return updateOrderStatus(userId, orderId, "on-the-way", {
        startedAt: serverTimestamp(),
      });
    },
    [updateOrderStatus],
  );

  /**
   * Mark an order as delivered - Like orderService
   */
  const markOrderAsDelivered = useCallback(
    async (userId: string, orderId: string, deliveryData: any = {}) => {
      return updateOrderStatus(userId, orderId, "delivered", {
        deliveredAt: serverTimestamp(),
        ...deliveryData,
      });
    },
    [updateOrderStatus],
  );

  /**
   * Accept an order for delivery - Like orderService
   */
  const acceptOrder = useCallback(
    async (userId: string, orderId: string) => {
      return updateOrderStatus(userId, orderId, "confirmed", {
        acceptedAt: serverTimestamp(),
      });
    },
    [updateOrderStatus],
  );

  // ========================
  // 🔥 AJOUTER CETTE FONCTION AU HOOK useUsers
  // ========================

  /**
   * 🗑️ NOUVELLE FONCTION - deleteOrderById
   * Supprime une commande en utilisant collectionGroup pour la recherche
   */
  const deleteOrderById = useCallback(async (orderId: string) => {
    setLoading(true);
    setError(null);
    try {
      console.log(`[deleteOrderById] Searching for order ${orderId} to delete`);

      let orderDocRef = null;
      let foundUserId = null;

      // Utiliser collectionGroup pour trouver la commande
      const ordersQuery = query(collectionGroup(db, "orders"));
      const snapshot = await getDocs(ordersQuery);

      for (const docSnap of snapshot.docs) {
        if (docSnap.id === orderId) {
          const pathSegments = docSnap.ref.path.split("/");
          foundUserId = pathSegments[1]; // users/{userId}/orders/{orderId}
          orderDocRef = doc(db, "users", foundUserId, "orders", orderId);
          console.log(
            `[deleteOrderById] Order ${orderId} found for user ${foundUserId}`,
          );
          break;
        }
      }

      // Si pas trouvé via collectionGroup, essayer la collection principale
      if (!orderDocRef) {
        const mainOrderDocRef = doc(db, "orders", orderId);
        const mainOrderSnapshot = await getDoc(mainOrderDocRef);
        if (mainOrderSnapshot.exists()) {
          orderDocRef = mainOrderDocRef;
          console.log(
            `[deleteOrderById] Order ${orderId} found in main orders collection`,
          );
        }
      }

      if (!orderDocRef) {
        const errorMessage = `Commande avec l'ID ${orderId} non trouvée pour la suppression.`;
        setError(errorMessage);
        console.error(`[deleteOrderById] ${errorMessage}`);
        return { success: false, error: errorMessage };
      }

      // Effectuer la suppression
      await deleteDoc(orderDocRef);
      console.log(`[deleteOrderById] Order ${orderId} deleted successfully`);

      // Mettre à jour l'état local - supprimer de la liste
      setOrders((prevOrders) =>
        prevOrders.filter((order) => order.id !== orderId),
      );

      return { success: true, message: "Commande supprimée avec succès." };
    } catch (err) {
      const errorMessage = (err as Error).message;
      setError(errorMessage);
      console.error("[deleteOrderById] Error:", err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    users,
    orders,
    loading,
    error,
    addUser,
    getAllUsers,
    getUserByUid,
    getUserById,
    getUsersByRole,
    getUsersByRestaurant,
    updateUser,
    deleteUser,
    createOrderForUser,
    createDraftOrderForUser,
    completeOrder,
    updateOrderPayment,
    getOrderById, // ✅ CORRIGÉE - Recherche optimisée
    getOrdersByUser, // For fetching all orders of a specific user
    getAllUsersOrders, // ✅ FONCTIONNE - Optimized version
    getUserOrderById, // ✅ CORRIGÉE - Recherche globale optimisée
    updateGlobalOrder, // ✅ CORRIGÉE - Mise à jour optimisée
    updateOrderStatus, // ✅ CORRIGÉE - Like orderService
    startDelivery, // ✅ CORRIGÉE - Like orderService
    markOrderAsDelivered, // ✅ CORRIGÉE - Like orderService
    acceptOrder, // ✅ CORRIGÉE - Like orderService
    clearError,
    deleteOrderById,
  };
}
