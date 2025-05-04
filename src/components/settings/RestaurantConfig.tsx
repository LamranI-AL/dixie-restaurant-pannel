/** @format */

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Store, HelpCircle, SlidersHorizontal, Settings2 } from "lucide-react";
import { RestaurantConfig as ConfigType } from "@/lib/types";

interface RestaurantConfigProps {
  config: ConfigType;
  onUpdate: (config: Partial<ConfigType>) => Promise<void>;
  isUpdating: boolean;
}

export default function RestaurantConfig({
  config,
  onUpdate,
  isUpdating,
}: RestaurantConfigProps) {
  const [localConfig, setLocalConfig] = useState<ConfigType>(config);

  const updateConfig = (key: keyof ConfigType, value: string) => {
    setLocalConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    await onUpdate(localConfig);
  };

  const settingItems = [
    {
      key: "scheduledDelivery",
      label: "Scheduled Delivery",
      tooltip: "Allow customers to schedule deliveries for a future time",
    },
    {
      key: "homeDelivery",
      label: "Home Delivery",
      tooltip: "Offer delivery service to customer's location",
    },
    {
      key: "takeaway",
      label: "Takeaway",
      tooltip: "Allow customers to pick up their orders",
    },
    {
      key: "veg",
      label: "Veg",
      tooltip: "Option to mark foods as vegetarian",
    },
    {
      key: "nonVeg",
      label: "Non Veg",
      tooltip: "Option to mark foods as non-vegetarian",
    },
    {
      key: "subscriptionBasedOrder",
      label: "Subscription Based Order",
      tooltip: "Allow customers to subscribe to regular orders",
    },
    {
      key: "cutlery",
      label: "Cutlery",
      tooltip: "Provide cutlery with orders",
    },
    {
      key: "instantOrder",
      label: "Instant Order",
      tooltip: "Allow customers to place instant orders",
    },
    {
      key: "halalTagStatus",
      label: "Halal Tag Status",
      tooltip: "Option to mark foods as halal",
    },
    {
      key: "extraPackagingCharge",
      label: "Extra Packaging Charge",
      tooltip: "Apply additional charge for packaging",
    },
    {
      key: "dineIn",
      label: "Dine-In",
      tooltip: "Allow customers to dine in at the restaurant",
    },
  ];

  return (
    <Card className="bg-white border-gray-200 mb-6">
      <CardContent className="p-5">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Store className="mr-2 h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-medium text-gray-800">
              Close Restaurant Temporarily
            </h2>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="ml-2 h-4 w-4 text-gray-500" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Temporarily close your restaurant for all orders</p>
              </TooltipContent>
            </Tooltip>
          </div>
          {/* <Switch
            checked={localConfig.temporarilyClosed}
            onCheckedChange={(checked) =>
              updateConfig("temporarilyClosed", checked)
            }
          /> */}
        </div>

        <h3 className="flex items-center mb-4 text-base font-medium text-gray-800">
          <SlidersHorizontal className="mr-2 h-5 w-5 text-gray-600" />
          General Settings
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {settingItems.map((item) => (
            <div
              key={item.key}
              className="flex justify-between items-center">
              <div className="flex items-center">
                <Label
                  htmlFor={item.key}
                  className="text-sm font-medium text-gray-700 cursor-pointer">
                  {item.label}
                </Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="ml-1 h-4 w-4 text-gray-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{item.tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Switch
                id={item.key}
                checked={localConfig[item.key as keyof ConfigType] as boolean}
                onCheckedChange={(checked) =>
                  updateConfig(item.key as keyof ConfigType, checked.toString())
                }
              />
            </div>
          ))}
        </div>

        <h3 className="flex items-center mb-4 text-base font-medium text-gray-800">
          <Settings2 className="mr-2 h-5 w-5 text-gray-600" />
          Basic Settings
        </h3>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Label className="text-sm font-medium text-gray-700">
                Extra Packaging Charge
              </Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="ml-1 h-4 w-4 text-gray-500" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Additional charge for packaging</p>
                </TooltipContent>
              </Tooltip>
            </div>
            {/* <RadioGroup
              // value={localConfig.packagingChargeType}
              // onValueChange={(value) =>
              //   updateConfig("packagingChargeType", value)
              // }
              className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="optional"
                  id="optional"
                />
                <Label htmlFor="optional">Optional</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="mandatory"
                  id="mandatory"
                />
                <Label htmlFor="mandatory">Mandatory</Label>
              </div>
            </RadioGroup> */}
          </div>

          <div className="mb-4">
            <Label
              htmlFor="packagingChargeAmount"
              className="block text-sm font-medium text-gray-700 mb-1">
              Extra Packaging Charge Amount
            </Label>
            <Input
              id="packagingChargeAmount"
              type="number"
              // value={localConfig.packagingChargeAmount}
              // onChange={(e) =>
              //   updateConfig("packagingChargeAmount", Number(e.target.value))
              // }
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
              <Label
                htmlFor="minimumOrderAmount"
                className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Order Amount
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="ml-1 inline h-4 w-4 text-gray-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Minimum order amount required for checkout</p>
                  </TooltipContent>
                </Tooltip>
              </Label>
              <Input
                id="minimumOrderAmount"
                type="number"
                // value={localConfig.minimumOrderAmount}
                // onChange={(e) =>
                //   updateConfig("minimumOrderAmount", Number(e.target.value))
                // }
                className="w-full"
              />
            </div>

            <div>
              <Label
                htmlFor="minimumDineInTime"
                className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Time For Dine-In Order
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="ml-1 inline h-4 w-4 text-gray-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Minimum time required for dine-in orders</p>
                  </TooltipContent>
                </Tooltip>
              </Label>
              <div className="flex">
                <Input
                  id="minimumDineInTime"
                  type="number"
                  // value={localConfig.minimumDineInTime}
                  // onChange={(e) =>
                  //   updateConfig("minimumDineInTime", Number(e.target.value))
                  // }
                  className="w-full rounded-r-none"
                />
                <Select
                // value={localConfig.minimumDineInTimeUnit}
                // onValueChange={(value) =>
                //   updateConfig("minimumDineInTimeUnit", value)
                // }
                >
                  <SelectTrigger className="w-24 rounded-l-none border-l-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="min">Min</SelectItem>
                    <SelectItem value="hour">Hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <Label className="text-sm font-medium text-gray-700">
                GST
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="ml-1 inline h-4 w-4 text-gray-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Apply Goods and Services Tax</p>
                  </TooltipContent>
                </Tooltip>
              </Label>
              <Switch
              // checked={localConfig.gstEnabled}
              // onCheckedChange={(checked) => updateConfig("gstEnabled", checked)}
              />
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-1">
              <Label className="block text-sm font-medium text-gray-700">
                Cuisine
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="ml-1 inline h-4 w-4 text-gray-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Categories of cuisine offered</p>
                  </TooltipContent>
                </Tooltip>
              </Label>
            </div>
            <div className="relative">
              <div className="flex flex-wrap gap-2 p-2 border border-gray-300 rounded-md mb-1">
                {/* {localConfig?.cuisines.map((cuisine, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 px-2 py-1 rounded text-sm flex items-center"
                  >
                    {cuisine}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-1 h-4 w-4 p-0 text-gray-500 hover:text-gray-700"
                      onClick={() => {
                        const newCuisines = [...localConfig.cuisines];
                        newCuisines.splice(index, 1);
                        updateConfig("cuisines", newCuisines);
                      }}
                    >
                      <span className="sr-only">Remove</span>
                      ✕
                    </Button>
                  </span>
                ))} */}
                <Input
                  placeholder="Add cuisine and press Enter"
                  className="border-0 p-0 h-8 flex-grow text-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const target = e.target as HTMLInputElement;
                      const value = target.value.trim();
                      // if (value && !localConfig.cuisines.includes(value)) {
                      //   updateConfig("cuisines", [...localConfig.cuisines, value]);
                      //   target.value = "";
                      // }
                    }
                  }}
                />
              </div>
            </div>
          </div>

          <div>
            <Label
              htmlFor="tags"
              className="block text-sm font-medium text-gray-700 mb-1">
              Tags
            </Label>
            <Input
              id="tags"
              placeholder="Enter tags separated by commas"
              className="w-full"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            variant="outline"
            className="mr-2"
            onClick={() => setLocalConfig(config)}>
            Reset
          </Button>
          <Button
            onClick={handleSave}
            disabled={isUpdating}>
            {isUpdating ? "Updating..." : "Update"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
