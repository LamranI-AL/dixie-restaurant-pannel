import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, CookingPot, Package, Bike } from "lucide-react";

interface OrderStats {
  confirmed: number;
  cooking: number;
  readyForDelivery: number;
  onTheWay: number;
}

interface OrderStatisticsProps {
  stats: OrderStats;
}

export default function OrderStatistics({ stats }: OrderStatisticsProps) {
  const statCards = [
    {
      label: "Confirmed",
      value: stats.confirmed,
      icon: CheckCircle,
      bgColor: "bg-green-100",
      textColor: "text-green-600",
      iconBgColor: "bg-green-200",
    },
    {
      label: "Cooking",
      value: stats.cooking,
      icon: CookingPot,
      bgColor: "bg-orange-100",
      textColor: "text-orange-600",
      iconBgColor: "bg-orange-200",
    },
    {
      label: "Ready for delivery",
      value: stats.readyForDelivery,
      icon: Package,
      bgColor: "bg-yellow-100",
      textColor: "text-yellow-600",
      iconBgColor: "bg-yellow-200",
    },
    {
      label: "Food on the way",
      value: stats.onTheWay,
      icon: Bike,
      bgColor: "bg-red-100",
      textColor: "text-red-600",
      iconBgColor: "bg-red-200",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statCards.map((stat, index) => (
        <Card key={index} className={`border-none ${stat.bgColor}`}>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className={`text-3xl font-bold ${stat.textColor}`}>
                {stat.value}
              </span>
              <p className={`text-sm ${stat.textColor.replace("600", "700")}`}>
                {stat.label}
              </p>
            </div>
            <div className={`p-3 rounded-full ${stat.iconBgColor}`}>
              <stat.icon
                className={`h-6 w-6 ${stat.textColor}`}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
