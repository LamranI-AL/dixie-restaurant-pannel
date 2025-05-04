/** @format */

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Food } from "@/lib/types";
import { Search, PlusCircle, Edit2, Trash2, Star } from "lucide-react";
import { getAllFoods } from "@/actions/food";
import Image from "next/image";

export default function FoodsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [foodsFetched, setFoods] = useState<Food[]>([]);
  useEffect(() => {
    const fetchFoods = async () => {
      const { success, foods } = await getAllFoods();
      console.log(foods);
      console.log(success);
      if (success) {
        setFoods(foods as Food[]);
      } else {
        console.error("Error fetching categories");
      }
    };
    fetchFoods();
  }, []);
  console.log("foodsFetched", foodsFetched);
  // Filter foods based on search query and active tab
  const filteredFoods = foodsFetched.filter((food) => {
    const matchesSearch = food.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    if (activeTab === "all") return matchesSearch;
    if (activeTab === "in-stock") return matchesSearch && food.isAvailable;
    if (activeTab === "out-of-stock") return matchesSearch && !food.isAvailable;
    return matchesSearch;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line
              x1="16"
              y1="13"
              x2="8"
              y2="13"></line>
            <line
              x1="16"
              y1="17"
              x2="8"
              y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          <h2 className="text-2xl font-bold">Foods</h2>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search foods..."
              className="w-[240px] pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            size="icon">
            <Search className="h-4 w-4" />
          </Button>
          <Button asChild>
            <Link href="/foods/add-new">
              <PlusCircle className="h-4 w-4 mr-1" />
              Add New
            </Link>
          </Button>
        </div>
      </div>

      <Tabs
        defaultValue="all"
        value={activeTab}
        onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Foods</TabsTrigger>
          <TabsTrigger value="in-stock">In Stock</TabsTrigger>
          <TabsTrigger value="out-of-stock">Out of Stock</TabsTrigger>
        </TabsList>
        <TabsContent
          value="all"
          className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFoods.map((food) => (
              <FoodCard
                key={food.id}
                food={food}
              />
            ))}
          </div>
        </TabsContent>
        <TabsContent
          value="in-stock"
          className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFoods
              .filter((f) => f.isAvailable)
              .map((food) => (
                <FoodCard
                  key={food.id}
                  food={food}
                />
              ))}
          </div>
        </TabsContent>
        <TabsContent
          value="out-of-stock"
          className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFoods
              .filter((f) => !f.isAvailable)
              .map((food) => (
                <FoodCard
                  key={food.id}
                  food={food}
                />
              ))}
          </div>
        </TabsContent>
      </Tabs>

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
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line
                x1="21"
                y1="12"
                x2="9"
                y2="12"
              />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
}

interface FoodCardProps {
  food: Food;
}

function FoodCard({ food }: FoodCardProps) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <div className="relative aspect-video overflow-hidden">
        <Image
          width={500}
          height={500}
          src={food.images[0]}
          alt={food.name}
          className="h-full w-full object-cover transition-transform hover:scale-105"
        />
        {food.totalSold > 0 && (
          <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 text-xs rounded">
            Sold: {food.totalSold}
          </div>
        )}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black to-transparent p-4">
          <h3 className="text-lg font-semibold text-white">{food.name}</h3>
        </div>
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-2">
          <div className="font-semibold">${food.price.toFixed(2)}</div>
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-500 mr-1" />
            <span className="text-sm">
              {food.rating > 0 ? food.rating.toFixed(1) : "No ratings"}
            </span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {food.description}
        </p>
        <div className="flex justify-between">
          <Button
            variant="outline"
            size="sm"
            className="text-blue-500">
            <Edit2 className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-red-500">
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
