/** @format */

import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addWeeks,
  subWeeks,
} from "date-fns";
import { fr } from "date-fns/locale";
import { ArrowLeftIcon, ArrowRightIcon, ChartBarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Order } from "@/lib/types";
import { fetchOrdersFromFirebase } from "@/actions/chart-stats";
// import { fetchOrdersFromFirebase } from "@/lib/firebaseHelpers";

// Types des données
// interface Order {
//   id?: string;
//   createdAt: string;
//   total: number;
//   [key: string]: any;
// }

interface DailyOrderData {
  date: string;
  totalAmount: number;
  orderCount: number;
}

interface WeeklyOrderData {
  date: string;
  formattedDate: string;
  totalAmount: number;
  orderCount: number;
}

interface OrdersAnalyticsChartProps {
  className?: string;
}

// Fonctions utilitaires pour le traitement des données de commandes
const processOrdersData = (orders: Order[]): DailyOrderData[] => {
  // Organiser les commandes par jour
  const ordersByDay: Record<string, DailyOrderData> = {};

  orders.forEach((order) => {
    if (order.createdAt && order.total) {
      const dateStr = format(new Date(order.createdAt), "yyyy-MM-dd");

      if (!ordersByDay[dateStr]) {
        ordersByDay[dateStr] = {
          date: dateStr,
          totalAmount: 0,
          orderCount: 0,
        };
      }

      ordersByDay[dateStr].totalAmount += parseFloat(order.total.toString());
      ordersByDay[dateStr].orderCount += 1;
    }
  });

  // Convertir en tableau pour le graphique
  return Object.values(ordersByDay).sort((a, b) =>
    a.date.localeCompare(b.date),
  );
};

// Fonction pour obtenir les données par semaine
const getWeeklyData = (
  dailyData: DailyOrderData[],
  currentWeekStart: Date,
): WeeklyOrderData[] => {
  const start = startOfWeek(currentWeekStart, { weekStartsOn: 1 }); // Commence le lundi
  const end = endOfWeek(currentWeekStart, { weekStartsOn: 1 });

  // Créer un tableau de toutes les dates de la semaine
  const daysInWeek = eachDayOfInterval({ start, end });

  // Préparer les données pour chaque jour de la semaine
  return daysInWeek.map((day) => {
    const dateStr = format(day, "yyyy-MM-dd");
    const dayData = dailyData.find((d) => d.date === dateStr);

    return {
      date: format(day, "EEE dd/MM", { locale: fr }),
      formattedDate: dateStr,
      totalAmount: dayData ? dayData.totalAmount : 0,
      orderCount: dayData ? dayData.orderCount : 0,
    };
  });
};

const OrdersAnalyticsChart: React.FC<OrdersAnalyticsChartProps> = ({
  className,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [processedData, setProcessedData] = useState<DailyOrderData[]>([]);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(
    startOfWeek(new Date(), { weekStartsOn: 1 }),
  );
  const [weeklyData, setWeeklyData] = useState<WeeklyOrderData[]>([]);
  const [activeTab, setActiveTab] = useState<string>("amount");

  // Chargement des données de commandes depuis Firebase
  useEffect(() => {
    const fetchOrdersData = async (): Promise<void> => {
      setIsLoading(true);
      try {
        // Récupérer les commandes des 30 derniers jours
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Utiliser notre helper pour récupérer les commandes
        const orderData = await fetchOrdersFromFirebase({
          startDate: thirtyDaysAgo,
        });

        setOrders(orderData as any);
        const processed = processOrdersData(orderData as any);
        setProcessedData(processed);

        // Mettre à jour les données de la semaine actuelle
        setWeeklyData(getWeeklyData(processed, currentWeekStart));
      } catch (error) {
        console.error(
          "Erreur lors du chargement des commandes depuis Firebase:",
          error,
        );
        // Utiliser des données simulées en cas d'erreur pour le développement
        const mockOrders: Order[] = [];
        setOrders(mockOrders);
        const processed = processOrdersData(mockOrders);
        setProcessedData(processed);
        setWeeklyData(getWeeklyData(processed, currentWeekStart));
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrdersData();
  }, []);

  // Mettre à jour les données hebdomadaires lorsque la semaine change
  useEffect(() => {
    setWeeklyData(getWeeklyData(processedData, currentWeekStart));
  }, [currentWeekStart, processedData]);

  // Navigation entre les semaines
  const goToPreviousWeek = (): void => {
    setCurrentWeekStart((prevWeek) => subWeeks(prevWeek, 1));
  };

  const goToNextWeek = (): void => {
    setCurrentWeekStart((prevWeek) => addWeeks(prevWeek, 1));
  };

  // Formatter les valeurs pour l'affichage dans le tooltip
  const formatTooltipValue = (value: number, name: string): string => {
    if (name === "totalAmount") {
      return `${value.toFixed(2)} MAD`;
    }
    return value.toString();
  };

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <div className="flex items-center">
          <ChartBarIcon className="mr-2 h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-lg font-medium">
            Analyse des Commandes
          </CardTitle>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousWeek}>
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">
            {format(currentWeekStart, "dd/MM/yyyy", { locale: fr })} -{" "}
            {format(
              endOfWeek(currentWeekStart, { weekStartsOn: 1 }),
              "dd/MM/yyyy",
              { locale: fr },
            )}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextWeek}>
            <ArrowRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs
          defaultValue="amount"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="amount">Montant des commandes</TabsTrigger>
            <TabsTrigger value="count">Nombre de commandes</TabsTrigger>
          </TabsList>

          <TabsContent value="amount">
            <div className="h-[300px]">
              {isLoading ? (
                <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-md">
                  <div className="flex flex-col items-center">
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-52 w-full max-w-xl rounded-md" />
                    <div className="flex justify-center mt-4 space-x-4">
                      <Skeleton className="h-3 w-32 rounded-full" />
                    </div>
                  </div>
                </div>
              ) : (
                <ResponsiveContainer
                  width="100%"
                  height="100%">
                  <BarChart
                    data={weeklyData}
                    margin={{ top: 10, right: 30, left: 20, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                    />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        formatTooltipValue(value, name),
                        name === "totalAmount" ? "Montant total (MAD)" : name,
                      ]}
                      labelFormatter={(label: string) => `Date: ${label}`}
                    />
                    <Legend />
                    <Bar
                      name="Montant total (MAD)"
                      dataKey="totalAmount"
                      fill="#82ca9d"
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="mt-4 text-center text-sm">
              {!isLoading && (
                <div>
                  Total hebdomadaire:{" "}
                  {weeklyData
                    .reduce((sum, day) => sum + day.totalAmount, 0)
                    .toFixed(2)}{" "}
                  MAD
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="count">
            <div className="h-[300px]">
              {isLoading ? (
                <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-md">
                  <div className="flex flex-col items-center">
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-52 w-full max-w-xl rounded-md" />
                    <div className="flex justify-center mt-4 space-x-4">
                      <Skeleton className="h-3 w-32 rounded-full" />
                    </div>
                  </div>
                </div>
              ) : (
                <ResponsiveContainer
                  width="100%"
                  height="100%">
                  <LineChart
                    data={weeklyData}
                    margin={{ top: 10, right: 30, left: 20, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                    />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number) => [
                        value,
                        "Nombre de commandes",
                      ]}
                      labelFormatter={(label: string) => `Date: ${label}`}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="orderCount"
                      name="Nombre de commandes"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="mt-4 text-center text-sm">
              {!isLoading && (
                <div>
                  Nombre total de commandes hebdomadaires:{" "}
                  {weeklyData.reduce((sum, day) => sum + day.orderCount, 0)}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default OrdersAnalyticsChart;
