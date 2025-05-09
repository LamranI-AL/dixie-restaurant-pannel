/** @format */
"use client";
import { getUserByUid } from "@/actions/user";
import { User } from "@/lib/types";
import React, { useEffect, useState } from "react";

type Props = {
  userId: string;
};

function OrderUserComponent({ userId }: Props) {
  const [userOrder, setUserOrder] = useState<User>();
  useEffect(() => {
    const getUserOrder = async () => {
      const { success, user } = await getUserByUid(userId);
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
      <div>Name:{userOrder?.displayName}</div>
      <div className="mask-radial-from-neutral-950 text-teal-600">
        Email :{userOrder?.email}
      </div>
    </div>
  );
}

export default OrderUserComponent;
