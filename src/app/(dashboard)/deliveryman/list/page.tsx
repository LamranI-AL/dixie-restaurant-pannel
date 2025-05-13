/** @format */

import { getAllActiveDeliverymen } from "@/actions/deliveryman";
import { ActiveDeliverymenTable } from "@/components/dashboard/deliveryman/DeliverymenList";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Deliveryman } from "@/lib/types";
import { Users, TrendingUp, AlertTriangle } from "lucide-react";
import React from "react";

// Fonction utilitaire pour garantir que les données sont sérialisables
function ensureSerializedData(data: any) {
  if (!data) return [];

  // Filtrer les valeurs null ou undefined
  return data.filter((item: any) => item !== null && item !== undefined);
}

async function ActiveDeliverymenPage() {
  const result = await getAllActiveDeliverymen();
  const deliverymen = result.success
    ? ensureSerializedData(result.deliverymen)
    : [];

  // Éviter le console.log qui peut causer des problèmes d'affichage
  // console.log(result.deliverymen);

  // Calcul des statistiques avec vérification de sécurité
  const totalDeliverymen = deliverymen?.length || 0;
  const activeDeliverymen =
    deliverymen?.filter((d: any) => d?.status === "active").length || 0;
  const suspendedDeliverymen =
    deliverymen?.filter((d: any) => d?.status === "suspended").length || 0;
  const inactiveDeliverymen =
    deliverymen?.filter((d: any) => d?.status === "inactive").length || 0;

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Gestion des livreurs</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <Users className="h-6 w-6 text-blue-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">
                Total livreurs
              </p>
              <p className="text-2xl font-bold">{totalDeliverymen}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="bg-green-100 p-3 rounded-full mr-4">
              <TrendingUp className="h-6 w-6 text-green-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">
                Livreurs actifs
              </p>
              <p className="text-2xl font-bold">{activeDeliverymen}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="bg-yellow-100 p-3 rounded-full mr-4">
              <AlertTriangle className="h-6 w-6 text-yellow-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">
                Livreurs inactifs
              </p>
              <p className="text-2xl font-bold">{inactiveDeliverymen}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="bg-red-100 p-3 rounded-full mr-4">
              <AlertTriangle className="h-6 w-6 text-red-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">
                Livreurs suspendus
              </p>
              <p className="text-2xl font-bold">{suspendedDeliverymen}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs
        defaultValue="tous"
        className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="tous">Tous les livreurs</TabsTrigger>
          <TabsTrigger value="actifs">Actifs</TabsTrigger>
          <TabsTrigger value="inactifs">Inactifs</TabsTrigger>
          <TabsTrigger value="suspendus">Suspendus</TabsTrigger>
        </TabsList>

        <TabsContent value="tous">
          <Card>
            <CardHeader>
              <CardTitle>Liste des livreurs</CardTitle>
              <CardDescription>
                Gérez tous les livreurs approuvés sur la plateforme. Vous pouvez
                voir les détails de chaque livreur, les suspendre ou les
                réactiver si nécessaire.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ActiveDeliverymenTable data={deliverymen} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actifs">
          <Card>
            <CardHeader>
              <CardTitle>Livreurs actifs</CardTitle>
              <CardDescription>
                Liste des livreurs actifs qui peuvent effectuer des livraisons.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ActiveDeliverymenTable
                data={
                  deliverymen?.filter((d: any) => d?.status === "active") || []
                }
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inactifs">
          <Card>
            <CardHeader>
              <CardTitle>Livreurs inactifs</CardTitle>
              <CardDescription>
                Liste des livreurs inactifs qui ne sont pas en service
                actuellement.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ActiveDeliverymenTable
                data={
                  deliverymen?.filter((d: any) => d?.status === "inactive") ||
                  []
                }
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suspendus">
          <Card>
            <CardHeader>
              <CardTitle>Livreurs suspendus</CardTitle>
              <CardDescription>
                Liste des livreurs suspendus qui ne peuvent pas accéder à la
                plateforme.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ActiveDeliverymenTable
                data={
                  deliverymen?.filter((d: any) => d?.status === "suspended") ||
                  []
                }
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ActiveDeliverymenPage;
