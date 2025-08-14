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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  Trash2,
  ShoppingCart,
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Order, OrderItem, Food } from "@/lib/types";
import { useUsers } from "@/lib/hooks/useUserOrders"; // Import du nouveau hook
import { useFoods } from "@/lib/hooks/useFoods";

interface AddOrderModalProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function AddOrderModal({ trigger, onSuccess }: AddOrderModalProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    customerAddress: "",
    orderType: "delivery",
    paymentMethod: "cash",
    notes: "",
  });

  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [selectedFood, setSelectedFood] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Utilisation du nouveau hook useUsers
  const {
    createOrderForUser, // Fonction pour créer une commande pour un utilisateur
    addUser, // Fonction pour créer un utilisateur s'il n'existe pas
    getUserByUid,
    loading: userLoading,
  } = useUsers();

  const { foods, getAllFoods, loading: foodsLoading } = useFoods();

  const loading = userLoading;

  useEffect(() => {
    if (open && foods.length === 0) {
      getAllFoods();
    }
  }, [open, foods.length, getAllFoods]);

  const resetForm = () => {
    setFormData({
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      customerAddress: "",
      orderType: "delivery",
      paymentMethod: "cash",
      notes: "",
    });
    setOrderItems([]);
    setSelectedFood("");
    setQuantity(1);
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.customerName.trim()) newErrors.customerName = "Nom requis";
    if (!formData.customerPhone.trim())
      newErrors.customerPhone = "Téléphone requis";
    if (orderItems.length === 0) newErrors.items = "Au moins un article requis";

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

  const addFoodToOrder = () => {
    if (!selectedFood || quantity <= 0) {
      toast.error("Sélectionnez un plat et une quantité valide");
      return;
    }

    const food = foods.find((f) => f.id === selectedFood);
    if (!food) return;

    const existingItemIndex = orderItems.findIndex(
      (item) => item.foodId === selectedFood,
    );

    if (existingItemIndex >= 0) {
      // Update existing item quantity
      const updatedItems = [...orderItems];
      updatedItems[existingItemIndex].quantity += quantity;
      updatedItems[existingItemIndex].subtotal =
        updatedItems[existingItemIndex].quantity * food.price;
      setOrderItems(updatedItems);
    } else {
      // Add new item
      const newItem: OrderItem = {
        id: `item-${Date.now()}`,
        foodId: food.id,
        name: food.name,
        quantity,
        price: food.price,
        variations: [],
        addons: [],
        subtotal: food.price * quantity,
      };
      setOrderItems((prev) => [...prev, newItem]);
    }

    setSelectedFood("");
    setQuantity(1);
    toast.success("Article ajouté à la commande");
  };

  const removeFromOrder = (itemId: string) => {
    setOrderItems((prev) => prev.filter((item) => item.id !== itemId));
    toast.info("Article supprimé de la commande");
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromOrder(itemId);
      return;
    }

    setOrderItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              quantity: newQuantity,
              subtotal: item.price * newQuantity,
            }
          : item,
      ),
    );
  };

  const calculateTotals = () => {
    const subtotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
    const tax = subtotal * 0; // 10% tax MAIS NON on vas transformer a 0% demander par le client
    const deliveryFee = formData.orderType === "delivery" ? 7 : 0;
    const packagingFee = 0;
    const total = subtotal + tax + deliveryFee + packagingFee;

    return { subtotal, tax, deliveryFee, packagingFee, total };
  };

  // Fonction pour créer ou récupérer un utilisateur
  const createOrGetUser = async () => {
    // D'abord, essayer de trouver l'utilisateur par téléphone ou email
    // Pour l'instant, on crée un utilisateur guest avec les informations fournies
    const userData = {
      // uid: `guest-${Date.now()}`, // UID temporaire pour les clients invités
      email: formData.customerEmail || `guest-${Date.now()}@temp.com`,
      displayName: formData.customerName,
      phoneNumber: formData.customerPhone,
      address: formData.customerAddress,
      role: "customer" as const,
      photoURL: null,
    };

    const result = await addUser(userData as any);
    return result;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Veuillez corriger les erreurs du formulaire");
      return;
    }

    try {
      // Créer ou récupérer l'utilisateur
      const userResult = await createOrGetUser();

      if (!userResult.success) {
        toast.error(
          userResult.error || "Erreur lors de la création de l'utilisateur",
        );
        return;
      }

      const userId = userResult.userId!;
      const totals = calculateTotals();

      const orderData: any = {
        orderNumber: `ORD-${Date.now()}`,
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerEmail: formData.customerEmail || null,
        customerAddress: formData.customerAddress || null,
        items: orderItems,
        subtotal: totals.subtotal,
        tax: totals.tax,
        deliveryFee: totals.deliveryFee,
        packagingFee: totals.packagingFee,
        discount: 0,
        total: totals.total,
        paymentMethod: formData.paymentMethod,
        paymentStatus: "unpaid" as const,
        orderStatus: "confirmed" as const,
        orderType: formData.orderType,
        restaurantId: "iqGHAk4qBeUEgODnF3aR",
        notes: formData.notes || null,
        deliveryLocation:
          formData.orderType === "delivery"
            ? {
                address: formData.customerAddress,
                latitude: 0,
                longitude: 0,
              }
            : null,
        deliveryOption: formData.orderType,
        status: "pending" as const,
      };

      // Utiliser createOrderForUser du hook useUsers
      const result = await createOrderForUser(userId, orderData);

      if (result.success) {
        toast.success("Commande créée avec succès !");
        setOpen(false);
        resetForm();
        onSuccess?.();
      } else {
        toast.error(
          result.error || "Erreur lors de la création de la commande",
        );
      }
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("Une erreur est survenue lors de la création de la commande");
    }
  };

  const totals = calculateTotals();

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nouvelle Commande
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Créer une nouvelle commande
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <form
            onSubmit={handleSubmit}
            className="space-y-6 p-1">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Informations Client */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informations Client
                </h3>
                <Separator />

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Nom complet <span className="text-red-500">*</span>
                    </label>
                    <Input
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleInputChange}
                      placeholder="Nom du client"
                      className={errors.customerName ? "border-red-500" : ""}
                    />
                    {errors.customerName && (
                      <p className="text-sm text-red-500 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.customerName}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Téléphone <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        name="customerPhone"
                        value={formData.customerPhone}
                        onChange={handleInputChange}
                        placeholder="+212 600 000 000"
                        className={`pl-10 ${errors.customerPhone ? "border-red-500" : ""}`}
                      />
                    </div>
                    {errors.customerPhone && (
                      <p className="text-sm text-red-500 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.customerPhone}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Email (optionnel)
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        name="customerEmail"
                        value={formData.customerEmail}
                        onChange={handleInputChange}
                        placeholder="email@exemple.com"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Type de commande
                    </label>
                    <Select
                      value={formData.orderType}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, orderType: value }))
                      }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="delivery">Livraison</SelectItem>
                        <SelectItem value="pickup">À emporter</SelectItem>
                        <SelectItem value="dine-in">Sur place</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.orderType === "delivery" && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Adresse de livraison
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Textarea
                          name="customerAddress"
                          value={formData.customerAddress}
                          onChange={handleInputChange}
                          placeholder="Adresse complète de livraison"
                          className="pl-10 min-h-16"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Méthode de paiement
                    </label>
                    <Select
                      value={formData.paymentMethod}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          paymentMethod: value,
                        }))
                      }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Espèces</SelectItem>
                        <SelectItem value="card">Carte bancaire</SelectItem>
                        <SelectItem value="mobile">Paiement mobile</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Articles de la Commande */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Articles de la Commande
                </h3>
                <Separator />

                {/* Ajouter un article */}
                <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                  <h4 className="font-medium">Ajouter un article</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <Select
                      value={selectedFood}
                      onValueChange={setSelectedFood}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un plat" />
                      </SelectTrigger>
                      <SelectContent>
                        {foodsLoading ? (
                          <div className="p-2 text-center">
                            <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                            Chargement...
                          </div>
                        ) : (
                          foods.map((food) => (
                            <SelectItem
                              key={food.id}
                              value={food.id}>
                              {food.name} - {food.price?.toFixed(2)} MAD
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      placeholder="Qté"
                    />
                    <Button
                      type="button"
                      onClick={addFoodToOrder}
                      size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Liste des articles */}
                <div className="space-y-2">
                  {orderItems.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                      <ShoppingCart className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p>Aucun article dans la commande</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {orderItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3 border rounded-lg bg-white">
                          <div className="flex-1">
                            <h5 className="font-medium">{item.name}</h5>
                            <p className="text-sm text-gray-500">
                              {item.price.toFixed(2)} MAD x {item.quantity}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity - 1)
                                }
                                className="h-6 w-6 p-0">
                                -
                              </Button>
                              <span className="w-8 text-center text-sm">
                                {item.quantity}
                              </span>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity + 1)
                                }
                                className="h-6 w-6 p-0">
                                +
                              </Button>
                            </div>
                            <Badge variant="outline">
                              {item.subtotal.toFixed(2)} MAD
                            </Badge>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFromOrder(item.id)}
                              className="h-6 w-6 p-0 text-red-500">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {errors.items && (
                    <p className="text-sm text-red-500 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.items}
                    </p>
                  )}
                </div>

                {/* Résumé de la commande */}
                {orderItems.length > 0 && (
                  <div className="p-4 border rounded-lg bg-gray-50 space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Résumé de la commande
                    </h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Sous-total:</span>
                        <span>{totals.subtotal.toFixed(2)} MAD</span>
                      </div>
                      <div className="flex justify-between">
                        <span>TVA (10%):</span>
                        <span>{totals.tax.toFixed(2)} MAD</span>
                      </div>
                      {formData.orderType === "delivery" && (
                        <div className="flex justify-between">
                          <span>Livraison:</span>
                          <span>{totals.deliveryFee.toFixed(2)} MAD</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Emballage:</span>
                        <span>{totals.packagingFee.toFixed(2)} MAD</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-semibold">
                        <span>Total:</span>
                        <span>{totals.total.toFixed(2)} MAD</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Notes (optionnel)</label>
              <Textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Instructions spéciales pour la commande..."
                className="min-h-16"
              />
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
                disabled={loading || orderItems.length === 0}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Création...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Créer la commande
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
