/** @format */

"use client";

import React from "react";
import { useRouter } from "next/navigation";
import UserFavoriteFoods from "@/components/food/UserFavoriteFoods";

const FavoriteFoodsPage: React.FC = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Aliments Favoris</h1>
          <button
            onClick={() => router.back()}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md transition-all">
            Retour
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <UserFavoriteFoods />
        </div>
      </div>
    </div>
  );
};

export default FavoriteFoodsPage;
