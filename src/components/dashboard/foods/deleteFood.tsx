/** @format */

"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useFoods } from "@/lib/hooks/useFoods";

interface DeleteFoodModalProps {
  foodId: string;
  foodName: string;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function DeleteFoodModal({
  foodId,
  foodName,
  trigger,
  onSuccess,
}: DeleteFoodModalProps) {
  const [open, setOpen] = useState(false);
  const { deleteFood, loading } = useFoods();

  const handleDelete = async () => {
    const result = await deleteFood(foodId);

    if (result.success) {
      toast.success("Plat supprimé avec succès !");
      setOpen(false);
      onSuccess?.();
    } else {
      toast.error(result.error || "Erreur lors de la suppression du plat");
    }
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {trigger || (
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 hover:text-red-700">
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Confirmer la suppression
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Êtes-vous sûr de vouloir supprimer le plat{" "}
              <span className="font-semibold">"{foodName}"</span> ?
            </p>
            <p className="text-sm text-red-600">
              Cette action est irréversible et supprimera définitivement :
            </p>
            <ul className="text-sm text-red-600 ml-4 space-y-1">
              <li>• Toutes les informations du plat</li>
              <li>• Les variations et suppléments</li>
              <li>• Les images associées</li>
              <li>• L'historique des ventes</li>
            </ul>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Suppression...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer définitivement
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
