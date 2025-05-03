import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart2 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface YearlyData {
  month: string;
  commission: number;
  earning: number;
}

interface YearlyStatisticsProps {
  data: YearlyData[];
}

export default function YearlyStatistics({ data }: YearlyStatisticsProps) {
  return (
    <Card className="bg-white p-5 rounded-lg border border-gray-200 flex-1">
      <CardHeader className="p-0 mb-4">
        <CardTitle className="font-medium text-gray-800 flex items-center">
          <BarChart2 className="mr-2 h-5 w-5" />
          Yearly Statistics
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex mb-4">
          <div className="mr-8 flex items-center">
            <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
            <span className="text-sm text-gray-600">
              Commission given: ${data.reduce((sum, item) => sum + item.commission, 0).toFixed(2)}
            </span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-primary mr-2"></div>
            <span className="text-sm text-gray-600">
              Total earning: ${data.reduce((sum, item) => sum + item.earning, 0).toFixed(2)}
            </span>
          </div>
        </div>

        {data.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="commission"
                  stackId="1"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                />
                <Area
                  type="monotone"
                  dataKey="earning"
                  stackId="1"
                  stroke="#0ea5e9"
                  fill="#0ea5e9"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <BarChart2 className="mx-auto mb-2 h-12 w-12 text-gray-400" />
              <p>No statistics data available</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
