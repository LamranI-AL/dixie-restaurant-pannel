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
import { Trash2, Loader2, AlertTriangle, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { useUsers } from "@/lib/hooks/useUserOrders";

interface DeleteOrderModalProps {
  orderId: string;
  userId?: string; // Optionnel maintenant car deleteOrderById trouve automatiquement
  orderNumber: string;
  customerName?: string;
  total?: number;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function DeleteOrderModal({
  orderId,
  userId,
  orderNumber,
  customerName,
  total,
  trigger,
  onSuccess,
}: DeleteOrderModalProps) {
  const [open, setOpen] = useState(false);

  // Utilisation de la nouvelle fonction deleteOrderById
  const { deleteOrderById, loading } = useUsers();

  const handleDelete = async () => {
    try {
      console.log(`[DeleteOrderModal] Attempting to delete order: ${orderId}`);

      // Utiliser la nouvelle fonction deleteOrderById qui gère tout automatiquement
      const result = await deleteOrderById(orderId);

      if (result.success) {
        toast.success(result.message || "Commande supprimée avec succès !");
        setOpen(false);
        onSuccess?.();
        console.log(`[DeleteOrderModal] Order ${orderId} deleted successfully`);
      } else {
        toast.error(
          result.error || "Erreur lors de la suppression de la commande",
        );
        console.error(
          `[DeleteOrderModal] Failed to delete order ${orderId}:`,
          result.error,
        );
      }
    } catch (error) {
      console.error("[DeleteOrderModal] Error deleting order:", error);
      toast.error("Une erreur est survenue lors de la suppression");
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
          <AlertDialogDescription className="space-y-3">
            <div className="flex items-center gap-2 text-gray-700">
              <ShoppingCart className="h-4 w-4" />
              <span>
                Vous êtes sur le point de supprimer définitivement la commande :
              </span>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg border-l-4 border-red-500">
              <div className="space-y-1 text-sm">
                <p>
                  <strong>ID :</strong> {orderId}
                </p>
                <p>
                  <strong>Numéro :</strong> {orderNumber}
                </p>
                {customerName && (
                  <p>
                    <strong>Client :</strong> {customerName}
                  </p>
                )}
                {total && (
                  <p>
                    <strong>Montant :</strong> {total.toFixed(2)} MAD
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-red-600 font-medium">
                ⚠️ Cette action supprimera définitivement et de manière
                irréversible :
              </p>
              <ul className="text-sm text-red-600 ml-4 space-y-1">
                <li>
                  • <strong>Toutes les informations</strong> de la commande
                </li>
                <li>
                  • <strong>Les détails des articles</strong> commandés
                </li>
                <li>
                  • <strong>L'historique complet</strong> des modifications
                </li>
                <li>
                  • <strong>Les informations de paiement</strong> et de
                  facturation
                </li>
                <li>
                  • <strong>Les données de livraison</strong> et coordonnées
                </li>
                <li>
                  • <strong>Tous les logs</strong> et traces de cette commande
                </li>
              </ul>
            </div>

            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">
                <strong>⚠️ ATTENTION :</strong> Cette suppression est{" "}
                <strong>physique et définitive</strong>. La commande sera
                complètement effacée de la base de données et ne pourra pas être
                récupérée.
              </p>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>💡 Alternative :</strong> Si vous souhaitez simplement
                annuler la commande sans la supprimer, utilisez plutôt la
                fonction "Modifier" pour changer son statut à "Annulée".
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel disabled={loading}>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600 text-white">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Suppression en cours...
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
