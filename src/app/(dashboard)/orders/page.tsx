/** @format */

"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Search, Package, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Order, OrderStatus } from "@/lib/types";
import { useUsers } from "@/lib/hooks/useUserOrders";
import { formatDate } from "@/utils/format-date";

// --- Modales ---
import { AddOrderModal } from "@/components/dashboard/orders/addOrderModal";
import { ViewOrderModal } from "@/components/dashboard/orders/viewOrderModal";
import { EditOrderModal } from "@/components/dashboard/orders/editOrderModal";
import { DeleteOrderModal } from "@/components/dashboard/orders/deleteOrder";

// --- Fonctions d'aide pour les couleurs des badges ---
const getOrderStatusStyle = (status?: OrderStatus) => {
  const styles: Record<string, { text: string; style: string }> = {
    pending: { text: "En attente", style: "bg-blue-100 text-blue-800" },
    delivered: { text: "Terminée", style: "bg-cyan-100 text-cyan-800" },
    canceled: { text: "Annulée", style: "bg-gray-100 text-gray-800" },
    "in-progress": {
      text: "En préparation",
      style: "bg-orange-100 text-orange-800",
    },
  };
  const statusKey = status || "pending";
  return (
    styles[statusKey] || { text: "Inconnu", style: "bg-gray-100 text-gray-800" }
  );
};

const getPaymentStatusStyle = (status?: "paid" | "unpaid" | "refunded") => {
  const styles: Record<string, { text: string; style: string }> = {
    paid: { text: "Payée", style: "text-green-600 font-medium" },
    unpaid: { text: "Non Payée", style: "text-red-600 font-medium" },
    refunded: { text: "Remboursée", style: "text-amber-600 font-medium" },
  };
  const statusKey = status || "unpaid";
  return (
    styles[statusKey] || { text: "Inconnu", style: "text-gray-600 font-medium" }
  );
};

// ============================================================================
// COMPOSANT PRINCIPAL OPTIMISÉ
// ============================================================================
export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");

  // Hook useUsers - on utilise seulement ce dont on a besoin
  const { orders, loading, error, getAllUsersOrders, clearError } = useUsers();

  // Chargement initial optimisé - UNE SEULE FOIS
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        if (isMounted && orders.length === 0) {
          await getAllUsersOrders();
        }
      } catch (err) {
        if (isMounted) {
          console.error("Erreur de chargement:", err);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []); // Dépendances vides - chargement unique

  // Gestion des erreurs
  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  // Filtrage et tri optimisés avec memo
  const filteredOrders = useMemo(() => {
    if (!orders || orders.length === 0) return [];

    let filtered = orders;

    // Filtre par onglet
    if (activeTab !== "all") {
      filtered = filtered.filter(
        (order) =>
          order.orderStatus === activeTab || order.status === activeTab,
      );
    }

    // Filtre par recherche
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (order: any) =>
          order.orderNumber?.toLowerCase().includes(searchLower) ||
          order.customerPhone?.toLowerCase().includes(searchLower) ||
          order.customerName?.toLowerCase().includes(searchLower),
      );
    }

    // Tri par date (plus récent en premier)
    return filtered.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  }, [orders, searchTerm, activeTab]);

  // Statistiques optimisées
  const orderStats = useMemo(() => {
    if (!orders || orders.length === 0) {
      return { all: 0 };
    }

    return orders.reduce(
      (acc, order) => {
        acc.all = (acc.all || 0) + 1;
        const status = order.orderStatus || order.status || "pending";
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
  }, [orders]);

  // Callback optimisé pour les modales
  const handleOrderSuccess = () => {
    // Rechargement simple après action
    getAllUsersOrders();
  };

  // ============================================================================
  // AFFICHAGE LOADER PRINCIPAL
  // ============================================================================
  if (loading && (!orders || orders.length === 0)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-6 p-8">
          {/* Loader principal */}
          <div className="relative">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
          </div>

          {/* Messages de chargement */}
          <div className="text-center space-y-2 max-w-md">
            <h2 className="text-2xl font-semibold text-foreground">
              Chargement des commandes
            </h2>
            <p className="text-muted-foreground">
              Récupération de vos données en cours...
            </p>
            <div className="mt-4 flex items-center justify-center space-x-1">
              <div
                className="h-2 w-2 bg-primary rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              />
              <div
                className="h-2 w-2 bg-primary rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              />
              <div
                className="h-2 w-2 bg-primary rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // AFFICHAGE ERREUR
  // ============================================================================
  if (error && (!orders || orders.length === 0)) {
    return (
      <div className="container mx-auto py-10">
        <Alert variant="destructive">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle>Erreur de chargement</AlertTitle>
          <AlertDescription>
            Impossible de charger les commandes: {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // ============================================================================
  // AFFICHAGE PRINCIPAL
  // ============================================================================
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Gestion des Commandes
          </h1>
          <p className="text-muted-foreground">
            {orders.length} commande{orders.length > 1 ? "s" : ""} au total
          </p>
        </div>
        <AddOrderModal onSuccess={handleOrderSuccess} />
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardContent className="p-4 space-y-4">
          {/* Barre de recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par numéro, téléphone, nom du client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
          </div>

          {/* Onglets de filtres */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
              <TabsTrigger value="all">
                Toutes ({orderStats.all || 0})
              </TabsTrigger>
              <TabsTrigger value="pending">
                En attente ({orderStats.pending || 0})
              </TabsTrigger>
              <TabsTrigger value="in-progress">En préparation(..)</TabsTrigger>
              <TabsTrigger value="delivered">
                Terminées ({orderStats.delivered || 0})
              </TabsTrigger>
              <TabsTrigger value="canceled">
                Annulées ({orderStats.canceled || 0})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Tableau des commandes */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Paiement</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <OrderRow
                      key={order.id}
                      order={order}
                      onSuccess={handleOrderSuccess}
                    />
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-32 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Package className="h-12 w-12 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Aucune commande trouvée</p>
                          <p className="text-sm text-muted-foreground">
                            {searchTerm || activeTab !== "all"
                              ? "Essayez de modifier vos filtres de recherche"
                              : "Commencez par créer votre première commande"}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// COMPOSANT LIGNE DE COMMANDE OPTIMISÉ
// ============================================================================
function OrderRow({ order, onSuccess }: { order: any; onSuccess: () => void }) {
  const orderStatus = getOrderStatusStyle(order.orderStatus || order.status);
  const paymentStatus = getPaymentStatusStyle(order.paymentStatus);

  return (
    <TableRow>
      <TableCell>
        <div className="text-sm font-medium">
          {/* #{order.orderNumber || order.id?.slice(-8)} */}
        </div>
        <div className="text-xs text-muted-foreground">
          {order.createdAt ? formatDate(new Date(order.createdAt)) : "N/A"}
        </div>
      </TableCell>

      <TableCell>
        <div className="font-medium">
          {order.customerName || order.userName || "Client"}
        </div>
        <div className="text-xs text-muted-foreground">
          {order.customerPhone}
        </div>
      </TableCell>

      <TableCell>
        <div className="font-bold text-lg">
          {order.total?.toFixed(2) || "0.00"} MAD
        </div>
      </TableCell>

      <TableCell>
        <span className={paymentStatus.style}>{paymentStatus.text}</span>
      </TableCell>

      <TableCell>
        <Badge
          variant="outline"
          className={`${orderStatus.style} border-0`}>
          {orderStatus.text}
        </Badge>
      </TableCell>

      <TableCell>
        <div className="flex items-center justify-end gap-1">
          <ViewOrderModal orderId={order.id} />
          <EditOrderModal
            orderId={order.id}
            onSuccess={onSuccess}
          />
          <DeleteOrderModal
            orderId={order.id}
            orderNumber={order.orderNumber || order.id}
            customerName={order.customerName || order.userName}
            total={order.total}
            onSuccess={onSuccess}
          />
        </div>
      </TableCell>
    </TableRow>
  );
}
