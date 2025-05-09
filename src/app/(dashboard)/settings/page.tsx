/** @format */
"use client"; // Ajoutez cette directive pour convertir la page en composant client

import { addRestaurant } from "@/actions/restaurant";
import {
  Restaurant,
  RestaurantInitializer,
} from "@/components/settings/initalisation";
import React from "react";
// import { RestaurantManagement } from "./edite/page";

function Page() {
  const getRestoConfig = async (data: Restaurant) => {
    console.log(data);
    // Ici, vous pouvez ajouter votre logique pour sauvegarder les données
    // Par exemple, une requête API pour créer le restaurant*
    try {
      await addRestaurant(data as any);
    } catch (error) {
      alert(error);
    }
  };

  return (
    <div>
      <RestaurantInitializer onInitComplete={getRestoConfig} />
    </div>
  );
}

export default Page;
