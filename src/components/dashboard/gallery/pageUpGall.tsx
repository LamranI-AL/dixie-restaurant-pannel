/** @format */

"use client";

import React from "react";
// import { RestaurantGallery } from "@/components/restaurant-gallery";
// import { GalleryPopupButton
import { Toaster } from "sonner";
// import GalleryPopupButton from "./GalleryPopupButton";
import RestaurantGallery from "./add-gallery-form";
// import RestaurantGallery from "./galleryList";

export default function GalleryPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Restaurant Gallery</h1>
            <p className="text-gray-500 mt-1">
              Showcase your restaurant's ambiance, food, and special moments
            </p>
          </div>
          {/* <GalleryPopupButton /> */}
        </header>

        <main>
          <RestaurantGallery />
        </main>
      </div>

      {/* Toast notifications */}
      <Toaster position="top-right" />
    </div>
  );
}
