/** @format */

"use client";

import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
// import { AddGalleryForm } from "./add-gallery-form";
import { restaurantGallery } from "@/lib/types";

interface GalleryPopupButtonProps {
  onGalleryItemAdded?: (newItem: restaurantGallery) => void;
  variant?:
    | "default"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export const GalleryPopupButton: React.FC<GalleryPopupButtonProps> = ({
  onGalleryItemAdded,
  variant = "default",
  size = "default",
  className,
}) => {
  const [open, setOpen] = React.useState(false);

  const handleSuccess = (newItem: restaurantGallery) => {
    // Close the dialog
    setOpen(false);

    // Call the parent callback if provided
    if (onGalleryItemAdded) {
      onGalleryItemAdded(newItem);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={className}>
          <Plus className="h-4 w-4 mr-2" />
          Add Gallery Item
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogTitle>ajoute une image</DialogTitle>
        {/* <AddGalleryForm onSuccess={handleSuccess} /> */}
      </DialogContent>
    </Dialog>
  );
};

export default GalleryPopupButton;
