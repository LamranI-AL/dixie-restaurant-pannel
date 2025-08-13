/** @format */

"use client";

import { ActiveDeliverymenTable } from "@/components/dashboard/deliveryman/DeliverymenList";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Deliveryman } from "@/lib/types";
import {
  Users,
  TrendingUp,
  AlertTriangle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import React, { useEffect, useMemo } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useDeliverymen } from "@/lib/hooks/useDeliverymen"; // Import du hook

function ActiveDeliverymenPage() {
  const { deliverymen, loading, error, getAllDeliverymen, clearError } =
    useDeliverymen();

  // Chargement initial des livreurs
  useEffect(() => {
    getAllDeliverymen();
  }, [getAllDeliverymen]);

  // Gestion des erreurs du hook
  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  // Calcul des statistiques avec useMemo pour optimiser les performances
  const statistics = useMemo(() => {
    const total = deliverymen.length;
    const active = deliverymen.filter((d) => d?.status === "active").length;
    const suspended = deliverymen.filter(
      (d) => d?.status === "suspended",
    ).length;
    const inactive = deliverymen.filter((d) => d?.status === "inactive").length;

    return { total, active, suspended, inactive };
  }, [deliverymen]);

  // Filtrage des livreurs par statut avec useMemo
  const filteredDeliverymen = useMemo(
    () => ({
      active: deliverymen.filter((d) => d?.status === "active"),
      inactive: deliverymen.filter((d) => d?.status === "inactive"),
      suspended: deliverymen.filter((d) => d?.status === "suspended"),
    }),
    [deliverymen],
  );

  // Fonction de rafraîchissement
  const handleRefresh = () => {
    getAllDeliverymen();
  };

  // Composant de carte de statistique réutilisable
  const StatCard = ({
    title,
    value,
    icon: Icon,
    bgColor,
    iconColor,
  }: {
    title: string;
    value: number;
    icon: React.ComponentType<any>;
    bgColor: string;
    iconColor: string;
  }) => (
    <Card>
      <CardContent className="flex items-center p-6">
        <div className={`${bgColor} p-3 rounded-full mr-4`}>
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
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
    data: Deliveryman[];
    emptyMessage: string;
  }) => (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ActiveDeliverymenTable data={data} />
        ) : (
          <p className="text-center text-gray-500 py-8">{emptyMessage}</p>
        )}
      </CardContent>
    </Card>
  );

  // Affichage du spinner de chargement initial
  if (loading && deliverymen.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)]">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
        <p className="mt-4 text-lg text-gray-600">Chargement des livreurs...</p>
      </div>
    );
  }

  // Affichage d'erreur persistante
  if (error && deliverymen.length === 0) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle>Erreur de chargement</AlertTitle>
          <AlertDescription>
            {error} Impossible de charger les données des livreurs.
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
      {/* En-tête avec bouton de rafraîchissement */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Gestion des livreurs</h1>
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
          Rafraîchir
        </Button>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total livreurs"
          value={statistics.total}
          icon={Users}
          bgColor="bg-blue-100"
          iconColor="text-blue-700"
        />
        <StatCard
          title="Livreurs actifs"
          value={statistics.active}
          icon={TrendingUp}
          bgColor="bg-green-100"
          iconColor="text-green-700"
        />
        <StatCard
          title="Livreurs inactifs"
          value={statistics.inactive}
          icon={AlertTriangle}
          bgColor="bg-yellow-100"
          iconColor="text-yellow-700"
        />
        <StatCard
          title="Livreurs suspendus"
          value={statistics.suspended}
          icon={AlertTriangle}
          bgColor="bg-red-100"
          iconColor="text-red-700"
        />
      </div>

      {/* Onglets pour filtrer */}
      <Tabs
        defaultValue="tous"
        className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="tous">
            Tous les livreurs ({statistics.total})
          </TabsTrigger>
          <TabsTrigger value="actifs">Actifs ({statistics.active})</TabsTrigger>
          <TabsTrigger value="inactifs">
            Inactifs ({statistics.inactive})
          </TabsTrigger>
          <TabsTrigger value="suspendus">
            Suspendus ({statistics.suspended})
          </TabsTrigger>
        </TabsList>

        {/* Contenu des onglets */}
        <TabsContent value="tous">
          <TabContent
            title="Liste de tous les livreurs"
            description="Gérez tous les livreurs approuvés sur la plateforme."
            data={deliverymen}
            emptyMessage="Aucun livreur trouvé. Créez votre premier livreur !"
          />
        </TabsContent>

        <TabsContent value="actifs">
          <TabContent
            title="Livreurs actifs"
            description="Liste des livreurs actifs qui peuvent effectuer des livraisons."
            data={filteredDeliverymen.active}
            emptyMessage="Aucun livreur actif trouvé."
          />
        </TabsContent>

        <TabsContent value="inactifs">
          <TabContent
            title="Livreurs inactifs"
            description="Liste des livreurs inactifs qui ne sont pas en service actuellement."
            data={filteredDeliverymen.inactive}
            emptyMessage="Aucun livreur inactif trouvé."
          />
        </TabsContent>

        <TabsContent value="suspendus">
          <TabContent
            title="Livreurs suspendus"
            description="Liste des livreurs suspendus qui ne peuvent pas accéder à la plateforme."
            data={filteredDeliverymen.suspended}
            emptyMessage="Aucun livreur suspendu trouvé."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ActiveDeliverymenPage;
