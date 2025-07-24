/** @format */

"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Users,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  Package,
  Truck,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  Filter,
  RefreshCw,
  Pizza,
  User,
  MapPin,
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  TrendingDown,
} from "lucide-react";
import { toast } from "sonner";
import { useUsers } from "@/lib/hooks/useUserOrders";
import { useFoods } from "@/lib/hooks/useFoods";
import { useDeliverymen } from "@/lib/hooks/useDeliverymen";
import { formatDate } from "@/utils/format-date";

// Couleurs pour les graphiques
const CHART_COLORS = {
  primary: "#3b82f6",
  secondary: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  info: "#06b6d4",
  purple: "#8b5cf6",
  pink: "#ec4899",
  gray: "#6b7280",
};

const PIE_COLORS = [
  CHART_COLORS.primary,
  CHART_COLORS.secondary,
  CHART_COLORS.warning,
  CHART_COLORS.danger,
  CHART_COLORS.info,
  CHART_COLORS.purple,
];

// Types pour les filtres
type DateFilter = "today" | "week" | "month" | "quarter" | "year" | "all";
type MetricType = "Orders" | "Revenue" | "Cients" | "Plats";

export default function ProfessionalDashboard() {
  const [dateFilter, setDateFilter] = useState<DateFilter>("week");
  const [selectedMetric, setSelectedMetric] = useState<MetricType>("Orders");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Hooks pour récupérer les données
  const {
    users,
    orders,
    loading: usersLoading,
    error: usersError,
    getAllUsers,
    getAllUsersOrders,
    clearError: clearUsersError,
  } = useUsers();

  const {
    foods,
    trendingFoods,
    loading: foodsLoading,
    error: foodsError,
    getAllFoods,
    getPopularFoods,
    clearError: clearFoodsError,
  } = useFoods();

  const {
    deliverymen,
    loading: deliveryLoading,
    error: deliveryError,
    getAllDeliverymen,
    clearError: clearDeliveryError,
  } = useDeliverymen();

  // État de chargement global
  const isLoading = usersLoading || foodsLoading || deliveryLoading;

  // Chargement initial des données
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        await Promise.all([
          getAllUsers(),
          getAllUsersOrders(),
          getAllFoods(),
          getPopularFoods(),
          getAllDeliverymen(),
        ]);
      } catch (error) {
        console.error("Erreur lors du chargement du dashboard:", error);
      }
    };

    loadDashboardData();
  }, []);

  // Gestion des erreurs
  useEffect(() => {
    if (usersError) {
      toast.error(usersError);
      clearUsersError();
    }
    if (foodsError) {
      toast.error(foodsError);
      clearFoodsError();
    }
    if (deliveryError) {
      toast.error(deliveryError);
      clearDeliveryError();
    }
  }, [usersError, foodsError, deliveryError]);

  // Fonction de rafraîchissement
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        getAllUsers(),
        getAllUsersOrders(),
        getAllFoods(),
        getPopularFoods(),
        getAllDeliverymen(),
      ]);
      toast.success("Données actualisées avec succès");
    } catch (error) {
      toast.error("Erreur lors de l'actualisation");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Filtrage des données par date
  const getFilteredData = useMemo(() => {
    const now = new Date();
    const filterDate = new Date();

    switch (dateFilter) {
      case "today":
        filterDate.setHours(0, 0, 0, 0);
        break;
      case "week":
        filterDate.setDate(now.getDate() - 7);
        break;
      case "month":
        filterDate.setMonth(now.getMonth() - 1);
        break;
      case "quarter":
        filterDate.setMonth(now.getMonth() - 3);
        break;
      case "year":
        filterDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        filterDate.setFullYear(2000); // Toutes les données
    }

    const filteredOrders = orders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      return dateFilter === "all" || orderDate >= filterDate;
    });

    const filteredUsers = users.filter((user) => {
      const userDate = new Date(user.createdAt);
      return dateFilter === "all" || userDate >= filterDate;
    });

    return { filteredOrders, filteredUsers };
  }, [orders, users, dateFilter]);

  // Calcul des statistiques principales
  // Calcul des statistiques principales - VERSION RÉALISTE
  const dashboardStats = useMemo(() => {
    const { filteredOrders, filteredUsers } = getFilteredData;

    // Statistiques des commandes
    const totalOrders = filteredOrders.length;
    const pendingOrders = filteredOrders.filter(
      (o) => o.status === "pending",
    ).length;
    const inProgressOrders = filteredOrders.filter(
      (o) => o.status === "in-progress",
    ).length;
    const deliveredOrders = filteredOrders.filter(
      (o) => o.status === "delivered",
    ).length;
    const canceledOrders = filteredOrders.filter(
      (o) => o.status === "canceled",
    ).length;

    // 🔥 REVENUS RÉALISTES - SEULEMENT LES COMMANDES LIVRÉES
    const deliveredOrdersData = filteredOrders.filter(
      (o) => o.status === "delivered",
    );

    const totalRevenue = deliveredOrdersData.reduce(
      (sum, order) => sum + (order.total || 0),
      0,
    );

    // 💰 REVENUS POTENTIELS (toutes commandes sauf pas accepeter)
    const potentialOrdersData = filteredOrders.filter(
      (o) => o.status === "pending",
    );

    const potentialRevenue = potentialOrdersData.reduce(
      (sum, order) => sum + (order.total || 0),
      0,
    );

    // 📉 REVENUS PERDUS (commandes annulées)
    const canceledOrdersData = filteredOrders.filter(
      (o) => o.status === "canceled",
    );

    const lostRevenue = canceledOrdersData.reduce(
      (sum, order) => sum + (order.total || 0),
      0,
    );

    // Moyennes
    const averageOrderValue =
      deliveredOrders > 0 ? totalRevenue / deliveredOrders : 0;
    const averagePotentialOrderValue =
      potentialOrdersData.length > 0
        ? potentialRevenue / potentialOrdersData.length
        : 0;

    // Utilisateurs
    const totalUsers = filteredUsers.length;
    const newUsers = filteredUsers.filter((user) => {
      const userDate = new Date(user.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return userDate >= weekAgo;
    }).length;

    // Livreurs
    const activeDeliverymen = deliverymen.filter(
      (d) => d.status === "active",
    ).length;
    const totalDeliverymen = deliverymen.length;

    // Plats
    const totalProducts = foods.length;
    const availableProducts = foods.filter((f) => f.isAvailable).length;

    // 📊 Taux de conversion et performance
    const conversionRate =
      totalOrders > 0 ? (deliveredOrders / totalOrders) * 100 : 0;
    const cancellationRate =
      totalOrders > 0 ? (canceledOrders / totalOrders) * 100 : 0;

    return {
      totalOrders,
      pendingOrders,
      inProgressOrders,
      deliveredOrders,
      canceledOrders,
      totalRevenue, // 💰 REVENUS RÉELS (delivered only)
      potentialRevenue, // 💰 REVENUS POTENTIELS
      lostRevenue, // 📉 REVENUS PERDUS
      averageOrderValue, // Moyenne des commandes livrées
      averagePotentialOrderValue, // Moyenne de toutes les commandes non-annulées
      totalUsers,
      newUsers,
      activeDeliverymen,
      totalDeliverymen,
      totalProducts,
      availableProducts,
      conversionRate,
      cancellationRate,
    };
  }, [getFilteredData, deliverymen, foods]);

  // Données pour les graphiques - VERSION RÉALISTE
  const chartData = useMemo(() => {
    const { filteredOrders } = getFilteredData;

    // Données pour le graphique temporel - REVENUS RÉELS vs POTENTIELS
    const timeData = filteredOrders.reduce((acc: any[], order) => {
      const date = new Date(order.createdAt).toLocaleDateString();
      const existing = acc.find((item) => item.date === date);

      if (existing) {
        existing.orders += 1;
        existing.potentialRevenue += order.total || 0;

        // Ajouter aux revenus réels seulement si livré
        if (order.status === "delivered") {
          existing.realRevenue += order.total || 0;
          existing.deliveredOrders += 1;
        }

        // Ajouter aux revenus perdus si annulé
        if (order.status === "canceled") {
          existing.lostRevenue += order.total || 0;
          existing.canceledOrders += 1;
        }
      } else {
        acc.push({
          date,
          orders: 1,
          deliveredOrders: order.status === "delivered" ? 1 : 0,
          canceledOrders: order.status === "canceled" ? 1 : 0,
          realRevenue: order.status === "delivered" ? order.total || 0 : 0,
          potentialRevenue: order.total || 0,
          lostRevenue: order.status === "canceled" ? order.total || 0 : 0,
        });
      }

      return acc;
    }, []);

    // Données pour le graphique en secteurs des statuts - MISE À JOUR
    const statusData = [
      {
        name: "En attente",
        value: dashboardStats.pendingOrders,
        color: CHART_COLORS.warning,
      },
      {
        name: "En cours",
        value: dashboardStats.inProgressOrders,
        color: CHART_COLORS.info,
      },
      {
        name: "Livrées",
        value: dashboardStats.deliveredOrders,
        color: CHART_COLORS.secondary,
      },
      {
        name: "Annulées",
        value: dashboardStats.canceledOrders,
        color: CHART_COLORS.danger,
      },
    ].filter((item) => item.value > 0);

    // Top des Plats populaires
    const productStats = trendingFoods.slice(0, 5).map((food) => ({
      name: food.name,
      sales: food.discount,
      revenue: food.originalPrice * food.discount,
    }));

    return { timeData, statusData, productStats };
  }, [getFilteredData, dashboardStats, trendingFoods]);

  if (isLoading && orders.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-6 p-8">
          <div className="relative">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold">
              Chargement du tableau de bord
            </h2>
            <p className="text-muted-foreground">
              Récupération des données en cours...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* En-tête avec filtres */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
              <BarChart3 className="h-10 w-10 text-blue-600" />
              Tableau de Bord
            </h1>
            <p className="text-gray-600 mt-2">
              Vue d'ensemble de votre activité commerciale
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Select
              value={dateFilter}
              onValueChange={(value: DateFilter) => setDateFilter(value)}>
              <SelectTrigger className="w-40">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Aujourd'hui</SelectItem>
                <SelectItem value="week">Cette semaine</SelectItem>
                <SelectItem value="month">Ce mois</SelectItem>
                <SelectItem value="quarter">Ce trimestre</SelectItem>
                <SelectItem value="year">Cette année</SelectItem>
                <SelectItem value="all">Toutes les données</SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={handleRefresh}
              disabled={isRefreshing}
              variant="outline"
              className="flex items-center gap-2">
              <RefreshCw
                className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
              Actualiser
            </Button>
          </div>
        </div>

        {/* Cartes de statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Commandes totales */}
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">
                    Total Commandes
                  </p>
                  <p className="text-3xl font-bold">
                    {dashboardStats.totalOrders}
                  </p>
                  <p className="text-blue-100 text-xs mt-1">
                    {dashboardStats.deliveredOrders} livrées •{" "}
                    {dashboardStats.pendingOrders} en attente
                  </p>
                </div>
                <ShoppingCart className="h-12 w-12 text-blue-100" />
              </div>
            </CardContent>
          </Card>

          {/* Revenus RÉELS - Seulement commandes livrées */}
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">
                    💰 Revenus Réels
                  </p>
                  <p className="text-3xl font-bold">
                    {dashboardStats.totalRevenue.toFixed(2)} MAD
                  </p>
                  <p className="text-green-100 text-xs mt-1">
                    Moy: {dashboardStats.averageOrderValue.toFixed(2)} MAD •{" "}
                    {dashboardStats.deliveredOrders} livrées
                  </p>
                </div>
                <DollarSign className="h-12 w-12 text-green-100" />
              </div>
            </CardContent>
          </Card>

          {/* Revenus Potentiels */}
          {/* <Card className="bg-gradient-to-r from-amber-500 to-amber-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 text-sm font-medium">
                    📈 Revenus Non-Livréé (En attente)
                  </p>
                  <p className="text-3xl font-bold">
                    {dashboardStats.potentialRevenue.toFixed(2)} MAD
                  </p>
                  <p className="  text-amber-100 text-xs mt-1">
                    -{dashboardStats.lostRevenue.toFixed(2)} MAD perdus
                  </p>
                </div>
                <TrendingUp className="h-12 w-12 text-amber-100" />
              </div>
            </CardContent>
          </Card> */}

          {/* Utilisateurs */}
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Clients</p>
                  <p className="text-3xl font-bold">
                    {dashboardStats.totalUsers}
                  </p>
                  <p className="text-purple-100 text-xs mt-1">
                    +{dashboardStats.newUsers} cette semaine
                  </p>
                </div>
                <Users className="h-12 w-12 text-purple-100" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Nouvelle section - Métriques de Performance */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Taux de Conversion */}
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Taux de Livraison
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {dashboardStats.conversionRate.toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500">
                    {dashboardStats.deliveredOrders} sur{" "}
                    {dashboardStats.totalOrders} commandes
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          {/* Taux d'Annulation */}
          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Taux d'Annulation
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    {dashboardStats.cancellationRate.toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500">
                    {dashboardStats.canceledOrders} commandes annulées
                  </p>
                </div>
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          {/* Commandes en Cours */}
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    En Cours de Traitement
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {dashboardStats.pendingOrders +
                      dashboardStats.inProgressOrders}
                  </p>
                  <p className="text-xs text-gray-500">
                    {dashboardStats.pendingOrders} pending •{" "}
                    {dashboardStats.inProgressOrders} en cours
                  </p>
                </div>
                <Clock className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Graphiques principaux - MISE À JOUR */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Évolution temporelle - REVENUS RÉELS vs POTENTIELS */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Évolution des Revenus Réels
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                <ResponsiveContainer
                  width="100%"
                  height="100%">
                  <AreaChart data={chartData.timeData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#f0f0f0"
                    />
                    <XAxis
                      dataKey="date"
                      stroke="#666"
                      fontSize={12}
                    />
                    <YAxis
                      stroke="#666"
                      fontSize={12}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e0e0e0",
                        borderRadius: "8px",
                      }}
                      formatter={(value, name: any) => [
                        `${value} ${name?.includes("Revenue") ? "MAD" : ""}`,
                        name,
                      ]}
                    />
                    <Legend />

                    {/* Revenus Potentiels (arrière-plan) */}
                    {/* <Area
                      type="monotone"
                      dataKey="potentialRevenue"
                      stackId="1"
                      stroke="#f59e0b"
                      fill="#f59e0b"
                      fillOpacity={0.3}
                      name="Revenus Potentiels"
                    /> */}

                    {/* Revenus Réels (livrées seulement) */}
                    <Area
                      type="monotone"
                      dataKey="realRevenue"
                      stackId="2"
                      stroke={CHART_COLORS.secondary}
                      fill={CHART_COLORS.secondary}
                      fillOpacity={0.8}
                      name="Revenus Réels (Livrées)"
                    />

                    {/* Commandes Livrées */}
                    <Area
                      type="monotone"
                      dataKey="deliveredOrders"
                      stackId="3"
                      stroke={CHART_COLORS.primary}
                      fill={CHART_COLORS.primary}
                      fillOpacity={0.6}
                      name="Commandes Livrées"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Graphiques principaux */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Évolution temporelle */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Évolution des Commandes et Revenus
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                <ResponsiveContainer
                  width="100%"
                  height="100%">
                  <AreaChart data={chartData.timeData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#f0f0f0"
                    />
                    <XAxis
                      dataKey="date"
                      stroke="#666"
                      fontSize={12}
                    />
                    <YAxis
                      stroke="#666"
                      fontSize={12}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e0e0e0",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="orders"
                      stackId="1"
                      stroke={CHART_COLORS.primary}
                      fill={CHART_COLORS.primary}
                      fillOpacity={0.6}
                      name="Commandes"
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stackId="2"
                      stroke={CHART_COLORS.secondary}
                      fill={CHART_COLORS.secondary}
                      fillOpacity={0.6}
                      name="Revenus (MAD)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Répartition des statuts - MISE À JOUR */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChartIcon className="h-5 w-5 text-purple-600" />
                Statuts des Commandes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                <ResponsiveContainer
                  width="100%"
                  height="100%">
                  <PieChart>
                    <Pie
                      data={chartData.statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }>
                      {chartData.statusData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`${value} commandes`, "Quantité"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Légende détaillée */}
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    Livrées
                  </span>
                  <span className="font-medium">
                    {dashboardStats.deliveredOrders} (
                    {dashboardStats.conversionRate.toFixed(1)}%)
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    En attente
                  </span>
                  <span className="font-medium">
                    {dashboardStats.pendingOrders}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    En cours
                  </span>
                  <span className="font-medium">
                    {dashboardStats.inProgressOrders}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    Annulées
                  </span>
                  <span className="font-medium">
                    {dashboardStats.canceledOrders} (
                    {dashboardStats.cancellationRate.toFixed(1)}%)
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statistiques détaillées */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Plats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pizza className="h-5 w-5 text-green-600" />
                Plats les Plus Vendus
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {chartData.productStats.length > 0 ? (
                  chartData.productStats.map((product, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                        <span className="font-medium">{product.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">
                          {product.sales} vendus
                        </div>
                        <div className="text-sm text-gray-500">
                          {product.revenue.toFixed(2)} MAD
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Pizza className="h-12 w-12 mx-auto mb-2 opacity-30" />
                    <p>Aucun produit populaire disponible</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Métriques Système */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-red-600" />
                Métriques Système
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Plats */}
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Package className="h-5 w-5 text-blue-600" />
                    <span className="font-medium">Plats</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-blue-600">
                      {dashboardStats.availableProducts}
                    </div>
                    <div className="text-sm text-gray-500">
                      sur {dashboardStats.totalProducts} total
                    </div>
                  </div>
                </div>

                {/* Livreurs actifs */}
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Truck className="h-5 w-5 text-green-600" />
                    <span className="font-medium">Livreurs Actifs</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">
                      {dashboardStats.activeDeliverymen}
                    </div>
                    <div className="text-sm text-gray-500">
                      {(
                        (dashboardStats.activeDeliverymen /
                          dashboardStats.totalDeliverymen) *
                        100
                      ).toFixed(0)}
                      % disponible
                    </div>
                  </div>
                </div>

                {/* Taux de conversion */}
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                    <span className="font-medium">Taux de Livraison</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-purple-600">
                      {dashboardStats.totalOrders > 0
                        ? (
                            (dashboardStats.deliveredOrders /
                              dashboardStats.totalOrders) *
                            100
                          ).toFixed(1)
                        : 0}
                      %
                    </div>
                    <div className="text-sm text-gray-500">
                      {dashboardStats.deliveredOrders} livrées
                    </div>
                  </div>
                </div>

                {/* Croissance utilisateurs */}
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-orange-600" />
                    <span className="font-medium">Nouveaux Clients</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-orange-600">
                      +{dashboardStats.newUsers}
                    </div>
                    <div className="text-sm text-gray-500">cette semaine</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pied de page */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-200 text-sm text-gray-500">
          <div>
            © 2024 AFOOD Dashboard - Données actualisées le{" "}
            {new Date().toLocaleString()}
          </div>
          <div className="flex items-center gap-4">
            <Badge
              variant="outline"
              className="text-green-600 border-green-200">
              {orders.length} commandes total
            </Badge>
            <Badge
              variant="outline"
              className="text-blue-600 border-blue-200">
              {users.length} utilisateurs
            </Badge>
            <Badge
              variant="outline"
              className="text-purple-600 border-purple-200">
              {foods.length} Plats
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
