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
} from "lucide-react";
import { YearlySales, TrendingFood } from "@/lib/types";
import Image from "next/image";
import { DateFilterType, getOrderStatistics } from "@/actions/ordres";
import { useRouter } from "next/navigation";
import { getPopularFoods } from "@/actions/food";
import GalleryPage from "@/components/dashboard/gallery/pageUpGall";
import { useCategories } from "@/lib/hooks/hooks/useCategories";
import { useOrders } from "@/lib/hooks/hooks/useOrders";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/lib/hooks/hooks/use-toast";

// Mock data for yearly sales
const yearlyData: YearlySales[] = [
  { month: "Jan", sales: 0, commission: 0 },
  { month: "Feb", sales: 0, commission: 0 },
  { month: "Mar", sales: 0, commission: 0 },
  { month: "Apr", sales: 0, commission: 0 },
  { month: "May", sales: 0, commission: 0 },
  { month: "Jun", sales: 0, commission: 0 },
  { month: "Jul", sales: 0, commission: 0 },
  { month: "Aug", sales: 0, commission: 0 },
  { month: "Sep", sales: 0, commission: 0 },
  { month: "Oct", sales: 0, commission: 0 },
  { month: "Nov", sales: 0, commission: 0 },
  { month: "Dec", sales: 4200, commission: 0 },
];

export default function DashboardPage() {
  const { statistics } = useOrders();
  const [isLoading, setIsLoading] = useState(true);
  const [isChartLoading, setIsChartLoading] = useState(true);
  const [popFoods, setPopFoods] = useState<TrendingFood[]>([]);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const fetchPopularFoods = async () => {
      setIsLoading(true);
      try {
        const popFood = await getPopularFoods();

        if (popFood.success) {
          setPopFoods(popFood.trindingfoods as TrendingFood[]);
          // Success toast notification
          toast({
            title: "Popular foods loaded",
            description: "Successfully loaded trending food items",
            variant: "default",
          });
        } else {
          // Error toast notification
          toast({
            title: "Failed to load popular foods",
            description:
              popFood.error || "An error occurred while loading trending foods",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error fetching popular foods:", error);
        // Error toast notification
        toast({
          title: "Error",
          description: "Failed to load trending foods. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    // Simulate chart loading
    setTimeout(() => {
      setIsChartLoading(false);
    }, 1500);

    fetchPopularFoods();
  }, [toast]);

  const calculateTotal = (): number => {
    return (
      (statistics?.confirmed || 0) +
      (statistics?.cooking || 0) +
      (statistics?.ready || 0) +
      (statistics?.on_the_way || 0) +
      (statistics?.delivered || 0) +
      (statistics?.refunded || 0) +
      (statistics?.scheduled || 0)
    );
  };

  const total = calculateTotal();

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
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline">Followup</Button>
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
      <div className="grid grid-cols-2 gap-4 md:grid-cols-2 lg:grid-cols-1">
        <div className="">
          {!statistics ? (
            <>
              <StatsCardSkeleton />
              <StatsCardSkeleton />
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <Card className="border border-gray-200 bg-green-50">
                  <CardContent className="pt-6">
                    <div className="flex items-center mb-1">
                      <ShoppingBag className="mr-3 text-green-600" />
                      <div className="text-3xl font-bold text-green-600">
                        {statistics.confirmed}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">Confirmed</p>
                  </CardContent>
                </Card>
                <Card className="border border-gray-200 bg-red-50">
                  <CardContent className="pt-6">
                    <div className="flex items-center mb-1">
                      <CookingPot className="mr-3 text-red-600" />
                      <div className="text-3xl font-bold text-red-600">
                        {statistics.cooking}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">Cooking</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <Card className="border border-gray-200 bg-amber-50">
                  <CardContent className="pt-6">
                    <div className="flex items-center mb-1">
                      <Package className="mr-3 text-amber-600" />
                      <div className="text-3xl font-bold text-amber-600">
                        {statistics.ready}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Ready for delivery
                    </p>
                  </CardContent>
                </Card>
                <Card className="border border-gray-200 bg-red-50">
                  <CardContent className="pt-6">
                    <div className="flex items-center mb-1">
                      <Truck className="mr-3 text-red-600" />
                      <div className="text-3xl font-bold text-red-600">
                        {statistics.on_the_way}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Food on the way
                    </p>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 md:col-span-1">
          <div className="col-span-1">
            <Card className="h-full flex flex-col justify-center">
              {!statistics ? (
                <CardContent className="pt-6 flex flex-col items-center justify-center space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="flex items-center w-full">
                      <Skeleton className="h-5 w-5 mr-2 rounded-full" />
                      <Skeleton className="h-4 w-20 flex-1" />
                      <Skeleton className="h-6 w-12" />
                    </div>
                  ))}
                </CardContent>
              ) : (
                <CardContent className="pt-6 flex flex-col items-center justify-center space-y-2">
                  <div className="flex items-center w-full">
                    <Truck className="mr-2 h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">Delivered</div>
                    <div className="text-xl font-semibold text-orange-500">
                      {statistics.delivered}
                    </div>
                  </div>

                  <div className="flex items-center w-full">
                    <RotateCcw className="mr-2 h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">Refunded</div>
                    <div className="text-xl font-semibold text-orange-500">
                      {statistics.refunded}
                    </div>
                  </div>
                  <div className="flex items-center w-full">
                    <Calendar className="mr-2 h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">Scheduled</div>
                    <div className="text-xl font-semibold text-orange-500">
                      {statistics.scheduled}
                    </div>
                  </div>
                  <div className="flex items-center w-full">
                    <UserCheck className="mr-2 h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">All</div>
                    <div className="text-xl font-semibold text-orange-500">
                      {total}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* CHART */}
      <div className="col-span-3">
        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <div className="flex items-center">
              <ChartIcon className="mr-2 h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg font-medium">
                Yearly Statistics
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              {isChartLoading ? (
                <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-md">
                  <div className="flex flex-col items-center">
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-40 w-full max-w-xl rounded-md" />
                    <div className="flex justify-center mt-4 space-x-4">
                      <Skeleton className="h-3 w-32 rounded-full" />
                      <Skeleton className="h-3 w-32 rounded-full" />
                    </div>
                  </div>
                </div>
              ) : (
                <ResponsiveContainer
                  width="100%"
                  height="100%">
                  <AreaChart
                    data={yearlyData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}>
                    <defs>
                      <linearGradient
                        id="colorSales"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1">
                        <stop
                          offset="5%"
                          stopColor="#82ca9d"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#82ca9d"
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient
                        id="colorCommission"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1">
                        <stop
                          offset="5%"
                          stopColor="#8884d8"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#8884d8"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="commission"
                      stroke="#8884d8"
                      fillOpacity={1}
                      fill="url(#colorCommission)"
                      name="Commission given"
                    />
                    <Area
                      type="monotone"
                      dataKey="sales"
                      stroke="#82ca9d"
                      fillOpacity={1}
                      fill="url(#colorSales)"
                      name="Total earning"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="flex justify-center mt-4 space-x-6">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-blue-400 mr-2"></div>
                <span className="text-sm">Commission given : $ 0.00</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-400 mr-2"></div>
                <span className="text-sm">Total earning : $ 0.00</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* top selling foods */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Pizza className="mr-2 h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-lg font-medium">
                  Top Selling Foods
                </CardTitle>
              </div>
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
                    className="relative group overflow-hidden rounded-lg">
                    <div className="relative h-44 w-full overflow-hidden rounded-lg">
                      <Image
                        width={500}
                        height={500}
                        src={food.image}
                        alt={food.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute top-2 left-2 bg-gray-800 text-white px-2 py-1 rounded text-xs">
                        Sold : {food.discount}
                      </div>
                    </div>
                    <div className="mt-2 text-center">
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
                    No trending foods found
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
            Restaurant settings
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground">
            Profile
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
