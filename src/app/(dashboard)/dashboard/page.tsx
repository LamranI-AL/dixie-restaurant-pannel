/** @format */
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Button } from "@/components/ui/button";
import {
  ShoppingBag,
  Truck,
  Package,
  Calendar,
  RotateCcw,
  Pizza,
  UserCheck,
  CookingPot,
  AreaChart as ChartIcon,
  Clock,
  PackageCheck,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { YearlySales, TrendingFood, Order, User } from "@/lib/types";
import Image from "next/image";
// import { getOrderStatistics } from "@/actions/ordres";
import { getPopularFoods } from "@/actions/food";
import GalleryPage from "@/components/dashboard/gallery/pageUpGall";
import { useOrders } from "@/lib/hooks/hooks/useOrders";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/lib/hooks/hooks/use-toast";
import { getOrderStatistics, getOrderStatisticsAlt } from "@/actions/user";
import {
  calculateOrderStats,
  fetchOrdersFromFirebase,
} from "@/actions/chart-stats";
import OrdersAnalyticsChart from "@/components/dashboard/chart-stats";

// Type pour les statistiques de commandes
interface OrderStats {
  pending: number;
  processing: number;
  delivered: number;
  cancelled: number;
  total: number;
}

// Couleurs pour le graphique en secteurs
const COLORS = ["#ffa726", "#42a5f5", "#66bb6a", "#ef5350"];

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isChartLoading, setIsChartLoading] = useState(true);
  const [popFoods, setPopFoods] = useState<TrendingFood[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("all");
  // const [orderStats, setOrderStats] = useState<OrderStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const { toast } = useToast();
  const [orderStats, setOrderStats] = useState<any>({
    totalRevenue: 0,
    averageOrderValue: 0,
    totalOrders: 0,
  });
  // Charger les statistiques pour le dashboard
  useEffect(() => {
    const loadDashboardData = async (): Promise<void> => {
      setIsLoading(true);
      try {
        // Récupérer les commandes des 30 derniers jours pour les statistiques
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Si selectedUserId est "all", on récupère toutes les commandes, sinon on filtre par utilisateur
        const userId = selectedUserId !== "all" ? selectedUserId : undefined;

        const ordersData = await fetchOrdersFromFirebase({
          startDate: thirtyDaysAgo,
          userId: userId,
        });

        setOrders(ordersData as any);

        // Calculer les statistiques
        const stats = calculateOrderStats(ordersData);
        setOrderStats(stats);
      } catch (error) {
        console.error(
          "Erreur lors du chargement des données du dashboard:",
          error,
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [selectedUserId]);

  // Préparer les données pour le graphique en secteurs des commandes
  const getOrderChartData = () => {
    if (!orderStats) return [];

    return [
      { name: "En traitement", value: orderStats.pending, color: COLORS[0] },
      { name: "En livraison", value: orderStats.processing, color: COLORS[1] },
      { name: "Livrées", value: orderStats.delivered, color: COLORS[2] },
      { name: "Annulées", value: orderStats.cancelled, color: COLORS[3] },
    ];
  };
  const handleUserChange = (userId: string): void => {
    setSelectedUserId(userId);
  };

  // Charger les statistiques de commandes
  useEffect(() => {
    const fetchOrderStats = async () => {
      setStatsLoading(true);
      try {
        const result = await getOrderStatistics();
        if (result.success && result.statistics) {
          setOrderStats(result.statistics);
          toast({
            title: "Statistiques chargées",
            description:
              "Les statistiques de commandes ont été chargées avec succès",
            variant: "default",
          });
        } else {
          toast({
            title: "Erreur de chargement",
            description:
              result.error ||
              "Impossible de charger les statistiques de commandes",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Erreur lors du chargement des statistiques:", error);
        toast({
          title: "Erreur",
          description:
            "Une erreur est survenue lors du chargement des statistiques",
          variant: "destructive",
        });
      } finally {
        setStatsLoading(false);
      }
    };

    fetchOrderStats();
  }, [toast]);

  useEffect(() => {
    const fetchPopularFoods = async () => {
      setIsLoading(true);
      try {
        const popFood = await getPopularFoods();

        if (popFood.success) {
          setPopFoods(popFood.trindingfoods as TrendingFood[]);
          toast({
            title: "Plats populaires chargés",
            description: "Les plats tendance ont été chargés avec succès",
            variant: "default",
          });
        } else {
          toast({
            title: "Échec du chargement des plats populaires",
            description:
              popFood.error ||
              "Une erreur est survenue lors du chargement des plats tendance",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Erreur lors du chargement des plats populaires:", error);
        toast({
          title: "Erreur",
          description:
            "Échec du chargement des plats tendance. Veuillez réessayer plus tard.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    // Simuler le chargement du graphique
    setTimeout(() => {
      setIsChartLoading(false);
    }, 1500);

    fetchPopularFoods();
  }, [toast]);

  // Stats card skeleton loader component
  const StatsCardSkeleton = () => (
    <div className="grid grid-cols-2 gap-4 mt-4">
      <Card className="border border-gray-200">
        <CardContent className="pt-6">
          <div className="flex items-center mb-1">
            <Skeleton className="h-8 w-8 rounded-full mr-3" />
            <Skeleton className="h-8 w-20" />
          </div>
          <Skeleton className="h-3 w-24 mt-2" />
        </CardContent>
      </Card>
      <Card className="border border-gray-200">
        <CardContent className="pt-6">
          <div className="flex items-center mb-1">
            <Skeleton className="h-8 w-8 rounded-full mr-3" />
            <Skeleton className="h-8 w-20" />
          </div>
          <Skeleton className="h-3 w-24 mt-2" />
        </CardContent>
      </Card>
    </div>
  );

  // Food card skeleton loader component
  const FoodCardSkeleton = () => (
    <div className="relative group overflow-hidden rounded-lg">
      <Skeleton className="h-44 w-full rounded-lg" />
      <div className="mt-2 text-center">
        <Skeleton className="h-4 w-full mx-auto" />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-2 md:space-y-0">
        <h2 className="text-3xl font-bold tracking-tight">Tableau de bord</h2>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="flex items-center gap-2">
            <Loader2 className="h-4 w-4" /> Actualiser
          </Button>
          <Button variant="outline">
            <svg
              width="15"
              height="15"
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5">
              <path
                d="M13.9 2.5C13.9 2.22386 13.6761 2 13.4 2C13.1239 2 12.9 2.22386 12.9 2.5V12.5C12.9 12.7761 13.1239 13 13.4 13C13.6761 13 13.9 12.7761 13.9 12.5V2.5ZM9.4 2.5C9.4 2.22386 9.17614 2 8.9 2C8.62386 2 8.4 2.22386 8.4 2.5V12.5C8.4 12.7761 8.62386 13 8.9 13C9.17614 13 9.4 12.7761 9.4 12.5V2.5ZM4.9 2.5C4.9 2.22386 4.67614 2 4.4 2C4.12386 2 3.9 2.22386 3.9 2.5V12.5C3.9 12.7761 4.12386 13 4.4 13C4.67614 13 4.9 12.7761 4.9 12.5V2.5ZM2.4 2C2.17909 2 2 2.17909 2 2.4V12.6C2 12.8209 2.17909 13 2.4 13C2.62091 13 2.8 12.8209 2.8 12.6V2.4C2.8 2.17909 2.62091 2 2.4 2ZM6.9 2C6.67909 2 6.5 2.17909 6.5 2.4V12.6C6.5 12.8209 6.67909 13 6.9 13C7.12091 13 7.3 12.8209 7.3 12.6V2.4C7.3 2.17909 7.12091 2 6.9 2ZM11.4 2C11.1791 2 11 2.17909 11 2.4V12.6C11 12.8209 11.1791 13 11.4 13C11.6209 13 11.8 12.8209 11.8 12.6V2.4C11.8 2.17909 11.6209 2 11.4 2Z"
                fill="currentColor"
                fillRule="evenodd"
                clipRule="evenodd"></path>
            </svg>
          </Button>
        </div>
      </div>

      {/* Order Statistics Cards */}
      <div className="grid grid-cols-4 gap-4 md:grid-cols-3">
        {/* Cartes de statistiques des commandes */}
        <div className="grid grid-cols-4 gap-4 md:col-span-1 lg:col-span-2">
          {statsLoading ? (
            <>
              <StatsCardSkeleton />
              <StatsCardSkeleton />
            </>
          ) : (
            <>
              <Card className="border border-gray-200 bg-amber-50">
                <CardContent className="pt-6">
                  <div className="flex items-center mb-1">
                    <Clock className="mr-3 text-amber-600" />
                    <div className="text-3xl font-bold text-amber-600">
                      {orderStats?.pending || 0}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">En traitement</p>
                </CardContent>
              </Card>
              <Card className="border border-gray-200 bg-blue-50">
                <CardContent className="pt-6">
                  <div className="flex items-center mb-1">
                    <CookingPot className="mr-3 text-blue-600" />
                    <div className="text-3xl font-bold text-blue-600">
                      {orderStats?.processing || 0}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">En livraison</p>
                </CardContent>
              </Card>
              <Card className="border border-gray-200 bg-green-50">
                <CardContent className="pt-6">
                  <div className="flex items-center mb-1">
                    <CheckCircle className="mr-3 text-green-600" />
                    <div className="text-3xl font-bold text-green-600">
                      {orderStats?.delivered || 0}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">Livrées</p>
                </CardContent>
              </Card>
              <Card className="border border-gray-200 bg-red-50">
                <CardContent className="pt-6">
                  <div className="flex items-center mb-1">
                    <XCircle className="mr-3 text-red-600" />
                    <div className="text-3xl font-bold text-red-600">
                      {orderStats?.cancelled || 0}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">Annulées</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Graphique en secteurs des commandes */}
        <div className="md:col-span-1 lg:col-span-1">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center">
                <ShoppingBag className="mr-2 h-5 w-5 text-muted-foreground" />
                Répartition des commandes
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center">
              {statsLoading ? (
                <div className="flex flex-col items-center justify-center w-full h-48">
                  <Skeleton className="h-40 w-40 rounded-full" />
                  <Skeleton className="h-4 w-40 mt-4" />
                </div>
              ) : (
                <>
                  <div className="h-48 w-full">
                    <ResponsiveContainer
                      width="100%"
                      height="100%">
                      <PieChart>
                        <Pie
                          data={getOrderChartData()}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) =>
                            `${name} ${(percent * 100).toFixed(0)}%`
                          }>
                          {getOrderChartData().map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={entry.color}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => [
                            `${value} commandes`,
                            "Quantité",
                          ]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-2 text-center">
                    <p className="text-lg font-semibold">
                      Total: {orderStats?.total || 0} commandes
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CHART */}
      {/* Nouveau composant de graphique des commandes */}
      <div className="col-span-3">
        <OrdersAnalyticsChart className="h-full" />
      </div>

      {/* Votre graphique de statistiques annuelles existant */}
      {/* <div className="col-span-3">
        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <div className="flex items-center">
              <ChartIcon className="mr-2 h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg font-medium">
                Statistiques Annuelles
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>teste</CardContent>
        </Card>
      </div> */}

      {/* top selling foods */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Pizza className="mr-2 h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-lg font-medium">
                  Plats les plus vendus
                </CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => window.location.reload()}>
                Actualiser
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {isLoading ? (
                // Show skeletons while loading
                Array(6)
                  .fill(0)
                  .map((_, i) => <FoodCardSkeleton key={i} />)
              ) : popFoods.length > 0 ? (
                // Show actual food items when loaded
                popFoods.map((food) => (
                  <div
                    key={food.id}
                    className="relative group overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                    <div className="relative h-44 w-full overflow-hidden rounded-lg">
                      <Image
                        width={500}
                        height={500}
                        src={food.image}
                        alt={food.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        Vendu : {food.discount}
                      </div>
                    </div>
                    <div className="mt-2 text-center p-2">
                      <h3 className="text-sm font-medium line-clamp-1">
                        {food.name}
                      </h3>
                    </div>
                  </div>
                ))
              ) : (
                // Show message when no foods are found
                <div className="col-span-3 text-center py-8">
                  <Pizza className="mx-auto h-12 w-12 text-muted-foreground opacity-30" />
                  <p className="mt-2 text-muted-foreground">
                    Aucun plat tendance trouvé
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <GalleryPage />
      </div>

      <div className="flex justify-between items-center border-t pt-4 text-sm text-muted-foreground">
        <div>© DIXIE.</div>
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground">
            Paramètres du restaurant
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground">
            Profil
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4">
              <path d="M10 3H6a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h4M16 17l5-5-5-5M19.8 12H9" />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
}
