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
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Order, OrderStatistics, OrderStatus } from "@/lib/types";

interface UseOrdersReturn {
  orders: Order[];
  loading: boolean;
  error: string | null;
  addOrder: (
    data: any,
  ) => Promise<{ success: boolean; orderId?: string; error?: string }>;
  getAllOrders: () => Promise<void>;
  getOrderById: (
    id: string,
  ) => Promise<{ success: boolean; order?: Order; error?: string }>;
  getOrdersByRestaurant: (
    restaurantId: string,
  ) => Promise<{ success: boolean; orders?: Order[]; error?: string }>;
  getRecentOrders: (
    restaurantId: string,
    limitCount?: number,
  ) => Promise<{ success: boolean; orders?: Order[]; error?: string }>;
  getOrdersByStatus: (
    restaurantId: string,
    status: OrderStatus,
  ) => Promise<{ success: boolean; orders?: Order[]; error?: string }>;
  updateOrder: (
    id: string,
    data: Partial<Order>,
  ) => Promise<{ success: boolean; error?: string }>;
  updateOrderStatus: (
    id: string,
    status: OrderStatus,
  ) => Promise<{ success: boolean; error?: string }>;
  deleteOrder: (id: string) => Promise<{ success: boolean; error?: string }>;
  getOrderStatistics: (orderStatus?: OrderStatus) => Promise<{
    success: boolean;
    statistics?: OrderStatistics;
    error?: string;
  }>;
  clearError: () => void;
}

// Génère un numéro de commande unique
function generateOrderNumber() {
  const prefix = "10";
  const timestamp = Date.now().toString().slice(-4);
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `${prefix}${timestamp}${random}`;
}

// Fonction pour sérialiser les timestamps Firebase
function serializeOrderData(data: any) {
  const serialized = { ...data };

  if (
    serialized.orderDate &&
    typeof serialized.orderDate.toDate === "function"
  ) {
    serialized.orderDate = serialized.orderDate.toDate().toISOString();
  }

  if (
    serialized.deliveryDate &&
    typeof serialized.deliveryDate.toDate === "function"
  ) {
    serialized.deliveryDate = serialized.deliveryDate.toDate().toISOString();
  }

  if (
    serialized.createdAt &&
    typeof serialized.createdAt.toDate === "function"
  ) {
    serialized.createdAt = serialized.createdAt.toDate().toISOString();
  }

  if (
    serialized.updatedAt &&
    typeof serialized.updatedAt.toDate === "function"
  ) {
    serialized.updatedAt = serialized.updatedAt.toDate().toISOString();
  }

  return serialized;
}

export function useOrders(): UseOrdersReturn {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const addOrder = useCallback(async (data: any) => {
    try {
      setLoading(true);
      setError(null);

      const orderNumber = generateOrderNumber();

      const newOrder = {
        orderNumber,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerEmail: data.customerEmail || null,
        customerAddress: data.customerAddress || null,
        items: data.items.map((item: any) => ({
          id: item.id,
          foodId: item.foodId || "",
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          variations: item.variations || [],
          addons: item.addons || [],
          subtotal: item.subtotal,
        })),
        subtotal: data.subtotal,
        OrderStatus:
          data.OrderStatus ||
          (data.orderType === "delivery"
            ? "Livraison"
            : data.orderType === "pickup"
              ? "À emporter"
              : "Sur place"),
        tax: data.tax,
        deliveryFee: data.deliveryFee,
        packagingFee: data.packagingFee,
        discount: data.discount || 0,
        total: data.total,
        paymentStatus: data.paymentStatus || "unpaid",
        paymentMethod: data.paymentMethod,
        orderStatus: data.orderStatus || "confirmed",
        orderDate: new Date(),
        restaurantId: data.restaurantId,
        notes: data.notes || null,
        userId: data.userId || "",
        deliveryLocation: data.deliveryLocation || null,
        deliveryOption: data.deliveryOption || "",
        status: data.status || "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
        orderConfirmedAt: new Date(),
        paymentConfirmedAt: data.paymentStatus === "paid" ? new Date() : null,
      };

      const ordersRef = collection(db, "orders");
      const docRef = await addDoc(ordersRef, newOrder);

      await updateDoc(doc(db, "orders", docRef.id), { id: docRef.id });

      // Mettre à jour la liste locale
      const addedOrder = { id: docRef.id, ...newOrder } as Order;
      setOrders((prev) => [addedOrder, ...prev]);

      return {
        success: true,
        orderId: docRef.id,
      };
    } catch (err) {
      const errorMessage = (err as Error).message;
      setError(errorMessage);
      console.error("Error adding order:", err);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const getAllOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const orderRef = collection(db, "orders");
      const q = query(orderRef, orderBy("orderDate", "desc"));
      const querySnapshot = await getDocs(q);

      const ordersData: Order[] = [];
      querySnapshot.forEach((doc) => {
        const data = serializeOrderData(doc.data());
        ordersData.push({
          id: doc.id,
          ...data,
        } as Order);
      });

      setOrders(ordersData);
    } catch (err) {
      const errorMessage = (err as Error).message;
      setError(errorMessage);
      console.error("Error getting orders:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getOrderById = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const orderRef = doc(db, "orders", id);
      const docSnap = await getDoc(orderRef);

      if (docSnap.exists()) {
        const data = serializeOrderData(docSnap.data());
        return {
          success: true,
          order: {
            id: docSnap.id,
            ...data,
          } as Order,
        };
      } else {
        return { success: false, error: "Order not found" };
      }
    } catch (err) {
      const errorMessage = (err as Error).message;
      setError(errorMessage);
      console.error("Error getting order:", err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const getOrdersByRestaurant = useCallback(async (restaurantId: string) => {
    try {
      setLoading(true);
      setError(null);

      const orderRef = collection(db, "orders");
      const q = query(
        orderRef,
        where("restaurantId", "==", restaurantId),
        orderBy("orderDate", "desc"),
      );
      const querySnapshot = await getDocs(q);

      const ordersData: Order[] = [];
      querySnapshot.forEach((doc) => {
        const data = serializeOrderData(doc.data());
        ordersData.push({
          id: doc.id,
          ...data,
        } as Order);
      });

      return { success: true, orders: ordersData };
    } catch (err) {
      const errorMessage = (err as Error).message;
      setError(errorMessage);
      console.error("Error getting restaurant orders:", err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const getRecentOrders = useCallback(
    async (restaurantId: string, limitCount: number = 5) => {
      try {
        setLoading(true);
        setError(null);

        const orderRef = collection(db, "orders");
        const q = query(
          orderRef,
          where("restaurantId", "==", restaurantId),
          orderBy("orderDate", "desc"),
          limit(limitCount),
        );
        const querySnapshot = await getDocs(q);

        const ordersData: Order[] = [];
        querySnapshot.forEach((doc) => {
          const data = serializeOrderData(doc.data());
          ordersData.push({
            id: doc.id,
            ...data,
          } as Order);
        });

        return { success: true, orders: ordersData };
      } catch (err) {
        const errorMessage = (err as Error).message;
        setError(errorMessage);
        console.error("Error getting recent orders:", err);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const getOrdersByStatus = useCallback(
    async (restaurantId: string, status: OrderStatus) => {
      try {
        setLoading(true);
        setError(null);

        const orderRef = collection(db, "orders");
        const q = query(
          orderRef,
          where("restaurantId", "==", restaurantId),
          where("orderStatus", "==", status),
          orderBy("orderDate", "desc"),
        );
        const querySnapshot = await getDocs(q);

        const ordersData: Order[] = [];
        querySnapshot.forEach((doc) => {
          const data = serializeOrderData(doc.data());
          ordersData.push({
            id: doc.id,
            ...data,
          } as Order);
        });

        return { success: true, orders: ordersData };
      } catch (err) {
        const errorMessage = (err as Error).message;
        setError(errorMessage);
        console.error("Error getting orders by status:", err);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const updateOrder = useCallback(async (id: string, data: Partial<Order>) => {
    try {
      setLoading(true);
      setError(null);

      const updatedData = { ...data };
      if (typeof updatedData.orderDate === "string") {
        updatedData.orderDate = new Date(updatedData.orderDate);
      }
      if (typeof updatedData.deliveryDate === "string") {
        updatedData.deliveryDate = new Date(updatedData.deliveryDate);
      }
      updatedData.updatedAt = new Date();

      const orderRef = doc(db, "orders", id);
      await updateDoc(orderRef, updatedData);

      // Mettre à jour la liste locale
      setOrders((prev) =>
        prev.map((order) =>
          order.id === id
            ? { ...order, ...data, updatedAt: new Date() }
            : order,
        ),
      );

      return { success: true };
    } catch (err) {
      const errorMessage = (err as Error).message;
      setError(errorMessage);
      console.error("Error updating order:", err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateOrderStatus = useCallback(
    async (id: string, status: OrderStatus) => {
      try {
        setLoading(true);
        setError(null);

        const orderRef = doc(db, "orders", id);
        await updateDoc(orderRef, {
          orderStatus: status,
          updatedAt: new Date(),
        });

        // Mettre à jour la liste locale
        setOrders((prev) =>
          prev.map((order) =>
            order.id === id
              ? { ...order, orderStatus: status, updatedAt: new Date() }
              : order,
          ),
        );

        return { success: true };
      } catch (err) {
        const errorMessage = (err as Error).message;
        setError(errorMessage);
        console.error("Error updating order status:", err);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const deleteOrder = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const orderRef = doc(db, "orders", id);
      await deleteDoc(orderRef);

      // Mettre à jour la liste locale
      setOrders((prev) => prev.filter((order) => order.id !== id));

      return { success: true };
    } catch (err) {
      const errorMessage = (err as Error).message;
      setError(errorMessage);
      console.error("Error deleting order:", err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const getOrderStatistics = useCallback(async (orderStatus?: OrderStatus) => {
    try {
      setLoading(true);
      setError(null);

      const result: OrderStatistics = {
        confirmed: 0,
        cooking: 0,
        ready: 0,
        on_the_way: 0,
        delivered: 0,
        refunded: 0,
        scheduled: 0,
        total: 0,
      };

      const ordersRef = collection(db, "orders");
      let ordersQuery;

      if (orderStatus) {
        ordersQuery = query(ordersRef, where("orderStatus", "==", orderStatus));
      } else {
        ordersQuery = query(ordersRef);
      }

      const ordersSnapshot = await getDocs(ordersQuery);
      result.total = ordersSnapshot.docs.length;

      ordersSnapshot.forEach((doc) => {
        const data = doc.data();
        const status = data.orderStatus;
        if (status && status in result) {
          result[status as keyof OrderStatistics]++;
        }
        if (data.isScheduled === true) {
          result.scheduled++;
        }
      });

      return { success: true, statistics: result };
    } catch (err) {
      const errorMessage = (err as Error).message;
      setError(errorMessage);
      console.error("Error getting order statistics:", err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    orders,
    loading,
    error,
    addOrder,
    getAllOrders,
    getOrderById,
    getOrdersByRestaurant,
    getRecentOrders,
    getOrdersByStatus,
    updateOrder,
    updateOrderStatus,
    deleteOrder,
    getOrderStatistics,
    clearError,
  };
}
