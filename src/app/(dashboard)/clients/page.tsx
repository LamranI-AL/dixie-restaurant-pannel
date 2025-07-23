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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Loader2,
  Search,
  Users,
  AlertTriangle,
  Plus,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  Mail,
  Phone,
  Calendar,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { User } from "@/lib/types";
import { useUsers } from "@/lib/hooks/useUserOrders";
import { formatDate } from "@/utils/format-date";
import { AddUserModal } from "@/components/dashboard/clients/addUserModal";
import { ViewUserModal } from "@/components/dashboard/clients/viewUserModal";
import { EditUserModal } from "@/components/dashboard/clients/editUserModal";
import { DeleteUserModal } from "@/components/dashboard/clients/deleteUserModal";

// Modals pour les utilisateurs
// import { AddUserModal } from "@/components/dashboard/users/addUserModal";
// import { ViewUserModal } from "@/components/dashboard/users/viewUserModal";
// import { EditUserModal } from "@/components/dashboard/users/editUserModal";
// import { DeleteUserModal } from "@/components/dashboard/users/deleteUserModal";

// Fonction pour obtenir les couleurs des rôles
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

// Fonction pour obtenir les initiales
const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

// ============================================================================
// COMPOSANT PRINCIPAL - PAGE GESTION UTILISATEURS
// ============================================================================
export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");

  // Hook useUsers
  const { users, loading, error, getAllUsers, clearError } = useUsers();

  // Chargement initial
  useEffect(() => {
    let isMounted = true;

    const loadUsers = async () => {
      try {
        if (isMounted && users.length === 0) {
          await getAllUsers();
        }
      } catch (err) {
        if (isMounted) {
          console.error("Erreur de chargement des utilisateurs:", err);
        }
      }
    };

    loadUsers();

    return () => {
      isMounted = false;
    };
  }, []);

  // Gestion des erreurs
  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  // Filtrage et tri des utilisateurs
  const filteredUsers = useMemo(() => {
    if (!users || users.length === 0) return [];

    let filtered = users;

    // Filtre par rôle
    if (activeTab !== "all") {
      filtered = filtered.filter((user) => user.role === activeTab);
    }

    // Filtre par recherche
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.displayName?.toLowerCase().includes(searchLower) ||
          user.email?.toLowerCase().includes(searchLower) ||
          user.phone?.toLowerCase().includes(searchLower),
      );
    }

    // Tri par date de création (plus récent en premier)
    return filtered.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  }, [users, searchTerm, activeTab]);

  // Statistiques des utilisateurs
  const userStats = useMemo(() => {
    if (!users || users.length === 0) {
      return { all: 0 };
    }

    return users.reduce(
      (acc, user) => {
        acc.all = (acc.all || 0) + 1;
        const role = user.role || "customer";
        acc[role] = (acc[role] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
  }, [users]);

  // Callback pour les actions sur les utilisateurs
  const handleUserSuccess = () => {
    getAllUsers();
  };

  // ============================================================================
  // AFFICHAGE LOADER PRINCIPAL
  // ============================================================================
  if (loading && (!users || users.length === 0)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-6 p-8">
          <div className="relative">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
          </div>

          <div className="text-center space-y-2 max-w-md">
            <h2 className="text-2xl font-semibold text-foreground">
              Chargement des utilisateurs
            </h2>
            <p className="text-muted-foreground">
              Récupération des données en cours...
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
  if (error && (!users || users.length === 0)) {
    return (
      <div className="container mx-auto py-10">
        <Alert variant="destructive">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle>Erreur de chargement</AlertTitle>
          <AlertDescription>
            Impossible de charger les utilisateurs: {error}
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
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-8 w-8" />
            Gestion des Utilisateurs
          </h1>
          <p className="text-muted-foreground">
            {users.length} utilisateur{users.length > 1 ? "s" : ""} enregistré
            {users.length > 1 ? "s" : ""}
          </p>
        </div>
        <AddUserModal onSuccess={handleUserSuccess} />
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total
                </p>
                <p className="text-2xl font-bold">{userStats.all || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Admins
                </p>
                <p className="text-2xl font-bold">{userStats.admin || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Staff
                </p>
                <p className="text-2xl font-bold">{userStats.staff || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Clients
                </p>
                <p className="text-2xl font-bold">{userStats.customer || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardContent className="p-4 space-y-4">
          {/* Barre de recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom, email, téléphone..."
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
              <TabsTrigger value="all">Tous ({userStats.all || 0})</TabsTrigger>
              <TabsTrigger value="admin">
                Admins ({userStats.admin || 0})
              </TabsTrigger>
              <TabsTrigger value="manager">
                Managers ({userStats.manager || 0})
              </TabsTrigger>
              <TabsTrigger value="staff">
                Staff ({userStats.staff || 0})
              </TabsTrigger>
              <TabsTrigger value="customer">
                Clients ({userStats.customer || 0})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Tableau des utilisateurs */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Inscription</TableHead>
                  {/* <TableHead>Dernière connexion</TableHead> */}
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <UserRow
                      key={user.id}
                      user={user}
                      onSuccess={handleUserSuccess}
                    />
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-32 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Users className="h-12 w-12 text-muted-foreground" />
                        <div>
                          <p className="font-medium">
                            Aucun utilisateur trouvé
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {searchTerm || activeTab !== "all"
                              ? "Essayez de modifier vos filtres de recherche"
                              : "Commencez par ajouter votre premier utilisateur"}
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
// COMPOSANT LIGNE UTILISATEUR
// ============================================================================
function UserRow({ user, onSuccess }: { user: User; onSuccess: () => void }) {
  const roleStyle = getRoleStyle(user.role);

  return (
    <TableRow>
      {/* Utilisateur */}
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={user.photoURL || ""}
              alt={user.displayName}
            />
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {getInitials(user.displayName || "U")}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-foreground">
              {user.displayName || "Nom non défini"}
            </div>
            <div className="text-xs text-muted-foreground">
              ID: {user.id?.slice(-8) || "N/A"}
            </div>
          </div>
        </div>
      </TableCell>

      {/* Contact */}
      <TableCell>
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-sm">
            <Mail className="h-3 w-3 text-muted-foreground" />
            <span>{user.email || "N/A"}</span>
          </div>
          {user.phone && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Phone className="h-3 w-3" />
              <span>{user.phone}</span>
            </div>
          )}
        </div>
      </TableCell>

      {/* Rôle */}
      <TableCell>
        <Badge
          variant="outline"
          className={`${roleStyle.style} border-0`}>
          {roleStyle.text}
        </Badge>
      </TableCell>

      {/* Date d'inscription */}
      <TableCell>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>
            {user.createdAt ? formatDate(new Date(user.createdAt)) : "N/A"}
          </span>
        </div>
      </TableCell>

      {/* Dernière connexion */}
      {/* <TableCell>
        <div className="text-sm text-muted-foreground">
          {user.lastLoginAt ? formatDate(new Date(user.lastLoginAt)) : "Jamais"}
        </div>
      </TableCell> */}

      {/* Actions */}
      <TableCell>
        <div className="flex items-center justify-end gap-1">
          <ViewUserModal userId={user.id} />
          <EditUserModal
            userId={user.id}
            onSuccess={onSuccess}
          />
          <DeleteUserModal
            userId={user.id}
            userName={user.displayName}
            userEmail={user.email}
            onSuccess={onSuccess}
          />
        </div>
      </TableCell>
    </TableRow>
  );
}
