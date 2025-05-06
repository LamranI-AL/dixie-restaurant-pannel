/** @format */
import React from "react";

import FoodDetailsComponent from "@/components/food/FoodDetails";

export default async function FoodDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <FoodDetailsComponent foodId={id} />;
}
