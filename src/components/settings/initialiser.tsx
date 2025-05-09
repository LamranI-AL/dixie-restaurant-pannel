/** @format */
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  DialogTrigger,
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
  LucideIcon,
  FileText,
  ClipboardList,
  Euro,
  ShoppingBag,
  UtensilsCrossed,
  FileCheck,
  FileBarChart,
  FileBadge,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/lib/hooks/hooks/use-toast";
// import { getRestaurantById, updateRestaurant } from "@/lib/services/restaurantService";
import { Restaurant, OpeningHours, DeliveryOption } from "@/lib/types";
import { UploadButton } from "@/utils/uploadthing";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { getRestaurantById, updateRestaurant } from "@/actions/restaurant";

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

// Schéma de validation
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

interface TabItemProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

// Composant: Tableau de bord de gestion d'un restaurant
export function RestaurantManagement({
  restaurantId,
}: {
  restaurantId: string;
}) {
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

  // État pour les heures d'ouverture
  const [openingHours, setOpeningHours] = useState<OpeningHours[]>([]);

  // État pour les options de livraison
  const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOption[]>([]);

  // Récupération des infos du restaurant au chargement
  useEffect(() => {
    const fetchRestaurantData = async () => {
      try {
        setIsLoading(true);
        setLoadingMessage("Chargement des informations du restaurant...");

        const result = await getRestaurantById(restaurantId);

        if (result.success && result.restaurant) {
          setRestaurant(result.restaurant);
          setLogoUrl(result.restaurant.logo);
          setOpeningHours(result.restaurant.openingHours || []);
          setDeliveryOptions(result.restaurant.deliveryOptions || []);

          // Initialiser le formulaire avec les données du restaurant
          form.reset({
            name: result.restaurant.name,
            address: result.restaurant.address,
            phone: result.restaurant.phone,
            email: result.restaurant.email,
            website: result.restaurant.website || "",
            cuisineTypes: result.restaurant.cuisineTypes,
            packagingCharges: result.restaurant.packagingCharges,
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
  }, [restaurantId, router, toast]);

  // Initialiser le formulaire avec React Hook Form
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

  // Fonction pour simuler la progression du téléchargement
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

  // Soumettre les modifications
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

      // Préparer les données mises à jour
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

      // Appeler le service pour mettre à jour le restaurant
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

        // Mettre à jour l'état local avec les nouvelles données
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
      setUploadProgress(0);
    }
  };

  // Retour au tableau de bord
  const handleBack = () => {
    router.push("/dashboard");
  };

  // Si chargement en cours, afficher un squelette
  if (isLoading) {
    return <RestaurantManagementSkeleton message={loadingMessage} />;
  }

  // Si le restaurant n'a pas été trouvé
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

  // Liste des onglets
  const tabItems: TabItemProps[] = [
    {
      icon: Building,
      title: "Général",
      description: "Informations de base du restaurant",
    },
    {
      icon: Clock,
      title: "Horaires",
      description: "Gestion des horaires d'ouverture",
    },
    {
      icon: Package,
      title: "Services",
      description: "Options de livraison et services",
    },
    {
      icon: FileText,
      title: "Documents",
      description: "Documents légaux et certifications",
    },
    {
      icon: Settings,
      title: "Paramètres",
      description: "Paramètres avancés du restaurant",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* En-tête avec informations du restaurant */}
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="icon"
            onClick={handleBack}
            className="h-10 w-10">
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <div className="relative flex items-center">
            {logoUrl ? (
              <div className="relative h-16 w-16 rounded-lg border overflow-hidden mr-4">
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
              <div className="flex items-center text-gray-500 text-sm">
                <MapPin className="h-3 w-3 mr-1" />
                <span className="truncate max-w-md">{restaurant.address}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <MoreVertical className="h-4 w-4 mr-2" />
                Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Options du restaurant</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  router.push(`/dashboard/restaurants/${restaurantId}/menu`)
                }>
                <ClipboardList className="h-4 w-4 mr-2" />
                Gérer le menu
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  router.push(`/dashboard/restaurants/${restaurantId}/orders`)
                }>
                <Calendar className="h-4 w-4 mr-2" />
                Voir les commandes
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

      {/* Onglets de gestion */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 mb-8">
          {tabItems.map((item) => (
            <TabsTrigger
              key={item.title.toLowerCase()}
              value={item.title.toLowerCase()}
              className="flex flex-col items-center py-3 px-4 gap-1 data-[state=active]:bg-primary/10">
              <item.icon className="h-5 w-5" />
              <span>{item.title}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            {/* Onglet Général */}
            <TabsContent value="général">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building className="h-5 w-5 mr-2 text-primary" />
                    Informations générales
                  </CardTitle>
                  <CardDescription>
                    Informations de base de votre restaurant visibles par vos
                    clients
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
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
                          <div className="relative w-full h-full group">
                            <Image
                              src={logoUrl}
                              alt="Logo du restaurant"
                              fill
                              sizes="128px"
                              className="object-cover"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
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
                            <p className="text-xs text-gray-500">Aucun logo</p>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 space-y-2">
                        <h4 className="text-sm font-medium">Choisir un logo</h4>
                        <p className="text-xs text-gray-500">
                          Une image claire avec un fond simple est recommandée.
                          Format carré recommandé (1:1).
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
                                    title: "Horaires copiés",
                                    description:
                                      "Les horaires du lundi ont été appliqués à tous les jours",
                                  });
                                }
                              }}
                            />
                            Appliquer à tous les jours
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Onglet Services */}
            <TabsContent value="services">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="h-5 w-5 mr-2 text-blue-600" />
                    Options de service et livraison
                  </CardTitle>
                  <CardDescription>
                    Configurez les modes de commande et options disponibles pour
                    vos clients
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {deliveryOptions.map((option, index) => {
                      const deliveryType = DELIVERY_TYPES.find(
                        (t) => t.id === option.type,
                      );

                      return (
                        <Card
                          key={option.type}
                          className={`border ${
                            option.available
                              ? "border-green-200 bg-green-50/50"
                              : ""
                          }`}>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-md flex items-center">
                              {option.type === "delivery" ? (
                                <Package className="h-4 w-4 mr-2" />
                              ) : option.type === "pickup" ? (
                                <ShoppingBag className="h-4 w-4 mr-2" />
                              ) : (
                                <UtensilsCrossed className="h-4 w-4 mr-2" />
                              )}
                              {deliveryType?.name}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">
                                Activer cette option
                              </span>
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
                            <p className="text-xs text-gray-500 mt-2">
                              {option.type === "delivery"
                                ? "Livraison des commandes au domicile des clients"
                                : option.type === "pickup"
                                ? "Les clients viennent chercher leurs commandes"
                                : "Service à table dans votre établissement"}
                            </p>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-md font-medium flex items-center mb-4">
                      <Euro className="mr-2 h-5 w-5 text-green-600" />
                      Frais supplémentaires
                    </h3>

                    <FormField
                      control={form.control}
                      name="packagingCharges"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Frais d'emballage (€)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="0.00"
                              className="w-36"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Frais supplémentaires appliqués pour l'emballage à
                            emporter
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Onglet Documents */}
            <TabsContent value="documents">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-orange-600" />
                    Documents légaux et certifications
                  </CardTitle>
                  <CardDescription>
                    Gérez vos documents d'entreprise, licences et certifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
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

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      {
                        title: "Registre de commerce",
                        icon: FileCheck,
                        description: "Document officiel d'enregistrement",
                      },
                      {
                        title: "Licence d'exploitation",
                        icon: FileBarChart,
                        description: "Permis d'exploitation d'un restaurant",
                      },
                      {
                        title: "Certification sanitaire",
                        icon: FileBadge,
                        description: "Conformité aux normes d'hygiène",
                      },
                    ].map((doc, i) => (
                      <Card
                        key={i}
                        className="border-dashed border-gray-300">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-md flex items-center">
                            <doc.icon className="h-4 w-4 mr-2 text-gray-500" />
                            {doc.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="h-20 flex flex-col items-center justify-center">
                            <p className="text-xs text-gray-500 text-center">
                              {doc.description}
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-2"
                              disabled>
                              <UploadCloud className="h-3 w-3 mr-1" />
                              Télécharger
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Onglet Paramètres */}
            <TabsContent value="paramètres">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="h-5 w-5 mr-2 text-gray-600" />
                    Paramètres avancés
                  </CardTitle>
                  <CardDescription>
                    Configurez les paramètres avancés de votre restaurant
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-md">
                          Statut du restaurant
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between py-2">
                          <div>
                            <h4 className="font-medium">
                              Activer le restaurant
                            </h4>
                            <p className="text-sm text-gray-500">
                              Si désactivé, le restaurant ne sera pas visible
                              pour les clients
                            </p>
                          </div>
                          <Switch
                            checked={true}
                            disabled
                            onCheckedChange={() => {}}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-md">Notifications</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between py-2">
                          <div>
                            <h4 className="font-medium">
                              Notifications par email
                            </h4>
                            <p className="text-sm text-gray-500">
                              Recevoir des notifications pour les nouvelles
                              commandes
                            </p>
                          </div>
                          <Switch
                            checked={true}
                            disabled
                            onCheckedChange={() => {}}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Alert
                    variant="default"
                    className="bg-blue-50 border-blue-200">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertTitle>Plus d'options à venir</AlertTitle>
                    <AlertDescription>
                      D'autres paramètres avancés seront bientôt disponibles
                      pour configurer votre expérience.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Boutons de sauvegarde */}
            <div className="flex justify-end mt-6 space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={isSaving}>
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isSaving || isUploading}
                className="min-w-32">
                {isSaving ? (
                  <>
                    <span className="mr-2">Enregistrement</span>
                    <Progress
                      value={uploadProgress}
                      className="w-12 h-2"
                    />
                  </>
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

      {/* Dialogue de confirmation de suppression */}
      <Dialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">
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
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                // Logique de suppression à implémenter
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

// Composant de squelette pour le chargement
function RestaurantManagementSkeleton({ message }: { message: string }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-10 w-10 rounded-md" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <Skeleton className="h-12 w-full mb-8" />

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-full max-w-md" />
        </CardHeader>
        <CardContent className="space-y-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-12 w-full"
            />
          ))}
        </CardContent>
      </Card>

      <div className="flex items-center justify-center mt-8 flex-col">
        <div className="flex items-center space-x-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          <p className="text-gray-500">{message || "Chargement en cours..."}</p>
        </div>
      </div>
    </div>
  );
}

{
  /* Nom et cuisine */
}
{
  /* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                            <Input placeholder="Le Bistrot Gourmand" {...field} />
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
                            <span className="text-red-500 ml-1">*</span>
                          </FormLabel>
                          <Select
                            onValueChange={(value) => field.onChange([...field.value, value])}
                            value={undefined}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner un type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {CUISINE_TYPES.filter(
                                (type) => !field.value.includes(type)
                              ).map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {field.value.map((type) => (
                              <Badge key={type} variant="secondary" className="pl-2">
                                {type}
                                <Button
                                  type="button"
                                  variant="ghost"
                                  className="h-5 w-5 p-0 ml-1"
                                  onClick={() =>
                                    field.onChange(
                                      field.value.filter((t) => t !== type)
                                    )
                                  }
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </Badge>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div> */
}

{
  /* Adresse */
}
{
  /* <FormField
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
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          L'adresse exacte de votre restaurant
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )} */
}
{
  /* /> */
}

{
  /* Contact */
}
{
  /* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                            Email
                            <span className="text-red-500 ml-1">*</span>
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
                  </div> */
}

{
  /* Site web */
}
{
  /* <FormField */
}
{
  /* //     control={form.control} */
}
//     name="website"
//     render={({ field }) => (
//       <FormItem>
//         <FormLabel>Site web (optionnel)</FormLabel>
//         <FormControl>
//           <div className="relative">
//             <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
//             <Input
//               className="pl-9"
//               placeholder="https://www.monrestaurant.com"
//               {...field}
//             />
//           </div>
//         </FormControl>
//         <FormDescription>
//           Votre site web ou page de réseaux sociaux
//         </FormDescription>
//         <FormMessage />
//       </FormItem>
//     )}
//   />
// </CardContent>
//   </Card>
// </TabsContent>

{
  /* Onglet Horaires */
}
// <TabsContent value="horaires">
//   <Card>
//     <CardHeader>
//       <CardTitle className="flex items-center">
//         <Clock className="h-5 w-5 mr-2 text-green-600" />
//         Horaires d'ouverture
//       </CardTitle>
//       <CardDescription>
//         Définissez les jours et horaires d'ouverture de votre restaurant
//       </CardDescription>
//     </CardHeader>
//     <CardContent>
//       <Alert variant="default" className="bg-blue-50 border-blue-200 mb-6">
//         <Info className="h-4 w-4 text-blue-600" />
//         <AlertTitle>Information</AlertTitle>
//         <AlertDescription>
//           Les horaires sont affichés sur votre page de commande et permettent aux clients de savoir quand votre restaurant est ouvert.
//         </AlertDescription>
//       </Alert>

//       <div className="space-y-6">
//         {openingHours.map((hours, index) => (
//           <div
//             key={hours.day}
//             className="grid grid-cols-12 gap-4 items-center border-b pb-4"
//           >
//             <div className="col-span-2">
//               <h4 className="font-medium">{hours.day}</h4>
//             </div>

//             <div className="col-span-3 flex items-center space-x-2">
//               <Switch
//                 checked={hours.open}
//                 onCheckedChange={(checked) =>
//                   handleOpeningHoursChange(index, "open", checked)
//                 }
//               />
//               <span
//                 className={
//                   hours.open ? "text-green-600" : "text-red-500"
//                 }
//               >
//                 {hours.open ? "Ouvert" : "Fermé"}
//               </span>
//             </div>

//             {hours.open ? (
//               <>
//                 <div className="col-span-3">
//                   <label className="text-xs text-gray-500">
//                     Heure d'ouverture
//                   </label>
//                   <Input
//                     type="time"
//                     value={hours.openTime}
//                     onChange={(e) =>
//                       handleOpeningHoursChange(
//                         index,
//                         "openTime",
//                         e.target.value
//                       )
//                     }
//                   />
//                 </div>
//                 <div className="col-span-3">
//                   <label className="text-xs text-gray-500">
//                     Heure de fermeture
//                   </label>
//                   <Input
//                     type="time"
//                     value={hours.closeTime}
//                     onChange={(e) =>
//                       handleOpeningHoursChange(
//                         index,
//                         "closeTime",
//                         e.target.value
//                       )
//                     }
//                   />
//                 </div>
//                 <div className="col-span-1">
//                   {hours.openTime && hours.closeTime && (
//                     <span className="text-xs text-gray-500">
//                       {calculateDuration(hours.openTime, hours.closeTime)}
//                     </span>
//                   )}
//                 </div>
//               </>
//             ) : (
//               <div className="col-span-7 text-sm text-gray-500">
//                 Restaurant fermé ce jour-là
//               </div>
//             )}
//           </div>
//         ))}
//       </div>

//       <div className="mt-6 flex justify-end">
//         <Button
//           type="button"
//           variant="outline"
//           onClick={() => {
//             // Appliquer les mêmes horaires à tous les jours
//             if (openingHours.length > 0) {
//               const firstDay = openingHours[0];
//               const updatedHours = openingHours.map(day => ({
//                 ...day,
//                 open: firstDay.open,
//                 openTime: firstDay.openTime,
//                 closeTime: firstDay.closeTime,
//               }));
//               setOpeningHours(updatedHours);

//               toast({
//                 title: "Horaires copiés",
//                 description: "Les horaires du lundi ont été appliqués à tous les jours",
//               });
//             }
//           }}
//         >
//           Appliquer à tous les jours
//         </Button>
//       </div>
//     </CardContent>
//   </Card>
// </TabsContent>
