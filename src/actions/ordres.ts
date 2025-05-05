/** @format */
"use server";
export type DateFilterType = "today" | "week" | "month" | "year" | "all";
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
import { revalidatePath } from "next/cache";

// Génère un numéro de commande unique basé sur la date et un nombre aléatoire
function generateOrderNumber() {
  const prefix = "10";
  const timestamp = Date.now().toString().slice(-4);
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `${prefix}${timestamp}${random}`;
}

// CREATE: Add a new order
export async function addOrder(data: any) {
  try {
    // Générer un numéro de commande unique
    const orderNumber = generateOrderNumber();

    // Préparer l'objet de commande en se basant sur le type Order
    const newOrder = {
      orderNumber,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerEmail: data.customerEmail || null,
      customerAddress: data.customerAddress || null,
      items: data.items.map((item: any) => ({
        id: item.id,
        foodId: item.foodId || "", // ID du plat
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        variations: item.variations || [],
        addons: item.addons || [],
        subtotal: item.subtotal, // Utiliser subtotal au lieu de totalPrice pour correspondre à l'interface
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
    };

    // Enregistrer la commande dans Firebase en utilisant l'API modulaire
    const ordersRef = collection(db, "orders");
    const docRef = await addDoc(ordersRef, newOrder);

    // Mettre à jour l'ID avec l'ID généré par Firebase
    const orderDoc = doc(db, "orders", docRef.id);
    await updateDoc(orderDoc, { id: docRef.id });

    // Revalider le chemin pour afficher les dernières données
    revalidatePath("/orders");

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

// READ: Get all orders
export async function getAllOrders() {
  try {
    const orderRef = collection(db, "orders");
    const q = query(orderRef, orderBy("orderDate", "desc"));
    const querySnapshot = await getDocs(q);

    const orders: Order[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();

      // Convertir les Timestamps en chaînes ISO
      const orderDate = data.orderDate
        ? data.orderDate.toDate().toISOString()
        : null;
      const deliveryDate = data.deliveryDate
        ? data.deliveryDate.toDate().toISOString()
        : null;

      orders.push({
        id: doc.id,
        ...data,
        orderDate,
        deliveryDate,
      } as Order);
    });

    return { success: true, orders };
  } catch (error) {
    console.error("Error getting orders:", error);
    return { success: false, error: (error as Error).message };
  }
}

// READ: Get a single order by ID
export async function getOrderById(id: string) {
  try {
    const orderRef = doc(db, "orders", id);
    const docSnap = await getDoc(orderRef);

    if (docSnap.exists()) {
      const data = docSnap.data();

      // Convertir les Timestamps en chaînes ISO
      const orderDate = data.orderDate
        ? data.orderDate.toDate().toISOString()
        : null;
      const deliveryDate = data.deliveryDate
        ? data.deliveryDate.toDate().toISOString()
        : null;

      return {
        success: true,
        order: {
          id: docSnap.id,
          ...data,
          orderDate,
          deliveryDate,
        } as Order,
      };
    } else {
      return { success: false, error: "Order not found" };
    }
  } catch (error) {
    console.error("Error getting order:", error);
    return { success: false, error: (error as Error).message };
  }
}

// READ: Get orders by restaurant ID
export async function getOrdersByRestaurant(restaurantId: string) {
  try {
    const orderRef = collection(db, "orders");
    const q = query(
      orderRef,
      where("restaurantId", "==", restaurantId),
      orderBy("orderDate", "desc"),
    );
    const querySnapshot = await getDocs(q);

    const orders: Order[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();

      // Convertir les Timestamps en chaînes ISO
      const orderDate = data.orderDate
        ? data.orderDate.toDate().toISOString()
        : null;
      const deliveryDate = data.deliveryDate
        ? data.deliveryDate.toDate().toISOString()
        : null;

      orders.push({
        id: doc.id,
        ...data,
        orderDate,
        deliveryDate,
      } as Order);
    });

    return { success: true, orders };
  } catch (error) {
    console.error("Error getting restaurant orders:", error);
    return { success: false, error: (error as Error).message };
  }
}

// READ: Get recent orders
export async function getRecentOrders(
  restaurantId: string,
  limitCount: number = 5,
) {
  try {
    const orderRef = collection(db, "orders");
    const q = query(
      orderRef,
      where("restaurantId", "==", restaurantId),
      orderBy("orderDate", "desc"),
      limit(limitCount),
    );
    const querySnapshot = await getDocs(q);

    const orders: Order[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();

      // Convertir les Timestamps en chaînes ISO
      const orderDate = data.orderDate
        ? data.orderDate.toDate().toISOString()
        : null;
      const deliveryDate = data.deliveryDate
        ? data.deliveryDate.toDate().toISOString()
        : null;

      orders.push({
        id: doc.id,
        ...data,
        orderDate,
        deliveryDate,
      } as Order);
    });

    return { success: true, orders };
  } catch (error) {
    console.error("Error getting recent orders:", error);
    return { success: false, error: (error as Error).message };
  }
}

// READ: Get orders by status
export async function getOrdersByStatus(
  restaurantId: string,
  status: OrderStatus,
) {
  try {
    const orderRef = collection(db, "orders");
    const q = query(
      orderRef,
      where("restaurantId", "==", restaurantId),
      where("orderStatus", "==", status),
      orderBy("orderDate", "desc"),
    );
    const querySnapshot = await getDocs(q);

    const orders: Order[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();

      // Convertir les Timestamps en chaînes ISO
      const orderDate = data.orderDate
        ? data.orderDate.toDate().toISOString()
        : null;
      const deliveryDate = data.deliveryDate
        ? data.deliveryDate.toDate().toISOString()
        : null;

      orders.push({
        id: doc.id,
        ...data,
        orderDate,
        deliveryDate,
      } as Order);
    });

    return { success: true, orders };
  } catch (error) {
    console.error("Error getting orders by status:", error);
    return { success: false, error: (error as Error).message };
  }
}

// UPDATE: Update an order
export async function updateOrder(id: string, data: Partial<Order>) {
  try {
    // Si orderDate est présent et c'est une chaîne, convertir en Date
    const updatedData = { ...data };
    if (typeof updatedData.orderDate === "string") {
      updatedData.orderDate = new Date(updatedData.orderDate);
    }
    if (typeof updatedData.deliveryDate === "string") {
      updatedData.deliveryDate = new Date(updatedData.deliveryDate);
    }

    const orderRef = doc(db, "orders", id);
    await updateDoc(orderRef, updatedData);

    return { success: true };
  } catch (error) {
    console.error("Error updating order:", error);
    return { success: false, error: (error as Error).message };
  }
}

// UPDATE: Update order status
export async function updateOrderStatus(id: string, status: OrderStatus) {
  try {
    const orderRef = doc(db, "orders", id);
    await updateDoc(orderRef, { orderStatus: status });

    return { success: true };
  } catch (error) {
    console.error("Error updating order status:", error);
    return { success: false, error: (error as Error).message };
  }
}

// DELETE: Delete an order
export async function deleteOrder(id: string) {
  try {
    const orderRef = doc(db, "orders", id);
    await deleteDoc(orderRef);

    return { success: true };
  } catch (error) {
    console.error("Error deleting order:", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Obtient les statistiques des commandes filtrées par statut
 * @param orderStatus Statut de commande à filtrer (optionnel)
 */
export async function getOrderStatistics(
  orderStatus?: OrderStatus,
): Promise<{ success: boolean; statistics?: OrderStatistics; error?: string }> {
  try {
    // Initialiser l'objet de statistiques
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

    // Récupérer les commandes
    const ordersRef = collection(db, "orders");
    let ordersQuery;

    if (orderStatus) {
      // Filtrer par statut spécifique
      ordersQuery = query(ordersRef, where("orderStatus", "==", orderStatus));
    } else {
      // Récupérer toutes les commandes
      ordersQuery = query(ordersRef);
    }

    const ordersSnapshot = await getDocs(ordersQuery);
    result.total = ordersSnapshot.docs.length; // Définir le nombre total

    // Compter chaque commande par statut
    ordersSnapshot.forEach((doc) => {
      const data = doc.data();

      // Compter par statut de commande
      const status = data.orderStatus;
      if (status && status in result) {
        result[status as keyof OrderStatistics]++;
      }

      // Compter les commandes planifiées
      if (data.isScheduled === true) {
        result.scheduled++;
      }
    });

    return { success: true, statistics: result };
  } catch (error) {
    console.error("Error getting order statistics:", error);
    return { success: false, error: (error as Error).message };
  }
}
