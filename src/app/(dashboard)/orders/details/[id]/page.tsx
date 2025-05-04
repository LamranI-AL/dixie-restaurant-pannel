/** @format */
import React from "react";

import OrderDetailsComponent from "@/components/dashboard/orders/OrderDetails";

export default async function OrderDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <OrderDetailsComponent orderId={id} />;
}
