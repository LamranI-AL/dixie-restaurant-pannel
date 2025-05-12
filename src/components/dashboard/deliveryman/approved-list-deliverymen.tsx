/** @format */

"use client";

import React, { useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
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
import { Check, Eye, FileText, X } from "lucide-react";
import { approveDeliveryman, rejectDeliveryman } from "@/actions/deliveryman";
import { useToast } from "@/lib/hooks/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { formatDate } from "@/utils/format-date";

interface PendingDeliverymenTableProps {
  data: Deliveryman[];
}

export const PendingDeliverymenTable: React.FC<
  PendingDeliverymenTableProps
> = ({ data }) => {
  const { toast } = useToast();
  const [pendingDeliverymen, setPendingDeliverymen] =
    useState<Deliveryman[]>(data);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [selectedDeliveryman, setSelectedDeliveryman] =
    useState<Deliveryman | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  const handleApprove = async () => {
    if (!selectedDeliveryman?.id) return;

    setIsLoading(true);
    try {
      const result = await approveDeliveryman(selectedDeliveryman.id);
      if (result.success) {
        setPendingDeliverymen(
          pendingDeliverymen.filter((d) => d.id !== selectedDeliveryman.id),
        );
        toast({
          title: "Livreur approuvé",
          description: `${selectedDeliveryman.firstName} ${selectedDeliveryman.lastName} a été approuvé avec succès.`,
          variant: "default",
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description:
          "Une erreur s'est produite lors de l'approbation du livreur.",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsLoading(false);
      setIsApproveDialogOpen(false);
      setSelectedDeliveryman(null);
    }
  };

  const handleReject = async () => {
    if (!selectedDeliveryman?.id) return;

    setIsLoading(true);
    try {
      const result = await rejectDeliveryman(selectedDeliveryman.id);
      if (result.success) {
        setPendingDeliverymen(
          pendingDeliverymen.filter((d) => d.id !== selectedDeliveryman.id),
        );
        toast({
          title: "Livreur refusé",
          description: `${selectedDeliveryman.firstName} ${selectedDeliveryman.lastName} a été refusé.`,
          variant: "default",
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors du refus du livreur.",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsLoading(false);
      setIsRejectDialogOpen(false);
      setSelectedDeliveryman(null);
    }
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
      header: "Prénom",
    },
    {
      accessorKey: "lastName",
      header: "Nom",
    },
    {
      accessorKey: "phone",
      header: "Téléphone",
    },
    {
      accessorKey: "vehicle",
      header: "Véhicule",
    },
    {
      accessorKey: "zone",
      header: "Zone",
    },
    {
      accessorKey: "createdAt",
      header: "Ajouté le",
      cell: ({ row }) => {
        const deliveryman = row.original;
        return formatDate(new Date(deliveryman.createdAt as any));
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const deliveryman = row.original;
        return (
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center text-blue-600 border-blue-600 hover:bg-blue-50"
              onClick={() => {
                setSelectedDeliveryman(deliveryman);
                setIsDetailsDialogOpen(true);
              }}>
              <Eye className="w-4 h-4 mr-1" />
              Détails
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center text-green-600 border-green-600 hover:bg-green-50"
              onClick={() => {
                setSelectedDeliveryman(deliveryman);
                setIsApproveDialogOpen(true);
              }}>
              <Check className="w-4 h-4 mr-1" />
              Accepter
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center text-red-600 border-red-600 hover:bg-red-50"
              onClick={() => {
                setSelectedDeliveryman(deliveryman);
                setIsRejectDialogOpen(true);
              }}>
              <X className="w-4 h-4 mr-1" />
              Refuser
            </Button>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: pendingDeliverymen,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
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
                <TableRow key={row.id}>
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
                  className="text-center">
                  Aucun livreur en attente d'approbation.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Boîte de dialogue de détails */}
      <Dialog
        open={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Détails du candidat livreur</DialogTitle>
            <DialogDescription>
              Consultez les informations détaillées de ce candidat livreur avant
              de prendre une décision.
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
                    <p className="text-sm text-gray-500">
                      Candidature du{" "}
                      {formatDate(
                        new Date(selectedDeliveryman.createdAt as any),
                      )}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Informations personnelles</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-gray-500">Email:</div>
                    <div>{selectedDeliveryman.email}</div>
                    <div className="text-gray-500">Téléphone:</div>
                    <div>{selectedDeliveryman.phone}</div>
                    <div className="text-gray-500">Âge:</div>
                    <div>{selectedDeliveryman.age} ans</div>
                    <div className="text-gray-500">Date de naissance:</div>
                    <div>
                      {formatDate(
                        new Date(selectedDeliveryman.birthdate as any),
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Informations livreur</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-gray-500">Zone:</div>
                    <div>{selectedDeliveryman.zone}</div>
                    <div className="text-gray-500">Véhicule:</div>
                    <div>{selectedDeliveryman.vehicle}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <h4 className="font-medium">Documents d'identité</h4>
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

          <div className="flex justify-end space-x-2 mt-6">
            <Button
              variant="outline"
              onClick={() => setIsDetailsDialogOpen(false)}>
              Fermer
            </Button>
            <Button
              variant="outline"
              className="text-green-600 border-green-600 hover:bg-green-50"
              onClick={() => {
                setIsDetailsDialogOpen(false);
                setIsApproveDialogOpen(true);
              }}>
              <Check className="w-4 h-4 mr-2" />
              Accepter
            </Button>
            <Button
              variant="outline"
              className="text-red-600 border-red-600 hover:bg-red-50"
              onClick={() => {
                setIsDetailsDialogOpen(false);
                setIsRejectDialogOpen(true);
              }}>
              <X className="w-4 h-4 mr-2" />
              Refuser
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Boîte de dialogue d'approbation */}
      <AlertDialog
        open={isApproveDialogOpen}
        onOpenChange={setIsApproveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approuver ce livreur ?</AlertDialogTitle>
            <AlertDialogDescription>
              Vous êtes sur le point d'approuver{" "}
              {selectedDeliveryman?.firstName} {selectedDeliveryman?.lastName}.
              Une fois approuvé, ce livreur pourra accéder à la plateforme et
              commencer à livrer des commandes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApprove}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700">
              {isLoading ? "Chargement..." : "Approuver"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Boîte de dialogue de refus */}
      <AlertDialog
        open={isRejectDialogOpen}
        onOpenChange={setIsRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Refuser ce livreur ?</AlertDialogTitle>
            <AlertDialogDescription>
              Vous êtes sur le point de refuser {selectedDeliveryman?.firstName}{" "}
              {selectedDeliveryman?.lastName}. Cette action est définitive et le
              candidat livreur sera supprimé du système.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700">
              {isLoading ? "Chargement..." : "Refuser"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
