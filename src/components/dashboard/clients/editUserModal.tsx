/** @format */

"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Edit,
  Save,
  Loader2,
  AlertCircle,
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import { User as UserType } from "@/lib/types";
import { useUsers } from "@/lib/hooks/useUserOrders";

interface EditUserModalProps {
  userId: string;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function EditUserModal({
  userId,
  trigger,
  onSuccess,
}: EditUserModalProps) {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);
  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    phone: "",
    address: "",
    role: "customer" as "admin" | "manager" | "staff" | "customer",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { getUserById, updateUser, loading, error, clearError } = useUsers();

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
      const result: any = await getUserById(userId);
      if (result.success && result.user) {
        setUser(result.user);
        setFormData({
          displayName: result.user.displayName || "",
          email: result.user.email || "",
          phone: result.user.phone || "",
          address: result.user.address || "",
          role: result.user.role || "customer",
        });
      } else {
        toast.error("Utilisateur non trouvé");
      }
    } catch (err) {
      console.error("Erreur lors du chargement:", err);
      toast.error("Impossible de charger les données de l'utilisateur");
    }
  };

  const resetForm = () => {
    if (user) {
      setFormData({
        displayName: user.displayName || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        role: user.role || "customer",
      } as any);
    }
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.displayName.trim()) {
      newErrors.displayName = "Le nom est requis";
    }
    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Format d'email invalide";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Veuillez corriger les erreurs du formulaire");
      return;
    }

    if (!user) {
      toast.error("Utilisateur non trouvé");
      return;
    }

    try {
      const updateData = {
        displayName: formData.displayName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        role: formData.role,
      };

      const result = await updateUser(user.id, updateData as any);

      if (result.success) {
        toast.success("Utilisateur modifié avec succès !");
        setOpen(false);
        onSuccess?.();
      } else {
        toast.error(
          result.error || "Erreur lors de la modification de l'utilisateur",
        );
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Une erreur est survenue lors de la modification");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        setOpen(open);
        if (!open) resetForm();
      }}>
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
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Modifier l'utilisateur
          </DialogTitle>
        </DialogHeader>

        {loading && !user ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !user ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Utilisateur non trouvé</p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-4">
            {/* Informations de base */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <User className="h-4 w-4" />
                Informations personnelles
              </div>
              <Separator />

              <div className="space-y-2">
                <Label htmlFor="displayName">
                  Nom complet <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="displayName"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleInputChange}
                  placeholder="Nom et prénom"
                  className={errors.displayName ? "border-red-500" : ""}
                />
                {errors.displayName && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.displayName}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="email@exemple.com"
                    className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+212 600 000 000"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Adresse</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Adresse complète"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Rôle et permissions */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Shield className="h-4 w-4" />
                Rôle et permissions
              </div>
              <Separator />

              <div className="space-y-2">
                <Label htmlFor="role">Rôle</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      role: value as "admin" | "manager" | "staff" | "customer",
                    }))
                  }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">Client</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="admin">Administrateur</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Informations de l'utilisateur */}
              <div className="p-3 bg-muted/50 rounded-lg text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ID:</span>
                  <span className="font-mono text-xs">{user.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">UID:</span>
                  <span className="font-mono text-xs">{user.uid}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Créé le:</span>
                  <span className="text-xs">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}>
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Modification...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Sauvegarder
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
