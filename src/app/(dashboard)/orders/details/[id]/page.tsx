/** @format */
import React from "react";

import OrderDetailsComponent from "@/components/dashboard/orders/OrderDetails";

interface OrderDetailsProps {
  params: {
    id: string;
  };
}

export default async function OrderDetails({ params }: OrderDetailsProps) {
  const id = await params.id;
  return <OrderDetailsComponent orderId={id} />;
}
