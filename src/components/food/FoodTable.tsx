/** @format */
"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
  ColumnFiltersState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Eye,
  Pencil,
  Trash2,
  MoreVertical,
  Search,
  Plus,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Check,
  X,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import { Switch } from "@/components/ui/switch";
import { EditFoodDialog } from "./EditFoodDialog";
import { DeleteFoodDialog } from "./DeleteFoodDialog";
import { Category, Food } from "@/lib/types";
import { updateFood, deleteFood } from "@/actions/food";
import { getCategoryById } from "@/actions/category";
import { useToast } from "@/lib/hooks/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { AddFoodDialog } from "./add-food-dialog";

interface FoodTableProps {
  foods: Food[];
}

export function FoodTable({ foods }: FoodTableProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [updatingFoodId, setUpdatingFoodId] = useState<string | null>(null);
  const [localFoods, setLocalFoods] = useState<Food[]>(foods);

  const [foodToEdit, setFoodToEdit] = useState<Food | null>(null);
  const [foodToDelete, setFoodToDelete] = useState<Food | null>(null);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  useEffect(() => {
    setLocalFoods(foods);
  }, [foods]);

  const handleViewDetails = (food: Food) => {
    setIsLoading(true);
    try {
      router.push(`/foods/details/${food.id}`);
      toast({
        title: "Navigation en cours",
        description: "Chargement des détails du plat...",
      });
    } catch (error) {
      console.error("Error navigating to food details:", error);
      toast({
        title: "Erreur de navigation",
        description: "Impossible d'accéder aux détails du plat.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleEditFood = (food: Food) => {
    setFoodToEdit(food);
    toast({
      title: "Modification",
      description: `Préparation de la modification pour: ${food.name}`,
    });
  };

  const handleDeleteFood = (food: Food) => {
    setFoodToDelete(food);
  };

  const handleUpdateSuccess = (foodId: string, action: string) => {
    // Update the local state to reflect changes
    setLocalFoods((prev) =>
      prev.map((food) =>
        food.id === foodId
          ? {
              ...food,
              ...(action === "availability" && {
                isAvailable: !food.isAvailable,
              }),
            }
          : food,
      ),
    );

    // Refresh the page to get the latest data from the server
    router.refresh();
  };

  const handleConfirmDelete = async (id: string) => {
    setIsLoading(true);
    try {
      await deleteFood(id);

      toast({
        title: "Succès!",
        description: "Le plat a été supprimé avec succès.",
        variant: "default",
        duration: 3000,
        action: (
          <Button
            size="sm"
            variant="outline"
            className="bg-green-50">
            <Check className="h-4 w-4 text-green-600 mr-1" /> OK
          </Button>
        ),
      });

      // Update local state
      setLocalFoods((prev) => prev.filter((food) => food.id !== id));
      setFoodToDelete(null);
      router.refresh();
    } catch (error) {
      console.error("Error deleting food:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer ce plat. Veuillez réessayer.",
        variant: "destructive",
        duration: 5000,
        action: (
          <Button
            size="sm"
            variant="outline"
            className="bg-red-50">
            <X className="h-4 w-4 text-red-600 mr-1" /> Fermer
          </Button>
        ),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleAvailability = async (food: Food, isAvailable: boolean) => {
    setUpdatingFoodId(food.id);
    try {
      await updateFood(food.id, {
        ...food,
        isAvailable: isAvailable,
      });

      const statusText = isAvailable ? "disponible" : "indisponible";
      toast({
        title: "Statut mis à jour",
        description: `Le plat "${food.name}" est maintenant ${statusText}.`,
        variant: "default",
        duration: 3000,
      });

      handleUpdateSuccess(food.id, "availability");
    } catch (error) {
      console.error("Error updating food availability:", error);
      toast({
        title: "Erreur de mise à jour",
        description: "Impossible de changer la disponibilité du plat.",
        variant: "destructive",
        duration: 5000,
      });

      // Revert the UI to the original state
      setLocalFoods((prev) =>
        prev.map((item) =>
          item.id === food.id ? { ...item, isAvailable: !isAvailable } : item,
        ),
      );
    } finally {
      setUpdatingFoodId(null);
    }
  };

  // Define columns for the table
  const columns: ColumnDef<Food>[] = useMemo(
    () => [
      {
        accessorKey: "image",
        header: "Image",
        cell: ({ row }) => {
          const food = row.original;
          return (
            <div className="relative h-12 w-12 overflow-hidden rounded-md">
              {food.image ? (
                <Image
                  src={food.image}
                  alt={food.name}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/images/placeholder.png";
                  }}
                />
              ) : (
                <div className="h-full w-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
                  No Image
                </div>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "name",
        header: "Nom du Plat",
        cell: ({ row }) => (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className="cursor-pointer"
                  onClick={() => handleViewDetails(row.original)}>
                  <div className="font-medium text-blue-600 hover:text-blue-800 hover:underline">
                    {row.original.name}
                  </div>
                  <div className="text-xs text-gray-500 truncate max-w-[200px]">
                    {row.original.description.length > 60
                      ? `${row.original.description.substring(0, 60)}...`
                      : row.original.description}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p className="max-w-xs">{row.original.description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ),
      },
      {
        accessorKey: "price",
        header: "Prix (MAD)",
        cell: ({ row }) => (
          <div>
            <div className="font-medium text-xs text-red-500 line-through">
              {row.original.price.toFixed(2)} MAD
            </div>
            {row.original.discountPrice && (
              <div className="font-medium ">
                {row.original.discountPrice.toFixed(2)} MAD
              </div>
            )}
          </div>
        ),
      },
      {
        accessorKey: "categoryId",
        header: "Catégorie",
        cell: ({ row }) => {
          const [categorie, setCategorie] = useState<Category | null>(null);
          const [loading, setLoading] = useState(true);
          const [error, setError] = useState(false);

          useEffect(() => {
            const getCurrentCategory = async (id: string) => {
              try {
                setLoading(true);
                const currentCategorie = await getCategoryById(id);
                setCategorie(currentCategorie.category as Category);
              } catch (err) {
                console.error("Error loading category:", err);
                setError(true);
              } finally {
                setLoading(false);
              }
            };

            if (row.original.cuisineId) {
              getCurrentCategory(row.original.cuisineId);
            } else {
              setLoading(false);
            }
          }, [row.original.cuisineId]);

          // Render based on state
          if (loading) {
            return <Skeleton className="h-6 w-20" />;
          }

          if (error || !categorie) {
            return (
              <Badge
                variant="outline"
                className="text-red-500 border-red-200 bg-red-50">
                Non définie
              </Badge>
            );
          }

          return (
            <Badge
              variant="outline"
              className="capitalize bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 transition-colors">
              {categorie.name}
            </Badge>
          );
        },
      },
      {
        accessorKey: "preparationTime",
        header: "Temps de Préparation",
        cell: ({ row }) => (
          <div className="text-sm">
            {row.original.preparationTime ? row.original.preparationTime : "10"}{" "}
            min
          </div>
        ),
      },
      {
        accessorKey: "isAvailable",
        header: "Disponible",
        cell: ({ row }) => (
          <div className="flex items-center">
            {updatingFoodId === row.original.id ? (
              <Loader2 className="h-4 w-4 animate-spin text-blue-500 mr-2" />
            ) : null}
            <Switch
              checked={row.original.isAvailable}
              onCheckedChange={(checked) =>
                handleToggleAvailability(row.original, checked)
              }
              disabled={updatingFoodId === row.original.id}
              className={row.original.isAvailable ? "bg-green-500" : ""}
              aria-label="Toggle availability"
            />
            <span className="ml-2 text-xs text-gray-500">
              {row.original.isAvailable ? "Oui" : "Non"}
            </span>
          </div>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-slate-100">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Menu d'actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleViewDetails(row.original)}
                className="cursor-pointer flex items-center text-blue-600 hover:text-blue-800 hover:bg-blue-50">
                <Eye className="mr-2 h-4 w-4" />
                Voir les détails
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleEditFood(row.original)}
                className="cursor-pointer flex items-center text-amber-600 hover:text-amber-800 hover:bg-amber-50">
                <Pencil className="mr-2 h-4 w-4" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDeleteFood(row.original)}
                className="cursor-pointer flex items-center text-red-600 hover:text-red-800 hover:bg-red-50">
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [updatingFoodId],
  );

  // Initialize the table
  const table = useReactTable({
    data: localFoods,
    columns,
    state: {
      sorting,
      columnFilters,
      pagination,
      globalFilter: searchQuery,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setSearchQuery,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: (row, columnId, filterValue) => {
      const value = String(row.getValue(columnId) || "").toLowerCase();
      return value.includes(filterValue.toLowerCase());
    },
  });

  return (
    <div className="space-y-4">
      <Card className="shadow-md border-t-4 border-t-blue-500">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-2xl font-bold">Menu des Plats</CardTitle>
            <CardDescription>
              Gérez les plats disponibles dans votre restaurant
            </CardDescription>
          </div>
          <AddFoodDialog />
        </CardHeader>
        <CardContent>
          <div className="flex items-center py-4">
            <div className="relative flex-1 mr-4">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher un plat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchQuery("")}
                disabled={!searchQuery}
                className="text-sm">
                Effacer
              </Button>
            </div>
          </div>

          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className="font-semibold text-gray-700">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className="hover:bg-blue-50 transition-colors">
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className="py-3">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-36 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <AlertCircle className="h-12 w-12 mb-3 text-amber-500" />
                        <p className="text-lg mb-1 font-medium">
                          Aucun plat trouvé
                        </p>
                        <p className="text-sm text-gray-400 mb-4">
                          {searchQuery
                            ? "Essayez de modifier votre recherche"
                            : "Ajoutez des plats pour commencer"}
                        </p>
                        {searchQuery ? (
                          <Button
                            onClick={() => setSearchQuery("")}
                            variant="outline"
                            size="sm"
                            className="text-sm">
                            Effacer la recherche
                          </Button>
                        ) : (
                          <Button
                            onClick={() => router.push("/foods/add-new")}
                            className="bg-blue-600 hover:bg-blue-700 text-sm">
                            <Plus className="h-4 w-4 mr-1" />
                            Ajouter un plat
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between border-t bg-gray-50 py-3">
          <div className="text-sm text-gray-500">
            Affichage{" "}
            <strong>
              {table.getFilteredRowModel().rows.length
                ? `${
                    table.getState().pagination.pageIndex *
                      table.getState().pagination.pageSize +
                    1
                  } -
                ${Math.min(
                  (table.getState().pagination.pageIndex + 1) *
                    table.getState().pagination.pageSize,
                  table.getFilteredRowModel().rows.length,
                )}`
                : "0"}
            </strong>{" "}
            sur <strong>{table.getFilteredRowModel().rows.length}</strong> plats
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage() || isLoading}
              className="h-8 w-8 p-0">
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage() || isLoading}
              className="h-8 w-8 p-0">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-gray-600 mx-2">
              Page{" "}
              <strong>
                {table.getPageCount()
                  ? `${
                      table.getState().pagination.pageIndex + 1
                    } sur ${table.getPageCount()}`
                  : "0 sur 0"}
              </strong>
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage() || isLoading}
              className="h-8 w-8 p-0">
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage() || isLoading}
              className="h-8 w-8 p-0">
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Edit Food Dialog */}
      {foodToEdit && (
        <EditFoodDialog
          food={foodToEdit}
          open={!!foodToEdit}
          onClose={() => setFoodToEdit(null)}
          // onSuccess={handleSuccessfulEdit}
        />
      )}

      {/* Delete Food Dialog */}
      {foodToDelete && (
        <DeleteFoodDialog
          food={foodToDelete}
          open={!!foodToDelete}
          onClose={() => setFoodToDelete(null)}
          onConfirm={() => handleConfirmDelete(foodToDelete.id)}
          // isLoading={isLoading}
        />
      )}
    </div>
  );
}
