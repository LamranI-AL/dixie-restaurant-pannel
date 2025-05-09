/** @format */

import { getAllFoods } from "@/actions/food";
import { FoodTable } from "@/components/food/FoodTable";
import { Food } from "@/lib/types";
import React from "react";

async function page() {
  const foods = await getAllFoods();
  return (
    <div>
      <FoodTable foods={foods.foods as Food[]} />
    </div>
  );
}

export default page;
