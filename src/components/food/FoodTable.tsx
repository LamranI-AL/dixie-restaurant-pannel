/** @format */

import { useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, PackageX, PlusCircle } from "lucide-react";
import { Link } from "wouter";
import { Food } from "@/lib/types";
import Image from "next/image";

interface FoodTableProps {
  foods: Food[];
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, status: boolean) => void;
  onToggleRecommended: (id: string, recommended: boolean) => void;
}

export default function FoodTable({
  foods,
  onDelete,
  onToggleStatus,
  onToggleRecommended,
}: FoodTableProps) {
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const columns = [
    {
      key: "id",
      header: "SI",
      cell: (food: Food, index: number) => index + 1,
      className: "w-14",
    },
    {
      key: "name",
      header: "Name",
      cell: (food: Food) => (
        <div className="flex items-center">
          <Image
            width={400}
            height={400}
            src={food.image! || "/images/placeholder.png"}
            alt={food.name}
            className="w-10 h-10 object-cover rounded mr-3"
          />
          <div>{food.name}</div>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      cell: (food: Food) => (
        <Badge
          variant="outline"
          className="font-normal">
          {food.categoryId}
        </Badge>
      ),
    },
    {
      key: "price",
      header: "Price",
      cell: (food: Food) => food.price,
    },
    {
      key: "recommended",
      header: "Recommended",
      cell: (food: Food) => (
        <Switch
          checked={food.rating > 4}
          onCheckedChange={(checked) => onToggleRecommended(food.id, checked)}
        />
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (food: Food) => (
        <Switch
          checked={food.price < 20}
          onCheckedChange={(checked) => onToggleStatus(food.id, checked)}
        />
      ),
    },
    {
      key: "actions",
      header: "Action",
      cell: (food: Food) => (
        <div className="flex space-x-2">
          <Link href={`/foods/edit/${food.id}`}>
            <Button
              size="icon"
              variant="outline"
              className="h-8 w-8 p-0 bg-blue-100 text-blue-600 border-blue-200 hover:bg-blue-200 hover:text-blue-700">
              <Pencil className="h-4 w-4" />
            </Button>
          </Link>
          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8 p-0 bg-red-100 text-red-600 border-red-200 hover:bg-red-200 hover:text-red-700"
            onClick={() => onDelete(food.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 justify-end">
        <Button
          className="bg-red-500 hover:bg-red-600 text-white"
          variant="destructive">
          <PackageX className="mr-2 h-4 w-4" />
          Out Of Stock Foods
        </Button>
        <Link href="/foods/add">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Food
          </Button>
        </Link>
      </div>

      <DataTable
        data={foods}
        columns={columns as any}
        searchPlaceholder="Ex: Search Food Name"
        searchKey="name"
        filterOptions={[
          {
            key: "category",
            options: [
              { label: "All categories", value: "all" },
              { label: "Italian", value: "Italian" },
              { label: "Varieties", value: "Varieties" },
              { label: "Fast Food", value: "Fast Food" },
            ],
          },
          {
            key: "status",
            options: [
              { label: "All", value: "all" },
              { label: "Active", value: "active" },
              { label: "Inactive", value: "inactive" },
            ],
          },
        ]}
        className="bg-white p-4 rounded-lg border border-gray-200"
      />
    </div>
  );
}
