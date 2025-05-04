/** @format */

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
// import { db } from "@/lib/firebase";
// import { Order, OrderStatus } from "@/types";

export function useOrders() {
  const queryClient = useQueryClient();

  const fetchOrders = async () => {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
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

  const createOrder = async (order: Omit<Order, "id" | "createdAt">) => {
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

  const fetchOrderStatistics = async () => {
    const statuses: Array<keyof typeof result> = [
      "confirmed",
      "cooking",
      "ready",
      "on_the_way",
    ];
    const result: {
      [key in "confirmed" | "cooking" | "ready" | "on_the_way"]: number;
    } = {
      confirmed: 0,
      cooking: 0,
      ready: 0,
      on_the_way: 0,
    };

    for (const status of statuses) {
      const q = query(collection(db, "orders"), where("status", "==", status));
      const snapshot = await getDocs(q);
      result[status] = snapshot.docs.length;
    }

    return result;
  };

  const fetchOrderSummary = async () => {
    const result = { delivered: 0, refunded: 0, scheduled: 0, all: 0 };

    const allSnapshot = await getDocs(collection(db, "orders"));
    result.all = allSnapshot.docs.length;

    const deliveredQuery = query(
      collection(db, "orders"),
      where("status", "==", "delivered"),
    );
    const deliveredSnapshot = await getDocs(deliveredQuery);
    result.delivered = deliveredSnapshot.docs.length;

    const refundedQuery = query(
      collection(db, "orders"),
      where("status", "==", "refunded"),
    );
    const refundedSnapshot = await getDocs(refundedQuery);
    result.refunded = refundedSnapshot.docs.length;

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

  const {
    data: statistics = { confirmed: 0, cooking: 0, ready: 0, on_the_way: 0 },
    isLoading: statsLoading,
  } = useQuery({
    queryKey: ["orderStatistics"],
    queryFn: fetchOrderStatistics,
  });

  const {
    data: summary = { delivered: 0, refunded: 0, scheduled: 0, all: 0 },
    isLoading: summaryLoading,
  } = useQuery({
    queryKey: ["orderSummary"],
    queryFn: fetchOrderSummary,
  });

  const createMutation = useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["orderStatistics"] });
      queryClient.invalidateQueries({ queryKey: ["orderSummary"] });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: updateOrderStatus,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", data.id] });
      queryClient.invalidateQueries({ queryKey: ["orderStatistics"] });
      queryClient.invalidateQueries({ queryKey: ["orderSummary"] });
    },
  });

  return {
    orders,
    isLoading,
    error,
    getOrder: orderByIdQuery,
    statistics,
    statsLoading,
    summary,
    summaryLoading,
    createOrder: createMutation.mutate,
    updateOrderStatus: updateStatusMutation.mutate,
    createOrderLoading: createMutation.isPending,
    updateStatusLoading: updateStatusMutation.isPending,
  };
}
