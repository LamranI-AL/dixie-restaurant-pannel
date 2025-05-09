/** @format */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormDescription,
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
import {
  Building,
  Phone,
  Mail,
  UploadCloud,
  ArrowRight,
  X,
  CheckCircle2,
  Clock,
  Package,
  Info,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import Image from "next/image";
import { UploadButton } from "@/utils/uploadthing";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/lib/hooks/hooks/use-toast";

// Interfaces pour le restaurant
interface OpeningHours {
  day: string;
  open: boolean;
  openTime: string;
  closeTime: string;
}

interface DeliveryOption {
  type: string;
  available: boolean;
}

export interface Restaurant {
  id: string;
  name: string;
  logo?: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  cuisineTypes: string[];
  openingHours: OpeningHours[];
  deliveryOptions: DeliveryOption[];
  packagingCharges: number;
}

// Constantes
const DAYS_OF_WEEK = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche",
];

const DELIVERY_TYPES = [
  { id: "delivery", name: "Livraison à domicile" },
  { id: "pickup", name: "À emporter" },
  { id: "dineIn", name: "Sur place" },
];

const CUISINE_TYPES = [
  "Marocaine",
  "Française",
  "Italienne",
  "Japonaise",
  "Chinoise",
  "Indienne",
  "Américaine",
  "Mexicaine",
  "Libanaise",
  "Thaïlandaise",
  "Autre",
];

// Schema de validation (version simplifiée pour l'initialisation)
const restaurantInitSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  address: z.string().min(5, "L'adresse doit être complète"),
  phone: z.string().min(10, "Numéro de téléphone invalide"),
  email: z.string().email("Email invalide"),
  cuisineTypes: z
    .array(z.string())
    .min(1, "Sélectionnez au moins un type de cuisine"),
});

interface RestaurantInitializerProps {
  onInitComplete: (data: Restaurant) => Promise<void>;
}

export function RestaurantInitializer({
  onInitComplete,
}: RestaurantInitializerProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [logoUrl, setLogoUrl] = useState<string | undefined>(undefined);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingText, setLoadingText] = useState("");

  // Simulation des étapes d'initialisation
  const totalSteps = 3;

  // État pour les heures d'ouverture (valeurs par défaut)
  const [openingHours, setOpeningHours] = useState<OpeningHours[]>(
    DAYS_OF_WEEK.map((day) => ({
      day,
      open: true,
      openTime: "09:00",
      closeTime: "22:00",
    })),
  );

  // État pour les options de livraison (valeurs par défaut)
  const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOption[]>(
    DELIVERY_TYPES.map((type) => ({
      type: type.id,
      available: type.id === "dineIn",
    })),
  );

  // Initialiser le formulaire avec React Hook Form
  const form = useForm<z.infer<typeof restaurantInitSchema>>({
    resolver: zodResolver(restaurantInitSchema),
    defaultValues: {
      name: "",
      address: "",
      phone: "",
      email: "",
      cuisineTypes: [],
    },
  });

  // Fonction pour simuler la progression du téléchargement
  const simulateProgress = (
    start = 0,
    max = 100,
    text = "Traitement en cours...",
  ) => {
    setUploadProgress(start);
    setLoadingText(text);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= max) {
          clearInterval(interval);
          return prev;
        }
        return prev + 5;
      });
    }, 150);
    return interval;
  };

  // Gestionnaire pour les heures d'ouverture
  const handleOpeningHoursChange = (
    index: number,
    field: keyof OpeningHours,
    value: any,
  ) => {
    const updatedHours = [...openingHours];
    updatedHours[index] = { ...updatedHours[index], [field]: value };
    setOpeningHours(updatedHours);
  };

  // Gestionnaire pour les options de livraison
  const handleDeliveryOptionChange = (
    index: number,
    field: keyof DeliveryOption,
    value: any,
  ) => {
    const updatedOptions = [...deliveryOptions];
    updatedOptions[index] = { ...updatedOptions[index], [field]: value };
    setDeliveryOptions(updatedOptions);
  };

  // Passage à l'étape suivante
  const goToNextStep = () => {
    if (currentStep < totalSteps) {
      // Valider le formulaire à l'étape 1
      if (currentStep === 1) {
        form.trigger().then((isValid) => {
          if (isValid) {
            setCurrentStep((prev) => prev + 1);
          } else {
            toast({
              title: "Informations incomplètes",
              description:
                "Veuillez remplir tous les champs obligatoires pour continuer.",
              variant: "destructive",
            });
          }
        });
      } else {
        setCurrentStep((prev) => prev + 1);
      }
    }
  };

  // Retour à l'étape précédente
  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Soumettre les données du restaurant
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      // Récupérer les valeurs du formulaire
      const formValues = form.getValues();

      // Simuler un chargement
      const progressInterval = simulateProgress(
        0,
        90,
        "Initialisation de votre restaurant...",
      );

      // Préparer les données du restaurant
      const restaurantData: Restaurant = {
        id: "new-restaurant", // L'ID sera généré côté serveur
        name: formValues.name,
        logo: logoUrl,
        address: formValues.address,
        phone: formValues.phone,
        email: formValues.email,
        website: "",
        cuisineTypes: formValues.cuisineTypes,
        openingHours,
        deliveryOptions,
        packagingCharges: 0, // Valeur par défaut
      };

      // Appeler la fonction de callback pour compléter l'initialisation
      await onInitComplete(restaurantData);

      // Terminer la progression
      clearInterval(progressInterval);
      setUploadProgress(100);
      setLoadingText("Configuration terminée !");

      // Afficher un toast de succès
      toast({
        title: "Restaurant configuré avec succès",
        description: "Vous allez être redirigé vers le tableau de bord.",
        variant: "default",
      });

      // Rediriger après un court délai
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (error) {
      console.error("Erreur lors de l'initialisation:", error);
      toast({
        title: "Erreur d'initialisation",
        description:
          "Une erreur s'est produite lors de la configuration de votre restaurant. Veuillez réessayer.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Bienvenue sur votre plateforme de gestion
          </h1>
          <p className="mt-3 text-lg text-gray-600">
            Configurons votre restaurant pour commencer à gérer vos commandes et
            votre menu
          </p>
        </div>

        <div className="mb-8">
          <div className="relative">
            <div className="overflow-hidden h-2 mb-4 flex rounded bg-gray-200">
              <div
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600 transition-all duration-500"
              />
            </div>
            <div className="flex justify-between">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-center w-8 h-8 rounded-full border-2 bg-white
                    ${
                      currentStep > i + 1
                        ? "border-blue-600 text-blue-600"
                        : currentStep === i + 1
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-gray-300 text-gray-400"
                    }`}>
                  {currentStep > i + 1 ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    i + 1
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-sm font-medium">Informations</span>
              <span className="text-sm font-medium">Horaires</span>
              <span className="text-sm font-medium">Finalisation</span>
            </div>
          </div>
        </div>

        <Card className="shadow-lg border-t-4 border-blue-600">
          {currentStep === 1 && (
            <>
              <CardHeader>
                <CardTitle className="text-xl font-semibold">
                  Informations de base de votre restaurant
                </CardTitle>
                <CardDescription>
                  Ces informations seront visibles par vos clients
                </CardDescription>
              </CardHeader>

              <CardContent>
                <Form {...form}>
                  <div className="space-y-6">
                    {/* Logo du restaurant */}
                    <div className="space-y-4">
                      <h3 className="text-md font-medium flex items-center">
                        <UploadCloud className="w-5 h-5 mr-2 text-blue-500" />
                        Logo du Restaurant
                      </h3>
                      <Separator />

                      <div className="flex items-start space-x-6">
                        <div className="w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center bg-gray-50 relative overflow-hidden">
                          {logoUrl ? (
                            <div className="relative w-full h-full">
                              <Image
                                src={logoUrl}
                                alt="Logo du restaurant"
                                fill
                                sizes="128px"
                                className="object-cover"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-1 right-1 h-6 w-6"
                                onClick={() => setLogoUrl(undefined)}>
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <div className="text-center p-4">
                              <Building className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-xs text-gray-500">
                                Aucun logo
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="flex-1 space-y-2">
                          <h4 className="text-sm font-medium">
                            Choisir un logo (optionnel)
                          </h4>
                          <p className="text-xs text-gray-500">
                            Une image claire avec un fond simple est
                            recommandée.
                          </p>

                          {isUploading ? (
                            <div className="space-y-2">
                              <p className="text-sm text-gray-600">
                                Téléchargement en cours...
                              </p>
                              <Progress
                                value={uploadProgress}
                                className="h-2"
                              />
                            </div>
                          ) : (
                            <div className="bg-gray-50 rounded-md p-4">
                              <UploadButton
                                endpoint="imageUploader"
                                onClientUploadComplete={(res) => {
                                  if (res && res[0] && res[0].url) {
                                    setLogoUrl(res[0].url);
                                    toast({
                                      title: "Logo téléchargé",
                                      description:
                                        "Le logo a été téléchargé avec succès.",
                                    });
                                  }
                                  setIsUploading(false);
                                }}
                                onUploadBegin={() => {
                                  setIsUploading(true);
                                  simulateProgress();
                                }}
                                onUploadError={(error: Error) => {
                                  toast({
                                    title: "Erreur de téléchargement",
                                    description: error.message,
                                    variant: "destructive",
                                  });
                                  setIsUploading(false);
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Nom et cuisine */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Nom du restaurant
                              <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Le Bistrot Gourmand"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="cuisineTypes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Types de cuisine
                              <span className="text-red-500">*</span>
                            </FormLabel>
                            <Select
                              onValueChange={(value) =>
                                field.onChange([...field.value, value])
                              }
                              value={undefined}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Sélectionner un type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {CUISINE_TYPES.filter(
                                  (type) => !field.value.includes(type),
                                ).map((type) => (
                                  <SelectItem
                                    key={type}
                                    value={type}>
                                    {type}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {field.value.map((type) => (
                                <Badge
                                  key={type}
                                  variant="secondary"
                                  className="pl-2">
                                  {type}
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    className="h-5 w-5 p-0 ml-1"
                                    onClick={() =>
                                      field.onChange(
                                        field.value.filter((t) => t !== type),
                                      )
                                    }>
                                    <X className="h-3 w-3" />
                                  </Button>
                                </Badge>
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Adresse */}
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Adresse<span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="123 Rue de la Gastronomie, 75001 Paris"
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            L'adresse exacte de votre restaurant
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Contact */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Téléphone<span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                  className="pl-9"
                                  placeholder="+212 5 22 123 456"
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
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Email<span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                  className="pl-9"
                                  placeholder="contact@monrestaurant.com"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </Form>
              </CardContent>
            </>
          )}

          {currentStep === 2 && (
            <>
              <CardHeader>
                <CardTitle className="text-xl font-semibold flex items-center">
                  <Clock className="mr-2 h-5 w-5 text-green-600" />
                  Horaires d'ouverture
                </CardTitle>
                <CardDescription>
                  Définissez les jours et heures d'ouverture de votre restaurant
                </CardDescription>
              </CardHeader>

              <CardContent>
                <Alert className="mb-6">
                  <Info className="h-4 w-4" />
                  <AlertTitle>Conseil</AlertTitle>
                  <AlertDescription>
                    Vous pourrez modifier ces horaires plus tard dans les
                    paramètres de votre restaurant.
                  </AlertDescription>
                </Alert>

                <div className="space-y-6">
                  {openingHours.map((hours, index) => (
                    <div
                      key={hours.day}
                      className="grid grid-cols-12 gap-4 items-center border-b pb-4">
                      <div className="col-span-3">
                        <h4 className="font-medium">{hours.day}</h4>
                      </div>

                      <div className="col-span-3 flex items-center space-x-2">
                        <Switch
                          checked={hours.open}
                          onCheckedChange={(checked) =>
                            handleOpeningHoursChange(index, "open", checked)
                          }
                        />
                        <span
                          className={
                            hours.open ? "text-green-600" : "text-red-500"
                          }>
                          {hours.open ? "Ouvert" : "Fermé"}
                        </span>
                      </div>

                      {hours.open ? (
                        <>
                          <div className="col-span-3">
                            <label className="text-xs text-gray-500">
                              Heure d'ouverture
                            </label>
                            <Input
                              type="time"
                              value={hours.openTime}
                              onChange={(e) =>
                                handleOpeningHoursChange(
                                  index,
                                  "openTime",
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                          <div className="col-span-3">
                            <label className="text-xs text-gray-500">
                              Heure de fermeture
                            </label>
                            <Input
                              type="time"
                              value={hours.closeTime}
                              onChange={(e) =>
                                handleOpeningHoursChange(
                                  index,
                                  "closeTime",
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                        </>
                      ) : (
                        <div className="col-span-6 text-sm text-gray-500">
                          Restaurant fermé ce jour-là
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-4 flex items-center">
                    <Package className="mr-2 h-5 w-5 text-blue-600" />
                    Options de service
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {deliveryOptions.map((option, index) => {
                      const deliveryType = DELIVERY_TYPES.find(
                        (t) => t.id === option.type,
                      );

                      return (
                        <div
                          key={option.type}
                          className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">
                              {deliveryType?.name}
                            </h4>
                            <Switch
                              checked={option.available}
                              onCheckedChange={(checked) =>
                                handleDeliveryOptionChange(
                                  index,
                                  "available",
                                  checked,
                                )
                              }
                            />
                          </div>
                          <p className="text-xs text-gray-500">
                            {option.available ? "Disponible" : "Non disponible"}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </>
          )}

          {currentStep === 3 && (
            <>
              <CardHeader>
                <CardTitle className="text-xl font-semibold">
                  Finalisation de la configuration
                </CardTitle>
                <CardDescription>
                  Vérifiez les informations avant de continuer
                </CardDescription>
              </CardHeader>

              <CardContent>
                {isSubmitting ? (
                  <div className="text-center py-8 space-y-4">
                    <div className="w-16 h-16 mx-auto relative">
                      <svg
                        className="animate-spin w-full h-full"
                        viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">{loadingText}</h3>
                      <Progress
                        value={uploadProgress}
                        className="max-w-md mx-auto h-2"
                      />
                      <p className="text-sm text-gray-500">
                        Veuillez patienter pendant la configuration...
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <Alert
                      variant="default"
                      className="bg-blue-50 border-blue-200">
                      <AlertCircle className="h-4 w-4 text-blue-600" />
                      <AlertTitle>Vous êtes presque prêt !</AlertTitle>
                      <AlertDescription>
                        Vérifiez que les informations saisies sont correctes
                        avant de finaliser la configuration. Vous pourrez les
                        modifier ultérieurement dans les paramètres.
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-4">
                      <h3 className="text-md font-medium">Récapitulatif</h3>
                      <Separator />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-sm font-medium flex items-center">
                            <Building className="w-4 h-4 mr-2 text-gray-500" />
                            Information de base
                          </h4>
                          <div className="mt-2 space-y-2">
                            <div className="flex">
                              <span className="text-sm font-medium w-24">
                                Nom:
                              </span>
                              <span className="text-sm">
                                {form.getValues().name}
                              </span>
                            </div>
                            <div className="flex">
                              <span className="text-sm font-medium w-24">
                                Cuisine:
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {form.getValues().cuisineTypes.map((type) => (
                                  <Badge
                                    key={type}
                                    variant="secondary"
                                    className="text-xs">
                                    {type}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div className="flex">
                              <span className="text-sm font-medium w-24">
                                Adresse:
                              </span>
                              <span className="text-sm">
                                {form.getValues().address}
                              </span>
                            </div>
                            <div className="flex">
                              <span className="text-sm font-medium w-24">
                                Téléphone:
                              </span>
                              <span className="text-sm">
                                {form.getValues().phone}
                              </span>
                            </div>
                            <div className="flex">
                              <span className="text-sm font-medium w-24">
                                Email:
                              </span>
                              <span className="text-sm">
                                {form.getValues().email}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium flex items-center">
                            <Clock className="w-4 h-4 mr-2 text-gray-500" />
                            Horaires et services
                          </h4>
                          <div className="mt-2 space-y-2">
                            <div className="text-sm">
                              {openingHours.filter((h) => h.open).length} jours
                              d'ouverture par semaine
                            </div>
                            <div className="text-sm">
                              Services disponibles:
                              <div className="flex flex-wrap gap-1 mt-1">
                                {deliveryOptions
                                  .filter((o) => o.available)
                                  .map((option) => {
                                    const deliveryType = DELIVERY_TYPES.find(
                                      (t) => t.id === option.type,
                                    );
                                    return (
                                      <Badge
                                        key={option.type}
                                        variant="outline"
                                        className="text-xs">
                                        {deliveryType?.name}
                                      </Badge>
                                    );
                                  })}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </>
          )}

          <CardFooter className="flex justify-between pt-6 border-t">
            {currentStep > 1 ? (
              <Button
                variant="outline"
                onClick={goToPreviousStep}
                disabled={isSubmitting}
                className="flex items-center">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour
              </Button>
            ) : (
              <div></div>
            )}

            {/* Bouton pour avancer ou finaliser */}
            {currentStep < totalSteps ? (
              <Button
                onClick={goToNextStep}
                className="flex items-center"
                disabled={isUploading}>
                Suivant
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center">
                {isSubmitting
                  ? "Initialisation..."
                  : "Finaliser la configuration"}
                {!isSubmitting && <CheckCircle2 className="ml-2 h-4 w-4" />}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
