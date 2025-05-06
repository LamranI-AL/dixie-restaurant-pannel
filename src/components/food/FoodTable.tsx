/** @format */
"use client";

import { useState, useMemo } from "react";
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
} from "lucide-react";
import Image from "next/image";
import { Switch } from "@/components/ui/switch";
import { EditFoodDialog } from "./EditFoodDialog";
import { DeleteFoodDialog } from "./DeleteFoodDialog";
import { Food } from "@/lib/types";
import { updateFood } from "@/actions/food";

interface FoodTableProps {
  foods: Food[];
}

export function FoodTable({ foods }: FoodTableProps) {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [foodToEdit, setFoodToEdit] = useState<Food | null>(null);
  const [foodToDelete, setFoodToDelete] = useState<Food | null>(null);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // Handle row actions
  const handleViewDetails = (food: Food) => {
    router.push(`/foods/details/${food.id}`);
  };

  const handleEditFood = (food: Food) => {
    setFoodToEdit(food);
  };

  const handleDeleteFood = (food: Food) => {
    setFoodToDelete(food);
  };

  const handleConfirmDelete = async (id: string) => {
    try {
      // Here you would implement the actual deletion logic using your API
      console.log(`Deleting food with ID: ${id}`);
      // After successful deletion, reload the data or remove from the local state
      setFoodToDelete(null);
    } catch (error) {
      console.error("Error deleting food:", error);
    }
  };

  const handleToggleAvailability = async (food: Food, isAvailable: boolean) => {
    try {
      // Here you would implement the actual update logic using your API
      console.log(`Toggling availability for ${food.id} to ${isAvailable}`);
      await updateFood(food.id, {
        ...food,
        isAvailable: isAvailable,
      });
      // After successful update, reload the data or update the local state
    } catch (error) {
      console.error("Error updating food availability:", error);
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
              <Image
                src={food.image || "/images/placeholder.png"}
                alt={food.name}
                fill
                className="object-cover"
              />
            </div>
          );
        },
      },
      {
        accessorKey: "name",
        header: "Nom du Plat",
        cell: ({ row }) => (
          <div>
            <div className="font-medium">{row.original.name}</div>
            <div className="text-xs text-gray-500 truncate max-w-[200px]">
              {row.original.description.length > 60
                ? `${row.original.description.substring(0, 60)}...`
                : row.original.description}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "price",
        header: "Prix (MAD)",
        cell: ({ row }) => (
          <div>
            <div className="font-medium">{row.original.price.toFixed(2)} €</div>
            {row.original.discountPrice && (
              <div className="text-xs text-gray-500 line-through">
                {row.original.discountPrice.toFixed(2)} MAD
              </div>
            )}
          </div>
        ),
      },
      {
        accessorKey: "categoryId",
        header: "Catégorie",
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className="capitalize">
            {row.original.cuisineId}
          </Badge>
        ),
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
          <Switch
            checked={row.original.isAvailable}
            onCheckedChange={(checked) =>
              handleToggleAvailability(row.original, checked)
            }
            aria-label="Toggle availability"
          />
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
                className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Menu d'actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleViewDetails(row.original)}
                className="cursor-pointer">
                <Eye className="mr-2 h-4 w-4" />
                Voir les détails
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleEditFood(row.original)}
                className="cursor-pointer">
                <Pencil className="mr-2 h-4 w-4" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDeleteFood(row.original)}
                className="cursor-pointer text-red-600 hover:text-red-700 focus:text-red-700">
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [],
  );

  // Initialize the table
  const table = useReactTable({
    data: foods,
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
      const value = row.getValue(columnId) as string;
      return value?.toLowerCase().includes(filterValue.toLowerCase());
    },
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-2xl font-bold">Menu des Plats</CardTitle>
            <CardDescription>
              Gérez les plats disponibles dans votre restaurant
            </CardDescription>
          </div>
          <Button
            onClick={() => router.push("/foods/add-new")}
            className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un Plat
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-center py-4">
            <div className="relative flex-1 mr-4">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher un plat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
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
                      data-state={row.getIsSelected() && "selected"}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
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
                      className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <AlertCircle className="h-8 w-8 mb-2" />
                        <p>Aucun plat trouvé</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Affichage{" "}
            <strong>
              {table.getState().pagination.pageIndex *
                table.getState().pagination.pageSize +
                1}{" "}
              -{" "}
              {Math.min(
                (table.getState().pagination.pageIndex + 1) *
                  table.getState().pagination.pageSize,
                table.getFilteredRowModel().rows.length,
              )}
            </strong>{" "}
            sur <strong>{table.getFilteredRowModel().rows.length}</strong> plats
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-gray-600">
              Page{" "}
              <strong>
                {table.getState().pagination.pageIndex + 1} sur{" "}
                {table.getPageCount()}
              </strong>
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}>
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
        />
      )}

      {/* Delete Food Dialog */}
      {foodToDelete && (
        <DeleteFoodDialog
          food={foodToDelete}
          open={!!foodToDelete}
          onClose={() => setFoodToDelete(null)}
          onConfirm={() => handleConfirmDelete(foodToDelete.id)}
        />
      )}
    </div>
  );
}
