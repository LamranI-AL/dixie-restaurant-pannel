/** @format */
"use client";
import { cn } from "@/lib/utils";
import Image from "next/image";
import logo from "../../../public/logo.png";

interface RestaurantLogoProps {
  className?: string;
}

export default function RestaurantLogo({ className }: RestaurantLogoProps) {
  return (
    <div className={cn("flex items-center justify-center rounded", className)}>
      {/* <Utensils className="h-5 w-5 text-white" /> */}
      <Image
        src={logo}
        alt="logo"
        width={50}
        height={50}
      />
    </div>
  );
}
