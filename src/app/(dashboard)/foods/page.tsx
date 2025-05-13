/** @format */
import { getAllFoods } from "@/actions/food";
import { FoodTable } from "@/components/food/FoodTable";
import { Food } from "@/lib/types";
import React from "react";

async function page() {
  try {
    const foodsResponse = await getAllFoods();

    // Vérification supplémentaire des données
    const foods = (foodsResponse.foods || []).filter((food) => food !== null);

    // Log pour débogage (à enlever en production)
    console.log("Données traitées:", foods.length, "aliments");

    return (
      <div>
        <FoodTable foods={foods as Food[]} />
      </div>
    );
  } catch (error) {
    console.error("Erreur lors du chargement des aliments:", error);

    // Afficher un composant d'erreur
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-red-600 mb-2">
          Erreur lors du chargement des données
        </h2>
        <p className="text-gray-600">
          Impossible de charger la liste des aliments. Veuillez rafraîchir la
          page ou contacter l'administrateur.
        </p>
      </div>
    );
  }
}

export default page;
