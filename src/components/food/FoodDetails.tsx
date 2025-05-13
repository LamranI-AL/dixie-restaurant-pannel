/** @format */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import {
  ArrowLeft,
  Clock,
  Star,
  Heart,
  Share2,
  ShoppingCart,
  Info,
  AlertCircle,
  ChevronRight,
  Loader2,
  Edit,
  Trash2,
  CheckCircle,
  Tag,
  Utensils,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Addon, Food, Variation } from "@/lib/types";
import { getFoodById } from "@/actions/food";
import { EditFoodDialog } from "./EditFoodDialog";
// export const dynamic = "force-dynamic";
const FoodDetailsSkeleton: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto p-4 space-y-8">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-48" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-[400px] w-full rounded-lg" />
          <div className="grid grid-cols-4 gap-2">
            <Skeleton className="h-24 w-full rounded-md" />
            <Skeleton className="h-24 w-full rounded-md" />
            <Skeleton className="h-24 w-full rounded-md" />
            <Skeleton className="h-24 w-full rounded-md" />
          </div>
        </div>

        {/* Details skeleton */}
        <div className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-9 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
          </div>

          <div className="flex space-x-4">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-24" />
          </div>

          <div className="space-y-1">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-5 w-24" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-2/3" />
          </div>

          <Skeleton className="h-10 w-full" />

          <div className="space-y-4">
            <Skeleton className="h-8 w-40" />
            <div className="space-y-2">
              <Skeleton className="h-12 w-full rounded-md" />
              <Skeleton className="h-12 w-full rounded-md" />
              <Skeleton className="h-12 w-full rounded-md" />
            </div>
          </div>

          <div className="flex justify-between items-center mt-8">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-12 w-40" />
          </div>
        </div>
      </div>
    </div>
  );
};

interface FoodDetailsProps {
  foodId: string;
}

export default function FoodDetailsComponent({ foodId }: FoodDetailsProps) {
  const router = useRouter();
  const [food, setFood] = useState<Food | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | undefined>(
    undefined,
  );
  const [selectedVariation, setSelectedVariation] = useState<Variation | null>(
    null,
  );
  const [selectedAddons, setSelectedAddons] = useState<Addon[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [foodToEdit, setFoodToEdit] = useState<Food | null>(null);

  useEffect(() => {
    const loadFoodDetails = async () => {
      try {
        setLoading(true);
        const data = await getFoodById(foodId);
        if (data) {
          setFood(data.food as Food);
          setSelectedImage(data.food?.image);
          if (data.food?.variations && data.food?.variations.length > 0) {
            setSelectedVariation(data.food.variations[0]);
          }
        } else {
          setError("Plat non trouvé");
        }
      } catch (err) {
        console.error("Erreur lors du chargement des détails du plat:", err);
        setError(
          "Une erreur est survenue lors du chargement des détails du plat",
        );
      } finally {
        setLoading(false);
      }
    };

    if (foodId) {
      loadFoodDetails();
    }
  }, [foodId]);

  const handleAddToCart = () => {
    if (!food) return;

    const variationName = selectedVariation
      ? selectedVariation.name
      : "Standard";
    const addonNames = selectedAddons.map((addon) => addon.name).join(", ");

    toast.success("Ajouté au panier", {
      description: `${quantity}x ${food.name} (${variationName})${
        addonNames ? ` avec ${addonNames}` : ""
      }`,
    });
  };

  const handleToggleAddon = (addon: Addon) => {
    setSelectedAddons((prev) => {
      const exists = prev.some((a) => a.id === addon.id);
      if (exists) {
        return prev.filter((a) => a.id !== addon.id);
      } else {
        return [...prev, addon];
      }
    });
  };

  const calculateTotalPrice = (): number => {
    if (!food) return 0;

    const basePrice = selectedVariation
      ? selectedVariation.price
      : food.discountPrice || food.price;
    const addonsPrice = selectedAddons.reduce(
      (sum, addon) => sum + addon.price,
      0,
    );

    return (basePrice + addonsPrice) * quantity;
  };

  const handleEditFood = (food: Food) => {
    setFoodToEdit(food);
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast.success(isFavorite ? "Retiré des favoris" : "Ajouté aux favoris");
  };

  const handleShareFood = () => {
    if (navigator.share && food) {
      navigator
        .share({
          title: food.name,
          text: food.description,
          url: window.location.href,
        })
        .then(() => console.log("Contenu partagé avec succès"))
        .catch((error) => console.log("Erreur lors du partage", error));
    } else {
      // Fallback pour les navigateurs qui ne supportent pas l'API Web Share
      navigator.clipboard.writeText(window.location.href);
      toast.success("Lien copié dans le presse-papier");
    }
  };

  if (loading) {
    return <FoodDetailsSkeleton />;
  }

  if (error || !food) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <Button
          variant="outline"
          onClick={() => router.push("/foods")}
          className="mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour à la liste des plats
        </Button>

        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center">
              <AlertCircle className="mr-2 h-5 w-5" />
              Erreur
            </CardTitle>
            <CardDescription className="text-red-600">
              {error || "Impossible de charger les détails du plat"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Veuillez réessayer plus tard ou contacter l'administrateur si le
              problème persiste.
            </p>
          </CardContent>
          <CardFooter>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="mr-2">
              Réessayer
            </Button>
            <Button onClick={() => router.push("/foods")}>
              Retour à la liste
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Navigation */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => router.push("/foods")}
            className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux plats
          </Button>
          <div className="text-sm text-gray-500 hidden md:flex items-center">
            <span>Menu</span>
            <ChevronRight className="h-4 w-4 mx-1" />
            <span>{food.categoryId || "Catégorie"}</span>
            <ChevronRight className="h-4 w-4 mx-1" />
            <span className="font-medium">{food.name}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleFavorite}
            className={isFavorite ? "text-red-500 bg-red-50" : ""}>
            <Heart className={`h-5 w-5 ${isFavorite ? "fill-red-500" : ""}`} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleShareFood}>
            <Share2 className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            onClick={() => handleEditFood(food)}>
            <Edit className="mr-2 h-4 w-4" />
            Modifier
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Food images */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-lg overflow-hidden border bg-gray-100">
            {selectedImage ? (
              <Image
                src={selectedImage}
                alt={food.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Utensils className="h-16 w-16 text-gray-300" />
                <p className="absolute bottom-4 text-gray-500">
                  Aucune image disponible
                </p>
              </div>
            )}
            {food.discountPrice && (
              <Badge className="absolute top-2 right-2 bg-red-500 hover:bg-red-600">
                Remise -
                {Math.round(
                  ((food.price - food.discountPrice) / food.price) * 100,
                )}
                %
              </Badge>
            )}
            {!food.isAvailable && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <div className="bg-white/90 px-6 py-3 rounded-md text-red-600 font-bold">
                  Non disponible
                </div>
              </div>
            )}
          </div>

          {food.images && food.images.length > 0 && (
            <ScrollArea className="whitespace-nowrap pb-2">
              <div className="flex space-x-2">
                {food.images.map((img, index) => (
                  <div
                    key={index}
                    className={`relative h-20 w-20 rounded-md overflow-hidden border cursor-pointer transition-all ${
                      selectedImage === img
                        ? "ring-2 ring-blue-500 ring-offset-2"
                        : "opacity-70 hover:opacity-100"
                    }`}
                    onClick={() => setSelectedImage(img)}>
                    <Image
                      src={img}
                      alt={`${food.name} - image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}

          <Card className="mt-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">
                Informations additionnelles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-lg">
                  <Clock className="h-5 w-5 text-blue-500 mb-1" />
                  <span className="text-sm font-medium">
                    {food.preparationTime || 0} min
                  </span>
                  <span className="text-xs text-gray-500">Préparation</span>
                </div>
                <div className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-lg">
                  <Tag className="h-5 w-5 text-green-500 mb-1" />
                  <span className="text-sm font-medium">
                    {food.totalSold || 0}
                  </span>
                  <span className="text-xs text-gray-500">Vendus</span>
                </div>
                <div className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-lg">
                  <Star className="h-5 w-5 text-amber-500 mb-1" />
                  <span className="text-sm font-medium">
                    {food.rating?.toFixed(1) || "N/A"}
                  </span>
                  <span className="text-xs text-gray-500">
                    {food.reviewCount || 0} avis
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-lg">
                  <Utensils className="h-5 w-5 text-purple-500 mb-1" />
                  <span className="text-sm font-medium capitalize">
                    {food.cuisineId || food.categoryId || "N/A"}
                  </span>
                  <span className="text-xs text-gray-500">Cuisine</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">Disponibilité:</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          <Switch
                            checked={food.isAvailable}
                            disabled
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Modifiez le plat pour changer la disponibilité</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="text-sm text-gray-500">
                  ID: {food.id.substring(0, 8)}...
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        {foodToEdit && (
          <EditFoodDialog
            food={foodToEdit}
            open={!!foodToEdit}
            onClose={() => setFoodToEdit(null)}
          />
        )}

        {/* Food details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{food.name}</h1>
            <div className="flex items-center space-x-2 mt-2">
              <Badge
                variant="outline"
                className="capitalize">
                {food.categoryId || "Catégorie non spécifiée"}
              </Badge>
              {food.cuisineId && (
                <Badge
                  variant="outline"
                  className="capitalize">
                  {food.cuisineId}
                </Badge>
              )}
              {food.isAvailable ? (
                <Badge className="bg-green-500 hover:bg-green-600">
                  Disponible
                </Badge>
              ) : (
                <Badge variant="destructive">Indisponible</Badge>
              )}
            </div>
          </div>
          {/* Rating and stats */}
          <div className="flex items-center space-x-6">
            {food.rating && (
              <div className="flex items-center">
                <Star className="h-5 w-5 text-amber-500 mr-1 fill-amber-500" />
                <span className="font-medium">{food.rating.toFixed(1)}</span>
                {food.reviewCount !== undefined && (
                  <span className="text-gray-500 text-sm ml-1">
                    ({food.reviewCount} avis)
                  </span>
                )}
              </div>
            )}
            {food.totalSold !== undefined && (
              <span className="text-gray-600 text-sm">
                {food.totalSold} vendus
              </span>
            )}
          </div>
          {/* Price */}
          <div className="flex items-baseline">
            {food.discountPrice ? (
              <>
                <span className="text-2xl font-bold text-blue-600">
                  {food.discountPrice.toFixed(2)} MAD
                </span>
                <span className="ml-2 text-gray-500 line-through">
                  {food.price.toFixed(2)} MAD
                </span>
                <Badge className="ml-2 bg-red-500 hover:bg-red-600">
                  -
                  {Math.round(
                    ((food.price - food.discountPrice) / food.price) * 100,
                  )}
                  %
                </Badge>
              </>
            ) : (
              <span className="text-2xl font-bold text-blue-600">
                {food.price.toFixed(2)} MAD
              </span>
            )}
          </div>
          {/* Description */}
          <div>
            <h2 className="text-lg font-medium mb-2">Description</h2>
            <p className="text-gray-700">
              {food.description ||
                "Aucune description disponible pour ce plat."}
            </p>
          </div>
          <Separator />
          {/* Variations and Addons */}
          <Tabs
            defaultValue="variations"
            className="w-full">
            <TabsList className="w-full">
              <TabsTrigger
                value="variations"
                className="flex-1"
                disabled={!food.variations || food.variations.length === 0}>
                Variations ({food.variations?.length || 0})
              </TabsTrigger>
              <TabsTrigger
                value="addons"
                className="flex-1"
                disabled={!food.addons || food.addons.length === 0}>
                Suppléments ({food.addons?.length || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="variations"
              className="space-y-4 py-2">
              {food.variations && food.variations.length > 0 ? (
                <div className="grid grid-cols-1 gap-2">
                  {food.variations.map((variation) => (
                    <div
                      key={variation.id}
                      className={`border rounded-md p-3 cursor-pointer transition-all ${
                        selectedVariation?.id === variation.id
                          ? "bg-blue-50 border-blue-500"
                          : "hover:bg-gray-50"
                      }`}
                      onClick={() => setSelectedVariation(variation)}>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          {selectedVariation?.id === variation.id && (
                            <CheckCircle className="h-4 w-4 text-blue-500 mr-2" />
                          )}
                          <span className="font-medium">{variation.name}</span>
                        </div>
                        <span className="text-blue-600 font-medium">
                          {variation.price.toFixed(2)} MAD
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 bg-gray-50 rounded-md">
                  <Info className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Aucune variation disponible</p>
                </div>
              )}
            </TabsContent>

            <TabsContent
              value="addons"
              className="space-y-4 py-2">
              {food.addons && food.addons.length > 0 ? (
                <div className="grid grid-cols-1 gap-2">
                  {food.addons.map((addon) => (
                    <div
                      key={addon.id}
                      className={`border rounded-md p-3 cursor-pointer transition-all ${
                        selectedAddons.some((a) => a.id === addon.id)
                          ? "bg-blue-50 border-blue-500"
                          : "hover:bg-gray-50"
                      }`}
                      onClick={() => handleToggleAddon(addon)}>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          {selectedAddons.some((a) => a.id === addon.id) && (
                            <CheckCircle className="h-4 w-4 text-blue-500 mr-2" />
                          )}
                          <span className="font-medium">{addon.name}</span>
                        </div>
                        <span className="text-blue-600 font-medium">
                          +{addon.price.toFixed(2)} MAD
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 bg-gray-50 rounded-md">
                  <Info className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Aucun supplément disponible</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
          {/* Quantity */}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-medium">Quantité</h2>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  disabled={quantity <= 1}
                  className="h-8 w-8">
                  -
                </Button>
                <span className="w-8 text-center font-medium">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity((prev) => prev + 1)}
                  className="h-8 w-8">
                  +
                </Button>
              </div>
            </div>
          </div>
          {/* Total and add to cart */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div>
              <div className="text-sm text-gray-500">Total</div>
              <div className="text-2xl font-bold">
                {calculateTotalPrice().toFixed(2)} MAD
              </div>
            </div>
            {/* <Button
              className="h-12 px-6 bg-blue-600 hover:bg-blue-700"
              disabled={!food.isAvailable}
              onClick={handleAddToCart}>
              <ShoppingCart className="mr-2 h-5 w-5" />
              Ajouter au panier
            </Button> */}
          </div>
          {!food.isAvailable && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
              <p className="text-red-600 text-sm">
                Ce plat n'est pas disponible actuellement. Veuillez vérifier
                plus tard.
              </p>
            </div>
          )}
          {/* Restaurant info if available */}
          {food.restaurantId && (
            <Card className="mt-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Restaurant
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="font-medium">{food.restaurantId}</div>
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 h-auto">
                    Voir le menu
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
