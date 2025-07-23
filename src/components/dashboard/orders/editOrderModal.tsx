/** @format */

"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Edit,
  Save,
  Loader2,
  AlertCircle,
  User,
  Calendar,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";
import { Order, OrderStatus } from "@/lib/types";
import { useUsers } from "@/lib/hooks/useUserOrders";
import { formatDate } from "@/utils/format-date";
import OrderUserComponent from "@/components/command/orderUserComponent";

interface EditOrderModalProps {
  orderId: string;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function EditOrderModal({
  orderId,
  trigger,
  onSuccess,
}: EditOrderModalProps) {
  const [open, setOpen] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [orderStatus, setOrderStatus] = useState<any>("pending");
  const [paymentStatus, setPaymentStatus] = useState<
    "paid" | "unpaid" | "refunded"
  >("unpaid");
  const [initialLoad, setInitialLoad] = useState(false);

  // Utilisation du hook useUsers
  const {
    getUserOrderById,
    updateGlobalOrder,
    loading,
    error: hookError,
    clearError,
  } = useUsers();

  // Charger les données de la commande
  useEffect(() => {
    if (open && orderId && !initialLoad) {
      loadOrder();
    }
    if (!open) {
      resetForm();
    }
  }, [open, orderId, initialLoad]);

  // Gestion des erreurs du hook
  useEffect(() => {
    if (hookError) {
      toast.error(hookError);
      clearError();
    }
  }, [hookError, clearError]);

  const loadOrder = useCallback(async () => {
    const result = await getUserOrderById(orderId);
    if (result.success && result.order) {
      setOrder(result.order);
      setOrderStatus(result.order.status || "pending");
      setPaymentStatus(result.order.paymentStatus || "unpaid");
      setInitialLoad(true);
    } else {
      toast.error(
        result.error || "Impossible de charger les détails de la commande.",
      );
      setOrder(null);
    }
  }, [orderId, getUserOrderById]);

  const resetForm = useCallback(() => {
    setOrder(null);
    setInitialLoad(false);
    setOrderStatus("pending");
    setPaymentStatus("unpaid");
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!order) {
        toast.error("Aucune commande à modifier.");
        return;
      }

      const updateData: Partial<Order> = {
        status: orderStatus,
        paymentStatus: paymentStatus,
      };

      const result = await updateGlobalOrder(order.id!, updateData);

      if (result.success) {
        toast.success("Commande modifiée avec succès !");
        setOpen(false);
        onSuccess?.();
      } else {
        toast.error(
          result.error || "Erreur lors de la modification de la commande",
        );
      }
    },
    [order, orderStatus, paymentStatus, updateGlobalOrder, onSuccess],
  );

  // Options pour les statuts de commande
  const orderStatusOptions: { value: OrderStatus; label: string }[] = [
    { value: "pending", label: "En attente" },
    { value: "in-progress", label: "En préparation" },
    { value: "completed", label: "Terminée" },
    { value: "canceled", label: "Annulée" },
  ];

  // Options pour les statuts de paiement
  const paymentStatusOptions = [
    { value: "unpaid", label: "Non payée" },
    { value: "paid", label: "Payée" },
    { value: "refunded", label: "Remboursée" },
  ];

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8">
            <Edit className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Modifier la Commande</DialogTitle>
          <DialogDescription>
            {order
              ? `Mise à jour de la commande #${order.orderNumber}`
              : "Chargement..."}
          </DialogDescription>
        </DialogHeader>

        {!order ? (
          <div className="flex items-center justify-center min-h-[300px]">
            {loading ? (
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            ) : (
              <AlertCircle className="h-8 w-8 text-destructive" />
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-6 py-4">
              {/* Section Informations (non modifiable) */}
              <div className="p-4 border rounded-lg bg-muted/50 space-y-3">
                <h3 className="font-semibold">Résumé de la commande</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-start gap-2">
                    <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <span className="font-medium">
                        <OrderUserComponent
                          userId={order.userId}
                          order={order}
                        />
                      </span>
                      <p className="text-muted-foreground">
                        {order.customerPhone}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <span className="font-medium">Date de commande</span>
                      <p className="text-muted-foreground">
                        {order.createdAt ? formatDate(order.createdAt) : "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <DollarSign className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <span className="font-medium">Montant Total</span>
                      <p className="text-muted-foreground font-bold">
                        {order.total?.toFixed(2) || "0.00"} MAD
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Section Statuts (modifiable) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label
                    htmlFor="orderStatus"
                    className="font-medium text-sm">
                    Statut de la commande
                  </label>
                  <Select
                    value={orderStatus}
                    onValueChange={(value) =>
                      setOrderStatus(value as OrderStatus)
                    }>
                    <SelectTrigger id="orderStatus">
                      <SelectValue placeholder="Changer le statut..." />
                    </SelectTrigger>
                    <SelectContent>
                      {orderStatusOptions.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="paymentStatus"
                    className="font-medium text-sm">
                    Statut du paiement
                  </label>
                  <Select
                    value={paymentStatus}
                    onValueChange={(value) =>
                      setPaymentStatus(value as "paid" | "unpaid" | "refunded")
                    }>
                    <SelectTrigger id="paymentStatus">
                      <SelectValue placeholder="Changer le statut..." />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentStatusOptions.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter className="pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}>
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Enregistrer
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
