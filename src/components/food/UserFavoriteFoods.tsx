/** @format */

"use client";

import React, { useEffect, useState } from "react";
// import { getAllUsersFavorites
import Image from "next/image";
import { getAllUsersFavorites } from "@/actions/user";
import { Food, User } from "@/lib/types";

interface FavoriteFood {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  cuisineId: string;
  userId: string;
  userName: string;
  createdAt: Date;
}

interface FavoritesGrouped {
  [foodId: string]: {
    food: Food;
    users: User[];
  };
}

const UserFavoriteFoods: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [groupedFavorites, setGroupedFavorites] = useState<FavoritesGrouped>(
    {},
  );

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setLoading(true);
        const response = await getAllUsersFavorites();
        // console.log(response.favorites);

        if (response.success && response.favorites) {
          // Grouper les favoris par aliment
          const grouped: FavoritesGrouped = {};

          response.favorites.forEach((favorite: FavoriteFood) => {
            // Identifiant unique pour l'aliment (peut être foodId si disponible)
            const foodId = favorite.id;

            if (!grouped[foodId]) {
              // Premier utilisateur à ajouter cet aliment aux favoris
              grouped[foodId] = {
                food: {
                  id: foodId,
                  name: favorite.name,
                  description: favorite.description,
                  price: favorite.price,
                  image: favorite.image,
                  cuisineId: favorite.cuisineId,
                } as any,
                users: [],
              };
            }

            // Ajouter l'utilisateur à la liste des utilisateurs qui ont aimé cet aliment
            const userExists = grouped[foodId].users.some(
              (user) => user.id === favorite.userId,
            );
            if (!userExists) {
              grouped[foodId].users.push({
                id: favorite.userId,
                displayName: favorite.userName || "Utilisateur inconnu",
              } as any);
            }
          });

          setGroupedFavorites(grouped);
        } else {
          setError("Impossible de charger les favoris");
        }
      } catch (err) {
        setError("Une erreur est survenue lors du chargement des favoris");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        Chargement des favoris...
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }
  // console.log(groupedFavorites)

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">
        Aliments favoris des utilisateurs
      </h1>

      {Object.keys(groupedFavorites).length === 0 ? (
        <p className="text-gray-500">
          Aucun aliment n'a été ajouté aux favoris.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.values(groupedFavorites).map((item) => (
            <div
              key={item.food.id}
              className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative h-48">
                {item.food.image ? (
                  <Image
                    src={item.food.image}
                    alt={item.food.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">Aucune image</span>
                  </div>
                )}
              </div>

              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">{item.food.name}</h2>
                <p className="text-gray-600 mb-2 text-sm line-clamp-2">
                  {item.food.description}
                </p>
                <p className="text-lg font-bold text-primary mb-3">
                  {item.food.price.toFixed(2)} MAD
                </p>

                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-1">
                    {item.users.length}{" "}
                    {item.users.length === 1
                      ? "utilisateur a aimé"
                      : "utilisateurs ont aimé"}
                  </h3>
                  <div className="flex flex-wrap gap-1">
                    {item.users.map((user) => (
                      <span
                        key={user.id}
                        className="inline-block bg-primary-50 text-primary-700 text-xs rounded-full px-2 py-1">
                        {user.displayName}
                        {user.email}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserFavoriteFoods;
