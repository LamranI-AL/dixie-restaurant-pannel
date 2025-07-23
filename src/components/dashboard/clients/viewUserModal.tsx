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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Eye,
  Loader2,
  AlertCircle,
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  Calendar,
  Clock,
  ShoppingCart,
} from "lucide-react";
import { toast } from "sonner";
import { User as UserType } from "@/lib/types";
import { useUsers } from "@/lib/hooks/useUserOrders";
import { formatDate } from "@/utils/format-date";

interface ViewUserModalProps {
  userId: string;
  trigger?: React.ReactNode;
}

// Fonction pour obtenir les initiales
const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

// Fonction pour obtenir le style du rôle
const getRoleStyle = (role?: string) => {
  const styles: Record<string, { text: string; style: string }> = {
    admin: { text: "Administrateur", style: "bg-red-100 text-red-800" },
    manager: { text: "Manager", style: "bg-blue-100 text-blue-800" },
    staff: { text: "Staff", style: "bg-green-100 text-green-800" },
    customer: { text: "Client", style: "bg-gray-100 text-gray-800" },
  };
  const roleKey = role || "customer";
  return (
    styles[roleKey] || { text: "Inconnu", style: "bg-gray-100 text-gray-800" }
  );
};

export function ViewUserModal({ userId, trigger }: ViewUserModalProps) {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);

  const { getUserById, getOrdersByUser, loading, error, clearError } =
    useUsers();

  // Charger les données de l'utilisateur
  useEffect(() => {
    if (open && userId) {
      loadUserData();
    }
  }, [open, userId]);

  // Gestion des erreurs
  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const loadUserData = async () => {
    try {
      const userResult = await getUserById(userId);
      if (userResult.success && userResult.user) {
        setUser(userResult.user);

        // Charger aussi les commandes de l'utilisateur
        const ordersResult = await getOrdersByUser(userId);
        if (ordersResult.success && ordersResult.orders) {
          setUser((prev) =>
            prev ? { ...prev, orders: ordersResult.orders! } : null,
          );
        }
      } else {
        toast.error("Utilisateur non trouvé");
      }
    } catch (err) {
      console.error("Erreur lors du chargement:", err);
      toast.error("Impossible de charger les données de l'utilisateur");
    }
  };

  const roleStyle = getRoleStyle(user?.role);

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
            <Eye className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Détails de l'utilisateur
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !user ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Utilisateur non trouvé</p>
            <p className="text-muted-foreground">
              Impossible de charger les informations de cet utilisateur.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* En-tête avec avatar et info principale */}
            <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
              <Avatar className="h-16 w-16">
                <AvatarImage
                  src={user.photoURL || ""}
                  alt={user.displayName}
                />
                <AvatarFallback className="bg-primary/10 text-primary font-medium text-lg">
                  {getInitials(user.displayName || "U")}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-semibold">
                    {user.displayName || "Nom non défini"}
                  </h3>
                  <Badge
                    variant="outline"
                    className={`${roleStyle.style} border-0`}>
                    {roleStyle.text}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{user.email}</span>
                </div>

                {user.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{user.phone}</span>
                  </div>
                )}

                <div className="text-sm text-muted-foreground">
                  ID: {user.id}
                </div>
              </div>
            </div>

            <Separator />

            {/* Informations détaillées */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Informations personnelles */}
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Informations personnelles
                </h4>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nom complet:</span>
                    <span className="font-medium">
                      {user.displayName || "N/A"}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span className="font-medium">{user.email}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Téléphone:</span>
                    <span className="font-medium">{user.phone || "N/A"}</span>
                  </div>

                  {/* {user.address && (
                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground">Adresse:</span>
                      <span className="font-medium text-wrap break-words">
                        {user.address}
                      </span>
                    </div>
                  )} */}
                </div>
              </div>

              {/* Informations système */}
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Informations système
                </h4>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rôle:</span>
                    <Badge
                      variant="outline"
                      className={`${roleStyle.style} border-0 text-xs`}>
                      {roleStyle.text}
                    </Badge>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">UID:</span>
                    <span className="font-mono text-xs">{user.uid}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Inscription:</span>
                    <span className="font-medium">
                      {user.createdAt
                        ? formatDate(new Date(user.createdAt))
                        : "N/A"}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Dernière MAJ:</span>
                    <span className="font-medium">
                      {user.updatedAt
                        ? formatDate(new Date(user.updatedAt))
                        : "N/A"}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Dernière connexion:
                    </span>
                    <span className="font-medium">
                      {user.lastLoginAt
                        ? formatDate(new Date(user.lastLoginAt))
                        : "Jamais"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Statistiques des commandes */}
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Historique des commandes
              </h4>

              {user.orders && user.orders.length > 0 ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {user.orders.length}
                      </div>
                      <div className="text-sm text-blue-600">
                        Total commandes
                      </div>
                    </div>

                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {
                          user.orders.filter((o) => o.status === "delivered")
                            .length
                        }
                      </div>
                      <div className="text-sm text-green-600">Livrées</div>
                    </div>

                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {
                          user.orders.filter((o) => o.status === "pending")
                            .length
                        }
                      </div>
                      <div className="text-sm text-orange-600">En attente</div>
                    </div>

                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {user.orders
                          .reduce((sum, o) => sum + (o.total || 0), 0)
                          .toFixed(2)}{" "}
                        MAD
                      </div>
                      <div className="text-sm text-purple-600">
                        Total dépensé
                      </div>
                    </div>
                  </div>

                  {/* Dernières commandes */}
                  <div className="space-y-2">
                    <h5 className="font-medium text-sm">
                      Dernières commandes:
                    </h5>
                    <div className="space-y-2">
                      {user.orders.slice(0, 3).map((order) => (
                        <div
                          key={order.id}
                          className="flex justify-between items-center p-2 border rounded">
                          <div className="flex items-center gap-2">
                            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">
                              #{order.orderNumber || order.id?.slice(-8)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                              {order.createdAt
                                ? formatDate(new Date(order.createdAt))
                                : "N/A"}
                            </span>
                            <span className="font-bold text-sm">
                              {order.total?.toFixed(2)} MAD
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Aucune commande trouvée</p>
                  <p className="text-sm">
                    Cet utilisateur n'a pas encore passé de commande.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
