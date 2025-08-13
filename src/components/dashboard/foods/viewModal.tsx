/** @format */

"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Eye,
  Clock,
  Star,
  Users,
  DollarSign,
  Package,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import { Food } from "@/lib/types";
import { useFoods } from "@/lib/hooks/useFoods";
import Image from "next/image";

interface ViewFoodModalProps {
  foodId: string;
  trigger?: React.ReactNode;
}

export function ViewFoodModal({ foodId, trigger }: ViewFoodModalProps) {
  const [open, setOpen] = useState(false);
  const [food, setFood] = useState<Food | null>(null);
  const { getFoodById, loading } = useFoods();

  useEffect(() => {
    if (open && foodId) {
      loadFood();
    }
  }, [open, foodId]);

  const loadFood = async () => {
    const result = await getFoodById(foodId);
    if (result.success && result.food) {
      setFood(result.food);
    }
  };

  const formatPrice = (price: number | undefined) => {
    return price ? `${price.toFixed(2)} MAD` : "N/A";
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return "N/A";
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="outline"
            size="sm">
            <Eye className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Détails du plat
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <span className="ml-2">Chargement des détails...</span>
            </div>
          ) : food ? (
            <div className="space-y-6 p-1">
              {/* En-tête avec image et informations principales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {food.image && (
                    <div className="relative">
                      <Image
                        src={food.image}
                        alt={food.name}
                        width={400}
                        height={250}
                        className="w-full h-64 object-cover rounded-lg"
                      />
                      <div className="absolute top-2 right-2">
                        <Badge
                          variant={food.isAvailable ? "default" : "destructive"}
                          className="bg-white/90 text-black">
                          {food.isAvailable ? (
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                          ) : (
                            <XCircle className="h-3 w-3 mr-1" />
                          )}
                          {food.isAvailable ? "Disponible" : "Indisponible"}
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {food.name}
                    </h2>
                    <p className="text-gray-600 mt-2">{food.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-500" />
                      <div>
                        <p className="text-sm text-gray-500">Prix</p>
                        <p className="font-semibold">
                          {formatPrice(food.price)}
                        </p>
                      </div>
                    </div>

                    {food.discountPrice && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-orange-500" />
                        <div>
                          <p className="text-sm text-gray-500">Prix réduit</p>
                          <p className="font-semibold text-orange-600">
                            {formatPrice(food.discountPrice)}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <div>
                        <p className="text-sm text-gray-500">Préparation</p>
                        <p className="font-semibold">
                          {food.preparationTime || 0} min
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <div>
                        <p className="text-sm text-gray-500">Note</p>
                        <p className="font-semibold">
                          {food.rating || 0}/5 ({food.reviewCount || 0} avis)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-purple-500" />
                      <div>
                        <p className="text-sm text-gray-500">Vendus</p>
                        <p className="font-semibold">{food.totalSold || 0}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-indigo-500" />
                      <div>
                        <p className="text-sm text-gray-500">Restaurant</p>
                        <p className="font-semibold">
                          {food.restaurantId || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Variations */}
              {food.variations && food.variations.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    Variations
                    <Badge>{food.variations.length}</Badge>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {food.variations.map((variation, index) => (
                      <div
                        key={variation.id || index}
                        className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                        <span className="font-medium">{variation.name}</span>
                        <Badge variant="outline">
                          {formatPrice(variation.price)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suppléments */}
              {food.addons && food.addons.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    Suppléments
                    <Badge>{food.addons.length}</Badge>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {food.addons.map((addon, index) => (
                      <div
                        key={addon.id || index}
                        className="flex items-center justify-between p-3 border rounded-lg bg-blue-50">
                        <span className="font-medium">{addon.name}</span>
                        <Badge
                          variant="outline"
                          className="bg-blue-100">
                          +{formatPrice(addon.price)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Images supplémentaires */}
              {food.images && food.images.length > 1 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">
                    Images supplémentaires
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {food.images.slice(1).map((imageUrl, index) => (
                      <div
                        key={index}
                        className="relative">
                        <Image
                          src={imageUrl}
                          alt={`${food.name} - Image ${index + 2}`}
                          width={200}
                          height={150}
                          className="w-full h-32 object-cover rounded-lg border"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* Informations système */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Informations système</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">ID du plat</p>
                    <p className="font-mono bg-gray-100 px-2 py-1 rounded">
                      {food.id}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">ID de la catégorie</p>
                    <p className="font-mono bg-gray-100 px-2 py-1 rounded">
                      {food.cuisineId || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Date de création</p>
                    <p>{formatDate(food.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Dernière modification</p>
                    <p>{formatDate(food.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <XCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Plat non trouvé</p>
              </div>
            </div>
          )}
        </ScrollArea>

        <div className="flex justify-end pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}>
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
