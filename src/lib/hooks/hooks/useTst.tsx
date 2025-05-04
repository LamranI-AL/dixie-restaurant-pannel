/** @format */
"use client"; // Add this to ensure it's a client component

import { db } from "@/lib/firebase/config";
import { Order, OrderStatus } from "@/lib/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  query,
  where,
  orderBy,
  addDoc,
} from "firebase/firestore";

// Define the OrderStatistics interface
export interface OrderStatistics {
  confirmed: number;
  cooking: number;
  ready: number;
  on_the_way: number;
  delivered: number;
  refunded: number;
  scheduled: number;
  total: number;
}

export function useOrders() {
  const queryClient = useQueryClient();

  const fetchOrders = async () => {
    const q = query(collection(db, "orders"), orderBy("creatAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Order[];
  };

  const fetchOrder = async (id: string) => {
    const docRef = doc(db, "orders", id);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) {
      throw new Error("Order not found");
    }
    return { id: snapshot.id, ...snapshot.data() } as Order;
  };

  const createOrder = async (order: Omit<Order, "id" | "creatAt">) => {
    const orderWithTimestamp = {
      ...order,
      createdAt: new Date().toISOString(),
    };
    const docRef = await addDoc(collection(db, "orders"), orderWithTimestamp);
    return { id: docRef.id, ...orderWithTimestamp } as Order;
  };

  const updateOrderStatus = async ({
    id,
    status,
    notes,
  }: {
    id: string;
    status: OrderStatus;
    notes?: string;
  }) => {
    const updates: { status: OrderStatus; notes?: string; updatedAt: string } =
      {
        status,
        updatedAt: new Date().toISOString(),
      };

    if (notes) {
      updates.notes = notes;
    }

    await updateDoc(doc(db, "orders", id), updates);

    return { id, status };
  };

  // Merged statistics function that returns data in the required format
  const fetchOrderStatistics = async (): Promise<OrderStatistics> => {
    // Initialize the result object according to the interface
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

    // Get all orders to determine total
    const allSnapshot = await getDocs(collection(db, "orders"));
    result.total = allSnapshot.docs.length;

    // Fetch counts for status-based statistics
    const statuses = [
      "confirmed",
      "cooking",
      "ready",
      "on_the_way",
      "delivered",
      "refunded",
      "total",
    ];
    for (const status of statuses) {
      const statusQuery = query(
        collection(db, "orders"),
        where("orderStatus", "==", status),
      );
      const statusSnapshot = await getDocs(statusQuery);
      result[status as keyof OrderStatistics] = statusSnapshot.docs.length;
    }

    // Fetch scheduled orders
    const scheduledQuery = query(
      collection(db, "orders"),
      where("isScheduled", "==", true),
    );
    const scheduledSnapshot = await getDocs(scheduledQuery);
    result.scheduled = scheduledSnapshot.docs.length;

    return result;
  };

  const {
    data: orders = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["orders"],
    queryFn: fetchOrders,
  });

  const getOrderQuery = (id: string) => ({
    queryKey: ["order", id],
    queryFn: () => fetchOrder(id),
  });

  const orderByIdQuery = (id: string) => useQuery(getOrderQuery(id));

  // Single combined statistics query
  const {
    data: statistics = {
      confirmed: 0,
      cooking: 0,
      ready: 0,
      on_the_way: 0,
      delivered: 0,
      refunded: 0,
      scheduled: 0,
      total: 0,
    },
    isLoading: statsLoading,
  } = useQuery<OrderStatistics>({
    queryKey: ["orderStatistics"],
    queryFn: fetchOrderStatistics,
  });

  const createMutation = useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["orderStatistics"] });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: updateOrderStatus,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", data.id] });
      queryClient.invalidateQueries({ queryKey: ["orderStatistics"] });
    },
  });

  return {
    orders,
    isLoading,
    error,
    getOrder: orderByIdQuery,
    statistics, // Now fully matched to OrderStatistics interface
    statsLoading,
    createOrder: createMutation.mutate,
    updateOrderStatus: updateStatusMutation.mutate,
    createOrderLoading: createMutation.isPending,
    updateStatusLoading: updateStatusMutation.isPending,
  };
}
