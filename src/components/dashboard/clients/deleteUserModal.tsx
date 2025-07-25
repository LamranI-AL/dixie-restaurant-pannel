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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Trash2,
  Loader2,
  AlertTriangle,
  User,
  Mail,
  Phone,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";
import { useUsers } from "@/lib/hooks/useUserOrders";

interface DeleteUserModalProps {
  userId: string;
  userName?: string;
  userEmail?: string;
  userRole?: string;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
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

export function DeleteUserModal({
  userId,
  userName,
  userEmail,
  userRole,
  trigger,
  onSuccess,
}: DeleteUserModalProps) {
  const [open, setOpen] = useState(false);

  const { deleteUser, loading } = useUsers();

  const handleDelete = async () => {
    try {
      const result = await deleteUser(userId);

      if (result.success) {
        toast.success("Utilisateur supprimé avec succès !");
        setOpen(false);
        onSuccess?.();
      } else {
        toast.error(
          result.error || "Erreur lors de la suppression de l'utilisateur",
        );
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Une erreur est survenue lors de la suppression");
    }
  };

  const isAdminUser = userRole === "admin";
  const isCurrentUser = false; // Vous pourriez vérifier si c'est l'utilisateur connecté

  return (
    <AlertDialog
      open={open}
      onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {trigger || (
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50">
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Confirmer la suppression
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p>
                Vous êtes sur le point de supprimer définitivement cet
                utilisateur :
              </p>

              {/* Carte utilisateur */}
              <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-red-500">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src=""
                      alt={userName || "Utilisateur"}
                    />
                    <AvatarFallback className="bg-red-100 text-red-700 font-medium">
                      {getInitials(userName || "U")}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 space-y-1">
                    <div className="font-medium text-gray-900">
                      {userName || "Nom non défini"}
                    </div>

                    {userEmail && (
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Mail className="h-3 w-3" />
                        <span>{userEmail}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          userRole === "admin"
                            ? "bg-red-100 text-red-800"
                            : userRole === "manager"
                              ? "bg-blue-100 text-blue-800"
                              : userRole === "staff"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                        }`}>
                        {userRole === "admin"
                          ? "Administrateur"
                          : userRole === "manager"
                            ? "Manager"
                            : userRole === "staff"
                              ? "Staff"
                              : "Client"}
                      </span>
                      {/* <span className="text-xs text-gray-500">
                        ID: {userId.slice(-8)}
                      </span> */}
                    </div>
                  </div>
                </div>
              </div>

              {/* Avertissements spéciaux */}
              {isAdminUser && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <ShieldAlert className="h-4 w-4 text-red-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-red-800">
                        ⚠️ Suppression d'un administrateur
                      </p>
                      <p className="text-red-700">
                        Cet utilisateur possède des privilèges administrateur.
                        Assurez-vous qu'un autre administrateur pourra gérer le
                        système.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {isCurrentUser && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-amber-800">
                        🚨 Auto-suppression
                      </p>
                      <p className="text-amber-700">
                        Vous êtes sur le point de supprimer votre propre compte.
                        Vous serez déconnecté immédiatement.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Conséquences de la suppression */}
              <div className="space-y-2">
                <p className="text-sm text-red-600 font-medium">
                  ⚠️ Cette action supprimera définitivement :
                </p>
                <ul className="text-sm text-red-600 ml-4 space-y-1">
                  <li>
                    • Toutes les informations personnelles de l'utilisateur
                  </li>
                  <li>• L'accès à son compte et ses données</li>
                  <li>• L'historique de ses connexions</li>
                  <li>• Ses préférences et paramètres</li>
                  <li>• Les liens avec ses commandes (historique conservé)</li>
                </ul>
              </div>

              {/* Note importante */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note :</strong> Les commandes passées par cet
                  utilisateur seront conservées dans l'historique pour des
                  raisons comptables, mais ne seront plus liées à un compte
                  utilisateur actif.
                </p>
              </div>

              {/* Confirmation finale */}
              <div className="p-3 bg-gray-50 border-l-4 border-gray-400 rounded">
                <p className="text-sm text-gray-700">
                  Tapez{" "}
                  <code className="bg-gray-200 px-1 rounded font-mono">
                    SUPPRIMER
                  </code>
                  pour confirmer cette action irréversible.
                </p>
              </div>
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
