/** @format */

import { sendDeliverymanApprovalEmail } from "@/emails/deliveryman-approval";
import { Deliveryman } from "@/lib/types";
import React from "react";

async function page() {
  const newDeliverymen: Deliveryman = {
    age: 22,
    birthdate: "",
    email: "lamraniotman000@gmail.com",
    firstName: "othmane",
    lastName: "alaoui",
    identityNumber: "yy",
    identityType: "idcart",
    isApproved: false,
    phone: "0666187356",
    status: "inactive",
    vehicle: "moto",
    zone: "",
    createdAt: new Date(""),
    updatedAt: new Date(""),
    identityImageUrl: "",
    licenseFile: "",
    profileImageUrl: "",
    password: "12345678",
    id: "",
  };
  const { success } = await sendDeliverymanApprovalEmail(
    "lO2kZ1m9q32OxlBjlJ4R",
  );
  console.log("succes is " + success);
  return <div>test</div>;
}

export default page;
