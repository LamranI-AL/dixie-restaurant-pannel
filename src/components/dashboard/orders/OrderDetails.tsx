/** @format */
"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Order, OrderStatus } from "@/lib/types";
import Image from "next/image";
import {
  Printer,
  PenLine,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Edit,
} from "lucide-react";
import { getOrderById, updateOrderStatus } from "@/actions/ordres";

// Fonction utilitaire pour formater les prix
const formatPrice = (price: any): string => {
  if (price === undefined || price === null) return "0.00";

  // Si c'est déjà un nombre, on le convertit directement
  if (typeof price === "number") {
    return price.toFixed(2);
  }

  // Si c'est une chaîne ou un autre type, on essaie de le convertir en nombre
  try {
    const numPrice = parseFloat(String(price));
    return isNaN(numPrice) ? "0.00" : numPrice.toFixed(2);
  } catch (error) {
    return "0.00";
  }
};

// Fonction utilitaire pour formater les dates
const formatDateFn = (date: any) => {
  if (!date) return "Date non disponible";

  let d: Date;

  // Si c'est un Timestamp Firebase (avec méthode toDate())
  if (date && typeof date === "object" && date.seconds !== undefined) {
    d = new Date(date.seconds * 1000);
  }
  // Si c'est déjà un objet Date
  else if (date instanceof Date) {
    d = date;
  }
  // Si c'est une chaîne ou un nombre
  else if (typeof date === "string" || typeof date === "number") {
    d = new Date(date);
  }
  // Gestion des cas imprévus
  else {
    return "Format de date invalide";
  }

  const day = d.getDate().toString().padStart(2, "0");
  const month = new Intl.DateTimeFormat("fr", { month: "short" }).format(d);
  const year = d.getFullYear();
  const hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 || 12;

  return (
    <div>
      <div>{`${day} ${month} ${year}`}</div>
      <div className="text-muted-foreground text-xs">{`${formattedHours}:${minutes} ${ampm}`}</div>
    </div>
  );
};

interface OrderDetailsProps {
  orderId: string;
}

export default function OrderDetailsComponent({ orderId }: OrderDetailsProps) {
  //   const orderId = params.id;
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [orderStatus, setOrderStatus] = useState<OrderStatus | "">("");

  useEffect(() => {
    async function fetchOrder() {
      setLoading(true);
      try {
        const result = await getOrderById(orderId);
        if (result.success) {
          // Cloner l'objet pour éviter les problèmes de sérialisation
          const sanitizedOrder = JSON.parse(JSON.stringify(result.order));
          setOrder(sanitizedOrder);
          setOrderStatus(sanitizedOrder?.orderStatus || "");
        }
      } catch (error) {
        console.error("Erreur lors du chargement de la commande:", error);
      } finally {
        setLoading(false);
      }
    }

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const handleStatusChange = async (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const newStatus = e.target.value as OrderStatus;
    setOrderStatus(newStatus);

    if (order) {
      try {
        const result = await updateOrderStatus(order.id, newStatus);
        if (result.success) {
          // Success notification could be added here
          console.log("Statut mis à jour avec succès");
        }
      } catch (error) {
        console.error("Erreur lors de la mise à jour du statut:", error);
      }
    }
  };

  const handleEditOrder = () => {
    router.push(`/orders/edit/${orderId}`);
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  const handleAssignDelivery = () => {
    console.log("Assign delivery person");
  };

  const handleAddReference = () => {
    console.log("Add reference code");
  };

  const handleAddDeliveryProof = () => {
    console.log("Add delivery proof");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        Chargement des détails de la commande...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex justify-center items-center h-96">
        Commande non trouvée
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <div className="bg-gray-100 p-2 rounded">
            <ChevronLeft className="h-5 w-5 text-gray-500" />
          </div>
          <h1 className="text-xl font-semibold">Détails de la commande</h1>
          <div className="bg-gray-100 p-2 rounded">
            <ChevronRight className="h-5 w-5 text-gray-500" />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleEditOrder}
            className="flex items-center gap-2 px-4 py-2 border border-blue-500 text-blue-500 rounded-md hover:bg-blue-50">
            <Edit size={16} />
            Modifier la commande
          </button>
          <button
            onClick={handlePrintInvoice}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
            <Printer size={16} />
            Imprimer la facture
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="col-span-2">
          <div className="border-b pb-4 mb-4">
            <h2 className="text-lg font-semibold mb-2">
              Commande #{order.orderNumber}
            </h2>
            <div className="text-gray-600 text-sm">
              Date de commande: {formatDateFn(order.orderDate)}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm font-medium">Restaurant:</span>
              <span className="text-sm text-blue-500">
                {order.restaurantId}
              </span>
            </div>
            <button className="flex items-center gap-1 text-xs text-blue-500 mt-2 border border-blue-500 rounded-md px-2 py-1">
              <MapPin size={12} />
              Afficher l'emplacement sur la carte
            </button>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium mb-3">Configuration de la commande</h3>

          <div className="grid grid-cols-2 gap-y-3 text-sm">
            <div className="text-gray-600">Type de commande:</div>
            <div>{order.OrderStatus}</div>

            <div className="text-gray-600">Statut:</div>
            <div className="flex items-center">
              <select
                value={orderStatus}
                onChange={handleStatusChange}
                className="border rounded-md py-1 px-2 text-sm w-full">
                <option value="pending">En attente</option>
                <option value="confirmed">Confirmée</option>
                <option value="preparing">En préparation</option>
                <option value="ready">Prête</option>
                <option value="delivering">En livraison</option>
                <option value="completed">Terminée</option>
                <option value="cancelled">Annulée</option>
              </select>
            </div>

            <div className="text-gray-600">Moyen de paiement:</div>
            <div>{order.paymentMethod}</div>

            <div className="text-gray-600">Statut du paiement:</div>
            <div>
              <span
                className={`px-2 py-1 rounded-full text-xs ${
                  order.paymentStatus === "paid"
                    ? "bg-green-100 text-green-800"
                    : order.paymentStatus === "refunded"
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}>
                {order.paymentStatus === "paid"
                  ? "Payé"
                  : order.paymentStatus === "refunded"
                  ? "Remboursé"
                  : "Non payé"}
              </span>
            </div>

            <div className="text-gray-600">Code de référence:</div>
            <div className="flex items-center gap-2">
              <span>{order.notes || "Aucun"}</span>
              <button
                onClick={handleAddReference}
                className="text-xs bg-blue-500 text-white px-2 py-1 rounded">
                Ajouter
              </button>
            </div>

            <div className="text-gray-600">Service de table:</div>
            <div>
              {parseFloat(String(order.packagingFee || 0)) > 0 ? "Oui" : "Non"}
            </div>
          </div>

          <div className="mt-4">
            <button
              onClick={handleAssignDelivery}
              className="w-full bg-blue-500 text-white py-2 rounded-md flex items-center justify-center gap-2">
              <span>Assigner un livreur</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="col-span-2">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                    N°
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Détails de l'article
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Suppléments
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prix
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {order.items && Array.isArray(order.items) ? (
                  order.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {item.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {item.price && (
                                <div>{formatPrice(item.price)} MAD</div>
                              )}
                              <div>Qté: {item.quantity}</div>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.addons && Array.isArray(item.addons)
                          ? item.addons.map((addon, idx) => (
                              <div key={idx}>
                                {addon.name} ({formatPrice(addon.price)} MAD)
                              </div>
                            ))
                          : null}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {/* {formatPrice(
                          item.totalPrice ||
                            parseFloat(String(item.price || 0)) *
                              parseFloat(String(item.quantity || 1)),
                        )}{" "} */}
                        100 MAD
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4}>Aucun article trouvé</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-6 border-t pt-4 grid grid-cols-2">
            <div></div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Montant total des articles:</span>
                <span>{formatPrice(order.subtotal)} MAD</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Coût des suppléments:</span>
                <span className="text-gray-600">
                  {formatPrice(
                    parseFloat(String(order.subtotal || 0)) -
                      parseFloat(String(order.total || 0)) +
                      parseFloat(String(order.tax || 0)) +
                      parseFloat(String(order.deliveryFee || 0)),
                  )}{" "}
                  MAD
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Sous-total:</span>
                <span>{formatPrice(order.subtotal)} MAD</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Remise:</span>
                <span className="text-red-500">
                  - {formatPrice(order.discount)} MAD
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Remise coupon:</span>
                <span className="text-red-500">- 0.00 MAD</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>TVA:</span>
                <span>+ {formatPrice(order.tax)} MAD</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Pourboire:</span>
                <span>+ 0.00 MAD</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Frais de livraison:</span>
                <span>+ {formatPrice(order.deliveryFee)} MAD</span>
              </div>
              <div className="flex justify-between font-semibold border-t pt-2 mt-2">
                <span>Total:</span>
                <span>{formatPrice(order.total)} MAD</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium flex items-center gap-2">
                <span>Informations client</span>
              </h3>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <div className="h-12 w-12 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                {/* Client avatar would go here */}
              </div>
              <div>
                <div className="font-medium">{order.customerName}</div>
                <div className="text-sm text-gray-500">17 Commandes</div>
              </div>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex gap-2">
                <span className="text-gray-500">Tél:</span>
                <span>{order.customerPhone}</span>
              </div>
              {order.customerEmail && (
                <div className="flex gap-2">
                  <span className="text-gray-500">Email:</span>
                  <span>{order.customerEmail}</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium flex items-center gap-2">
                <span>Informations de livraison</span>
              </h3>
              <button className="text-blue-500">
                <PenLine size={16} />
              </button>
            </div>
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-3 gap-1">
                <span className="text-gray-500">Nom:</span>
                <span className="col-span-2">{order.customerName}</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <span className="text-gray-500">Contact:</span>
                <span className="col-span-2">{order.customerPhone}</span>
              </div>
              {order.customerAddress && (
                <>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-gray-500">Adresse:</span>
                    <span className="col-span-2">{order.customerAddress}</span>
                  </div>
                </>
              )}
              <div className="pt-2 mt-2 border-t border-gray-200 text-center">
                <p className="text-gray-500">Non défini</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium flex items-center gap-2">
                <span>Preuve de livraison</span>
              </h3>
              <button
                onClick={handleAddDeliveryProof}
                className="text-xs bg-blue-500 text-white px-2 py-1 rounded">
                Ajouter
              </button>
            </div>
            <div className="h-24 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
              <p className="text-sm text-gray-500">
                Aucune preuve de livraison
              </p>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium flex items-center gap-2">
                <span>Informations du restaurant</span>
              </h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-3 gap-1">
                <span className="text-gray-500">Restaurant:</span>
                <span className="col-span-2">{order.restaurantId}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
