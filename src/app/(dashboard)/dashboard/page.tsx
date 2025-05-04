/** @format */

"use client";

import { useState } from "react";
// import { useAuth } from "@/providers/auth-provider";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  OrderStatistics,
  YearlySales,
  TopSellingFood,
  TopRatedFood,
} from "@/lib/types";
import Image from "next/image";

// Mock data for yearly sales
const yearlyData: YearlySales[] = [
  { month: "Jan", sales: 1500, commission: 150 },
  { month: "Feb", sales: 2200, commission: 220 },
  { month: "Mar", sales: 1800, commission: 180 },
  { month: "Apr", sales: 2400, commission: 240 },
  { month: "May", sales: 2600, commission: 260 },
  { month: "Jun", sales: 3100, commission: 310 },
  { month: "Jul", sales: 2900, commission: 290 },
  { month: "Aug", sales: 3300, commission: 330 },
  { month: "Sep", sales: 3500, commission: 350 },
  { month: "Oct", sales: 3200, commission: 320 },
  { month: "Nov", sales: 3800, commission: 380 },
  { month: "Dec", sales: 4200, commission: 420 },
];

// Mock data for top selling foods
const topSellingFoods: TopSellingFood[] = [
  {
    id: "1",
    name: "Medu Vada",
    image:
      "https://images.pexels.com/photos/2233729/pexels-photo-2233729.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    soldCount: 9,
  },
  {
    id: "2",
    name: "Meat Pizza",
    image:
      "https://images.pexels.com/photos/4109111/pexels-photo-4109111.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    soldCount: 5,
  },
  {
    id: "3",
    name: "Grilled Lemon Herb Mediterranean Chicken Salad",
    image:
      "https://images.pexels.com/photos/2097090/pexels-photo-2097090.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    soldCount: 2,
  },
  {
    id: "4",
    name: "Cheese Pizza",
    image:
      "https://images.pexels.com/photos/2619970/pexels-photo-2619970.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    soldCount: 1,
  },
  {
    id: "5",
    name: "Steak Kebabs",
    image:
      "https://images.pexels.com/photos/2233729/pexels-photo-2233729.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    soldCount: 0,
  },
  {
    id: "6",
    name: "Fried Rice",
    image:
      "https://images.pexels.com/photos/723198/pexels-photo-723198.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    soldCount: 0,
  },
];

// Mock data for top rated foods
const topRatedFoods: TopRatedFood[] = [
  {
    id: "1",
    name: "Meat Pizza",
    image:
      "https://images.pexels.com/photos/4109111/pexels-photo-4109111.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    rating: 4.5,
    reviewCount: 3,
  },
  {
    id: "2",
    name: "Steak Kebabs",
    image:
      "https://images.pexels.com/photos/2233729/pexels-photo-2233729.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    rating: 0,
    reviewCount: 0,
  },
  {
    id: "3",
    name: "Fried Rice",
    image:
      "https://images.pexels.com/photos/723198/pexels-photo-723198.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    rating: 0,
    reviewCount: 0,
  },
  {
    id: "4",
    name: "Thai Fried Rice",
    image:
      "https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    rating: 0,
    reviewCount: 0,
  },
  {
    id: "5",
    name: "Cheese Pizza",
    image:
      "https://images.pexels.com/photos/2619970/pexels-photo-2619970.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    rating: 0,
    reviewCount: 0,
  },
  {
    id: "6",
    name: "Grilled Lemon Herb Mediterranean Chicken Salad",
    image:
      "https://images.pexels.com/photos/2097090/pexels-photo-2097090.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    rating: 0,
    reviewCount: 0,
  },
];

export default function DashboardPage() {
  // const { currentUser } = useAuth();
  const orderStats = {
    confirmed: 1,
    cooking: 0,
    readyForDelivery: 1,
    onTheWay: 1,
    delivered: 23,
    refunded: 0,
    scheduled: 1,
    total: 69,
  };

  const [statsType, setStatsType] = useState("overall");

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
      {/* cards for folowup */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-2 lg:grid-cols-1">
        <div className="">
          <Card className="border border-gray-200 bg-green-50">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-lg font-medium">
                Order statistics
              </CardTitle>
              <Select
                value={statsType}
                onValueChange={setStatsType}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Select statistics type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="overall">Overall Statistics</SelectItem>
                    <SelectItem value="today">{`Today's Statistics`}</SelectItem>
                    <SelectItem value="weekly">Weekly Statistics</SelectItem>
                    <SelectItem value="monthly">Monthly Statistics</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <Card className="border border-gray-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex items-center mb-1">
                  <ShoppingBag className="mr-3 text-green-600" />
                  <div className="text-3xl font-bold text-green-600">
                    {orderStats.confirmed}
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
                    {orderStats.cooking}
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
                    {orderStats.readyForDelivery}
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
                    {orderStats.onTheWay}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Food on the way</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:col-span-1">
          <div className="col-span-1">
            <Card className="h-full flex flex-col justify-center">
              <CardContent className="pt-6 flex flex-col items-center justify-center space-y-2">
                <div className="flex items-center w-full">
                  <Truck className="mr-2 h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">Delivered</div>
                  <div className="text-xl font-semibold text-orange-500">
                    {orderStats.delivered}
                  </div>
                </div>
                <div className="flex items-center w-full">
                  <RotateCcw className="mr-2 h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">Refunded</div>
                  <div className="text-xl font-semibold text-orange-500">
                    {orderStats.refunded}
                  </div>
                </div>
                <div className="flex items-center w-full">
                  <Calendar className="mr-2 h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">Scheduled</div>
                  <div className="text-xl font-semibold text-orange-500">
                    {orderStats.scheduled}
                  </div>
                </div>
                <div className="flex items-center w-full">
                  <UserCheck className="mr-2 h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">All</div>
                  <div className="text-xl font-semibold text-orange-500">
                    {orderStats.total}
                  </div>
                </div>
              </CardContent>
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

      {/* top selles */}
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
              {topSellingFoods.map((food) => (
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
                      Sold : {food.soldCount}
                    </div>
                  </div>
                  <div className="mt-2 text-center">
                    <h3 className="text-sm font-medium line-clamp-1">
                      {food.name}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2 h-5 w-5 text-muted-foreground">
                  <path d="M12 2L15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2z" />
                </svg>
                <CardTitle className="text-lg font-medium">
                  Top Rated Foods
                </CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {topRatedFoods.map((food) => (
                <div
                  key={food.id}
                  className="flex flex-col items-center">
                  <div className="w-24 h-24 rounded-md overflow-hidden mb-2">
                    <Image
                      width={300}
                      height={300}
                      src={food.image}
                      alt={food.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <h3 className="text-sm font-medium text-center line-clamp-1">
                    {food.name}
                  </h3>
                  <div className="flex items-center mt-1">
                    <div className="text-amber-500 mr-1">
                      {food.rating ? food.rating.toFixed(1) : "0"}
                    </div>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill={
                            star <= Math.round(food.rating)
                              ? "currentColor"
                              : "none"
                          }
                          stroke="currentColor"
                          className="h-3 w-3 text-amber-500">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 2L15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2z"
                          />
                        </svg>
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground ml-1">
                      ({food.reviewCount} Reviews)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
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
