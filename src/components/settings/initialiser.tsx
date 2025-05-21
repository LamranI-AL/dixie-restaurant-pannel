/** @format */
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Building,
  MapPin,
  Phone,
  Mail,
  Globe,
  Save,
  UploadCloud,
  Clock,
  Package,
  Settings,
  ChevronDown,
  Edit,
  Trash2,
  Info,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  X,
  CameraIcon,
  MoreVertical,
  Calendar,
  FileText,
  ClipboardList,
  Euro,
  ShoppingBag,
  UtensilsCrossed,
  FileCheck,
  FileBarChart,
  FileBadge,
  Copy,
  PenLine,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
// import { useToast } from "@/lib/hooks/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { getRestaurantById, updateRestaurant } from "@/actions/restaurant";
import { Restaurant, OpeningHours, DeliveryOption } from "@/lib/types";
import { UploadButton } from "@/utils/uploadthing";
import { useToast } from "@/lib/hooks/hooks/use-toast";
import { Toaster } from "../ui/toaster";

// Constants
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

// Validation schema
const restaurantSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  address: z.string().min(5, "L'adresse doit être complète"),
  phone: z.string().min(10, "Numéro de téléphone invalide"),
  email: z.string().email("Email invalide"),
  website: z.string().url("URL invalide").optional().or(z.literal("")),
  cuisineTypes: z
    .array(z.string())
    .min(1, "Sélectionnez au moins un type de cuisine"),
  packagingCharges: z.coerce
    .number()
    .min(0, "Les frais d'emballage ne peuvent pas être négatifs"),
});

// Helper function to calculate duration
function calculateDuration(start: any, end: any) {
  if (!start || !end) return "";

  const [startHours, startMinutes] = start.split(":").map(Number);
  const [endHours, endMinutes] = end.split(":").map(Number);

  let hours = endHours - startHours;
  let minutes = endMinutes - startMinutes;

  if (minutes < 0) {
    hours -= 1;
    minutes += 60;
  }

  if (hours < 0) {
    hours += 24; // Assuming end is on the same day or next day
  }

  return `${hours}h${minutes.toString().padStart(2, "0")}`;
}

// Restaurant Management Component
export function RestaurantManagement({
  restaurantId,
}: {
  restaurantId: string;
}) {
  <Toaster />;
  const router = useRouter();
  const { toast } = useToast();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState("general");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  // Opening hours state
  const [openingHours, setOpeningHours] = useState<OpeningHours[]>([]);

  // Delivery options state
  const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOption[]>([]);

  // Form initialization
  const form = useForm<z.infer<typeof restaurantSchema>>({
    resolver: zodResolver(restaurantSchema),
    defaultValues: {
      name: "",
      address: "",
      phone: "",
      email: "",
      website: "",
      cuisineTypes: [],
      packagingCharges: 0,
    },
  });

  // Fetch restaurant data on load
  useEffect(() => {
    const fetchRestaurantData = async () => {
      try {
        setIsLoading(true);
        setLoadingMessage("Chargement des informations du restaurant...");

        const result = await getRestaurantById(restaurantId);

        if (result.success && result.restaurant) {
          setRestaurant(result.restaurant);
          setLogoUrl(result.restaurant.logo);

          // Initialize opening hours if empty
          if (
            !result.restaurant.openingHours ||
            result.restaurant.openingHours.length === 0
          ) {
            const defaultHours = DAYS_OF_WEEK.map((day) => ({
              day,
              open: day !== "Dimanche",
              openTime: "09:00",
              closeTime: "22:00",
            }));
            setOpeningHours(defaultHours);
          } else {
            setOpeningHours(result.restaurant.openingHours);
          }

          // Initialize delivery options if empty
          if (
            !result.restaurant.deliveryOptions ||
            result.restaurant.deliveryOptions.length === 0
          ) {
            const defaultOptions = DELIVERY_TYPES.map((type) => ({
              type: type.id,
              available: type.id === "delivery" || type.id === "pickup",
              minOrderAmount: type.id === "delivery" ? 15 : 0,
              deliveryFee: type.id === "delivery" ? 3.5 : 0,
            }));
            setDeliveryOptions(defaultOptions);
          } else {
            setDeliveryOptions(result.restaurant.deliveryOptions);
          }

          // Initialize form with restaurant data
          form.reset({
            name: result.restaurant.name,
            address: result.restaurant.address,
            phone: result.restaurant.phone,
            email: result.restaurant.email,
            website: result.restaurant.website || "",
            cuisineTypes: result.restaurant.cuisineTypes || [],
            packagingCharges: result.restaurant.packagingCharges || 0,
          });
        } else {
          toast({
            title: "Erreur",
            description:
              result.error ||
              "Impossible de charger les informations du restaurant",
            variant: "destructive",
          });
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("Erreur lors du chargement:", error);
        toast({
          title: "Erreur",
          description:
            "Une erreur s'est produite lors du chargement des données",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (restaurantId) {
      fetchRestaurantData();
    }
  }, [restaurantId, router, toast, form]);

  // Simulate upload progress
  const simulateProgress = (
    start = 0,
    max = 100,
    message = "Traitement en cours...",
  ) => {
    setUploadProgress(start);
    setLoadingMessage(message);
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

  // Handle opening hours changes
  const handleOpeningHoursChange = (
    index: number,
    field: keyof OpeningHours,
    value: any,
  ) => {
    const updatedHours = [...openingHours];
    updatedHours[index] = { ...updatedHours[index], [field]: value };
    setOpeningHours(updatedHours);
  };

  // Handle delivery option changes
  const handleDeliveryOptionChange = (
    index: number,
    field: keyof DeliveryOption,
    value: any,
  ) => {
    const updatedOptions = [...deliveryOptions];
    updatedOptions[index] = { ...updatedOptions[index], [field]: value };
    setDeliveryOptions(updatedOptions);
  };

  // Submit form changes
  const handleSubmit = async (formValues: z.infer<typeof restaurantSchema>) => {
    if (!restaurant) return;

    try {
      setIsSaving(true);
      setLoadingMessage("Enregistrement des modifications...");
      const progressInterval = simulateProgress(
        0,
        90,
        "Mise à jour de votre restaurant...",
      );

      // Prepare updated data
      const updatedData: Partial<Restaurant> = {
        name: formValues.name,
        logo: logoUrl,
        address: formValues.address,
        phone: formValues.phone,
        email: formValues.email,
        website: formValues.website,
        cuisineTypes: formValues.cuisineTypes,
        openingHours,
        deliveryOptions,
        packagingCharges: formValues.packagingCharges,
      };

      // Call update service
      const result = await updateRestaurant(restaurantId, updatedData);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (result.success) {
        toast({
          title: "Succès",
          description:
            "Les informations de votre restaurant ont été mises à jour",
          variant: "default",
        });

        // Update local state with new data
        setRestaurant({
          ...restaurant,
          ...updatedData,
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      toast({
        title: "Erreur",
        description:
          "Une erreur s'est produite lors de l'enregistrement des modifications",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  // Return to dashboard
  const handleBack = () => {
    router.push("/dashboard");
  };

  // Apply Monday hours to all days
  const applyMondayHoursToAll = () => {
    if (openingHours.length > 0) {
      const mondayHours = openingHours[0];
      const updatedHours = openingHours.map((day, index) =>
        index === 0
          ? day
          : {
              ...day,
              open: mondayHours.open,
              openTime: mondayHours.openTime,
              closeTime: mondayHours.closeTime,
            },
      );

      setOpeningHours(updatedHours);

      toast({
        title: "Horaires copiés",
        description: "Les horaires du lundi ont été appliqués à tous les jours",
      });
    }
  };

  // If loading, show skeleton
  if (isLoading) {
    return <RestaurantManagementSkeleton message={loadingMessage} />;
  }

  // If restaurant not found
  if (!restaurant) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>
            Restaurant introuvable. Veuillez vérifier l'identifiant ou retourner
            au tableau de bord.
          </AlertDescription>
        </Alert>
        <Button
          onClick={handleBack}
          className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour au tableau de bord
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header with restaurant info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="icon"
              onClick={handleBack}
              className="h-10 w-10 bg-white">
              <ArrowLeft className="h-4 w-4" />
            </Button>

            <div className="relative flex items-center">
              {logoUrl ? (
                <div className="relative h-16 w-16 rounded-lg border overflow-hidden mr-4 shadow-sm">
                  <Image
                    src={logoUrl}
                    alt={restaurant.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="h-16 w-16 rounded-lg border bg-gray-100 flex items-center justify-center mr-4">
                  <Building className="h-8 w-8 text-gray-400" />
                </div>
              )}

              <div>
                <h1 className="text-2xl font-bold">{restaurant.name}</h1>
                <div className="flex items-center text-gray-500 text-sm mt-1">
                  <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                  <span className="truncate max-w-md">
                    {restaurant.address}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={() => router.push(`/foods`)}
              className="bg-white border-gray-200">
              <ClipboardList className="h-4 w-4 mr-2" />
              Menu
            </Button>

            <Button
              variant="outline"
              onClick={() => router.push(`/orders`)}
              className="bg-white border-gray-200">
              <Calendar className="h-4 w-4 mr-2" />
              Commandes
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="bg-white border-gray-200">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56">
                <DropdownMenuLabel>Options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push(`/dashboard`)}>
                  <FileBarChart className="h-4 w-4 mr-2" />
                  Statistiques
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    router.push(
                      `/dashboard/restaurants/${restaurantId}/reviews`,
                    )
                  }>
                  <Edit className="h-4 w-4 mr-2" />
                  Avis clients
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() => setDeleteDialogOpen(true)}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer le restaurant
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Management tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full">
          <TabsList className="w-full grid grid-cols-5 bg-gray-50 p-0 h-auto">
            {[
              { id: "general", icon: Building, label: "Général" },
              { id: "horaires", icon: Clock, label: "Horaires" },
              { id: "services", icon: Package, label: "Services" },
              { id: "documents", icon: FileText, label: "Documents" },
              { id: "parametres", icon: Settings, label: "Paramètres" },
            ].map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="py-4 px-3 data-[state=active]:bg-white rounded-none border-b-2 border-transparent data-[state=active]:border-primary flex items-center gap-2">
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
              <div className="p-6">
                {/* General Tab */}
                <TabsContent
                  value="general"
                  className="mt-0">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Basic Information */}
                    <div>
                      <h3 className="text-lg font-medium mb-4 flex items-center text-gray-800">
                        <Building className="h-5 w-5 mr-2 text-primary" />
                        Informations générales
                      </h3>

                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Nom du restaurant
                                <span className="text-red-500 ml-1">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Le Bistrot Gourmand"
                                  {...field}
                                  className="bg-white"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Adresse
                                <span className="text-red-500 ml-1">*</span>
                              </FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="123 Rue de la Gastronomie, 75001 Paris"
                                  className="resize-none bg-white"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  Téléphone
                                  <span className="text-red-500 ml-1">*</span>
                                </FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                      className="pl-9 bg-white"
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
                                  Email
                                  <span className="text-red-500 ml-1">*</span>
                                </FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                      className="pl-9 bg-white"
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

                        <FormField
                          control={form.control}
                          name="website"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Site web (optionnel)</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                  <Input
                                    className="pl-9 bg-white"
                                    placeholder="https://www.monrestaurant.com"
                                    {...field}
                                  />
                                </div>
                              </FormControl>
                              <FormDescription>
                                Votre site web ou page de réseaux sociaux
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Logo and Cuisine Types */}
                    <div className="space-y-8">
                      {/* Logo upload */}
                      <div className="bg-gray-50 rounded-lg p-6 border border-gray-100">
                        <h3 className="text-md font-medium flex items-center mb-4">
                          <UploadCloud className="w-5 h-5 mr-2 text-blue-500" />
                          Logo du Restaurant
                        </h3>

                        <div className="flex items-start space-x-6">
                          <div className="w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center bg-white relative overflow-hidden">
                            {logoUrl ? (
                              <div className="relative w-full h-full group">
                                <Image
                                  src={logoUrl}
                                  alt="Logo du restaurant"
                                  fill
                                  sizes="128px"
                                  className="object-cover"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => setLogoUrl(undefined)}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
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
                              Choisir un logo
                            </h4>
                            <p className="text-xs text-gray-500">
                              Une image claire avec un fond simple est
                              recommandée. Format carré recommandé (1:1).
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
                              <div className="bg-gradient-to-b from-orange-950 border-t-yellow-800 rounded-md p-4 border border-gray-200">
                                <UploadButton
                                  endpoint="imageUploader"
                                  onClientUploadComplete={(res) => {
                                    if (res && res[0] && res[0].url) {
                                      setLogoUrl(res[0].url);
                                      toast({
                                        title: "Logo téléchargé",
                                        description:
                                          "Votre logo a été téléchargé avec succès",
                                      });
                                    }
                                  }}
                                  onUploadProgress={(progress) => {
                                    setUploadProgress(progress);
                                  }}
                                  onUploadError={(error) => {
                                    toast({
                                      title: "Erreur",
                                      description: error.message,
                                      variant: "destructive",
                                    });
                                    setIsUploading(false);
                                    setUploadProgress(0);
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Cuisine Types */}
                      <div>
                        <FormField
                          control={form.control}
                          name="cuisineTypes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Types de cuisine
                                <span className="text-red-500 ml-1">*</span>
                              </FormLabel>
                              <Select
                                onValueChange={(value) =>
                                  field.onChange([...field.value, value])
                                }
                                value={undefined}>
                                <FormControl>
                                  <SelectTrigger className="bg-white">
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
                              <div className="flex flex-wrap gap-2 mt-3">
                                {field.value.map((type) => (
                                  <Badge
                                    key={type}
                                    variant="secondary"
                                    className="pl-2 py-1">
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

                                {field.value.length === 0 && (
                                  <p className="text-sm text-gray-500 italic">
                                    Aucun type de cuisine sélectionné
                                  </p>
                                )}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Hours Tab */}
                <TabsContent
                  value="horaires"
                  className="mt-0">
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium flex items-center text-gray-800">
                        <Clock className="h-5 w-5 mr-2 text-green-600" />
                        Horaires d'ouverture
                      </h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={applyMondayHoursToAll}
                        className="bg-white text-sm flex items-center">
                        <Copy className="h-3.5 w-3.5 mr-1.5" />
                        Appliquer Lundi à tous les jours
                      </Button>
                    </div>

                    <Alert className="bg-blue-50 border-blue-200">
                      <Info className="h-4 w-4 text-blue-600" />
                      <AlertTitle>Information</AlertTitle>
                      <AlertDescription>
                        Les horaires sont affichés sur votre page de commande et
                        permettent aux clients de savoir quand commander.
                      </AlertDescription>
                    </Alert>

                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                      <div className="grid grid-cols-12 gap-2 bg-gray-50 px-6 py-3 border-b">
                        <div className="col-span-2 font-medium text-sm text-gray-600">
                          Jour
                        </div>
                        <div className="col-span-2 font-medium text-sm text-gray-600">
                          Statut
                        </div>
                        <div className="col-span-3 font-medium text-sm text-gray-600">
                          Ouverture
                        </div>
                        <div className="col-span-3 font-medium text-sm text-gray-600">
                          Fermeture
                        </div>
                        <div className="col-span-2 font-medium text-sm text-gray-600">
                          Durée
                        </div>
                      </div>

                      <div className="divide-y">
                        {openingHours.map((hours, index) => (
                          <div
                            key={hours.day}
                            className={`grid grid-cols-12 gap-2 px-6 py-4 items-center ${
                              hours.open ? "bg-white" : "bg-gray-50"
                            }`}>
                            <div className="col-span-2">
                              <p className="font-medium">{hours.day}</p>
                            </div>

                            <div className="col-span-2 flex items-center space-x-2">
                              <Switch
                                checked={hours.open}
                                onCheckedChange={(checked) =>
                                  handleOpeningHoursChange(
                                    index,
                                    "open",
                                    checked,
                                  )
                                }
                                className={hours.open ? "bg-green-500" : ""}
                              />
                              <span
                                className={
                                  hours.open
                                    ? "text-sm text-green-600 font-medium"
                                    : "text-sm text-gray-500 font-medium"
                                }>
                                {hours.open ? "Ouvert" : "Fermé"}
                              </span>
                            </div>

                            {hours.open ? (
                              <>
                                <div className="col-span-3">
                                  <div className="flex flex-col">
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
                                      className="bg-white"
                                    />
                                  </div>
                                </div>
                                <div className="col-span-3">
                                  <div className="flex flex-col">
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
                                      className="bg-white"
                                    />
                                  </div>
                                </div>
                                <div className="col-span-2">
                                  {hours.openTime && hours.closeTime && (
                                    <Badge
                                      variant="outline"
                                      className="bg-green-50 text-green-700 border-green-200">
                                      {calculateDuration(
                                        hours.openTime,
                                        hours.closeTime,
                                      )}
                                    </Badge>
                                  )}
                                </div>
                              </>
                            ) : (
                              <div className="col-span-8 text-sm text-gray-500 italic">
                                Restaurant fermé ce jour-là
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Services Tab */}
                <TabsContent
                  value="services"
                  className="mt-0">
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium flex items-center text-gray-800">
                      <Package className="h-5 w-5 mr-2 text-blue-600" />
                      Options de service et livraison
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {deliveryOptions.map((option, index) => {
                        const deliveryType = DELIVERY_TYPES.find(
                          (t) => t.id === option.type,
                        );

                        return (
                          <div
                            key={option.type}
                            className={`bg-white rounded-lg border ${
                              option.available
                                ? "border-green-200 ring-1 ring-green-100"
                                : "border-gray-200"
                            } p-4 transition-all hover:shadow-sm`}>
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium flex items-center">
                                {option.type === "delivery" ? (
                                  <Package className="h-4 w-4 mr-2 text-blue-500" />
                                ) : option.type === "pickup" ? (
                                  <ShoppingBag className="h-4 w-4 mr-2 text-amber-500" />
                                ) : (
                                  <UtensilsCrossed className="h-4 w-4 mr-2 text-purple-500" />
                                )}
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
                                className={
                                  option.available ? "bg-green-500" : ""
                                }
                              />
                            </div>

                            <p className="text-sm text-gray-500 mb-3">
                              {option.type === "delivery"
                                ? "Livraison des commandes au domicile des clients"
                                : option.type === "pickup"
                                  ? "Les clients viennent chercher leurs commandes"
                                  : "Service à table dans votre établissement"}
                            </p>

                            {option.available && (
                              <div className="mt-3 pt-3 border-t border-gray-100">
                                <Badge
                                  variant="outline"
                                  className="bg-green-50 text-green-700 border-green-200">
                                  Activé
                                </Badge>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-8">
                      <h3 className="text-lg font-medium flex items-center text-gray-800 mb-4">
                        <Euro className="h-5 w-5 mr-2 text-green-600" />
                        Frais supplémentaires
                      </h3>

                      <div className="bg-white p-6 rounded-lg border border-gray-200">
                        <div className="max-w-md">
                          <FormField
                            control={form.control}
                            name="packagingCharges"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Frais d'emballage (MAD)</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Input
                                      type="number"
                                      // value={option}
                                      min="0"
                                      step="0.01"
                                      placeholder="0.00"
                                      className="bg-white pl-6"
                                      {...field}
                                    />
                                    <span className="absolute left-3 top-2.5 text-gray-500">
                                      MAD
                                    </span>
                                  </div>
                                </FormControl>
                                <FormDescription>
                                  Frais supplémentaires appliqués pour
                                  l'emballage à emporter
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Documents Tab */}
                <TabsContent
                  value="documents"
                  className="mt-0">
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium flex items-center text-gray-800">
                      <FileText className="h-5 w-5 mr-2 text-orange-600" />
                      Documents légaux et certifications
                    </h3>

                    <Alert
                      variant="default"
                      className="bg-amber-50 border-amber-200">
                      <Info className="h-4 w-4 text-amber-600" />
                      <AlertTitle>Fonctionnalité à venir</AlertTitle>
                      <AlertDescription>
                        La gestion de documents sera bientôt disponible. Vous
                        pourrez télécharger et organiser vos documents légaux,
                        licences et certifications.
                      </AlertDescription>
                    </Alert>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                      {[
                        {
                          title: "Registre de commerce",
                          icon: FileCheck,
                          description: "Document officiel d'enregistrement",
                          color: "text-blue-500",
                        },
                        {
                          title: "Licence d'exploitation",
                          icon: FileBarChart,
                          description: "Permis d'exploitation d'un restaurant",
                          color: "text-green-500",
                        },
                        {
                          title: "Certification sanitaire",
                          icon: FileBadge,
                          description: "Conformité aux normes d'hygiène",
                          color: "text-purple-500",
                        },
                      ].map((doc, i) => (
                        <div
                          key={i}
                          className="bg-white rounded-lg border border-dashed border-gray-300 p-4 hover:border-gray-400 transition-colors group">
                          <div className="h-36 flex flex-col items-center justify-center text-center">
                            <doc.icon
                              className={`h-10 w-10 ${doc.color} mb-3 opacity-70`}
                            />
                            <h4 className="font-medium mb-1">{doc.title}</h4>
                            <p className="text-xs text-gray-500 mb-4">
                              {doc.description}
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-2 bg-white group-hover:bg-gray-50"
                              disabled>
                              <UploadCloud className="h-3.5 w-3.5 mr-1.5" />
                              Télécharger
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                {/* Settings Tab */}
                <TabsContent
                  value="parametres"
                  className="mt-0">
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium flex items-center text-gray-800">
                      <Settings className="h-5 w-5 mr-2 text-gray-600" />
                      Paramètres avancés
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white rounded-lg border border-gray-200 p-5">
                        <h4 className="text-md font-medium mb-4 flex items-center">
                          <Building className="h-4 w-4 mr-2 text-primary" />
                          Statut du restaurant
                        </h4>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between py-2 border-b border-gray-100 pb-3">
                            <div>
                              <h5 className="font-medium">
                                Activer le restaurant
                              </h5>
                              <p className="text-sm text-gray-500 mt-0.5">
                                Si désactivé, le restaurant ne sera pas visible
                                pour les clients
                              </p>
                            </div>
                            <Switch
                              checked={true}
                              className="bg-green-500"
                              onCheckedChange={() => {
                                toast({
                                  title: "Action importante",
                                  description:
                                    "La désactivation du restaurant masquera toutes vos offres. Cette fonctionnalité est en cours de développement.",
                                  variant: "destructive",
                                });
                              }}
                            />
                          </div>
                          <div className="flex items-center justify-between py-2">
                            <div>
                              <h5 className="font-medium">Mode vacances</h5>
                              <p className="text-sm text-gray-500 mt-0.5">
                                Désactive temporairement les commandes pendant
                                votre absence
                              </p>
                            </div>
                            <Switch
                              checked={false}
                              onCheckedChange={() => {
                                toast({
                                  title: "Fonctionnalité en développement",
                                  description:
                                    "Le mode vacances sera disponible prochainement",
                                  variant: "default",
                                });
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg border border-gray-200 p-5">
                        <h4 className="text-md font-medium mb-4 flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-primary" />
                          Notifications
                        </h4>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between py-2 border-b border-gray-100 pb-3">
                            <div>
                              <h5 className="font-medium">
                                Notifications par email
                              </h5>
                              <p className="text-sm text-gray-500 mt-0.5">
                                Recevoir des notifications pour les nouvelles
                                commandes
                              </p>
                            </div>
                            <Switch
                              checked={true}
                              className="bg-green-500"
                              onCheckedChange={() => {
                                toast({
                                  title: "Configuration des notifications",
                                  description:
                                    "Les paramètres de notifications email seront configurables prochainement",
                                  variant: "default",
                                });
                              }}
                            />
                          </div>
                          <div className="flex items-center justify-between py-2">
                            <div>
                              <h5 className="font-medium">Notifications SMS</h5>
                              <p className="text-sm text-gray-500 mt-0.5">
                                Recevoir des alertes SMS pour les commandes
                                urgentes
                              </p>
                            </div>
                            <Switch
                              checked={false}
                              onCheckedChange={() => {
                                toast({
                                  title: "Fonctionnalité en développement",
                                  description:
                                    "Les notifications SMS seront bientôt disponibles",
                                  variant: "default",
                                });
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <Alert
                      variant="default"
                      className="bg-blue-50 border-blue-200 mt-6">
                      <Info className="h-4 w-4 text-blue-600" />
                      <AlertTitle>Plus d'options à venir</AlertTitle>
                      <AlertDescription>
                        D'autres paramètres avancés seront bientôt disponibles
                        pour configurer votre expérience.
                      </AlertDescription>
                    </Alert>
                  </div>
                </TabsContent>
              </div>

              {/* Save buttons */}
              <div className="bg-gray-50 px-6 py-4 flex justify-end items-center space-x-4 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={isSaving}
                  className="bg-white">
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving || isUploading}
                  className="min-w-36">
                  {isSaving ? (
                    <div className="flex items-center">
                      <span className="mr-2">Enregistrement</span>
                      <div className="w-16 h-1 bg-white/20 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-white transition-all duration-300 ease-in-out"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Enregistrer les modifications
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </Tabs>
      </div>

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center">
              <Trash2 className="h-5 w-5 mr-2" />
              Supprimer le restaurant
            </DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer ce restaurant ? Cette action
              est irréversible. Toutes les données associées seront
              définitivement supprimées.
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 bg-red-50 rounded-md border border-red-200 my-4">
            <p className="font-semibold">{restaurant.name}</p>
            <p className="text-sm text-gray-500">{restaurant.address}</p>
          </div>
          <DialogFooter className="sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="bg-white">
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                // Delete logic to implement
                setDeleteDialogOpen(false);
                toast({
                  title: "Fonctionnalité à venir",
                  description: "La suppression sera bientôt disponible",
                  variant: "default",
                });
              }}>
              Supprimer définitivement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Loading skeleton
function RestaurantManagementSkeleton({ message }: { message: string }) {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header skeleton */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-10 w-10 rounded-md" />
            <div className="flex items-center">
              <Skeleton className="h-16 w-16 rounded-lg mr-4" />
              <div>
                <Skeleton className="h-7 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-10" />
          </div>
        </div>
      </div>

      {/* Tabs skeleton */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <Skeleton className="h-14 w-full" />

        <div className="p-6">
          <Skeleton className="h-7 w-48 mb-4" />

          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-12 w-full"
              />
            ))}
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center flex-col">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            <p className="text-gray-500 font-medium">{message}</p>
          </div>
          <div className="w-64 h-1.5 bg-gray-100 rounded-full mt-4 overflow-hidden">
            <div
              className="h-full bg-primary animate-pulse"
              style={{ width: "60%" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
