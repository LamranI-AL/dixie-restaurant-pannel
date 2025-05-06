/** @format */
"use client";
import { useEffect, useState } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ImagePlus,
  Save,
  Clock,
  DollarSign,
  Tag,
  FileText,
  Trash2,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Plus,
  GripVertical,
  Coffee,
} from "lucide-react";
import { toast } from "sonner";
import { getAllCategories } from "@/actions/category";
import { addFood } from "@/actions/food";
import { UploadButton } from "@/utils/uploadthing";
import { Addon, Category, Food, Variation } from "@/lib/types";
import Image from "next/image";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FoodFormData {
  name: string;
  description: string;
  price: string;
  discountPrice: string;
  categoryId: string;
  cuisineId: string;
  isAvailable: boolean;
  preparationTime: string;
}

interface FormErrors {
  name?: string;
  description?: string;
  price?: string;
  discountPrice?: string;
  categoryId?: string;
  cuisineId?: string;
  preparationTime?: string;
  variations?: string;
  addons?: string;
}

// Form completion status tracker
interface FormCompletion {
  name: boolean;
  description: boolean;
  price: boolean;
  categoryId: boolean;
  preparationTime: boolean;
  image: boolean;
}

// Liste des cuisines fictives
const cuisines = [
  { id: "italian", name: "Italien" },
  { id: "french", name: "Français" },
  { id: "asian", name: "Asiatique" },
  { id: "indian", name: "Indien" },
  { id: "american", name: "Américain" },
  { id: "mexican", name: "Mexicain" },
  { id: "mediterranean", name: "Méditerranéen" },
];

const AddFoodForm: React.FC = () => {
  const router = useRouter();
  // Form state
  const [formData, setFormData] = useState<FoodFormData>({
    name: "",
    description: "",
    price: "",
    discountPrice: "",
    categoryId: "",
    cuisineId: "",
    isAvailable: true,
    preparationTime: "",
  });

  // État pour les variations et suppléments
  const [variations, setVariations] = useState<Variation[]>([]);
  const [addons, setAddons] = useState<Addon[]>([]);

  // État pour les formulaires de variation et de supplément
  const [newVariation, setNewVariation] = useState<{
    name: string;
    price: string;
  }>({
    name: "",
    price: "",
  });
  const [newAddon, setNewAddon] = useState<{ name: string; price: string }>({
    name: "",
    price: "",
  });

  // State for categories, images, etc.
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [imageUrl, setUrlImage] = useState<string>("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [formCompletion, setFormCompletion] = useState<FormCompletion>({
    name: false,
    description: false,
    price: false,
    categoryId: false,
    preparationTime: false,
    image: false,
  });

  // Erreurs spécifiques pour les variations et suppléments
  const [variationError, setVariationError] = useState<string | null>(null);
  const [addonError, setAddonError] = useState<string | null>(null);

  // Calculate completion percentage
  const calculateCompletionPercentage = () => {
    const requiredFields = Object.keys(formCompletion);
    const completedCount = Object.values(formCompletion).filter(Boolean).length;
    return Math.round((completedCount / requiredFields.length) * 100);
  };

  // Track form completion
  useEffect(() => {
    setFormCompletion({
      name: formData.name.trim() !== "",
      description: formData.description.trim() !== "",
      price: formData.price !== "" && /^\d+(\.\d{1,2})?$/.test(formData.price),
      categoryId: formData.categoryId !== "",
      preparationTime:
        formData.preparationTime !== "" &&
        /^\d+$/.test(formData.preparationTime),
      image: imageUrl !== "",
    });
  }, [formData, imageUrl]);

  // Show unsaved changes warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (Object.values(formCompletion).some(Boolean) && !submitting) {
        e.preventDefault();
        e.returnValue =
          "Vous avez des modifications non enregistrées. Êtes-vous sûr de vouloir quitter ?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [formCompletion, submitting]);

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const result = await getAllCategories();
        if (result.success && result.categories) {
          setCategories(result.categories as Category[]);
        } else {
          toast.error("Impossible de charger les catégories", {
            description: "Veuillez rafraîchir la page",
            action: {
              label: "Réessayer",
              onClick: () => fetchCategories(),
            },
          });
        }
      } catch (error) {
        toast.error("Impossible de charger les catégories", {
          description: "Veuillez réessayer plus tard",
          action: {
            label: "Réessayer",
            onClick: () => fetchCategories(),
          },
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear the error for this field when user types
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      isAvailable: checked,
    }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      categoryId: value,
    }));

    if (errors.categoryId) {
      setErrors((prev) => ({
        ...prev,
        categoryId: undefined,
      }));
    }
  };

  const handleCuisineChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      cuisineId: value,
    }));

    if (errors.cuisineId) {
      setErrors((prev) => ({
        ...prev,
        cuisineId: undefined,
      }));
    }
  };

  // Gestion des variations
  const handleVariationInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = e.target;
    setNewVariation((prev) => ({
      ...prev,
      [name]: value,
    }));
    setVariationError(null);
  };

  const addVariation = () => {
    // Validation
    if (!newVariation.name.trim()) {
      setVariationError("Le nom de la variation est requis");
      return;
    }

    if (
      !newVariation.price.trim() ||
      !/^\d+(\.\d{1,2})?$/.test(newVariation.price)
    ) {
      setVariationError("Prix invalide");
      return;
    }

    const variationId = `var-${Date.now()}`;
    setVariations(
      (prev) =>
        [
          ...prev,
          {
            id: variationId,
            name: newVariation.name,
            price: parseFloat(newVariation.price),
          },
        ] as any,
    );

    // Réinitialiser le formulaire
    setNewVariation({ name: "", price: "" });
    setVariationError(null);

    toast.success("Variation ajoutée", {
      description: `${newVariation.name} (${newVariation.price} €) a été ajouté`,
    });
  };

  const removeVariation = (id: string) => {
    setVariations((prev) => prev.filter((variation) => variation.id !== id));
    toast.info("Variation supprimée");
  };

  // Gestion des suppléments
  const handleAddonInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewAddon((prev) => ({
      ...prev,
      [name]: value,
    }));
    setAddonError(null);
  };

  const addAddon = () => {
    // Validation
    if (!newAddon.name.trim()) {
      setAddonError("Le nom du supplément est requis");
      return;
    }

    if (!newAddon.price.trim() || !/^\d+(\.\d{1,2})?$/.test(newAddon.price)) {
      setAddonError("Prix invalide");
      return;
    }

    const addonId = `add-${Date.now()}`;
    setAddons(
      (prev) =>
        [
          ...prev,
          {
            id: addonId,
            name: newAddon.name,
            price: parseFloat(newAddon.price),
          },
        ] as any,
    );

    // Réinitialiser le formulaire
    setNewAddon({ name: "", price: "" });
    setAddonError(null);

    toast.success("Supplément ajouté", {
      description: `${newAddon.name} (${newAddon.price} €) a été ajouté`,
    });
  };

  const removeAddon = (id: string) => {
    setAddons((prev) => prev.filter((addon) => addon.id !== id));
    toast.info("Supplément supprimé");
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) newErrors.name = "Le nom du plat est requis";
    if (!formData.description.trim())
      newErrors.description = "La description est requise";
    if (!formData.categoryId) newErrors.categoryId = "La catégorie est requise";

    if (!formData.price) {
      newErrors.price = "Le prix est requis";
    } else if (!/^\d+(\.\d{1,2})?$/.test(formData.price)) {
      newErrors.price = "Veuillez entrer un prix valide";
    }

    if (
      formData.discountPrice &&
      !/^\d+(\.\d{1,2})?$/.test(formData.discountPrice)
    ) {
      newErrors.discountPrice = "Veuillez entrer un prix de remise valide";
    }

    if (!formData.preparationTime) {
      newErrors.preparationTime = "Le temps de préparation est requis";
    } else if (!/^\d+$/.test(formData.preparationTime)) {
      newErrors.preparationTime = "Veuillez entrer un nombre valide";
    }

    if (!imageUrl) {
      toast.warning("Aucune image téléchargée", {
        description: "Veuillez télécharger au moins une image du plat",
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const simulateProgress = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return prev;
        }
        return prev + 5;
      });
    }, 100);
    return interval;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Veuillez corriger les erreurs dans le formulaire", {
        description: "Remplissez tous les champs obligatoires correctement",
      });
      // Scroll to the first error
      const firstErrorElement = document.querySelector(".text-red-500");
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
      return;
    }

    // Prepare data for server action
    const foodData = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      discountPrice: formData.discountPrice
        ? parseFloat(formData.discountPrice)
        : undefined,
      image: imageUrl,
      images: [imageUrl],
      categoryId: formData.categoryId,
      cuisineId: formData.cuisineId || undefined,
      isAvailable: formData.isAvailable,
      preparationTime: parseInt(formData.preparationTime, 10),
      variations: variations,
      addons: addons,
      restaurantId: "current-restaurant-id", // This would come from context or auth in real app
      totalSold: 0,
      rating: 0,
      reviewCount: 0,
    };

    try {
      setSubmitting(true);
      // Show progress indicator
      const progressInterval = simulateProgress();

      const result = await addFood(foodData as Food);

      // Complete the progress bar
      clearInterval(progressInterval);
      setUploadProgress(100);

      // Delay to show the complete progress
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (result.success) {
        toast.success("Plat ajouté avec succès !", {
          description: `"${formData.name}" a été ajouté à votre menu`,
        });

        // Small delay to show success before redirecting
        setTimeout(() => {
          router.push("/foods");
        }, 1000);
      } else {
        toast.error(result.error || "Échec de l'ajout du plat", {
          description: "Veuillez réessayer",
        });
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout du plat:", error);
      toast.error("Une erreur inattendue s'est produite", {
        description:
          "Veuillez réessayer ou contacter le support si le problème persiste",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (Object.values(formCompletion).some(Boolean) && !submitting) {
      toast.warning("Vous avez des modifications non enregistrées", {
        description: "Êtes-vous sûr de vouloir quitter sans enregistrer ?",
        action: {
          label: "Quitter quand même",
          onClick: () => router.push("/foods"),
        },
        cancel: {
          label: "Rester",
          onClick: () => {},
        },
      });
    } else {
      router.push("/foods");
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto pb-10">
      <div className="mb-6 flex items-center justify-between">
        <Button
          variant="ghost"
          className="mb-4 flex items-center"
          onClick={handleCancel}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour aux plats
        </Button>
        <div className="flex items-center space-x-2">
          <div className="text-sm text-gray-500">
            Formulaire : {calculateCompletionPercentage()}%
          </div>
          <div className="w-32">
            <Progress
              value={calculateCompletionPercentage()}
              className="h-2"
            />
          </div>
        </div>
      </div>

      {submitting && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="w-80">
            <CardHeader>
              <CardTitle className="text-center">
                Enregistrement en cours
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress
                value={uploadProgress}
                className="h-2"
              />
              <p className="text-center text-sm">
                {uploadProgress < 100 ? "Traitement en cours..." : "Terminé !"}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="shadow-lg border border-gray-200">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900">
          <CardTitle className="text-2xl font-bold flex items-center">
            <FileText className="mr-2 h-6 w-6 text-blue-600" />
            Ajouter un nouveau plat
          </CardTitle>
          <CardDescription>
            Complétez le formulaire ci-dessous pour ajouter un nouveau plat à
            votre menu
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-500" />
              Informations de base
              {formCompletion.name &&
              formCompletion.description &&
              formCompletion.categoryId ? (
                <CheckCircle2 className="ml-2 h-4 w-4 text-green-500" />
              ) : null}
            </h3>
            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center">
                  Nom du plat
                  <span className="text-red-500 ml-1">*</span>
                  {formCompletion.name && (
                    <CheckCircle2 className="ml-2 h-4 w-4 text-green-500" />
                  )}
                </label>
                <Input
                  placeholder="ex: Pizza Margherita"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={
                    errors.name ? "border-red-500 focus:ring-red-500" : ""
                  }
                />
                {errors.name && (
                  <p className="text-sm text-red-500 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.name}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center">
                  Catégorie
                  <span className="text-red-500 ml-1">*</span>
                  {formCompletion.categoryId && (
                    <CheckCircle2 className="ml-2 h-4 w-4 text-green-500" />
                  )}
                </label>
                {loading ? (
                  <div className="flex items-center space-x-2 p-2 border rounded-md bg-gray-50">
                    <Loader2 className="animate-spin h-4 w-4 text-blue-500" />
                    <span className="text-sm">
                      Chargement des catégories...
                    </span>
                  </div>
                ) : (
                  <Select
                    onValueChange={handleCategoryChange}
                    value={formData.categoryId}>
                    <SelectTrigger
                      className={errors.categoryId ? "border-red-500" : ""}>
                      <SelectValue placeholder="Sélectionnez une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.length > 0 ? (
                        categories.map((category) => (
                          <SelectItem
                            key={category.id}
                            value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="p-2 text-center text-sm text-gray-500">
                          Aucune catégorie trouvée
                          <Button
                            variant="link"
                            className="p-0 h-auto text-blue-500 block mx-auto"
                            onClick={() => router.push("/categories/new")}>
                            Ajouter une catégorie
                          </Button>
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                )}
                {errors.categoryId && (
                  <p className="text-sm text-red-500 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.categoryId}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center">
                  Type de cuisine
                </label>
                <Select
                  onValueChange={handleCuisineChange}
                  value={formData.cuisineId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez le type de cuisine" />
                  </SelectTrigger>
                  <SelectContent>
                    {cuisines.map((cuisine) => (
                      <SelectItem
                        key={cuisine.id}
                        value={cuisine.id}>
                        {cuisine.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  Optionnel: le type de cuisine du plat
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center">
                Description
                <span className="text-red-500 ml-1">*</span>
                {formCompletion.description && (
                  <CheckCircle2 className="ml-2 h-4 w-4 text-green-500" />
                )}
              </label>
              <Textarea
                placeholder="Décrivez le plat..."
                className={`min-h-24 ${
                  errors.description ? "border-red-500 focus:ring-red-500" : ""
                }`}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
              />
              <div className="flex justify-between">
                {errors.description ? (
                  <p className="text-sm text-red-500 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.description}
                  </p>
                ) : (
                  <p className="text-xs text-gray-500">
                    Fournissez une description claire et appétissante
                  </p>
                )}
                <span className="text-xs text-gray-500">
                  {formData.description.length > 0
                    ? `${formData.description.length} caractères`
                    : ""}
                </span>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-green-500" />
              Tarification
              {formCompletion.price ? (
                <CheckCircle2 className="ml-2 h-4 w-4 text-green-500" />
              ) : null}
            </h3>
            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center">
                  Prix (€)
                  <span className="text-red-500 ml-1">*</span>
                  {formCompletion.price && (
                    <CheckCircle2 className="ml-2 h-4 w-4 text-green-500" />
                  )}
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    className={`pl-9 ${
                      errors.price ? "border-red-500 focus:ring-red-500" : ""
                    }`}
                    placeholder="0.00"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                  />
                </div>
                {errors.price ? (
                  <p className="text-sm text-red-500 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.price}
                  </p>
                ) : (
                  <p className="text-xs text-gray-500">Prix normal du plat</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center">
                  Prix réduit (€)
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0 ml-1">
                          <AlertCircle className="h-4 w-4 text-gray-400" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="w-60">
                          Optionnel: Définissez un prix réduit pour les
                          promotions ou offres spéciales. Laissez vide si aucune
                          réduction ne s'applique.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    className={`pl-9 ${
                      errors.discountPrice
                        ? "border-red-500 focus:ring-red-500"
                        : ""
                    }`}
                    placeholder="0.00"
                    name="discountPrice"
                    value={formData.discountPrice}
                    onChange={handleInputChange}
                  />
                </div>
                {errors.discountPrice ? (
                  <p className="text-sm text-red-500 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.discountPrice}
                  </p>
                ) : (
                  <p className="text-xs text-gray-500">
                    Prix promotionnel (optionnel)
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Variations */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center">
              <Coffee className="w-5 h-5 mr-2 text-amber-500" />
              Variations
              {variations.length > 0 && (
                <Badge className="ml-2 bg-amber-500">{variations.length}</Badge>
              )}
            </h3>
            <Separator />

            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Ajoutez différentes options ou tailles pour ce plat (ex: petite,
                moyenne, grande)
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Nom de la variation (ex: Petite)"
                  name="name"
                  value={newVariation.name}
                  onChange={handleVariationInputChange}
                  className={
                    variationError && !newVariation.name ? "border-red-500" : ""
                  }
                />
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    className="pl-9"
                    placeholder="Prix (ex: 10.99)"
                    name="price"
                    value={newVariation.price}
                    onChange={handleVariationInputChange}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Button
                  onClick={addVariation}
                  type="button"
                  size="sm"
                  className="bg-amber-500 hover:bg-amber-600">
                  <Plus className="mr-1 h-4 w-4" />
                  Ajouter variation
                </Button>
                {variationError && (
                  <p className="text-sm text-red-500 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {variationError}
                  </p>
                )}
              </div>

              {variations.length > 0 && (
                <div className="border rounded-md overflow-hidden">
                  <div className="bg-gray-50 p-3 border-b text-sm font-medium flex items-center justify-between">
                    <span>Variations ajoutées ({variations.length})</span>
                  </div>
                  <ScrollArea className="max-h-60">
                    <div className="p-2">
                      {variations.map((variation, index) => (
                        <div
                          key={variation.id}
                          className="flex items-center justify-between p-2 border rounded-md mb-2 bg-white">
                          <div className="flex items-center gap-2">
                            <GripVertical className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">
                              {variation.name}
                            </span>
                            <Badge variant="outline">
                              {variation.price.toFixed(2)} €
                            </Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeVariation(variation.id)}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
          </div>

          {/* Addons (suppléments) */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center">
              <Plus className="w-5 h-5 mr-2 text-purple-500" />
              Suppléments
              {addons.length > 0 && (
                <Badge className="ml-2 bg-purple-500">{addons.length}</Badge>
              )}
            </h3>
            <Separator />

            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Ajoutez des options supplémentaires que les clients peuvent
                sélectionner pour ce plat
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Nom du supplément (ex: Fromage extra)"
                  name="name"
                  value={newAddon.name}
                  onChange={handleAddonInputChange}
                  className={
                    addonError && !newAddon.name ? "border-red-500" : ""
                  }
                />
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    className="pl-9"
                    placeholder="Prix (ex: 1.50)"
                    name="price"
                    value={newAddon.price}
                    onChange={handleAddonInputChange}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Button
                  onClick={addAddon}
                  type="button"
                  size="sm"
                  className="bg-purple-500 hover:bg-purple-600">
                  <Plus className="mr-1 h-4 w-4" />
                  Ajouter supplément
                </Button>
                {addonError && (
                  <p className="text-sm text-red-500 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {addonError}
                  </p>
                )}
              </div>

              {addons.length > 0 && (
                <div className="border rounded-md overflow-hidden">
                  <div className="bg-gray-50 p-3 border-b text-sm font-medium flex items-center justify-between">
                    <span>Suppléments ajoutés ({addons.length})</span>
                  </div>
                  <ScrollArea className="max-h-60">
                    <div className="p-2">
                      {addons.map((addon) => (
                        <div
                          key={addon.id}
                          className="flex items-center justify-between p-2 border rounded-md mb-2 bg-white">
                          <div className="flex items-center gap-2">
                            <GripVertical className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">{addon.name}</span>
                            <Badge variant="outline">
                              +{addon.price.toFixed(2)} €
                            </Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAddon(addon.id)}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
          </div>

          {/* Additional Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center">
              <Tag className="w-5 h-5 mr-2 text-purple-500" />
              Détails additionnels
              {formCompletion.preparationTime ? (
                <CheckCircle2 className="ml-2 h-4 w-4 text-green-500" />
              ) : null}
            </h3>
            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center">
                  Temps de préparation (minutes)
                  <span className="text-red-500 ml-1">*</span>
                  {formCompletion.preparationTime && (
                    <CheckCircle2 className="ml-2 h-4 w-4 text-green-500" />
                  )}
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    className={`pl-9 ${
                      errors.preparationTime
                        ? "border-red-500 focus:ring-red-500"
                        : ""
                    }`}
                    placeholder="15"
                    name="preparationTime"
                    value={formData.preparationTime}
                    onChange={handleInputChange}
                  />
                </div>
                {errors.preparationTime ? (
                  <p className="text-sm text-red-500 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.preparationTime}
                  </p>
                ) : (
                  <p className="text-xs text-gray-500">
                    Temps moyen nécessaire pour préparer ce plat
                  </p>
                )}
              </div>

              <div className="flex flex-row items-center justify-between rounded-lg border p-4 hover:bg-gray-50 transition-colors">
                <div className="space-y-0.5">
                  <label className="text-base font-medium">Disponibilité</label>
                  <p className="text-xs text-gray-500">
                    Ce plat est-il disponible à la commande ?
                  </p>
                </div>
                <Switch
                  checked={formData.isAvailable}
                  onCheckedChange={handleSwitchChange}
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center">
              <ImagePlus className="w-5 h-5 mr-2 text-amber-500" />
              Images du plat
              <span className="text-red-500 ml-1">*</span>
              {formCompletion.image && (
                <CheckCircle2 className="ml-2 h-4 w-4 text-green-500" />
              )}
            </h3>
            <Separator />

            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Téléchargez des images du plat. Des images de haute qualité
                améliorent l'intérêt des clients.
              </p>

              {!imageUrl && (
                <Alert
                  variant="default"
                  className="border-amber-300 bg-amber-50">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  <AlertDescription>
                    Ajouter au moins une image est recommandé pour une meilleure
                    visibilité
                  </AlertDescription>
                </Alert>
              )}

              <div className="bg-gradient-to-r from-blue-900 to-indigo-100 text-zinc-600 rounded-xl p-1">
                <div className="bg-white rounded-lg p-4 text-center">
                  {isUploading ? (
                    <div className="space-y-3">
                      <Loader2 className="animate-spin h-8 w-8 text-blue-500 mx-auto" />
                      <p className="text-sm text-gray-500">
                        Téléchargement de l'image...
                      </p>
                      <Progress
                        value={uploadProgress}
                        className="h-2"
                      />
                    </div>
                  ) : (
                    <div className="bg-gradient-to-r from-blue-900 to-indigo-100 rounded-lg p-4">
                      <UploadButton
                        endpoint="imageUploader"
                        onClientUploadComplete={(res) => {
                          if (res && res[0] && res[0].ufsUrl) {
                            setUrlImage(res[0].ufsUrl);
                            toast.success("Image téléchargée avec succès");
                          }
                          setIsUploading(false);
                          setUploadProgress(100);
                        }}
                        onUploadBegin={() => {
                          setIsUploading(true);
                          const interval = simulateProgress();
                          // Clear interval after 3 seconds (if upload takes longer)
                          setTimeout(() => clearInterval(interval), 3000);
                        }}
                        onUploadError={(error: Error) => {
                          toast.error(
                            `Échec du téléchargement: ${error.message}`,
                          );
                          setIsUploading(false);
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {imageUrl && (
                <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium mb-2">
                      Image téléchargée
                    </h4>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => {
                        setUrlImage("");
                        toast.info("Image supprimée");
                      }}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Supprimer
                    </Button>
                  </div>
                  <div className="relative group rounded-lg overflow-hidden border">
                    <Image
                      width={400}
                      height={300}
                      src={imageUrl}
                      alt="Uploaded Food"
                      className="w-full h-48 object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
                      <p className="text-white p-2 text-sm truncate w-full">
                        {formData.name || "Image du plat"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="bg-gray-50 dark:bg-gray-900 border-t flex justify-between p-6">
          <Button
            variant="outline"
            type="button"
            onClick={handleCancel}
            disabled={submitting}
            className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Annuler
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700 transition-colors"
            disabled={submitting || calculateCompletionPercentage() < 80}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Enregistrer le plat
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AddFoodForm;
