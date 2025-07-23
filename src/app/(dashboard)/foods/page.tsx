/** @format */

"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2,
  Search,
  RefreshCw,
  Plus,
  Eye,
  Edit,
  Trash2,
  Package,
  DollarSign,
  Clock,
  Star,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Image from "next/image";
import { Food } from "@/lib/types";
import { useFoods } from "@/lib/hooks/useFoods";
import { useCategories } from "@/lib/hooks/useCategories";
import { ViewFoodModal } from "@/components/dashboard/foods/viewModal";
import { EditFoodModal } from "@/components/dashboard/foods/editeFood";
import { DeleteFoodModal } from "@/components/dashboard/foods/deleteFood";
import { AddFoodModal } from "@/components/dashboard/foods/addFoodModel";

export default function FoodsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const {
    foods,
    loading,
    error,
    getAllFoods,
    toggleFoodAvailability,
    clearError,
  } = useFoods();

  const {
    categories,
    getAllCategories,
    loading: categoriesLoading,
  } = useCategories();

  // Chargement initial
  useEffect(() => {
    getAllFoods();
    getAllCategories();
  }, [getAllFoods, getAllCategories]);

  // Gestion des erreurs
  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  // Filtrage des plats avec useMemo pour optimiser les performances
  const filteredFoods = useMemo(() => {
    return foods.filter((food) => {
      const matchesSearch =
        food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        food.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" || food.cuisineId === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [foods, searchTerm, selectedCategory]);

  // Statistiques calculées avec useMemo
  const statistics = useMemo(() => {
    const total = foods.length;
    const available = foods.filter((food) => food.isAvailable).length;
    const unavailable = foods.filter((food) => !food.isAvailable).length;
    const avgPrice =
      foods.length > 0
        ? foods.reduce((sum, food) => sum + (food.price || 0), 0) / foods.length
        : 0;

    return { total, available, unavailable, avgPrice };
  }, [foods]);

  // Plats par statut avec useMemo
  const foodsByStatus = useMemo(
    () => ({
      available: foods.filter((food) => food.isAvailable),
      unavailable: foods.filter((food) => !food.isAvailable),
    }),
    [foods],
  );

  const handleRefresh = () => {
    getAllFoods();
    getAllCategories();
  };

  const handleToggleAvailability = async (
    foodId: string,
    currentStatus: boolean,
    foodName: string,
  ) => {
    const result = await toggleFoodAvailability(foodId, !currentStatus);
    if (result.success) {
      toast.success(
        `${foodName} ${!currentStatus ? "rendu disponible" : "rendu indisponible"}`,
      );
    } else {
      toast.error(result.error || "Erreur lors de la modification");
    }
  };

  // Composant réutilisable pour les cartes de statistiques
  const StatCard = ({
    title,
    value,
    icon: Icon,
    bgColor,
    iconColor,
    subtitle,
  }: {
    title: string;
    value: string | number;
    icon: React.ComponentType<any>;
    bgColor: string;
    iconColor: string;
    subtitle?: string;
  }) => (
    <Card>
      <CardContent className="flex items-center p-6">
        <div className={`${bgColor} p-3 rounded-full mr-4`}>
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
        </div>
      </CardContent>
    </Card>
  );

  // Composant de ligne de tableau
  const FoodRow = ({ food, index }: { food: Food; index: number }) => (
    <TableRow key={food.id}>
      <TableCell className="text-center">{index + 1}</TableCell>
      <TableCell>
        <div className="flex items-center space-x-3">
          <div className="h-12 w-12 rounded-md overflow-hidden">
            <Image
              src={food.image || "/placeholder-food.jpg"}
              alt={food.name}
              width={48}
              height={48}
              className="h-full w-full object-cover"
              unoptimized
            />
          </div>
          <div>
            <p className="font-medium">{food.name}</p>
            <p className="text-sm text-gray-500 line-clamp-1">
              {food.description}
            </p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="space-y-1">
          <p className="font-semibold">{food.price?.toFixed(2)} MAD</p>
          {food.discountPrice && (
            <p className="text-sm text-orange-600">
              {food.discountPrice.toFixed(2)} MAD
            </p>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3 text-gray-400" />
          <span className="text-sm">{food.preparationTime || 0} min</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Star className="h-3 w-3 text-yellow-400" />
          <span className="text-sm">
            {food.rating?.toFixed(1) || "0.0"} ({food.reviewCount || 0})
          </span>
        </div>
      </TableCell>
      <TableCell>
        <Badge
          variant={food.isAvailable ? "default" : "secondary"}
          className={
            food.isAvailable
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }>
          {food.isAvailable ? (
            <CheckCircle2 className="h-3 w-3 mr-1" />
          ) : (
            <XCircle className="h-3 w-3 mr-1" />
          )}
          {food.isAvailable ? "Disponible" : "Indisponible"}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <ViewFoodModal foodId={food.id} />
          <EditFoodModal
            foodId={food.id}
            onSuccess={handleRefresh}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              handleToggleAvailability(food.id, food.isAvailable, food.name)
            }
            className={food.isAvailable ? "text-orange-600" : "text-green-600"}>
            {food.isAvailable ? (
              <XCircle className="h-4 w-4" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
          </Button>
          <DeleteFoodModal
            foodId={food.id}
            foodName={food.name}
            onSuccess={handleRefresh}
          />
        </div>
      </TableCell>
    </TableRow>
  );

  // Composant de contenu d'onglet réutilisable
  const TabContent = ({
    title,
    description,
    data,
    emptyMessage,
  }: {
    title: string;
    description: string;
    data: Food[];
    emptyMessage: string;
  }) => (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <p className="text-sm text-gray-500">{description}</p>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 text-center">N°</TableHead>
                  <TableHead>Plat</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead>Temps</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((food, index) => (
                  <FoodRow
                    key={food.id}
                    food={food}
                    index={index}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">{emptyMessage}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  // Affichage du spinner de chargement initial
  if (loading && foods.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)]">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
        <p className="mt-4 text-lg text-gray-600">Chargement des plats...</p>
      </div>
    );
  }

  // Affichage d'erreur persistante
  if (error && foods.length === 0) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle>Erreur de chargement</AlertTitle>
          <AlertDescription>
            {error} Impossible de charger les plats.
            <Button
              onClick={handleRefresh}
              className="ml-2"
              size="sm"
              variant="outline"
              disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-1" />
              )}
              Réessayer
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestion des Plats</h1>
          <p className="text-gray-600">Gérez votre menu et vos plats</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleRefresh}
            disabled={loading}
            variant="outline"
            size="sm"
            className="gap-2">
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Actualiser
          </Button>
          <AddFoodModal onSuccess={handleRefresh} />
        </div>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher un plat..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-64">
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les catégories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les catégories</SelectItem>
                  {categoriesLoading ? (
                    <div className="p-2 text-center">
                      <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                      Chargement...
                    </div>
                  ) : (
                    categories.map((category) => (
                      <SelectItem
                        key={category.id}
                        value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Informations de filtrage */}
          {(searchTerm || selectedCategory !== "all") && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-blue-700">
                  <Search className="h-4 w-4" />
                  <span>
                    {filteredFoods.length} plat(s) trouvé(s)
                    {searchTerm && ` pour "${searchTerm}"`}
                    {selectedCategory !== "all" && (
                      <span>
                        {" "}
                        dans la catégorie "
                        {categories.find((c) => c.id === selectedCategory)
                          ?.name || "Inconnue"}
                        "
                      </span>
                    )}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("all");
                  }}
                  className="text-blue-700 hover:text-blue-800">
                  Effacer les filtres
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Onglets pour filtrer par statut */}
      <Tabs
        defaultValue="all"
        className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">
            Tous les plats ({statistics.total})
          </TabsTrigger>
          <TabsTrigger value="available">
            Disponibles ({statistics.available})
          </TabsTrigger>
          <TabsTrigger value="unavailable">
            Indisponibles ({statistics.unavailable})
          </TabsTrigger>
        </TabsList>

        {/* Contenu des onglets */}
        <TabsContent value="all">
          <TabContent
            title="Liste de tous les plats"
            description="Gérez tous les plats de votre menu"
            data={filteredFoods}
            emptyMessage={
              searchTerm || selectedCategory !== "all"
                ? "Aucun plat ne correspond aux filtres appliqués"
                : "Aucun plat trouvé. Ajoutez votre premier plat !"
            }
          />
        </TabsContent>

        <TabsContent value="available">
          <TabContent
            title="Plats disponibles"
            description="Plats actuellement disponibles pour les commandes"
            data={foodsByStatus.available.filter((food) => {
              const matchesSearch =
                food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                food.description
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase());
              const matchesCategory =
                selectedCategory === "all" ||
                food.cuisineId === selectedCategory;
              return matchesSearch && matchesCategory;
            })}
            emptyMessage="Aucun plat disponible ne correspond aux filtres"
          />
        </TabsContent>

        <TabsContent value="unavailable">
          <TabContent
            title="Plats indisponibles"
            description="Plats temporairement indisponibles"
            data={foodsByStatus.unavailable.filter((food) => {
              const matchesSearch =
                food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                food.description
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase());
              const matchesCategory =
                selectedCategory === "all" ||
                food.cuisineId === selectedCategory;
              return matchesSearch && matchesCategory;
            })}
            emptyMessage="Aucun plat indisponible ne correspond aux filtres"
          />
        </TabsContent>
      </Tabs>

      {/* Instructions d'aide */}
      {foods.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">
                  Conseils pour la gestion des plats
                </h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>
                    • Utilisez des images de haute qualité pour attirer les
                    clients
                  </li>
                  <li>
                    • Mettez à jour régulièrement la disponibilité de vos plats
                  </li>
                  <li>
                    • Ajoutez des variations et suppléments pour plus d'options
                  </li>
                  <li>
                    • Surveillez les statistiques de vente pour optimiser votre
                    menu
                  </li>
                  <li>
                    • Organisez vos plats par catégories pour faciliter la
                    navigation
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
