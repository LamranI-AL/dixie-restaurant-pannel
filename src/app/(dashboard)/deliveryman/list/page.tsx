/** @format */

"use client";

import { getAllDeliverymen } from "@/actions/deliveryman";
import { ActiveDeliverymenTable } from "@/components/dashboard/deliveryman/DeliverymenList"; // Assuming this component handles displaying the table
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Deliveryman } from "@/lib/types"; // Assuming Deliveryman type is defined here
import { Users, TrendingUp, AlertTriangle, Loader2 } from "lucide-react"; // Added Loader2 for spinner
import React, { useEffect, useState } from "react";
import { toast } from "sonner"; // Import toast for notifications
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Assuming you have an Alert component (e.g., from shadcn/ui)

// You might want a skeleton component for better loading feel
// import { CardSkeleton, TableSkeleton } from "@/components/ui/skeletons"; // Example skeleton components

function ActiveDeliverymenPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deliverymen, setDeliverymen] = useState<Deliveryman[] | null>(null); // Initialize as null to distinguish between no data and loading

  const fetchDeliverymen = async () => {
    setLoading(true);
    setError(null); // Clear previous errors before fetching
    try {
      const response = await getAllDeliverymen();

      if (response.success) {
        // Ensure the response structure matches Deliveryman[]
        setDeliverymen(response.deliverymen as Deliveryman[]);
        // Optionally show a success toast if data is loaded after an error or interaction
        // toast.success("Données des livreurs chargées avec succès.");
      } else {
        // Handle API-specific errors
        const errorMessage =
          response.error ||
          "Erreur inconnue lors de la récupération des livreurs.";
        setError(errorMessage);
        toast.error(`Erreur: ${errorMessage}`); // Show toast for API error
      }
    } catch (err: any) {
      // Handle network errors or unexpected exceptions
      const errorMessage =
        "Erreur lors du chargement des données des livreurs.";
      setError(errorMessage);
      toast.error(`Erreur: ${errorMessage}`); // Show toast for catch error
      console.error("Failed to fetch delivery items:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliverymen();
  }, []); // Fetch data only on mount

  // Calculate statistics safely
  const totalDeliverymen = deliverymen?.length || 0;
  const activeDeliverymen =
    deliverymen?.filter((d) => d?.status === "active").length || 0;
  const suspendedDeliverymen =
    deliverymen?.filter((d) => d?.status === "suspended").length || 0;
  const inactiveDeliverymen =
    deliverymen?.filter((d) => d?.status === "inactive").length || 0;

  // --- Conditional Rendering for Loading and Error States ---

  // Show a full-page spinner on initial load if no data is present yet
  if (loading && deliverymen === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)]">
        {" "}
        {/* Adjust height as needed */}
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />{" "}
        {/* Use Loader2 for spinner */}
        <p className="mt-4 text-lg text-gray-600">Chargement des livreurs...</p>
        {/* Alternatively, use skeletons here for a better visual */}
        {/* <div className="container mx-auto py-6"><CardSkeleton count={4} /><TableSkeleton /></div> */}
      </div>
    );
  }

  // Show a persistent error message if fetching failed and no data is available
  if (error && deliverymen === null) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive">
          {" "}
          {/* Use a destructive variant for errors */}
          <AlertTriangle className="h-5 w-5" /> {/* Use AlertTriangle icon */}
          <AlertTitle>Erreur de chargement</AlertTitle>
          <AlertDescription>
            {error} Impossible de charger les données des livreurs. Veuillez
            réessayer.
            <button
              onClick={fetchDeliverymen}
              className="ml-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              disabled={loading} // Disable retry button while loading
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin inline-block mr-1" />
              ) : null}{" "}
              {/* Spinner on button */}
              Réessayer
            </button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // If data is loaded but the array is empty
  if (!loading && deliverymen?.length === 0 && !error) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Gestion des livreurs</h1>
        </div>
        {/* Display the stats cards even if empty */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Card for Total */}
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
          {/* ... other stat cards ... */}
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
        <p className="text-center text-gray-500 text-lg mt-8">
          Aucun livreur trouvé pour le moment.
        </p>
      </div>
    );
  }

  // --- Main Render when data is available ---
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Gestion des livreurs</h1>
        {/* Optional: Add a refresh button */}
        <button
          onClick={fetchDeliverymen}
          disabled={loading}
          className={`flex items-center px-4 py-2 border rounded-md text-sm font-medium ${loading ? "opacity-50 cursor-not-allowed" : ""}`}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Rafraîchir
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Card for Total */}
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

        {/* Card for Active */}
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

        {/* Card for Inactive */}
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

        {/* Card for Suspended */}
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

      {/* Tabs for filtering */}
      <Tabs
        defaultValue="tous"
        className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="tous">Tous les livreurs</TabsTrigger>
          <TabsTrigger value="actifs">Actifs</TabsTrigger>
          <TabsTrigger value="inactifs">Inactifs</TabsTrigger>
          <TabsTrigger value="suspendus">Suspendus</TabsTrigger>
        </TabsList>

        {/* Tab Content for All Deliverymen */}
        <TabsContent value="tous">
          <Card>
            <CardHeader>
              <CardTitle>Liste de tous les livreurs</CardTitle>
              <CardDescription>
                Gérez tous les livreurs approuvés sur la plateforme.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Show table if data exists, otherwise show "No data" message */}
              {deliverymen && deliverymen.length > 0 ? (
                <ActiveDeliverymenTable data={deliverymen} />
              ) : (
                // This case is technically covered by the "no data" full page return,
                // but good defensive coding to have it here too if the list becomes empty after filtering,
                // although this specific tab is for "all".
                <p className="text-center text-gray-500">
                  Aucun livreur trouvé.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Content for Active Deliverymen */}
        <TabsContent value="actifs">
          <Card>
            <CardHeader>
              <CardTitle>Livreurs actifs</CardTitle>
              <CardDescription>
                Liste des livreurs actifs qui peuvent effectuer des livraisons.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filter and show table */}
              {deliverymen && activeDeliverymen > 0 ? (
                <ActiveDeliverymenTable
                  data={deliverymen.filter((d) => d?.status === "active")}
                />
              ) : (
                <p className="text-center text-gray-500">
                  Aucun livreur actif trouvé.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Content for Inactive Deliverymen */}
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
              {/* Filter and show table */}
              {deliverymen && inactiveDeliverymen > 0 ? (
                <ActiveDeliverymenTable
                  data={deliverymen.filter((d) => d?.status === "inactive")}
                />
              ) : (
                <p className="text-center text-gray-500">
                  Aucun livreur inactif trouvé.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Content for Suspended Deliverymen */}
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
              {/* Filter and show table */}
              {deliverymen && suspendedDeliverymen > 0 ? (
                <ActiveDeliverymenTable
                  data={deliverymen.filter((d) => d?.status === "suspended")}
                />
              ) : (
                <p className="text-center text-gray-500">
                  Aucun livreur suspendu trouvé.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ActiveDeliverymenPage;
