/** @format */

"use client"; // This makes it a client-side component

import { getPendingDeliverymen } from "@/actions/deliveryman";
// Assuming PendingDeliverymenTable is a client component or compatible
import { PendingDeliverymenTable } from "@/components/dashboard/deliveryman/approved-list-deliverymen";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Deliveryman } from "@/lib/types"; // Assuming Deliveryman type is defined here
import { UsersRound, AlertTriangle, Loader2 } from "lucide-react"; // Added Loader2 for spinner
import React, { useEffect, useState } from "react"; // Import hooks
import { toast } from "sonner"; // Import toast
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Assuming Alert component exists

// You might want skeleton components for loading states
// import { CardSkeleton, TableSkeleton } from "@/components/ui/skeletons"; // Example skeleton components

function PendingDeliverymenPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingDeliverymen, setPendingDeliverymen] = useState<
    Deliveryman[] | null
  >(null); // Initialize as null

  const fetchPendingDeliverymen = async () => {
    setLoading(true);
    setError(null); // Clear previous errors
    try {
      const result = await getPendingDeliverymen();

      if (result.success) {
        // Ensure the response structure matches Deliveryman[]
        setPendingDeliverymen(result.deliverymen as Deliveryman[]);
        // Optionally show a success toast if data is loaded after an error or interaction
        // toast.success("Candidatures chargées avec succès.");
      } else {
        // Handle API-specific errors
        const errorMessage =
          result.error ||
          "Erreur inconnue lors de la récupération des candidatures.";
        setError(errorMessage);
        toast.error(`Erreur: ${errorMessage}`); // Show toast for API error
      }
    } catch (err: any) {
      // Handle network errors or unexpected exceptions
      const errorMessage = "Erreur lors du chargement des candidatures.";
      setError(errorMessage);
      toast.error(`Erreur: ${errorMessage}`); // Show toast for catch error
      console.error("Failed to fetch pending deliverymen:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingDeliverymen();
  }, []); // Fetch data only on mount

  // Calculate count safely
  const pendingCount = pendingDeliverymen?.length || 0;

  // --- Conditional Rendering for Loading and Error States ---

  // Show a full-page spinner on initial load if no data is present yet
  if (loading && pendingDeliverymen === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)]">
        {" "}
        {/* Adjust height as needed */}
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />{" "}
        {/* Use Loader2 for spinner */}
        <p className="mt-4 text-lg text-gray-600">
          Chargement des candidatures...
        </p>
        {/* Alternatively, use skeletons here */}
        {/* <div className="container mx-auto py-6"><CardSkeleton count={1} /><TableSkeleton /></div> */}
      </div>
    );
  }

  // Show a persistent error message if fetching failed and no data is available
  if (error && pendingDeliverymen === null) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive">
          {" "}
          {/* Use a destructive variant */}
          <AlertTriangle className="h-5 w-5" /> {/* Use icon */}
          <AlertTitle>Erreur de chargement</AlertTitle>
          <AlertDescription>
            {error} Impossible de charger les données des candidatures en
            attente. Veuillez réessayer.
            <button
              onClick={fetchPendingDeliverymen}
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

  // --- Main Render when data is available (or empty array) ---
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Approbation des livreurs</h1>
        {/* Display the count bubble */}
        <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
          <UsersRound className="w-4 h-4 mr-2" />
          {pendingCount} candidature(s) en attente
          {/* Optional: Add a small loading spinner next to the count when refreshing */}
          {loading && pendingDeliverymen !== null && (
            <Loader2 className="ml-2 h-4 w-4 animate-spin" />
          )}
        </div>
        {/* Optional: Add a refresh button */}
        <button
          onClick={fetchPendingDeliverymen}
          disabled={loading}
          className={`flex items-center px-4 py-2 border rounded-md text-sm font-medium ${loading ? "opacity-50 cursor-not-allowed" : ""}`}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Rafraîchir
        </button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Candidatures en attente</CardTitle>
          <CardDescription>
            Consultez et gérez les candidatures des livreurs qui souhaitent
            rejoindre la plateforme.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Check if data exists and is not empty before rendering the table */}
          {pendingDeliverymen && pendingDeliverymen.length > 0 ? (
            <PendingDeliverymenTable data={pendingDeliverymen} />
          ) : (
            // Show message if data is loaded but the array is empty
            // Note: The full-page "no data" handles the case where pendingDeliverymen is [] initially.
            // This specific message is more for clarity within the CardContent.
            // It might be slightly redundant with the full-page check, depending on exact flow.
            // Let's refine this: The full-page empty state handles the initial load.
            // If data exists (not null) but the count is 0, the header count will show 0,
            // and the CardContent should show the no data message.
            !loading && (
              <p className="text-center text-gray-500">
                Aucune candidature en attente trouvée.
              </p>
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default PendingDeliverymenPage;
