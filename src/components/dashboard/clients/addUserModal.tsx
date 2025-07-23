/** @format */

"use client";

import { useState } from "react";
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
  Plus,
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
import { useUsers } from "@/lib/hooks/useUserOrders";

interface AddUserModalProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function AddUserModal({ trigger, onSuccess }: AddUserModalProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    phoneNumber: "",
    address: "",
    role: "customer" as "admin" | "manager" | "staff" | "customer",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { addUser, loading } = useUsers();

  const resetForm = () => {
    setFormData({
      displayName: "",
      email: "",
      phoneNumber: "",
      address: "",
      role: "customer",
    });
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
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Le téléphone est requis";
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

    try {
      const userData: any = {
        email: formData.email,
        displayName: formData.displayName,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        role: formData.role,
        photoURL: null,
      };

      const result = await addUser(userData);

      if (result.success) {
        toast.success("Utilisateur créé avec succès !");
        setOpen(false);
        resetForm();
        onSuccess?.();
      } else {
        toast.error(
          result.error || "Erreur lors de la création de l'utilisateur",
        );
      }
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error("Une erreur est survenue lors de la création");
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
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nouvel Utilisateur
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Créer un nouvel utilisateur
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-4">
          {/* Informations personnelles */}
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
              <Label htmlFor="phoneNumber">
                Téléphone <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="+212 600 000 000"
                  className={`pl-10 ${errors.phoneNumber ? "border-red-500" : ""}`}
                />
              </div>
              {errors.phoneNumber && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.phoneNumber}
                </p>
              )}
            </div>
            {/* 
            <div className="space-y-2">
              <Label htmlFor="address">Adresse (optionnel)</Label>
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
            </div> */}
          </div>

          {/* Rôle et permissions */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Shield className="h-4 w-4" />
              Pour en savoir plus sur les rôles (client , admin , staff ...) et
              permissions disponibles ou pour accéder à des fonctionnalités
              additionnelles, veuillez contacter le support.
            </div>
            <Separator />

            {/* <div className="space-y-2">
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
            </div> */}

            {/* Description du rôle */}
            <div className="p-3 bg-muted/50 rounded-lg text-sm">
              {formData.role === "admin" && (
                <p>
                  <strong>Administrateur :</strong> Accès complet à toutes les
                  fonctionnalités
                </p>
              )}
              {formData.role === "manager" && (
                <p>
                  <strong>Manager :</strong> Gestion des commandes, utilisateurs
                  et rapports
                </p>
              )}
              {formData.role === "staff" && (
                <p>
                  <strong>Staff :</strong> Gestion des commandes et clients
                </p>
              )}
              {formData.role === "customer" && (
                <p>
                  <strong>Client :</strong> Accès limité aux commandes
                  personnelles
                </p>
              )}
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
                  Création...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Créer l'utilisateur
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
