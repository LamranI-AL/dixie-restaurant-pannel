/** @format */

"use client"; // This directive makes it a client-side component

import { getAllFoods } from "@/actions/food";
import { FoodTable } from "@/components/food/FoodTable"; // Assuming FoodTable is client-compatible
import { Food } from "@/lib/types"; // Assuming Food type is defined here
import React, { useEffect, useState } from "react"; // Import hooks
import { toast } from "sonner"; // Import toast
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Assuming Alert component exists
import { AlertTriangle, Loader2 } from "lucide-react"; // Import spinner icon

// You might want skeleton components for loading states
// import { CardSkeleton, TableSkeleton } from "@/components/ui/skeletons"; // Example skeleton components

function FoodListPage() {
  // Renamed for clarity as it's now a client component function
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [foods, setFoods] = useState<Food[] | null>(null); // Initialize as null

  const fetchFoods = async () => {
    setLoading(true);
    setError(null); // Clear previous errors
    try {
      const foodsResponse = await getAllFoods();

      if (foodsResponse.success) {
        // Apply the original null filtering logic
        const processedFoods = (foodsResponse.foods || []).filter(
          (food) => food !== null,
        ) as Food[];
        setFoods(processedFoods);
        // Optionally show a success toast if data is loaded after an error or interaction
        // toast.success("Liste des aliments chargée.");
      } else {
        // Handle API-specific errors
        const errorMessage =
          foodsResponse.error ||
          "Erreur inconnue lors de la récupération des aliments.";
        setError(errorMessage);
        toast.error(`Erreur: ${errorMessage}`); // Show toast for API error
      }
    } catch (err: any) {
      // Handle network errors or unexpected exceptions
      const errorMessage =
        "Erreur lors du chargement des données des aliments.";
      setError(errorMessage);
      toast.error(`Erreur: ${errorMessage}`); // Show toast for catch error
      console.error("Erreur lors du chargement des aliments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoods();
  }, []); // Fetch data only on mount

  // --- Conditional Rendering for Loading and Error States ---

  // Show a full-page spinner on initial load if no data is present yet
  if (loading && foods === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)]">
        {" "}
        {/* Adjust height */}
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />{" "}
        {/* Spinner */}
        <p className="mt-4 text-lg text-gray-600">Chargement des aliments...</p>
        {/* Alternatively, use skeletons here */}
        {/* <div className="container mx-auto py-6"><CardSkeleton count={1} /><TableSkeleton /></div> */}
      </div>
    );
  }

  // Show a persistent error message if fetching failed and no data is available
  if (error && foods === null) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive">
          {" "}
          {/* Use a destructive variant */}
          <AlertTriangle className="h-5 w-5" /> {/* Use icon */}
          <AlertTitle>Erreur de chargement</AlertTitle>
          <AlertDescription>
            {error} Impossible de charger la liste des aliments. Veuillez
            réessayer.
            <button
              onClick={fetchFoods}
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
  if (!loading && foods?.length === 0 && !error) {
    return (
      <div className="container mx-auto py-6 text-center">
        <h1 className="text-2xl font-bold mb-6">Liste des aliments</h1>
        <p className="text-gray-500 text-lg">
          Aucun aliment trouvé pour le moment.
        </p>
        {/* Optional: Add a refresh button even when empty */}
        <button
          onClick={fetchFoods}
          disabled={loading}
          className={`mt-4 flex items-center justify-center mx-auto px-4 py-2 border rounded-md text-sm font-medium ${loading ? "opacity-50 cursor-not-allowed" : ""}`}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Rafraîchir
        </button>
      </div>
    );
  }

  // --- Main Render when data is available (and not empty) ---
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Liste des aliments</h1>
        {/* Optional: Add a refresh button */}
        <button
          onClick={fetchFoods}
          disabled={loading}
          className={`flex items-center px-4 py-2 border rounded-md text-sm font-medium ${loading ? "opacity-50 cursor-not-allowed" : ""}`}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Rafraîchir
        </button>
      </div>

      {/* Render the table if foods is not null and has items */}
      {foods && foods.length > 0 ? (
        <FoodTable foods={foods} />
      ) : (
        // This case should ideally not be reached often if the initial "no data" state is handled,
        // but defensive rendering is fine. It covers the edge case where foods becomes empty *after* initial load.
        !loading && (
          <p className="text-center text-gray-500">Aucun aliment trouvé.</p>
        )
      )}
    </div>
  );
}

// Export the client component function
export default FoodListPage;
