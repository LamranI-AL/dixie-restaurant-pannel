/** @format */

"use client";

import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Plus,
  Save,
  Clock,
  DollarSign,
  ImagePlus,
  Upload,
  Trash2,
  GripVertical,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { uploadImage } from "@/utils/uploadthing";
import { Food, Category, Variation, Addon } from "@/lib/types";
import { useCategories } from "@/lib/hooks/useCategories";
import { useFoods } from "@/lib/hooks/useFoods";
import Image from "next/image";

interface AddFoodModalProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function AddFoodModal({ trigger, onSuccess }: AddFoodModalProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    discountPrice: "",
    categoryId: "",
    preparationTime: "",
    isAvailable: true,
  });

  const [imageUrl, setImageUrl] = useState<string>("");
  const [variations, setVariations] = useState<Variation[]>([]);
  const [addons, setAddons] = useState<Addon[]>([]);
  const [newVariation, setNewVariation] = useState({ name: "", price: "" });
  const [newAddon, setNewAddon] = useState({ name: "", price: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    categories,
    getAllCategories,
    loading: categoriesLoading,
  } = useCategories();
  const { addFood, loading: foodLoading } = useFoods();

  const loading = foodLoading;

  useEffect(() => {
    if (open && categories.length === 0) {
      getAllCategories();
    }
  }, [open, categories.length, getAllCategories]);

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      discountPrice: "",
      categoryId: "",
      preparationTime: "",
      isAvailable: true,
    });
    setImageUrl("");
    setVariations([]);
    setAddons([]);
    setNewVariation({ name: "", price: "" });
    setNewAddon({ name: "", price: "" });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Le nom est requis";
    if (!formData.description.trim())
      newErrors.description = "La description est requise";
    if (!formData.categoryId) newErrors.categoryId = "La catégorie est requise";
    if (!formData.price) newErrors.price = "Le prix est requis";
    else if (!/^\d+(\.\d{1,2})?$/.test(formData.price))
      newErrors.price = "Prix invalide";
    if (!formData.preparationTime)
      newErrors.preparationTime = "Le temps de préparation est requis";
    else if (!/^\d+$/.test(formData.preparationTime))
      newErrors.preparationTime = "Temps invalide";

    if (
      formData.discountPrice &&
      !/^\d+(\.\d{1,2})?$/.test(formData.discountPrice)
    ) {
      newErrors.discountPrice = "Prix de remise invalide";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const addVariation = () => {
    if (!newVariation.name.trim() || !newVariation.price.trim()) {
      toast.error("Nom et prix de la variation requis");
      return;
    }

    if (!/^\d+(\.\d{1,2})?$/.test(newVariation.price)) {
      toast.error("Prix de variation invalide");
      return;
    }

    const variation: Variation | any = {
      id: `var-${Date.now()}`,
      name: newVariation.name,
      price: parseFloat(newVariation.price),
    };

    setVariations((prev) => [...prev, variation]);
    setNewVariation({ name: "", price: "" });
    toast.success("Variation ajoutée");
  };

  const addAddon = () => {
    if (!newAddon.name.trim() || !newAddon.price.trim()) {
      toast.error("Nom et prix du supplément requis");
      return;
    }

    if (!/^\d+(\.\d{1,2})?$/.test(newAddon.price)) {
      toast.error("Prix de supplément invalide");
      return;
    }

    const addon: Addon | any = {
      id: `add-${Date.now()}`,
      name: newAddon.name,
      price: parseFloat(newAddon.price),
    };

    setAddons((prev) => [...prev, addon]);
    setNewAddon({ name: "", price: "" });
    toast.success("Supplément ajouté");
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      const uploadedUrl = await uploadImage(file);
      setImageUrl(uploadedUrl);
      toast.success("Image téléchargée avec succès !");
    } catch (error) {
      toast.error(
        `Erreur de téléchargement : ${error instanceof Error ? error.message : "Erreur inconnue"}`,
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Veuillez corriger les erreurs du formulaire");
      return;
    }

    if (!imageUrl) {
      toast.error("Veuillez ajouter une image");
      return;
    }

    const foodData: Food | any = {
      id: "",
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      discountPrice: formData.discountPrice
        ? parseFloat(formData.discountPrice)
        : undefined,
      image: imageUrl,
      images: [imageUrl],
      cuisineId: formData.categoryId,
      isAvailable: formData.isAvailable,
      preparationTime: parseInt(formData.preparationTime, 10),
      variations,
      addons,
      restaurantId: "current-restaurant-id",
      totalSold: 0,
      rating: 0,
      reviewCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await addFood(foodData);

    if (result.success) {
      toast.success("Plat ajouté avec succès !");
      setOpen(false);
      resetForm();
      onSuccess?.();
    } else {
      toast.error(result.error || "Erreur lors de l'ajout du plat");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Ajouter un plat
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Ajouter un nouveau plat
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <form
            onSubmit={handleSubmit}
            className="space-y-6 p-1">
            {/* Informations de base */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Informations de base</h3>
              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Nom du plat <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="ex: Pizza Margherita"
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.name}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Catégorie <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, categoryId: value }))
                    }>
                    <SelectTrigger
                      className={errors.categoryId ? "border-red-500" : ""}>
                      <SelectValue placeholder="Sélectionnez une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoriesLoading ? (
                        <div className="p-2 text-center">
                          <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                          Chargement...
                        </div>
                      ) : categories.length > 0 ? (
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
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  {errors.categoryId && (
                    <p className="text-sm text-red-500 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.categoryId}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Description <span className="text-red-500">*</span>
                </label>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Décrivez le plat..."
                  className={`min-h-20 ${errors.description ? "border-red-500" : ""}`}
                />
                {errors.description && (
                  <p className="text-sm text-red-500 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.description}
                  </p>
                )}
              </div>
            </div>

            {/* Prix */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Tarification</h3>
              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Prix (MAD) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      className={`pl-9 ${errors.price ? "border-red-500" : ""}`}
                    />
                  </div>
                  {errors.price && (
                    <p className="text-sm text-red-500 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.price}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Prix réduit (MAD)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      name="discountPrice"
                      value={formData.discountPrice}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      className={`pl-9 ${errors.discountPrice ? "border-red-500" : ""}`}
                    />
                  </div>
                  {errors.discountPrice && (
                    <p className="text-sm text-red-500 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.discountPrice}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Variations */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center">
                Variations
                {variations.length > 0 && (
                  <Badge className="ml-2">{variations.length}</Badge>
                )}
              </h3>
              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="Nom de la variation"
                  value={newVariation.name}
                  onChange={(e) =>
                    setNewVariation((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                />
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Prix"
                      value={newVariation.price}
                      onChange={(e) =>
                        setNewVariation((prev) => ({
                          ...prev,
                          price: e.target.value,
                        }))
                      }
                      className="pl-9"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={addVariation}
                    size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {variations.length > 0 && (
                <div className="border rounded-md p-3 max-h-32 overflow-y-auto">
                  {variations.map((variation) => (
                    <div
                      key={variation.id}
                      className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{variation.name}</span>
                        <Badge variant="outline">
                          {variation.price.toFixed(2)} MAD
                        </Badge>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setVariations((prev) =>
                            prev.filter((v) => v.id !== variation.id),
                          )
                        }
                        className="h-6 w-6 p-0 text-red-500">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Suppléments */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center">
                Suppléments
                {addons.length > 0 && (
                  <Badge className="ml-2">{addons.length}</Badge>
                )}
              </h3>
              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="Nom du supplément"
                  value={newAddon.name}
                  onChange={(e) =>
                    setNewAddon((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Prix"
                      value={newAddon.price}
                      onChange={(e) =>
                        setNewAddon((prev) => ({
                          ...prev,
                          price: e.target.value,
                        }))
                      }
                      className="pl-9"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={addAddon}
                    size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {addons.length > 0 && (
                <div className="border rounded-md p-3 max-h-32 overflow-y-auto">
                  {addons.map((addon) => (
                    <div
                      key={addon.id}
                      className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{addon.name}</span>
                        <Badge variant="outline">
                          +{addon.price.toFixed(2)} MAD
                        </Badge>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setAddons((prev) =>
                            prev.filter((a) => a.id !== addon.id),
                          )
                        }
                        className="h-6 w-6 p-0 text-red-500">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Détails additionnels */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Détails additionnels</h3>
              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Temps de préparation (min){" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      name="preparationTime"
                      value={formData.preparationTime}
                      onChange={handleInputChange}
                      placeholder="15"
                      className={`pl-9 ${errors.preparationTime ? "border-red-500" : ""}`}
                    />
                  </div>
                  {errors.preparationTime && (
                    <p className="text-sm text-red-500 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.preparationTime}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">Disponible</label>
                    <p className="text-xs text-gray-500">
                      Ce plat est-il disponible ?
                    </p>
                  </div>
                  <Switch
                    checked={formData.isAvailable}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, isAvailable: checked }))
                    }
                  />
                </div>
              </div>
            </div>

            {/* Image */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center">
                <ImagePlus className="w-5 h-5 mr-2" />
                Image du plat <span className="text-red-500 ml-1">*</span>
              </h3>
              <Separator />

              {!imageUrl ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <ImagePlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-gray-500 mb-4">
                    Téléchargez une image de votre plat
                  </p>
                  <Button onClick={() => fileInputRef.current?.click()}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Image
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="relative">
                  <Image
                    src={imageUrl}
                    alt="Food preview"
                    width={400}
                    height={200}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setImageUrl("")}
                    className="absolute top-2 right-2 bg-white">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Boutons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
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
                    Ajout...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Ajouter le plat
                  </>
                )}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
