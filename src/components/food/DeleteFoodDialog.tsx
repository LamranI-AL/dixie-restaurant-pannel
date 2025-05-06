/** @format */
"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Food } from "@/lib/types";
import { useState } from "react";
import { Loader2, Trash2, AlertCircle } from "lucide-react";
import Image from "next/image";

interface DeleteFoodDialogProps {
  food: Food;
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteFoodDialog({
  food,
  open,
  onClose,
  onConfirm,
}: DeleteFoodDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      onConfirm();
    } catch (error) {
      console.error("Error deleting food:", error);
    } finally {
      setIsDeleting(false);
      onClose();
    }
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={onClose}>
      <AlertDialogContent className="max-w-[450px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-red-600 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            Confirmer la suppression
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <p>
              Êtes-vous sûr de vouloir supprimer <strong>"{food.name}"</strong>?
              Cette action est irréversible et supprimera définitivement ce plat
              de votre menu.
            </p>

            {food.image && (
              <div className="flex items-center mt-2 border rounded-md p-2 bg-gray-50">
                <div className="relative h-16 w-16 overflow-hidden rounded-md">
                  <Image
                    src={food.image}
                    alt={food.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="ml-3">
                  <p className="font-medium">{food.name}</p>
                  <p className="text-sm text-gray-500">
                    {food.price.toFixed(2)} €
                  </p>
                </div>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            disabled={isDeleting}>
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Suppression...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
