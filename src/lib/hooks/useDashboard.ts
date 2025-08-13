/** @format */
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  getAllUsersOrders,
  getOrdersByUser,
  getOrderStatistics,
  OrderStatistics,
} from "@/actions/user";
import { getPopularFoods } from "@/actions/food";
import { TrendingFood, Order, User } from "@/lib/types";

// Types pour les hooks
export interface OrderStats {
  totalRevenue: number;
  averageOrderValue: number;
  totalOrders: number;
  pending: number;
  processing: number;
  delivered: number;
  cancelled: number;
  total: number;
}

export interface FetchOrdersOptions {
  startDate?: Date;
  endDate?: Date;
  limitCount?: number;
  userId?: string;
}

// Hook pour les statistiques des commandes
export const useOrderStats = (userId?: string) => {
  const [orderStats, setOrderStats] = useState<OrderStats>({
    totalRevenue: 0,
    averageOrderValue: 0,
    totalOrders: 0,
    pending: 0,
    processing: 0,
    delivered: 0,
    cancelled: 0,
    total: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchStats = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Récupérer les statistiques globales
      const statsResult = await getOrderStatistics();

      if (statsResult.success && statsResult.statistics) {
        const stats = statsResult.statistics;

        // Récupérer les commandes pour calculer les revenus
        let orders: Order[] = [];
        if (userId && userId !== "all") {
          const ordersResult = await getOrdersByUser(userId);
          if (ordersResult.success && ordersResult.orders) {
            orders = ordersResult.orders;
          }
        } else {
          const allOrdersResult = await getAllUsersOrders();
          if (allOrdersResult.success && allOrdersResult.orders) {
            orders = allOrdersResult.orders;
          }
        }

        // Calculer les statistiques de revenus
        const totalOrders = orders.length;
        const totalRevenue = orders.reduce(
          (sum, order) => sum + parseFloat(order.total?.toString() || "0"),
          0,
        );
        const averageOrderValue =
          totalOrders > 0 ? totalRevenue / totalOrders : 0;

        setOrderStats({
          totalRevenue,
          averageOrderValue,
          totalOrders,
          pending: stats.pending,
          processing: stats.processing,
          delivered: stats.delivered,
          cancelled: stats.cancelled,
          total: stats.total,
        });

        toast({
          title: "Statistiques chargées",
          description: "Les statistiques de commandes ont été mises à jour",
          variant: "default",
        });
      } else {
        throw new Error(
          statsResult.error || "Impossible de charger les statistiques",
        );
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur inconnue";
      setError(errorMessage);
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [userId]);

  return {
    orderStats,
    isLoading,
    error,
    refetch: fetchStats,
  };
};

// Hook pour les commandes
export const useOrders = (options: FetchOrdersOptions = {}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { startDate, endDate, limitCount, userId } = options;
      let fetchedOrders: Order[] = [];

      // Récupérer les commandes selon les options
      if (userId && userId !== "all") {
        const result = await getOrdersByUser(userId);
        if (result.success && result.orders) {
          fetchedOrders = result.orders;
        }
      } else {
        const result = await getAllUsersOrders();
        if (result.success && result.orders) {
          fetchedOrders = result.orders;
        }
      }

      // Filtrer par date si nécessaire
      if (startDate || endDate) {
        fetchedOrders = fetchedOrders.filter((order) => {
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
      fetchedOrders.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });

      // Limiter le nombre de résultats si demandé
      if (limitCount && limitCount > 0) {
        fetchedOrders = fetchedOrders.slice(0, limitCount);
      }

      setOrders(fetchedOrders);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erreur lors du chargement des commandes";
      setError(errorMessage);
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [options.userId, options.startDate, options.endDate, options.limitCount]);

  return {
    orders,
    isLoading,
    error,
    refetch: fetchOrders,
  };
};

// Hook pour les plats populaires
export const usePopularFoods = () => {
  const [popularFoods, setPopularFoods] = useState<TrendingFood[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPopularFoods = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getPopularFoods();

      if (result.success && result.trindingfoods) {
        setPopularFoods(result.trindingfoods);
        toast({
          title: "Plats populaires chargés",
          description: "Les plats tendance ont été chargés avec succès",
          variant: "default",
        });
      } else {
        throw new Error(
          result.error || "Impossible de charger les plats populaires",
        );
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erreur lors du chargement des plats populaires";
      setError(errorMessage);
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPopularFoods();
  }, []);

  return {
    popularFoods,
    isLoading,
    error,
    refetch: fetchPopularFoods,
  };
};

// Hook combiné pour le dashboard
export const useDashboard = (selectedUserId: string = "all") => {
  const orderStatsHook = useOrderStats(selectedUserId);
  const popularFoodsHook = usePopularFoods();

  // Options pour les commandes des 30 derniers jours
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const ordersHook = useOrders({
    startDate: thirtyDaysAgo,
    userId: selectedUserId !== "all" ? selectedUserId : undefined,
  });

  const isLoading =
    orderStatsHook.isLoading ||
    popularFoodsHook.isLoading ||
    ordersHook.isLoading;
  const hasError =
    orderStatsHook.error || popularFoodsHook.error || ordersHook.error;

  const refetchAll = () => {
    orderStatsHook.refetch();
    popularFoodsHook.refetch();
    ordersHook.refetch();
  };

  return {
    // Données
    orderStats: orderStatsHook.orderStats,
    popularFoods: popularFoodsHook.popularFoods,
    orders: ordersHook.orders,

    // États de chargement
    isLoading,
    statsLoading: orderStatsHook.isLoading,
    foodsLoading: popularFoodsHook.isLoading,
    ordersLoading: ordersHook.isLoading,

    // Erreurs
    error: hasError,
    statsError: orderStatsHook.error,
    foodsError: popularFoodsHook.error,
    ordersError: ordersHook.error,

    // Actions
    refetch: refetchAll,
    refetchStats: orderStatsHook.refetch,
    refetchFoods: popularFoodsHook.refetch,
    refetchOrders: ordersHook.refetch,
  };
};
