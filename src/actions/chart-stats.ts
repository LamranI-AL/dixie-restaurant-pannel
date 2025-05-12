/** @format */

import { getAllUsersOrders, getOrdersByUser } from "./user";

// Types
export interface Order {
  id?: string;
  userId?: string;
  userName?: string;
  total: number;
  createdAt: Date | null;
  updatedAt?: Date | null;
  orderConfirmedAt?: Date | null;
  paymentConfirmedAt?: Date | null;
  status?: string;
  items?: any[];
  [key: string]: any;
}

export interface User {
  id: string;
  displayName?: string;
  email?: string;
  [key: string]: any;
}

export interface OrderStats {
  totalRevenue: number;
  averageOrderValue: number;
  totalOrders: number;
  [key: string]: number;
}

export interface FetchOrdersOptions {
  startDate?: Date;
  endDate?: Date;
  limitCount?: number;
  userId?: string;
  [key: string]: any;
}

interface OrderResponse {
  success: boolean;
  orders?: Order[];
  error?: string;
}

interface UserResponse {
  success: boolean;
  users?: User[];
  error?: string;
}
export const fetchOrdersFromFirebase = async (
  options: FetchOrdersOptions = {},
): Promise<Order[]> => {
  try {
    const { startDate, endDate, limitCount, userId } = options;

    let orders: Order[] = [];

    // Si un userId est spécifié, on récupère uniquement les commandes de cet utilisateur
    if (userId) {
      const result = await getOrdersByUser(userId);
      if (result.success && result.orders) {
        orders = result.orders;
      }
    } else {
      // Sinon, on récupère toutes les commandes de tous les utilisateurs
      const result = await getAllUsersOrders();
      if (result.success && result.orders) {
        orders = result.orders;
      }
    }

    // Filtrer par date si nécessaire
    if (startDate || endDate) {
      orders = orders.filter((order) => {
        if (!order.createdAt) return false;

        const orderDate =
          order.createdAt instanceof Date
            ? order.createdAt
            : new Date(order.createdAt);

        if (startDate && orderDate < startDate) return false;
        if (endDate && orderDate > endDate) return false;

        return true;
      });
    }

    // Trier par date (la plus récente en premier)
    orders.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    // Limiter le nombre de résultats si demandé
    if (limitCount && limitCount > 0) {
      orders = orders.slice(0, limitCount);
    }

    // Convertir les commandes au format attendu par le composant du graphique
    return orders.map((order) => ({
      id: order.id,
      userId: order.userId,
      userName: order.userName,
      createdAt:
        order.createdAt instanceof Date
          ? order.createdAt.toISOString()
          : (order.createdAt as any),
      total: parseFloat(order.total.toString()),
      status: order.status,
      // Autres champs nécessaires
    }));
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des commandes depuis Firebase:",
      error,
    );
    return [];
  }
};

/**
 * Calcule des statistiques sur les commandes pour le dashboard
 */
export const calculateOrderStats = (orders: Order[]): OrderStats => {
  if (!orders || orders.length === 0) {
    return {
      totalRevenue: 0,
      averageOrderValue: 0,
      totalOrders: 0,
    };
  }

  const totalOrders = orders.length;
  const totalRevenue = orders.reduce(
    (sum, order) => sum + parseFloat(order.total?.toString() || "0"),
    0,
  );
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return {
    totalRevenue,
    averageOrderValue,
    totalOrders,
  };
};
