/** @format */
"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, EyeOff, ImageIcon, Upload, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Deliveryman } from "@/lib/types";
import { UploadButton } from "@/utils/uploadthing";
import { toast } from "sonner";
import Image from "next/image";
import { useDeliverymen } from "@/lib/hooks/useDeliverymen"; // Import du hook

// Schéma de validation
const formSchema = z
  .object({
    firstName: z
      .string()
      .min(2, "Le prénom doit contenir au moins 2 caractères."),
    lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères."),
    email: z.string().email("Veuillez entrer une adresse email valide."),
    zone: z.string().min(1, "Veuillez sélectionner une zone."),
    vehicle: z.string().min(1, "Veuillez sélectionner un véhicule."),
    identityType: z
      .string()
      .min(1, "Veuillez sélectionner un type d'identité."),
    identityNumber: z.string().min(1, "Veuillez entrer un numéro d'identité."),
    age: z.string().min(1, "Veuillez entrer votre âge."),
    phone: z.string().min(1, "Veuillez entrer un numéro de téléphone."),
    password: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères."),
    confirmPassword: z
      .string()
      .min(8, "Veuillez confirmer votre mot de passe."),
    deliverymanType: z
      .string()
      .min(1, "Veuillez sélectionner un type de livreur."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

export default function AddDeliveryman() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [imageIdentifier, setImageIdentifier] = useState<string | null>(null);
  const [imageProfile, setImageProfile] = useState<string | null>(null);

  // Utilisation du hook useDeliverymen
  const { addDeliveryman, loading } = useDeliverymen();

  // Configuration du formulaire
  const form = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      zone: "",
      vehicle: "",
      identityType: "",
      identityNumber: "",
      age: "",
      deliverymanType: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Gestionnaires d'upload optimisés
  const handleProfileUploadComplete = useCallback((res: any) => {
    if (res?.[0]?.ufsUrl) {
      setImageProfile(res[0].ufsUrl);
      toast.success("Image de profil téléchargée avec succès !");
    }
  }, []);

  const handleIdentityUploadComplete = useCallback((res: any) => {
    if (res?.[0]?.ufsUrl) {
      setImageIdentifier(res[0].ufsUrl);
      toast.success("Image d'identité téléchargée avec succès !");
    }
  }, []);

  const handleUploadError = useCallback((error: any) => {
    console.error("Upload error:", error.message);
    toast.error(`Erreur de téléchargement : ${error.message}`);
  }, []);

  // Gestionnaire de soumission du formulaire
  const onSubmit = async (values: any) => {
    try {
      // Validation avec zod
      const validatedData = formSchema.parse(values);

      // Vérification des images
      if (!imageProfile) {
        toast.error("Veuillez télécharger une image de profil");
        return;
      }

      if (!imageIdentifier) {
        toast.error("Veuillez télécharger une image d'identité");
        return;
      }

      // Conversion des données pour Firebase
      const deliverymanData: Deliveryman = {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email,
        zone: validatedData.zone,
        vehicle: validatedData.vehicle,
        identityType: validatedData.identityType,
        identityNumber: validatedData.identityNumber,
        age: validatedData.age,
        birthdate: new Date().toISOString(),
        phone: validatedData.phone,
        password: validatedData.password,
        profileImageUrl: imageProfile,
        identityImageUrl: imageIdentifier,
        status: "active",
        createdAt: new Date(),
        id: "",
        updatedAt: new Date(),
        isApproved: true,
        licenseFile: "",
      };

      const result = await addDeliveryman(deliverymanData);

      if (result.success) {
        toast.success("✅ Livreur ajouté avec succès !");
        router.push("/deliveryman/list");
        router.refresh();
      } else {
        toast.error(`❌ ${result.error || "Échec de l'ajout du livreur"}`);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Afficher les erreurs de validation
        error.errors.forEach((err) => {
          toast.error(`${err.path.join(".")}: ${err.message}`);
        });
      } else {
        console.error("Error submitting form:", error);
        toast.error("🚨 Une erreur inattendue s'est produite.");
      }
    }
  };

  // Composant réutilisable pour les sections de formulaire
  const FormSection = ({
    title,
    icon,
    children,
  }: {
    title: string;
    icon: string;
    children: React.ReactNode;
  }) => (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center mb-4">
          <div className="mr-2">{icon}</div>
          <h2 className="text-lg font-medium">{title}</h2>
        </div>
        {children}
      </CardContent>
    </Card>
  );

  // Composant réutilisable pour l'upload d'image
  const ImageUpload = ({
    label,
    image,
    onUploadComplete,
    uploadText,
    height = "h-32",
  }: {
    label: string;
    image: string | null;
    onUploadComplete: (res: any) => void;
    uploadText: string;
    height?: string;
  }) => (
    <div>
      <FormLabel>{label}</FormLabel>
      <div
        className={`mt-1 flex items-center justify-center border rounded-md ${height} w-full`}>
        {image ? (
          <Image
            width={200}
            height={200}
            src={image}
            alt={`${label} preview`}
            className="h-full object-cover rounded-md max-w-full"
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-4 bg-gradient-to-r from-blue-200 to-blue-100 rounded-md h-full w-full">
            {height === "h-32" ? (
              <Upload className="h-8 w-8 text-gray-400 mb-2" />
            ) : (
              <ImageIcon className="h-10 w-10 text-gray-400 mb-2" />
            )}
            <p className="text-sm font-medium text-center px-2">{uploadText}</p>
            <p className="text-xs text-gray-500 mt-1">
              PNG, JPG, WEBP jusqu'à 5MB
            </p>
            <div className="mt-2">
              <UploadButton
                endpoint="imageUploader"
                onClientUploadComplete={onUploadComplete}
                onUploadError={handleUploadError}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <div className="mr-2">🚚</div>
        <h1 className="text-2xl font-semibold">Ajouter un Nouveau Livreur</h1>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8">
          {/* Section Informations Générales */}
          <FormSection
            title="Informations Générales"
            icon="👤">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prénom</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Prénom"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nom"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <ImageUpload
                label="Image de Profil"
                image={imageProfile}
                onUploadComplete={handleProfileUploadComplete}
                uploadText="Glisser-déposer ou cliquer pour télécharger l'image de profil"
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="deliverymanType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type de Livreur</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez le type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="freelancer">Freelancer</SelectItem>
                        <SelectItem value="permanent">Permanent</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="zone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Zone</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez la zone" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="north">Zone Nord</SelectItem>
                        <SelectItem value="south">Zone Sud</SelectItem>
                        <SelectItem value="east">Zone Est</SelectItem>
                        <SelectItem value="west">Zone Ouest</SelectItem>
                        <SelectItem value="central">Zone Centrale</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </FormSection>

          {/* Section Informations d'Identification */}
          <FormSection
            title="Informations d'Identification"
            icon="🪪">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="vehicle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Véhicule</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez le véhicule" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="bicycle">Vélo</SelectItem>
                        <SelectItem value="motorcycle">Moto</SelectItem>
                        <SelectItem value="car">Voiture</SelectItem>
                        <SelectItem value="van">Camionnette</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="identityType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type d'Identité</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez le type d'identité" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="passport">Passeport</SelectItem>
                        <SelectItem value="idCard">Carte d'Identité</SelectItem>
                        <SelectItem value="drivingLicense">
                          Permis de Conduire
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="identityNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Numéro d'Identité</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Numéro d'identité"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="md:col-span-3">
                <ImageUpload
                  label="Image d'Identité"
                  image={imageIdentifier}
                  onUploadComplete={handleIdentityUploadComplete}
                  uploadText="Glisser-déposer ou cliquer pour télécharger le document d'identité"
                  height="h-48"
                />
              </div>
            </div>
          </FormSection>

          {/* Section Données Supplémentaires */}
          <FormSection
            title="Données Supplémentaires"
            icon="📋">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Âge</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Âge"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </FormSection>

          {/* Section Informations de Compte */}
          <FormSection
            title="Informations de Compte"
            icon="🔐">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Téléphone</FormLabel>
                    <FormControl>
                      <div className="flex">
                        <div className="flex items-center bg-gray-100 border rounded-l-md px-3">
                          <span className="text-sm">MAR +212</span>
                        </div>
                        <Input
                          type="tel"
                          className="rounded-l-none"
                          placeholder="Numéro de téléphone"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mot de Passe</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Ex: 8+ Caractères"
                          {...field}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? (
                            <EyeOff className="h-5 w-5 text-gray-400" />
                          ) : (
                            <Eye className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmer le Mot de Passe</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Ex: 8+ Caractères"
                          {...field}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }>
                          {showConfirmPassword ? (
                            <EyeOff className="h-5 w-5 text-gray-400" />
                          ) : (
                            <Eye className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </FormSection>

          {/* Boutons d'action */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/deliveryman/list")}
              disabled={loading}>
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Ajout en cours...
                </>
              ) : (
                "Ajouter le Livreur"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
