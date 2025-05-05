/** @format */

// import DeliverymenList from "@/components/dashboard/deliveryman/DeliverymenList";
import { getAllDeliverymen } from "@/actions/deliveryman";
import { DeliverymenTable } from "@/components/dashboard/deliveryman/DeliverymenList";
import { Deliveryman } from "@/lib/types";
import React from "react";

async function page() {
  const deliverymens = await getAllDeliverymen();
  return (
    <div>
      <h1 className=" text-2xl font-bold mb-4 text-center">
        List des livreurs
      </h1>
      <DeliverymenTable data={deliverymens.deliverymen as Deliveryman[]} />
    </div>
  );
}

export default page;
