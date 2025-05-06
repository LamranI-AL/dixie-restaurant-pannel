/** @format */
"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Food } from "@/lib/types";
import { Loader2, Save, Clock, DollarSign, AlertCircle } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { getAllCategories } from "@/actions/category";
import { updateFood } from "@/actions/food";

interface EditFoodDialogProps {
  food: Food;
  open: boolean;
  onClose: () => void;
}

export function EditFoodDialog({ food, open, onClose }: EditFoodDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    // discountPrice: "",
    categoryId: "",
    isAvailable: true,
    preparationTime: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([
    { id: "italian", name: "Italien" },
    { id: "french", name: "Français" },
    { id: "asian", name: "Asiatique" },
    { id: "fast-food", name: "Fast Food" },
  ]);

  // Initialize form data from food prop
  useEffect(() => {
    if (food) {
      setFormData({
        name: food.name,
        description: food.description,
        price: food.price.toString(),
        // discountPrice: "",
        categoryId: food.categoryId,
        isAvailable: food.isAvailable,
        preparationTime: food.preparationTime
          ? food?.preparationTime?.toString()
          : "10",
      });
    }
  }, [food]);
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Simulate API call to fetch categories
        await new Promise((resolve) => setTimeout(resolve, 1000));
        // Here you would call your API to fetch categories
        const categoriesfitched = await getAllCategories();
        console.log("categories", categoriesfitched);
        if (categoriesfitched.success) {
          setCategories(
            categoriesfitched.categories as { id: string; name: string }[],
          );
        } else {
          console.error("Error fetching categories");
        }
        // setCategories(fetchedCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
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

    // Clear errors when user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
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
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.categoryId;
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Le nom est requis";
    if (!formData.description.trim())
      newErrors.description = "La description est requise";
    if (!formData.categoryId) newErrors.categoryId = "La catégorie est requise";

    if (!formData.price) {
      newErrors.price = "Le prix est requis";
    } else if (!/^\d+(\.\d{1,2})?$/.test(formData.price)) {
      newErrors.price = "Veuillez entrer un prix valide";
    }

    // if (
    //   formData.discountPrice &&
    //   !/^\d+(\.\d{1,2})?$/.test(formData.discountPrice)
    // ) {
    //   newErrors.discountPrice = "Veuillez entrer un prix de remise valide";
    // }

    // if (!formData.preparationTime) {
    //   newErrors.preparationTime = "Le temps de préparation est requis";
    // } else if (!/^\d+$/.test(formData.preparationTime)) {
    //   newErrors.preparationTime = "Veuillez entrer un nombre valide";
    // }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);

      // Create updated food object
      const updatedFoodItem = {
        ...food,
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        // discountPrice: formData.discountPrice
        //   ? parseFloat(formData.discountPrice)
        //   : undefined,
        categoryId: formData.categoryId,
        isAvailable: formData.isAvailable,
        // preparationTime: parseInt(formData.preparationTime, 10),
      };

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Here you would call your API to update the food
      console.log("Food updated:", updatedFoodItem);
      await updateFood(food.id, updatedFoodItem);

      toast.success("Plat mis à jour avec succès");
      onClose();
    } catch (error) {
      console.error("Error updating food:", error);
      toast.error("Une erreur est survenue lors de la mise à jour du plat");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Modifier le Plat</DialogTitle>
          <DialogDescription>
            Modifiez les informations du plat et cliquez sur Enregistrer pour
            confirmer les changements.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 md:col-span-1">
              <Label
                htmlFor="name"
                className="flex items-center">
                Nom du Plat <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-sm text-red-500 flex items-center mt-1">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.name}
                </p>
              )}
            </div>

            <div className="col-span-2 md:col-span-1">
              <Label
                htmlFor="category"
                className="flex items-center">
                Catégorie <span className="text-red-500 ml-1">*</span>
              </Label>
              <Select
                value={formData.categoryId}
                onValueChange={handleCategoryChange}>
                <SelectTrigger
                  id="category"
                  className={errors.categoryId ? "border-red-500" : ""}>
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem
                      key={category.id}
                      value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoryId && (
                <p className="text-sm text-red-500 flex items-center mt-1">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.categoryId}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label
              htmlFor="description"
              className="flex items-center">
              Description <span className="text-red-500 ml-1">*</span>
            </Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className={`min-h-[100px] ${
                errors.description ? "border-red-500" : ""
              }`}
            />
            {errors.description && (
              <p className="text-sm text-red-500 flex items-center mt-1">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.description}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div>
              <Label
                htmlFor="price"
                className="flex items-center">
                Prix (MAD) <span className="text-red-500 ml-1">*</span>
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className={`pl-9 ${errors.price ? "border-red-500" : ""}`}
                />
              </div>
              {errors.price && (
                <p className="text-sm text-red-500 flex items-center mt-1">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.price}
                </p>
              )}
            </div>
          </div>

          {food.image && (
            <div>
              <Label>Image Actuelle</Label>
              <div className="mt-2 relative h-40 w-full md:w-1/2 overflow-hidden rounded-md border">
                <Image
                  src={food.image}
                  alt={food.name}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={submitting}>
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Enregistrer les Modifications
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
