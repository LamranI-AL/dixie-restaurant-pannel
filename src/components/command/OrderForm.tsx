/** @format */
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
// import { createOrder } from "@/actions/ordres"; // Server Action pour créer une commande
import { Loader2, PlusCircle, Trash2, ChevronLeft, Search } from "lucide-react";
import {
  Addon,
  Order,
  OrderItem,
  OrderStatus,
  Restaurant,
  Food,
  Variation,
} from "@/lib/types"; // Importation des types
import { Tag, Ticket, AlertCircle, X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
// Importer la fonction de validation de coupon
// import { validateCoupon, incrementCouponUsage } from "@/lib/firebase/coupons";
// Ajoutez le type Coupon aux importations
import { validateCoupon, incrementCouponUsage } from "@/actions/coupons";
import { Coupon } from "@/lib/types";

// Importation des composants shadcn
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
// import { addOrder } from "@/actions/ordres";
import { addUser, createOrderForUser } from "@/actions/user";
// Actions pour récupérer les plats existants
import { getAllFoods } from "@/actions/food";

export default function AddOrderForm() {
  const router = useRouter();

  const [restaurants, setRestaurants] = useState<Restaurant[] | any[]>([
    { id: "FhnRefHSJQohtFlvilC9", name: "Restaurant Dixie" },
  ]);

  // État pour les plats existants
  const [existingFoods, setExistingFoods] = useState<Food[]>([]);
  const [filteredFoods, setFilteredFoods] = useState<Food[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  // État pour le coupon
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  // État pour le chargement
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingFoods, setIsLoadingFoods] = useState(false);
  // Fonction pour gérer la saisie du code coupon
  const handleCouponChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCouponCode(e.target.value);
    // Réinitialiser les erreurs de coupon lorsque l'utilisateur modifie le code
    if (couponError) setCouponError(null);
    // Réinitialiser le coupon appliqué si le code est modifié
    if (appliedCoupon) {
      setAppliedCoupon(null);
      setCouponDiscount(0);
    }
  };

  // Fonction pour vérifier et appliquer un coupon
  const handleApplyCoupon = async () => {
    // Vérifier si un code de coupon a été saisi
    if (!couponCode.trim()) {
      setCouponError("Veuillez saisir un code de coupon");
      return;
    }

    // Vérifier si un restaurant a été sélectionné
    if (!formData.restaurantId) {
      setCouponError("Veuillez d'abord sélectionner un restaurant");
      return;
    }

    const subtotal = calculateTotals().subtotal;

    // Vérifier si la commande contient des articles
    if (subtotal <= 0) {
      setCouponError("Votre commande doit contenir au moins un article");
      return;
    }

    setIsValidatingCoupon(true);
    setCouponError(null);

    try {
      // Appeler la fonction de validation du coupon
      const result = await validateCoupon(
        couponCode,
        subtotal,
        formData.restaurantId,
      );

      if (result.success) {
        setAppliedCoupon(result.coupon as Coupon);
        setCouponDiscount(result.discountAmount || 0);
        toast.success(`Coupon ${result.coupon?.code} appliqué avec succès!`);
      } else {
        setCouponError(result.error || "Coupon non valide");
        setAppliedCoupon(null);
        setCouponDiscount(0);
      }
    } catch (error) {
      console.error("Erreur lors de la validation du coupon:", error);
      setCouponError("Une erreur est survenue lors de la validation du coupon");
      setAppliedCoupon(null);
      setCouponDiscount(0);
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  // Fonction pour supprimer un coupon appliqué
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponCode("");
    setCouponError(null);
    toast.info("Coupon supprimé");
  };
  // État pour les items de la commande
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  // État pour le formulaire
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    customerAddress: "",
    restaurantId: "",
    paymentMethod: "cash", // Par défaut: espèces
    notes: "",
    orderType: "delivery", // Par défaut: livraison
  });

  // Nouvelles valeurs temporaires pour l'item en cours d'ajout
  const [newItem, setNewItem] = useState({
    quantity: "1",
  });
  // Fonction pour mettre à jour la sélection (restaurant, méthode de paiement, etc.)
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // État pour les variants sélectionnés pour l'article en cours
  const [selectedVariations, setSelectedVariations] = useState<Variation[]>([]);

  // Addon et variant sélectionnés pour l'article en cours
  const [selectedAddons, setSelectedAddons] = useState<Addon[]>([]);

  // Charger tous les plats au chargement du composant
  useEffect(() => {
    loadAllFoods();
  }, []);

  // Fonction pour charger tous les plats (sans filtrer par restaurant)
  const loadAllFoods = async () => {
    setIsLoadingFoods(true);
    try {
      // Cette fonction devrait être implémentée dans vos actions pour récupérer tous les plats
      const { foods } = await getAllFoods(); // Il faudra créer cette fonction dans vos actions

      // Utiliser les données réelles ou mock selon le cas
      setExistingFoods(foods as any);
      setFilteredFoods(foods as any);
    } catch (error) {
      console.error("Erreur lors du chargement des plats:", error);
      toast.error("Impossible de charger les plats disponibles");
    } finally {
      setIsLoadingFoods(false);
    }
  };

  // Fonction pour filtrer les plats
  const handleSearchFood = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    if (query.trim() === "") {
      setFilteredFoods(existingFoods);
    } else {
      const filtered = existingFoods.filter(
        (food) =>
          food.name.toLowerCase().includes(query) ||
          food.description?.toLowerCase().includes(query) ||
          food.categoryId?.toLowerCase().includes(query),
      );
      setFilteredFoods(filtered);
    }
  };

  // Fonction pour mettre à jour les données du formulaire
  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Fonction pour toggle une variation
  const toggleVariation = (variation: Variation) => {
    const exists = selectedVariations.some((item) => item.id === variation.id);
    if (exists) {
      setSelectedVariations(
        selectedVariations.filter((item) => item.id !== variation.id),
      );
    } else {
      setSelectedVariations([...selectedVariations, variation]);
    }
  };

  // Fonction pour sélectionner un plat
  const selectFood = (food: Food) => {
    setSelectedFood(food);
    setSelectedAddons([]);
    setSelectedVariations([]);
    setNewItem({
      quantity: "1",
    });
    setIsDialogOpen(true);
  };

  // Fonction pour toggle un addon dans les sélectionnés
  const toggleAddon = (addon: Addon) => {
    const exists = selectedAddons.some((item) => item.id === addon.id);
    if (exists) {
      setSelectedAddons(selectedAddons.filter((item) => item.id !== addon.id));
    } else {
      setSelectedAddons([...selectedAddons, addon]);
    }
  };

  // Fonction pour ajouter un item sélectionné à la commande
  const addSelectedFoodToOrder = () => {
    if (!selectedFood) return;

    const quantity = parseInt(newItem.quantity);
    if (isNaN(quantity) || quantity <= 0) {
      toast.error("La quantité doit être un nombre positif");
      return;
    }

    // Calculer le prix total de l'item (y compris les addons et variations)
    const addonsTotalPrice = selectedAddons.reduce(
      (sum, addon) => sum + addon.price,
      0,
    );

    // Calculer le prix supplémentaire des variations
    const variationsTotalPrice = selectedVariations.reduce(
      (sum, variation) => sum + variation.price,
      0,
    );

    // Prix de base + prix des variations + prix des addons
    const baseItemPrice = selectedFood.price + variationsTotalPrice;
    const totalItemPrice = (baseItemPrice + addonsTotalPrice) * quantity;

    const item: OrderItem = {
      id: `item_${Date.now()}`,
      foodId: selectedFood.id,
      name: selectedFood.name,
      price: baseItemPrice, // Prix de base avec variations
      quantity: quantity,
      addons: [...selectedAddons],
      variations: [...selectedVariations],
      subtotal: totalItemPrice,
    };

    setOrderItems((prev) => [...prev, item]);
    setIsDialogOpen(false);
    setSelectedFood(null);
    setSelectedAddons([]);
    setSelectedVariations([]);
    toast.success("Article ajouté à la commande");
  };

  // Fonction pour supprimer un item de la commande
  const removeOrderItem = (id: string) => {
    setOrderItems((prev) => prev.filter((item) => item.id !== id));
    toast.success("Article supprimé de la commande");
  };

  // Calculer les totaux
  const calculateTotals = () => {
    const subtotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
    const tax = subtotal * 0; // TVA 0%
    const deliveryFee = formData.orderType === "delivery" ? 10 : 0; // Frais de livraison
    const packagingFee = 0; // Frais d'emballage
    const total = subtotal + tax + deliveryFee + packagingFee;

    return {
      subtotal,
      tax,
      deliveryFee,
      packagingFee,
      total,
    };
  };

  const totals = calculateTotals();

  // Fonction pour soumettre le formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation des champs obligatoires
    if (
      !formData.customerName ||
      !formData.customerPhone ||
      !formData.restaurantId
    ) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    // Validation des articles
    if (orderItems.length === 0) {
      toast.error("Veuillez ajouter au moins un article à la commande");
      return;
    }

    setIsSubmitting(true);

    try {
      // Préparation des données de la commande selon la structure de la base de données Firebase
      const orderData: Order | any = {
        ...formData,
        userId: "adminUser11", // Toujours utiliser cet ID d'administrateur
        items: orderItems.map((item) => ({
          id: item.id,
          foodId: item.foodId || "",
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          variations: item.variations || [],
          addons: item.addons || [],
          subtotal: item.subtotal,
        })),
        subtotal: totals.subtotal,
        OrderStatus:
          formData.orderType === "delivery"
            ? "Livraison"
            : formData.orderType === "pickup"
              ? "À emporter"
              : "Sur place",
        tax: totals.tax,
        deliveryFee: totals.deliveryFee,
        packagingFee: totals.packagingFee,
        total: totals.total,
        discount: 0, // À implémenter si nécessaire
        paymentStatus: "unpaid", // Par défaut
        orderStatus: "pending" as OrderStatus,
        deliveryLocation: {
          address: formData.customerAddress || "ask admin please",
          latitude: 1,
          longitude: 1,
        }, // Conversion explicite selon le type OrderStatus
        // orderDate: new Date(),
      };

      // Créer également un utilisateur avec les informations du client (si nécessaire)
      // await addUser({
      //   uid: "adminUser11", // ID administrateur fixe
      //   displayName: formData.customerName,
      //   email:
      //     formData.customerEmail || `${formData.customerPhone}@example.com`,
      //   phone: formData.customerPhone,
      //   address: formData.customerAddress || "",
      //   lastLoginAt: new Date(Date.now()),
      //   // Autres propriétés utilisateur si nécessaires
      // });

      // Envoi des données au serveur avec l'action serveur
      const result = await createOrderForUser("adminUser11", orderData as any); // Assurez-vous que le type est correct

      if (result.success) {
        toast.success("Commande créée avec succès");
        // Redirection vers la page de détails de la commande
        router.push(`/orders/details/${result.orderId}`);
      } else {
        toast.error(
          result.error || "Erreur lors de la création de la commande",
        );
      }
    } catch (error) {
      console.error("Erreur lors de la soumission du formulaire:", error);
      toast.error("Une erreur est survenue lors de la création de la commande");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="mr-2">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-semibold">Nouvelle commande</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Informations client */}
          <Card>
            <CardHeader>
              <CardTitle>Informations client</CardTitle>
              <CardDescription>
                Entrez les coordonnées du client pour cette commande
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Nom du client *</Label>
                <Input
                  id="customerName"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleFormChange}
                  placeholder="Nom complet"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerPhone">Téléphone *</Label>
                <Input
                  id="customerPhone"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleFormChange}
                  placeholder="+212 6XX XXXXXX"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerEmail">Email</Label>
                <Input
                  id="customerEmail"
                  name="customerEmail"
                  type="email"
                  value={formData.customerEmail}
                  onChange={handleFormChange}
                  placeholder="email@exemple.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerAddress">Adresse de livraison</Label>
                <Textarea
                  id="customerAddress"
                  name="customerAddress"
                  value={formData.customerAddress}
                  onChange={handleFormChange}
                  placeholder="Adresse complète pour la livraison"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Détails de la commande */}
          <Card>
            <CardHeader>
              <CardTitle>Détails de la commande</CardTitle>
              <CardDescription>
                Configurez les paramètres de cette commande
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="restaurantId">Restaurant *</Label>
                <Select
                  onValueChange={(value) =>
                    handleSelectChange("restaurantId", value)
                  }
                  value={formData.restaurantId}
                  required>
                  <SelectTrigger id="restaurantId">
                    <SelectValue placeholder="Sélectionner un restaurant" />
                  </SelectTrigger>
                  <SelectContent>
                    {restaurants.map((restaurant) => (
                      <SelectItem
                        key={restaurant.id}
                        value={restaurant.id}>
                        {restaurant.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="orderType">Type de commande</Label>
                <Select
                  onValueChange={(value) =>
                    handleSelectChange("orderType", value)
                  }
                  value={formData.orderType}>
                  <SelectTrigger id="orderType">
                    <SelectValue placeholder="Type de commande" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="delivery">Livraison</SelectItem>
                    <SelectItem value="pickup">À emporter</SelectItem>
                    <SelectItem value="dine_in">Sur place</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Méthode de paiement</Label>
                <Select
                  onValueChange={(value) =>
                    handleSelectChange("paymentMethod", value)
                  }
                  value={formData.paymentMethod}>
                  <SelectTrigger id="paymentMethod">
                    <SelectValue placeholder="Méthode de paiement" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Espèces</SelectItem>
                    <SelectItem value="card">Carte bancaire</SelectItem>
                    <SelectItem value="mobile">Paiement mobile</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes / Instructions spéciales</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleFormChange}
                  placeholder="Instructions ou notes supplémentaires"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Section Articles */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Articles de la commande</CardTitle>
              <CardDescription>
                Ajoutez les articles que le client a commandés
              </CardDescription>
            </div>

            <Dialog
              open={isDialogOpen}
              onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-orange-400 to-orange-600">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Ajouter un article
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Sélectionner un article</DialogTitle>
                  <DialogDescription>
                    Choisissez parmi les articles disponibles au restaurant
                  </DialogDescription>
                </DialogHeader>

                <div className="relative mt-4">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Rechercher un article..."
                    value={searchQuery}
                    onChange={handleSearchFood}
                    className="pl-9"
                  />
                </div>

                {isLoadingFoods ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                  </div>
                ) : filteredFoods.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Aucun article trouvé</p>
                  </div>
                ) : (
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      {filteredFoods.map((food) => (
                        <Card
                          key={food.id}
                          className={`cursor-pointer transition hover:border-orange-300 ${
                            selectedFood?.id === food.id
                              ? "border-orange-500 bg-orange-50"
                              : ""
                          }`}
                          onClick={() => selectFood(food)}>
                          <CardContent className="p-4 flex items-center">
                            <div className="h-16 w-16 rounded-md bg-orange-100 mr-4 flex-shrink-0 flex items-center justify-center">
                              {food.image ? (
                                <img
                                  src={food.image}
                                  alt={food.name}
                                  className="h-full w-full object-cover rounded-md"
                                />
                              ) : (
                                <div className="text-orange-500 text-xl font-semibold">
                                  {food.name.charAt(0)}
                                </div>
                              )}
                            </div>
                            <div className="flex-grow">
                              <h3 className="font-semibold">{food.name}</h3>
                              <p className="text-sm text-gray-500 line-clamp-1">
                                {food.description || "Aucune description"}
                              </p>
                              <p className="text-orange-600 font-medium mt-1">
                                {food.price.toFixed(2)} MAD
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {selectedFood && (
                      <div className="mt-6 border-t pt-4">
                        <h3 className="font-semibold text-lg mb-2">
                          {selectedFood.name}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                          <div>
                            <Label htmlFor="itemQuantity">Quantité</Label>
                            <Input
                              id="itemQuantity"
                              name="quantity"
                              type="number"
                              min="1"
                              value={newItem.quantity}
                              onChange={(e) =>
                                setNewItem({
                                  ...newItem,
                                  quantity: e.target.value,
                                })
                              }
                              className="mt-1"
                            />
                          </div>

                          {selectedFood.addons &&
                            selectedFood.addons.length > 0 && (
                              <div>
                                <Label className="mb-2 block">
                                  Suppléments disponibles
                                </Label>
                                <div className="space-y-2">
                                  {selectedFood.addons.map((addon) => (
                                    <div
                                      key={addon.id}
                                      className="flex items-center justify-between p-2 border rounded-md">
                                      <div className="flex items-center gap-2">
                                        <input
                                          type="checkbox"
                                          id={`addon-${addon.id}`}
                                          checked={selectedAddons.some(
                                            (item) => item.id === addon.id,
                                          )}
                                          onChange={() => toggleAddon(addon)}
                                          className="h-4 w-4 text-orange-500"
                                        />
                                        <Label
                                          htmlFor={`addon-${addon.id}`}
                                          className="cursor-pointer text-sm m-0">
                                          {addon.name}
                                        </Label>
                                      </div>
                                      <span className="text-gray-600 text-sm">
                                        +{addon.price.toFixed(2)} MAD
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                          {/* Affichage des variations */}
                          {selectedFood.variations &&
                            selectedFood.variations.length > 0 && (
                              <div className="mt-4">
                                <Label className="mb-2 block">
                                  Variations disponibles
                                </Label>
                                <div className="space-y-2">
                                  {selectedFood.variations.map((variation) => (
                                    <div
                                      key={variation.id}
                                      className="flex items-center justify-between p-2 border rounded-md">
                                      <div className="flex items-center gap-2">
                                        <input
                                          type="checkbox"
                                          id={`variation-${variation.id}`}
                                          checked={selectedVariations.some(
                                            (item) => item.id === variation.id,
                                          )}
                                          onChange={() =>
                                            toggleVariation(variation)
                                          }
                                          disabled={!variation.isAvailable}
                                          className="h-4 w-4 text-orange-500"
                                        />
                                        <Label
                                          htmlFor={`variation-${variation.id}`}
                                          className={`cursor-pointer text-sm m-0 ${
                                            !variation.isAvailable
                                              ? "text-gray-400"
                                              : ""
                                          }`}>
                                          {variation.name}
                                          {!variation.isAvailable &&
                                            " (Non disponible)"}
                                        </Label>
                                      </div>
                                      {variation.price > 0 && (
                                        <span className="text-gray-600 text-sm">
                                          +{variation.price.toFixed(2)} MAD
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                        </div>

                        <div className="mt-6 flex justify-end gap-4">
                          <Button
                            variant="outline"
                            onClick={() => setIsDialogOpen(false)}>
                            Annuler
                          </Button>
                          <Button
                            onClick={addSelectedFoodToOrder}
                            className="bg-gradient-to-r from-orange-400 to-orange-600">
                            Ajouter à la commande
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {orderItems.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed rounded-md">
                <p className="text-gray-500">
                  Aucun article ajouté à la commande
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Cliquez sur "Ajouter un article" pour sélectionner des plats
                  du menu
                </p>
              </div>
            ) : (
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead>Article</TableHead>
                      <TableHead>Prix unitaire</TableHead>
                      <TableHead>Qté</TableHead>
                      <TableHead>Suppléments</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="bg-white divide-y divide-gray-200">
                    {orderItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.name}
                        </TableCell>
                        <TableCell>{item.price.toFixed(2)} MAD</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>
                          {item.addons.length > 0 ? (
                            <ul className="list-disc list-inside">
                              {item.addons.map((addon: any) => (
                                <li
                                  key={addon.id}
                                  className="text-sm">
                                  {addon.name} (+{addon.price.toFixed(2)} MAD)
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-gray-400 text-sm">
                              Aucun supplément
                            </span>
                          )}

                          {/* Affichage des variations */}
                          {item.variations && item.variations.length > 0 && (
                            <div className="mt-2 border-t pt-2">
                              <span className="text-xs text-gray-500 font-semibold">
                                Variations:
                              </span>
                              <ul className="list-disc list-inside">
                                {item.variations.map((variation: any) => (
                                  <li
                                    key={variation.id}
                                    className="text-sm">
                                    {variation.name}
                                    {variation.price > 0 &&
                                      ` (+${variation.price.toFixed(2)} MAD)`}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {item.subtotal.toFixed(2)} MAD
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeOrderItem(item.id)}>
                            <Trash2 className="h-5 w-5 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
        {/* Section coupon */}
        <div className="mt-4 mb-3">
          <div className="flex items-center space-x-2 mb-1">
            <Ticket className="h-4 w-4 text-gray-500" />
            <Label
              htmlFor="couponCode"
              className="text-sm font-medium">
              Code coupon
            </Label>
          </div>
          <div className="flex space-x-2">
            <div className="relative flex-grow">
              <Input
                id="couponCode"
                value={couponCode}
                onChange={handleCouponChange}
                placeholder="Entrez un code coupon"
                disabled={!!appliedCoupon || isValidatingCoupon}
                className={`${couponError ? "border-red-300 focus:ring-red-500" : ""}`}
              />
              {appliedCoupon && (
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="Supprimer le coupon">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            {!appliedCoupon ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleApplyCoupon}
                disabled={!couponCode.trim() || isValidatingCoupon}
                className="whitespace-nowrap">
                {isValidatingCoupon ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : (
                  <Tag className="h-4 w-4 mr-1" />
                )}
                Appliquer
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRemoveCoupon}
                className="whitespace-nowrap text-red-600 border-red-200 hover:bg-red-50">
                <X className="h-4 w-4 mr-1" />
                Supprimer
              </Button>
            )}
          </div>

          {couponError && (
            <p className="text-red-600 text-xs mt-1 flex items-center">
              <AlertCircle className="h-3 w-3 inline mr-1" />
              {couponError}
            </p>
          )}

          {appliedCoupon && (
            <div className="mt-2">
              <Badge className="bg-green-50 text-green-700 hover:bg-green-100 border border-green-200">
                <Ticket className="h-3 w-3 mr-1" />
                {appliedCoupon.code}:{" "}
                {appliedCoupon.discountType === "percentage"
                  ? `${appliedCoupon.discountValue}% de réduction`
                  : `${appliedCoupon.discountValue.toFixed(2)} MAD de réduction`}
              </Badge>
              <p className="text-xs text-gray-500 mt-1">
                {couponDiscount.toFixed(2)} MAD de réduction appliquée
              </p>
            </div>
          )}
        </div>

        {totals.total > 0 && (
          <div className="flex justify-between text-green-600 font-medium">
            <span>Réduction:</span>
            <span>-{totals.total.toFixed(2)} MAD</span>
          </div>
        )}

        <Separator className="my-2" />

        {/* Récapitulatif et validation */}
        <Card>
          <CardHeader>
            <CardTitle>Récapitulatif de la commande</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-medium mb-4">Détails de facturation</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sous-total:</span>
                    <span>{totals.subtotal.toFixed(2)} MAD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">TVA (20%):</span>
                    <span>{totals.tax.toFixed(2)} MAD</span>
                  </div>
                  {formData.orderType === "delivery" && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Frais de livraison:</span>
                      <span>{totals.deliveryFee.toFixed(2)} MAD</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Frais d'emballage:</span>
                    <span>{totals.packagingFee.toFixed(2)} MAD</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-semibold">
                    <span>Total:</span>
                    <span className="text-orange-600">
                      {totals.total.toFixed(2)} MAD
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-4">Résumé de la commande</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nombre d'articles:</span>
                    <span>{orderItems.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type de commande:</span>
                    <span>
                      {formData.orderType === "delivery"
                        ? "Livraison"
                        : formData.orderType === "pickup"
                          ? "À emporter"
                          : "Sur place"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Méthode de paiement:</span>
                    <span>
                      {formData.paymentMethod === "cash"
                        ? "Espèces"
                        : formData.paymentMethod === "card"
                          ? "Carte bancaire"
                          : "Paiement mobile"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Client:</span>
                    <span>{formData.customerName || "Non spécifié"}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}>
              Annuler
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-orange-400 to-orange-600"
              disabled={isSubmitting || orderItems.length === 0}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création en cours...
                </>
              ) : (
                "Créer la commande"
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
