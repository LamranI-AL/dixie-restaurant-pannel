/** @format */

"use client";

import React, { useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  Eye,
  AlertTriangle,
  User,
  Phone,
  Mail,
  Car,
} from "lucide-react";
import { toast } from "sonner";
import { useDeliverymen } from "@/lib/hooks/useDeliverymen";
import { Deliveryman } from "@/lib/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";

export default function PendingDeliverymenPage() {
  const {
    pendingDeliverymen,
    loading,
    error,
    getPendingDeliverymen,
    approveDeliveryman,
    rejectDeliveryman,
    clearError,
  } = useDeliverymen();

  // Chargement initial des candidatures
  useEffect(() => {
    getPendingDeliverymen();
  }, [getPendingDeliverymen]);

  // Gestion des erreurs
  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  // Statistiques des candidatures
  const statistics = useMemo(
    () => ({
      total: pendingDeliverymen.length,
      recent: pendingDeliverymen.filter((d) => {
        const createdAt = new Date(d.createdAt as any);
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
        return createdAt > threeDaysAgo;
      }).length,
    }),
    [pendingDeliverymen],
  );

  // Fonction de rafraîchissement
  const handleRefresh = () => {
    getPendingDeliverymen();
  };

  // Gestion de l'approbation
  const handleApprove = async (id: string, fullName: string) => {
    const result = await approveDeliveryman(id);
    if (result.success) {
      toast.success(`✅ ${fullName} a été approuvé avec succès !`);
    } else {
      toast.error(`❌ Erreur lors de l'approbation : ${result.error}`);
    }
  };

  // Gestion du rejet
  const handleReject = async (id: string, fullName: string) => {
    const result = await rejectDeliveryman(id);
    if (result.success) {
      toast.success(`🗑️ Candidature de ${fullName} rejetée.`);
    } else {
      toast.error(`❌ Erreur lors du rejet : ${result.error}`);
    }
  };

  // Composant de détails du livreur
  const DeliverymanDetails = ({
    deliveryman,
  }: {
    deliveryman: Deliveryman;
  }) => (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={deliveryman.profileImageUrl} />
          <AvatarFallback>
            {deliveryman.firstName?.[0]}
            {deliveryman.lastName?.[0]}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="text-lg font-semibold">
            {deliveryman.firstName} {deliveryman.lastName}
          </h3>
          <p className="text-gray-600">{deliveryman.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Phone className="h-4 w-4 text-gray-500" />
            <span className="text-sm">{deliveryman.phone}</span>
          </div>
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-gray-500" />
            <span className="text-sm">Âge: {deliveryman.age}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Car className="h-4 w-4 text-gray-500" />
            <span className="text-sm">Véhicule: {deliveryman.vehicle}</span>
          </div>
        </div>
        <div className="space-y-2">
          <p>
            <strong>Zone:</strong> {deliveryman.zone}
          </p>
          <p>
            <strong>Type d'identité:</strong> {deliveryman.identityType}
          </p>
          <p>
            <strong>N° d'identité:</strong> {deliveryman.identityNumber}
          </p>
        </div>
      </div>

      {deliveryman.identityImageUrl && (
        <div>
          <h4 className="font-semibold mb-2">Document d'identité</h4>
          <div className="border rounded-md p-2">
            <Image
              src={deliveryman.identityImageUrl}
              alt="Document d'identité"
              width={300}
              height={200}
              className="rounded object-cover max-w-full h-auto"
            />
          </div>
        </div>
      )}
    </div>
  );

  // Composant de ligne de tableau
  const DeliverymanRow = ({
    deliveryman,
    index,
  }: {
    deliveryman: Deliveryman;
    index: number;
  }) => (
    <TableRow key={deliveryman.id}>
      <TableCell>{index + 1}</TableCell>
      <TableCell>
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarImage src={deliveryman.profileImageUrl} />
            <AvatarFallback>
              {deliveryman.firstName?.[0]}
              {deliveryman.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">
              {deliveryman.firstName} {deliveryman.lastName}
            </p>
            <p className="text-sm text-gray-500">{deliveryman.email}</p>
          </div>
        </div>
      </TableCell>
      <TableCell>{deliveryman.phone}</TableCell>
      <TableCell>
        <Badge
          variant="outline"
          className="capitalize">
          {deliveryman.vehicle}
        </Badge>
      </TableCell>
      <TableCell>{deliveryman.zone}</TableCell>
      <TableCell>
        <Badge
          variant="secondary"
          className="bg-yellow-100 text-yellow-800">
          <Clock className="h-3 w-3 mr-1" />
          En attente
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center space-x-2">
          {/* Bouton Voir Détails */}
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm">
                <Eye className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Détails de la candidature</DialogTitle>
              </DialogHeader>
              <DeliverymanDetails deliveryman={deliveryman} />
            </DialogContent>
          </Dialog>

          {/* Bouton Approuver */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="default"
                size="sm"
                className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmer l'approbation</AlertDialogTitle>
                <AlertDialogDescription>
                  Êtes-vous sûr de vouloir approuver la candidature de{" "}
                  <strong>
                    {deliveryman.firstName} {deliveryman.lastName}
                  </strong>{" "}
                  ? Cette action ne peut pas être annulée.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() =>
                    handleApprove(
                      deliveryman.id as any,
                      `${deliveryman.firstName} ${deliveryman.lastName}`,
                    )
                  }
                  className="bg-green-600 hover:bg-green-700">
                  Approuver
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Bouton Rejeter */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="sm">
                <XCircle className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmer le rejet</AlertDialogTitle>
                <AlertDialogDescription>
                  Êtes-vous sûr de vouloir rejeter la candidature de{" "}
                  <strong>
                    {deliveryman.firstName} {deliveryman.lastName}
                  </strong>{" "}
                  ? Cette action supprimera définitivement la candidature.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() =>
                    handleReject(
                      deliveryman.id as any,
                      `${deliveryman.firstName} ${deliveryman.lastName}`,
                    )
                  }
                  className="bg-red-600 hover:bg-red-700">
                  Rejeter
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </TableCell>
    </TableRow>
  );

  // Affichage du spinner de chargement initial
  if (loading && pendingDeliverymen.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)]">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
        <p className="mt-4 text-lg text-gray-600">
          Chargement des candidatures...
        </p>
      </div>
    );
  }

  // Affichage d'erreur persistante
  if (error && pendingDeliverymen.length === 0) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle>Erreur de chargement</AlertTitle>
          <AlertDescription>
            {error} Impossible de charger les candidatures des livreurs.
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
    <div className="container mx-auto py-6">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Candidatures des Livreurs</h1>
          <p className="text-gray-600">
            Gérez les demandes d'inscription des nouveaux livreurs
          </p>
        </div>
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
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="bg-yellow-100 p-3 rounded-full mr-4">
              <Clock className="h-6 w-6 text-yellow-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">
                Candidatures en attente
              </p>
              <p className="text-2xl font-bold">{statistics.total}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <User className="h-6 w-6 text-blue-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">
                Candidatures récentes (3 jours)
              </p>
              <p className="text-2xl font-bold">{statistics.recent}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="bg-green-100 p-3 rounded-full mr-4">
              <CheckCircle className="h-6 w-6 text-green-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">
                Actions requises
              </p>
              <p className="text-2xl font-bold">{statistics.total}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tableau des candidatures */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Candidatures en Attente d'Approbation
          </CardTitle>
          <CardDescription>
            Examinez et approuvez ou rejetez les candidatures des nouveaux
            livreurs
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingDeliverymen.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucune candidature en attente
              </h3>
              <p className="text-gray-500">
                Toutes les candidatures ont été traitées ou aucune nouvelle
                candidature n'a été soumise.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Candidat</TableHead>
                    <TableHead>Téléphone</TableHead>
                    <TableHead>Véhicule</TableHead>
                    <TableHead>Zone</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingDeliverymen.map((deliveryman, index) => (
                    <DeliverymanRow
                      key={deliveryman.id}
                      deliveryman={deliveryman}
                      index={index}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions d'aide */}
      {pendingDeliverymen.length > 0 && (
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <AlertTriangle className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">
                  Instructions pour l'évaluation des candidatures
                </h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>
                    • Cliquez sur l'icône œil pour voir tous les détails de la
                    candidature
                  </li>
                  <li>
                    • Vérifiez que toutes les informations sont complètes et
                    correctes
                  </li>
                  <li>• Examinez le document d'identité fourni</li>
                  <li>
                    • Approuvez seulement les candidatures avec des informations
                    valides
                  </li>
                  <li>
                    • Les candidatures approuvées seront automatiquement
                    ajoutées à la liste des livreurs actifs
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
