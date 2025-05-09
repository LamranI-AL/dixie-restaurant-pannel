/** @format */
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
// import { createOrder } from "@/actions/ordres"; // Server Action pour créer une commande
import { Loader2, PlusCircle, Trash2, ChevronLeft } from "lucide-react";
import { Addon, Order, OrderItem, OrderStatus, Restaurant } from "@/lib/types"; // Importation des types

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
import { addOrder } from "@/actions/ordres";
import { createOrderForUser } from "@/actions/user";

// Type pour les éléments de commande (adapté à votre type OrderItem)
// interface TempOrderItem {
//   id: string;
//   name: string;
//   price: number;
//   quantity: number;
//   addons: {
//     id: string;
//     name: string;
//     price: number;
//   }[];
//   totalPrice: number;
//   // Ajout des champs requis par votre type OrderItem
//   foodId?: string;
//   variations: { name: string; price: number }[];
//   subtotal: number;
// }

export default function AddOrderForm() {
  const router = useRouter();

  // État pour charger les restaurants (à remplacer par votre vraie API)
  const [restaurants, setRestaurants] = useState<Restaurant[] | any[]>([
    { id: "1", name: "Restaurant Dixie" },
  ]);

  // État pour le chargement
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    name: "",
    price: "",
    quantity: "1",
  });

  // Nouvelle valeur temporaire pour l'addon en cours d'ajout
  const [newAddon, setNewAddon] = useState({
    name: "",
    price: "",
  });

  // Addons temporaires pour l'item en cours d'ajout
  const [tempAddons, setTempAddons] = useState<
    { id: string; name: string; price: number }[]
  >([]);

  // Fonction pour mettre à jour les données du formulaire
  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Fonction pour mettre à jour la sélection (restaurant, méthode de paiement, etc.)
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Fonction pour mettre à jour les valeurs du nouvel item
  const handleNewItemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewItem((prev) => ({ ...prev, [name]: value }));
  };

  // Fonction pour mettre à jour les valeurs du nouvel addon
  const handleNewAddonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewAddon((prev) => ({ ...prev, [name]: value }));
  };

  // Fonction pour ajouter un addon temporaire
  const addTempAddon = () => {
    if (newAddon.name.trim() === "" || newAddon.price.trim() === "") {
      toast.error("Veuillez remplir tous les champs du supplément");
      return;
    }

    const price = parseFloat(newAddon.price);
    if (isNaN(price) || price < 0) {
      toast.error("Le prix du supplément doit être un nombre positif");
      return;
    }

    const addon = {
      id: `addon_${Date.now()}`,
      name: newAddon.name,
      price: price,
    };

    setTempAddons((prev) => [...prev, addon]);
    setNewAddon({ name: "", price: "" });
  };

  // Fonction pour supprimer un addon temporaire
  const removeTempAddon = (id: string) => {
    setTempAddons((prev) => prev.filter((addon) => addon.id !== id));
  };

  // Fonction pour ajouter un item à la commande
  const addItemToOrder = () => {
    if (newItem.name.trim() === "" || newItem.price.trim() === "") {
      toast.error("Veuillez remplir tous les champs de l'article");
      return;
    }

    const price = parseFloat(newItem.price);
    const quantity = parseInt(newItem.quantity);

    if (isNaN(price) || price < 0) {
      toast.error("Le prix doit être un nombre positif");
      return;
    }

    if (isNaN(quantity) || quantity <= 0) {
      toast.error("La quantité doit être un nombre positif");
      return;
    }

    // Calculer le prix total de l'item (y compris les addons)
    const addonsTotalPrice = tempAddons.reduce(
      (sum, addon) => sum + addon.price,
      0,
    );
    const totalItemPrice = (price + addonsTotalPrice) * quantity;

    const item: OrderItem = {
      id: `item_${Date.now()}`,
      name: newItem.name,
      price: price,
      quantity: quantity,
      addons: [...tempAddons] as Addon[],

      subtotal: totalItemPrice,
      foodId: "", // Ensure this is always a string
      variations: [], // Adapt as needed
      //   subtotal: totalItemPrice,
    };

    setOrderItems((prev) => [...prev, item]);
    setNewItem({ name: "", price: "", quantity: "1" });
    setTempAddons([]);

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
    const deliveryFee = formData.orderType === "delivery" ? 15 : 0; // Frais de livraison
    const packagingFee = 1.5; // Frais d'emballage
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
        totalAmount: totals.total,
        discount: 0, // À implémenter si nécessaire
        paymentStatus: "unpaid", // Par défaut
        orderStatus: "pending" as OrderStatus,
        address: {
          address: formData.customerAddress || "ask admin please",
          latitude: 1,
          longitude: 1,
        }, // Conversion explicite selon le type OrderStatus
        // orderDate: new Date(),
      };

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
  // console.log("orderItems", orderItems);

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
          <CardHeader>
            <CardTitle>Articles de la commande</CardTitle>
            <CardDescription>
              Ajoutez les articles que le client a commandés
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion
              type="single"
              collapsible
              className="mb-6">
              <AccordionItem value="add-item">
                <AccordionTrigger className="text-orange-500 font-medium">
                  Ajouter un nouvel article
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 p-4 border rounded-md bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="itemName">Nom de l'article *</Label>
                        <Input
                          id="itemName"
                          name="name"
                          value={newItem.name}
                          onChange={handleNewItemChange}
                          placeholder="Nom de l'article"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="itemPrice">Prix (MAD) *</Label>
                        <Input
                          id="itemPrice"
                          name="price"
                          type="number"
                          min="0"
                          step="0.01"
                          value={newItem.price}
                          onChange={handleNewItemChange}
                          placeholder="0.00"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="itemQuantity">Quantité *</Label>
                        <Input
                          id="itemQuantity"
                          name="quantity"
                          type="number"
                          min="1"
                          value={newItem.quantity}
                          onChange={handleNewItemChange}
                          placeholder="1"
                        />
                      </div>
                    </div>

                    {/* Section pour ajouter des suppléments */}
                    <div className="mt-4">
                      <h3 className="font-medium mb-2">Suppléments</h3>

                      {tempAddons.length > 0 && (
                        <div className="mb-4 space-y-2">
                          {tempAddons.map((addon) => (
                            <div
                              key={addon.id}
                              className="flex justify-between items-center p-2 bg-white rounded border">
                              <span>{addon.name}</span>
                              <div className="flex items-center gap-4">
                                <span className="text-gray-600">
                                  {addon.price.toFixed(2)} MAD
                                </span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeTempAddon(addon.id)}>
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="addonName">Nom du supplément</Label>
                          <Input
                            id="addonName"
                            name="name"
                            value={newAddon.name}
                            onChange={handleNewAddonChange}
                            placeholder="Ex: Sauce supplémentaire"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="addonPrice">Prix (MAD)</Label>
                          <Input
                            id="addonPrice"
                            name="price"
                            type="number"
                            min="0"
                            step="0.01"
                            value={newAddon.price}
                            onChange={handleNewAddonChange}
                            placeholder="0.00"
                          />
                        </div>

                        <div className="flex items-end">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={addTempAddon}
                            className="w-full border-orange-500 text-orange-500">
                            Ajouter un supplément
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end mt-4">
                      <Button
                        type="button"
                        onClick={addItemToOrder}
                        className="bg-gradient-to-r from-orange-400 to-orange-600">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Ajouter à la commande
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {orderItems.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed rounded-md">
                <p className="text-gray-500">
                  Aucun article ajouté à la commande
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Utilisez le formulaire ci-dessus pour ajouter des articles
                </p>
              </div>
            ) : (
              <div className="border rounded-md overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Article
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Prix unitaire
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Qté
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Suppléments
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orderItems.map((item) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.price.toFixed(2)} MAD
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {item.addons.length > 0 ? (
                            <ul className="list-disc list-inside">
                              {item.addons.map((addon: any) => (
                                <li key={addon.id}>
                                  {addon.name} (+{addon.price.toFixed(2)} MAD)
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-gray-400">
                              Aucun supplément
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          {item.subtotal.toFixed(2)} MAD
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeOrderItem(item.id)}>
                            <Trash2 className="h-5 w-5 text-red-500" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

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
