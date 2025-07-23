/** @format */

"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Eye,
  User,
  Phone,
  Mail,
  MapPin,
  ShoppingCart,
  CreditCard,
  Calendar,
  Package,
  Truck,
  Clock,
  FileText,
  Loader2,
  XCircle,
} from "lucide-react";
import { Order, OrderStatus } from "@/lib/types";
// Assuming the new hook is useUsers and provides getUserOrderById
import { useUsers } from "@/lib/hooks/useUserOrders"; // Adjust path as needed
import OrderUserComponent from "@/components/command/orderUserComponent";

interface ViewOrderModalProps {
  orderId: string;
  trigger?: React.ReactNode;
}

export function ViewOrderModal({ orderId, trigger }: ViewOrderModalProps) {
  const [open, setOpen] = useState(false);
  const [order, setOrder] = useState<any | null>(null);
  // Destructure the new function from the new hook
  const { getUserOrderById, loading, error, clearError } = useUsers(); // Changed from useOrders to useUsers

  useEffect(() => {
    if (open && orderId) {
      loadOrder();
    }
  }, [open, orderId]);

  // Optionally, if you want to display an error toast within the modal
  useEffect(() => {
    if (error) {
      // You might want a more specific toast here, or rely on a global error handler
      console.error("Failed to load order:", error);
      // toast.error(`Erreur: ${error}`); // Uncomment if you want a toast for loading errors
      clearError(); // Clear the error after displaying/handling
    }
  }, [error, clearError]);

  const loadOrder = async () => {
    // Call the new function from the new hook
    const result = await getUserOrderById(orderId);
    if (result.success && result.order) {
      setOrder(result.order);
    } else if (!result.success && result.error) {
      // Handle the error specifically for this modal, e.g., show a message inside
      setOrder(null); // Clear order if there's an error
    }
  };

  const getStatusColor = (status: OrderStatus): string => {
    const statusColors: Record<OrderStatus | any, string> = {
      pending: "bg-blue-100 text-blue-600",
      confirmed: "bg-green-100 text-green-600",
      accepted: "bg-green-100 text-green-600",
      //   cooking: "bg-amber-100 text-amber-600",
      //   "ready-for-delivery": "bg-purple-100 text-purple-600",
      //   "on-the-way": "bg-pink-100 text-pink-600",
      //   delivered: "bg-emerald-100 text-emerald-600",
      //   "dine-in": "bg-indigo-100 text-indigo-600",
      //   refunded: "bg-red-100 text-red-600",
      //   "refund-requested": "bg-red-100 text-red-600",
      //   scheduled: "bg-cyan-100 text-cyan-600",
      //   "payment-failed": "bg-red-100 text-red-600",
      canceled: "bg-gray-100 text-gray-600",
    };
    return statusColors[status] || "bg-gray-100 text-gray-600";
  };

  const getPaymentStatusColor = (
    status: "paid" | "unpaid" | "refunded",
  ): string => {
    const statusColors = {
      paid: "bg-green-100 text-green-600",
      unpaid: "bg-red-100 text-red-600",
      refunded: "bg-amber-100 text-amber-600",
    };
    return statusColors[status] || "bg-gray-100 text-gray-600";
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return "N/A";
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="outline"
            size="sm">
            <Eye className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Détails de la commande
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <span className="ml-2">Chargement des détails...</span>
            </div>
          ) : order ? (
            <div className="space-y-6 p-1">
              {/* En-tête de la commande */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-500">Numéro de commande</p>
                  <p className="text-lg font-bold">{order.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date de commande</p>
                  {order.createdAt
                    ? formatDate(new Date(order.createdAt))
                    : "N/A"}{" "}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Statut</p>
                  <Badge className={`${getStatusColor(order.status)} mt-1`}>
                    {order.status}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Informations Client */}
                <div className="space-y-4">
                  {/* <h3 className="text-lg font-semibold flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Informations Client
                  </h3>
                  <div className="space-y-3 p-4 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">Nom:</span>
                      <span>{order.customerName || "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">Téléphone:</span>
                      <span>{order.customerPhone || "N/A"}</span>
                    </div>
                    {order.customerEmail && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">Email:</span>
                        <span>{order.customerEmail}</span>
                      </div>
                    )}
                    {order.customerAddress && (
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                        <div>
                          <span className="font-medium">Adresse:</span>
                          <p className="text-sm mt-1">
                            {order.customerAddress}
                          </p>
                        </div>
                      </div>
                    )}
                  </div> */}
                  <OrderUserComponent
                    userId={order.userId}
                    order={order}
                  />
                </div>

                {/* Informations de Livraison */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Détails de Livraison
                  </h3>
                  <div className="space-y-3 p-4 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">Type:</span>
                      <Badge variant="outline">
                        {order.orderType || "N/A"}{" "}
                        {/* Changed from OrderStatus to orderType, assuming order.orderType exists */}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">Option:</span>
                      <span>{order.deliveryOption || "N/A"}</span>
                    </div>
                    {order.createdAt && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">Date de Commande:</span>
                        {order.createdAt
                          ? formatDate(new Date(order.createdAt))
                          : "N/A"}{" "}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Articles de la commande */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Articles commandés ({order.items?.length || 0})
                </h3>
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 p-3 text-sm font-medium border-b">
                    <div className="grid grid-cols-6 gap-4">
                      <div className="col-span-3">Article</div>
                      <div className="text-center">Quantité</div>
                      <div className="text-right">Prix unitaire</div>
                      <div className="text-right">Total</div>
                    </div>
                  </div>
                  <div className="divide-y">
                    {order.items?.map((item: any, index: any) => (
                      <div
                        key={item.id || index}
                        className="p-3">
                        <div className="grid grid-cols-6 gap-4 items-center">
                          <div className="col-span-3">
                            <h4 className="font-medium">{item.name}</h4>
                            {item.variations && item.variations.length > 0 && (
                              <p className="text-sm text-gray-500">
                                Variations:{" "}
                                {item.variations
                                  .map((v: any) => v.name)
                                  .join(", ")}
                              </p>
                            )}
                            {item.addons && item.addons.length > 0 && (
                              <p className="text-sm text-gray-500">
                                Suppléments:{" "}
                                {item.addons.map((a: any) => a.name).join(", ")}
                              </p>
                            )}
                          </div>
                          <div className="text-center">
                            <Badge variant="outline">{item.quantity}</Badge>
                          </div>
                          <div className="text-right font-medium">
                            {item.price?.toFixed(2)} MAD
                          </div>
                          <div className="text-right font-semibold">
                            {item.subtotal?.toFixed(2)} MAD
                          </div>
                        </div>
                      </div>
                    )) || (
                      <div className="p-8 text-center text-gray-500">
                        Aucun article dans cette commande
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Résumé financier */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Paiement
                  </h3>
                  <div className="space-y-3 p-4 border rounded-lg">
                    <div className="flex justify-between">
                      <span className="font-medium">Méthode:</span>
                      <span>{order.paymentMethod || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Statut:</span>
                      <Badge
                        className={getPaymentStatusColor(order.paymentStatus)}>
                        {order.paymentStatus}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Résumé financier</h3>
                  <div className="space-y-2 p-4 border rounded-lg">
                    <div className="flex justify-between">
                      <span>Sous-total:</span>
                      <span>{order.subtotal?.toFixed(2) || "0.00"} MAD</span>
                    </div>
                    <div className="flex justify-between">
                      <span>TVA:</span>
                      <span>{order.tax?.toFixed(2) || "0.00"} MAD</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Frais de livraison:</span>
                      <span>{order.deliveryFee?.toFixed(2) || "0.00"} MAD</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Emballage:</span>
                      <span>
                        {order.packagingFee?.toFixed(2) || "0.00"} MAD
                      </span>
                    </div>
                    {order.discount && order.discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Remise:</span>
                        <span>-{order.discount.toFixed(2)} MAD</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span>{order.total?.toFixed(2) || "0.00"} MAD</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {order.notes && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Notes
                  </h3>
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm">{order.notes}</p>
                  </div>
                </div>
              )}

              {/* Informations système */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Informations système</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">ID de la commande</p>
                    <p className="font-mono bg-gray-100 px-2 py-1 rounded">
                      {order.id}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Restaurant ID</p>
                    <p className="font-mono bg-gray-100 px-2 py-1 rounded">
                      {order.restaurantId || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Date de création</p>
                    <p>{formatDate(order.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Dernière modification</p>
                    <p>{formatDate(order.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <XCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Commande non trouvée</p>
              </div>
            </div>
          )}
        </ScrollArea>

        <div className="flex justify-end pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}>
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
