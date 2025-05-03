import { Button } from "@/components/ui/button";
import { Package, RotateCcw, Calendar, Layers } from "lucide-react";

interface OrderSummary {
  delivered: number;
  refunded: number;
  scheduled: number;
  all: number;
}

interface OrderManagementSummaryProps {
  summary: OrderSummary;
}

export default function OrderManagementSummary({ summary }: OrderManagementSummaryProps) {
  const summaryItems = [
    {
      label: "Delivered",
      value: summary.delivered,
      icon: Package,
      bgColor: "bg-blue-100 text-blue-700",
    },
    {
      label: "Refunded",
      value: summary.refunded,
      icon: RotateCcw,
      bgColor: "bg-red-100 text-red-700",
    },
    {
      label: "Scheduled",
      value: summary.scheduled,
      icon: Calendar,
      bgColor: "bg-purple-100 text-purple-700",
    },
    {
      label: "All",
      value: summary.all,
      icon: Layers,
      bgColor: "bg-green-100 text-green-700",
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
      {summaryItems.map((item, index) => (
        <Button
          key={index}
          variant="outline"
          className="flex items-center justify-between bg-white p-4 rounded-md border border-gray-200 hover:bg-gray-50 transition h-auto"
        >
          <div className="flex items-center">
            <div className="p-2 rounded-md bg-gray-100 mr-3">
              <item.icon className="h-5 w-5 text-gray-700" />
            </div>
            <span className="font-medium text-gray-700">{item.label}</span>
          </div>
          <span className={`px-2 py-1 rounded text-sm font-medium ${item.bgColor}`}>
            {item.value}
          </span>
        </Button>
      ))}
    </div>
  );
}
