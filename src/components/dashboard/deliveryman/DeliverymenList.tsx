/** @format */

"use client";

import React, { useState, useEffect } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
  ColumnFiltersState,
  getPaginationRowModel,
} from "@tanstack/react-table";
import { Deliveryman } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowUpDown,
  MoreVertical,
  Eye,
  FileText,
  User,
  Truck,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Clock,
  Search,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowDownAZ,
  ArrowUpAZ,
  Download,
} from "lucide-react";
// import { useToast } from "@/components/ui/use-toast";
import {
  suspendDeliveryman,
  reactivateDeliveryman,
} from "@/actions/deliveryman";
import { useToast } from "@/lib/hooks/hooks/use-toast";
import { formatDate } from "@/utils/format-date";

interface ActiveDeliverymenTableProps {
  data: Deliveryman[];
}

export const ActiveDeliverymenTable: React.FC<ActiveDeliverymenTableProps> = ({
  data,
}) => {
  const { toast } = useToast();
  const [deliverymen, setDeliverymen] = useState<Deliveryman[]>(data);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedDeliveryman, setSelectedDeliveryman] =
    useState<Deliveryman | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isSuspendDialogOpen, setIsSuspendDialogOpen] = useState(false);
  const [isReactivateDialogOpen, setIsReactivateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    if (statusFilter === "all") {
      setColumnFilters(
        columnFilters.filter((filter) => filter.id !== "status"),
      );
    } else {
      setColumnFilters([
        ...columnFilters.filter((filter) => filter.id !== "status"),
        { id: "status", value: statusFilter },
      ]);
    }
  }, [statusFilter]);

  // const formatDate = (date: Date | string | undefined) => {
  //   if (!date) return "N/A";
  //   const dateObj = typeof date === "string" ? new Date(date) : date;
  //   return dateObj.toLocaleDateString("fr-FR", {
  //     day: "2-digit",
  //     month: "2-digit",
  //     year: "numeric",
  //   });
  // };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-yellow-100 text-yellow-800";
      case "suspended":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusTranslation = (status: string) => {
    switch (status) {
      case "active":
        return "Actif";
      case "inactive":
        return "Inactif";
      case "suspended":
        return "Suspendu";
      default:
        return status;
    }
  };

  const handleSuspend = async () => {
    if (!selectedDeliveryman?.id) return;

    setIsLoading(true);
    try {
      const result = await suspendDeliveryman(selectedDeliveryman.id);
      if (result.success) {
        // Mettre à jour le tableau localement
        setDeliverymen(
          deliverymen.map((d) =>
            d.id === selectedDeliveryman.id ? { ...d, status: "suspended" } : d,
          ),
        );
        toast({
          title: "Livreur suspendu",
          description: `${selectedDeliveryman.firstName} ${selectedDeliveryman.lastName} a été suspendu.`,
          variant: "default",
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description:
          "Une erreur s'est produite lors de la suspension du livreur.",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsLoading(false);
      setIsSuspendDialogOpen(false);
      setSelectedDeliveryman(null);
    }
  };

  const handleReactivate = async () => {
    if (!selectedDeliveryman?.id) return;

    setIsLoading(true);
    try {
      const result = await reactivateDeliveryman(selectedDeliveryman.id);
      if (result.success) {
        // Mettre à jour le tableau localement
        setDeliverymen(
          deliverymen.map((d) =>
            d.id === selectedDeliveryman.id ? { ...d, status: "active" } : d,
          ),
        );
        toast({
          title: "Livreur réactivé",
          description: `${selectedDeliveryman.firstName} ${selectedDeliveryman.lastName} a été réactivé.`,
          variant: "default",
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description:
          "Une erreur s'est produite lors de la réactivation du livreur.",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsLoading(false);
      setIsReactivateDialogOpen(false);
      setSelectedDeliveryman(null);
    }
  };

  const exportToCSV = () => {
    // Préparer les données
    const headers = [
      "ID",
      "Prénom",
      "Nom",
      "Email",
      "Téléphone",
      "Zone",
      "Véhicule",
      "Statut",
      "Ajouté le",
    ];

    const csvData = deliverymen.map((d) => [
      d.id,
      d.firstName,
      d.lastName,
      d.email,
      d.phone,
      d.zone,
      d.vehicle,
      getStatusTranslation(d.status),
      formatDate(d.createdAt as any),
    ]);

    // Convertir en CSV
    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    // Créer un blob et télécharger
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `livreurs_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export réussi",
      description: `Liste des livreurs exportée en CSV.`,
      variant: "default",
    });
  };

  const columns: ColumnDef<Deliveryman>[] = [
    {
      header: "Image",
      cell: ({ row }) => {
        const deliveryman = row.original;
        return (
          <Avatar className="w-10 h-10">
            <AvatarImage
              src={deliveryman.profileImageUrl || ""}
              alt={deliveryman.firstName}
            />
            <AvatarFallback>{deliveryman.firstName.charAt(0)}</AvatarFallback>
          </Avatar>
        );
      },
    },
    {
      accessorKey: "firstName",
      header: ({ column }) => (
        <div
          className="flex items-center cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Prénom
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </div>
      ),
    },
    {
      accessorKey: "lastName",
      header: ({ column }) => (
        <div
          className="flex items-center cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Nom
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </div>
      ),
    },
    {
      accessorKey: "phone",
      header: "Téléphone",
    },
    {
      accessorKey: "zone",
      header: "Zone",
      cell: ({ row }) => (
        <div className="flex items-center">
          <MapPin className="mr-1 h-4 w-4 text-gray-500" />
          {row.getValue("zone")}
        </div>
      ),
    },
    {
      accessorKey: "vehicle",
      header: "Véhicule",
      cell: ({ row }) => (
        <div className="flex items-center">
          <Truck className="mr-1 h-4 w-4 text-gray-500" />
          {row.getValue("vehicle")}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Statut",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge className={getStatusColor(status)}>
            {getStatusTranslation(status)}
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        return value === row.getValue(id);
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <div
          className="flex items-center cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Ajouté le
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </div>
      ),
      cell: ({ row }) => {
        const deliveryman = row.original;
        return formatDate(deliveryman.createdAt as any);
      },
      sortingFn: (rowA, rowB, columnId) => {
        // Conversion en timestamps pour le tri
        const dateA = rowA.original.createdAt
          ? new Date(rowA.original.createdAt).getTime()
          : 0;
        const dateB = rowB.original.createdAt
          ? new Date(rowB.original.createdAt).getTime()
          : 0;
        return dateA - dateB;
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const deliveryman = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0">
                <span className="sr-only">Ouvrir menu</span>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                className="flex items-center cursor-pointer"
                onClick={() => {
                  setSelectedDeliveryman(deliveryman);
                  setIsDetailsDialogOpen(true);
                }}>
                <Eye className="mr-2 h-4 w-4" />
                Voir détails
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {deliveryman.status !== "suspended" ? (
                <DropdownMenuItem
                  className="flex items-center cursor-pointer text-red-600"
                  onClick={() => {
                    setSelectedDeliveryman(deliveryman);
                    setIsSuspendDialogOpen(true);
                  }}>
                  <XCircle className="mr-2 h-4 w-4" />
                  Suspendre
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  className="flex items-center cursor-pointer text-green-600"
                  onClick={() => {
                    setSelectedDeliveryman(deliveryman);
                    setIsReactivateDialogOpen(true);
                  }}>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Réactiver
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: deliverymen,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <>
      <div className="flex flex-col space-y-4">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Rechercher un livreur..."
                value={globalFilter ?? ""}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="active">Actifs</SelectItem>
                <SelectItem value="inactive">Inactifs</SelectItem>
                <SelectItem value="suspended">Suspendus</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Button
              variant="outline"
              className="flex items-center"
              onClick={exportToCSV}>
              <Download className="mr-2 h-4 w-4" />
              Exporter en CSV
            </Button>
          </div>
        </div>

        <div className="rounded-xl border shadow-sm overflow-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="text-left">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      setSelectedDeliveryman(row.original);
                      setIsDetailsDialogOpen(true);
                    }}>
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
                    className="text-center h-24">
                    Aucun livreur trouvé.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {table.getFilteredRowModel().rows.length} livreur(s) sur{" "}
            {deliverymen.length}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}>
              Précédent
            </Button>
            <div className="text-sm">
              Page {table.getState().pagination.pageIndex + 1} sur{" "}
              {table.getPageCount()}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}>
              Suivant
            </Button>
          </div>
        </div>
      </div>

      {/* Boîte de dialogue de détails */}
      <Dialog
        open={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Détails du livreur</DialogTitle>
            <DialogDescription>
              Informations complètes sur le livreur.
            </DialogDescription>
          </DialogHeader>

          {selectedDeliveryman && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage
                      src={selectedDeliveryman.profileImageUrl || ""}
                      alt={selectedDeliveryman.firstName}
                    />
                    <AvatarFallback>
                      {selectedDeliveryman.firstName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-medium">
                      {selectedDeliveryman.firstName}{" "}
                      {selectedDeliveryman.lastName}
                    </h3>
                    <div className="flex items-center text-sm text-gray-500">
                      <Badge
                        className={getStatusColor(selectedDeliveryman.status)}>
                        {getStatusTranslation(selectedDeliveryman.status)}
                      </Badge>
                      <span className="ml-2">
                        Depuis le{" "}
                        {formatDate(selectedDeliveryman.createdAt as any)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Informations personnelles
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-gray-500">Email:</div>
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-1 text-gray-400" />
                      {selectedDeliveryman.email}
                    </div>
                    <div className="text-gray-500">Téléphone:</div>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-1 text-gray-400" />
                      {selectedDeliveryman.phone}
                    </div>
                    <div className="text-gray-500">Âge:</div>
                    <div>{selectedDeliveryman.age} ans</div>
                    <div className="text-gray-500">Date de naissance:</div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                      {formatDate(selectedDeliveryman.birthdate as any)}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium flex items-center">
                    <Truck className="w-4 h-4 mr-2" />
                    Informations livreur
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-gray-500">Zone:</div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                      {selectedDeliveryman.zone}
                    </div>
                    <div className="text-gray-500">Véhicule:</div>
                    <div className="flex items-center">
                      <Truck className="w-4 h-4 mr-1 text-gray-400" />
                      {selectedDeliveryman.vehicle}
                    </div>
                    <div className="text-gray-500">Ajouté le:</div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1 text-gray-400" />
                      {formatDate(selectedDeliveryman.createdAt as any)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    Documents d'identité
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-gray-500">Type d'identité:</div>
                    <div>{selectedDeliveryman.identityType}</div>
                    <div className="text-gray-500">Numéro d'identité:</div>
                    <div>{selectedDeliveryman.identityNumber}</div>
                  </div>
                </div>

                {selectedDeliveryman.identityImageUrl && (
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center">
                      <FileText className="w-4 h-4 mr-1" />
                      Carte d'identité
                    </h4>
                    <div className="border rounded-md p-2">
                      <img
                        src={selectedDeliveryman.identityImageUrl}
                        alt="Carte d'identité"
                        className="w-full h-auto max-h-40 object-contain rounded"
                      />
                      <div className="mt-2">
                        <a
                          href={selectedDeliveryman.identityImageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline">
                          Voir l'image en plein écran
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {selectedDeliveryman.licenseFile && (
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center">
                      <FileText className="w-4 h-4 mr-1" />
                      Permis de conduire
                    </h4>
                    <div className="border rounded-md p-2">
                      <img
                        src={selectedDeliveryman.licenseFile}
                        alt="Permis de conduire"
                        className="w-full h-auto max-h-40 object-contain rounded"
                      />
                      <div className="mt-2">
                        <a
                          href={selectedDeliveryman.licenseFile}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline">
                          Voir l'image en plein écran
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="flex justify-between">
            <div>
              {selectedDeliveryman &&
              selectedDeliveryman.status !== "suspended" ? (
                <Button
                  variant="outline"
                  className="text-red-600 border-red-600 hover:bg-red-50"
                  onClick={() => {
                    setIsDetailsDialogOpen(false);
                    setIsSuspendDialogOpen(true);
                  }}>
                  <XCircle className="w-4 h-4 mr-2" />
                  Suspendre
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="text-green-600 border-green-600 hover:bg-green-50"
                  onClick={() => {
                    setIsDetailsDialogOpen(false);
                    setIsReactivateDialogOpen(true);
                  }}>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Réactiver
                </Button>
              )}
            </div>
            <Button
              variant="outline"
              onClick={() => setIsDetailsDialogOpen(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Boîte de dialogue de suspension */}
      <AlertDialog
        open={isSuspendDialogOpen}
        onOpenChange={setIsSuspendDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Suspendre ce livreur ?</AlertDialogTitle>
            <AlertDialogDescription>
              Vous êtes sur le point de suspendre{" "}
              {selectedDeliveryman?.firstName} {selectedDeliveryman?.lastName}.
              Une fois suspendu, ce livreur ne pourra plus accéder à la
              plateforme ni effectuer des livraisons.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSuspend}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700">
              {isLoading ? "Chargement..." : "Suspendre"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Boîte de dialogue de réactivation */}
      <AlertDialog
        open={isReactivateDialogOpen}
        onOpenChange={setIsReactivateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Réactiver ce livreur ?</AlertDialogTitle>
            <AlertDialogDescription>
              Vous êtes sur le point de réactiver{" "}
              {selectedDeliveryman?.firstName} {selectedDeliveryman?.lastName}.
              Une fois réactivé, ce livreur pourra à nouveau accéder à la
              plateforme et effectuer des livraisons.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReactivate}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700">
              {isLoading ? "Chargement..." : "Réactiver"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
