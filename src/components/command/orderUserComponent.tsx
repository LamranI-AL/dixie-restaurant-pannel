/** @format */
"use client";
import { getUserByUid } from "@/actions/user";
import { useUsers } from "@/lib/hooks/useUserOrders";
import { Order, User } from "@/lib/types";
import { Mail, MapPin, Phone, User2 } from "lucide-react";
import React, { useEffect, useState } from "react";

type Props = {
  userId: string;
  order: any;
};

export default function OrderUserComponent({ userId, order }: Props) {
  const [userOrder, setUserOrder] = useState<User>();
  const { getUserById } = useUsers();
  useEffect(() => {
    const getUserOrder = async () => {
      const { success, user } = await getUserById(userId);
      console.log(user);
      if (success) {
        setUserOrder(user as User);
      } else {
        console.error("Error fetching user");
      }
    };
    getUserOrder();
  }, []);
  return (
    <div>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <User2 className="h-5 w-5" />
          Informations Client
        </h3>
        <div className="space-y-3 p-4 border rounded-lg">
          <div className="flex items-center gap-2">
            <User2 className="h-4 w-4 text-gray-500" />
            <span className="font-medium">Nom:</span>
            <span>{userOrder?.displayName || "N/A"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-gray-500" />
            <span className="font-medium">Téléphone:</span>
            <span>{order.customerPhone || "N/A"}</span>
          </div>
          {userOrder?.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-500" />
              <span className="font-medium">Email:</span>
              <span>{userOrder?.email}</span>
            </div>
          )}
          {order.deliveryLocation && (
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
              <div>
                <span className="font-medium">Adresse:</span>
                <p className="text-sm mt-1">{order.deliveryLocation.address}</p>
                <p className="text-sm mt-1">
                  {order.deliveryLocation.latitude}
                </p>
                <p className="text-sm mt-1">
                  {order.deliveryLocation.longitude}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
