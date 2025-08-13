/** @format */

"use client";
import { useEffect, useState, useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search } from "lucide-react";
import { Cuisine } from "@/lib/types";
import { useAuth } from "@/providers/auth-provider";
import Image from "next/image";
import { toast, Toaster } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { uploadImage } from "@/utils/uploadthing";
import { Upload } from "lucide-react";
import { EditCategoryForm } from "@/components/dashboard/categories/EditeCategoryForm";
import { DeleteCategoryConfirmation } from "@/components/dashboard/categories/DeleteCategorieForm";
import { useCategories } from "@/lib/hooks/useCategories"; // Import du hook

export default function CuisinesPage() {
  const [recherche, setRecherche] = useState("");
  const { currentUser } = useAuth();
  const [popoverOuvert, setPopoverOuvert] = useState(false);

  // Utilisation du hook useCategories
  const {
    categories,
    loading: chargement,
    error,
    addCategory,
    getAllCategories,
    clearError,
  } = useCategories();

  // État du formulaire de nouvelle cuisine
  const [nomCuisine, setNomCuisine] = useState("");
  const [descriptionCuisine, setDescriptionCuisine] = useState("");
  const [imageCuisine, setImageCuisine] = useState("");
  const [telechargementImage, setTelechargementImage] = useState(false);
  const [chargementFormulaire, setChargementFormulaire] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Gestionnaire d'upload d'image
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setTelechargementImage(true);
    try {
      const uploadedUrl = await uploadImage(file);
      setImageCuisine(uploadedUrl);
      toast.success("Image téléchargée avec succès !");
    } catch (error) {
      toast.error(`Erreur de téléchargement : ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setTelechargementImage(false);
    }
  };

  // Récupérer les cuisines au montage du composant
  useEffect(() => {
    getAllCategories();
  }, [getAllCategories]);

  // Gestion des erreurs du hook
  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  // Gérer l'ajout d'une nouvelle cuisine
  const handleAjouterCuisine = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nomCuisine.trim()) {
      toast.error("Le nom de la catégorie est requis");
      return;
    }

    if (!imageCuisine) {
      toast.error("Veuillez télécharger une image pour la cuisine");
      return;
    }

    setChargementFormulaire(true);

    try {
      const result = await addCategory({
        status: true,
        userId: (await currentUser?.getIdToken()) || "",
        id: "",
        name: nomCuisine,
        description: descriptionCuisine || "test",
        longDescription: "testmock",
        image: imageCuisine,
      });

      if (result.success) {
        toast.success("Cuisine ajoutée avec succès !");
        // Réinitialiser le formulaire
        setNomCuisine("");
        setDescriptionCuisine("");
        setImageCuisine("");
        // Fermer le popover
        setPopoverOuvert(false);
        // Pas besoin de recharger manuellement, le hook gère la mise à jour automatique
      } else {
        toast.error(result.error || "Échec de l'ajout de la cuisine");
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout de la catégorie :", error);
      toast.error("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setChargementFormulaire(false);
    }
  };

  // Filtrer les cuisines en fonction de la recherche
  const cuisinesFiltrees = categories.filter((cuisine) =>
    cuisine.name.toLowerCase().includes(recherche.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      {/* Notifications toast */}
      <Toaster
        position="top-right"
        richColors
        closeButton
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6">
            <rect
              width="7"
              height="7"
              x="3"
              y="3"
              rx="1"
            />
            <rect
              width="7"
              height="7"
              x="14"
              y="3"
              rx="1"
            />
            <rect
              width="7"
              height="7"
              x="14"
              y="14"
              rx="1"
            />
            <rect
              width="7"
              height="7"
              x="3"
              y="14"
              rx="1"
            />
          </svg>
          <h2 className="text-2xl font-bold">Liste des Catégories</h2>
          <div className="ml-2 flex h-7 items-center justify-center rounded-full bg-blue-100 px-3 text-xs font-medium text-blue-500">
            {cuisinesFiltrees.length}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Ex : Rechercher par nom de catégories.."
              className="w-[240px] pl-8"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
            />
          </div>

          <Button
            variant="outline"
            size="icon">
            <Search className="h-4 w-4" />
          </Button>

          {/* Popover Ajouter une Cuisine */}
          <Popover
            open={popoverOuvert}
            onOpenChange={setPopoverOuvert}>
            <PopoverTrigger asChild>
              <Button className="gap-1">
                <Plus className="h-4 w-4 mr-1" />
                Ajouter une Nouvelle Cuisine
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <form
                onSubmit={handleAjouterCuisine}
                className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium leading-none">
                    Ajouter une Nouvelle Cuisine
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Saisissez les détails de la nouvelle catégorie
                  </p>
                </div>

                {/* Téléchargement d'image */}
                <div className="space-y-2">
                  <Label htmlFor="image">Image de la catégorie</Label>
                  <div className="bg-gradient-to-b from-slate-600 to-slate-400 rounded-md p-2">
                    <Button 
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={telechargementImage}
                      className="w-full"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {telechargementImage ? "Téléchargement..." : "Choisir une image"}
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    {imageCuisine && (
                      <div className="mt-2">
                        <Image 
                          src={imageCuisine} 
                          alt="Aperçu" 
                          width={100} 
                          height={100} 
                          className="rounded-md object-cover"
                        />
                      </div>
                    )}
                  </div>

                  {/* Aperçu de l'image */}
                  {imageCuisine && (
                    <div className="mt-2 relative h-24 w-24 mx-auto">
                      <Image
                        src={imageCuisine}
                        alt="Aperçu de la cuisine"
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>
                  )}
                </div>

                {/* Nom de la Cuisine */}
                <div className="space-y-2">
                  <Label htmlFor="name">Nom de la catégorie</Label>
                  <Input
                    id="name"
                    required
                    placeholder="Saisissez le nom de la catégorie"
                    value={nomCuisine}
                    onChange={(e) => setNomCuisine(e.target.value)}
                  />
                </div>

                {/* Description de la Cuisine */}
                {/* <div className="space-y-2">
                  <Label htmlFor="description">Description (Optionnel)</Label>
                  <Textarea
                    id="description"
                    placeholder="Saisissez la description de la cuisine"
                    value={descriptionCuisine}
                    onChange={(e) => setDescriptionCuisine(e.target.value)}
                    className="resize-none"
                    rows={3}
                  />
                </div> */}

                {/* Bouton de Soumission */}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={
                    chargementFormulaire || telechargementImage || !imageCuisine
                  }>
                  {chargementFormulaire ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    "Ajouter une Cuisine"
                  )}
                </Button>
              </form>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Tableau des Cuisines */}
      <Card className="border border-gray-200">
        <CardContent className="p-0">
          {chargement ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-12 text-center">N°</TableHead>
                  <TableHead>Image</TableHead>
                  <TableHead>Nom de la Catégorie</TableHead>
                  <TableHead className="w-24 text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cuisinesFiltrees.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-8 text-gray-500">
                      Aucune cuisine trouvée. Créez votre première cuisine !
                    </TableCell>
                  </TableRow>
                ) : (
                  cuisinesFiltrees.map((cuisine, index) => (
                    <TableRow key={cuisine.id || index}>
                      <TableCell className="text-center">{index + 1}</TableCell>
                      <TableCell>
                        <div className="h-12 w-12 rounded-md overflow-hidden">
                          <Image
                            width={300}
                            height={300}
                            src={
                              (cuisine.image as string) ||
                              "https://img.icons8.com/color/96/000000/curry.png"
                            }
                            alt={cuisine.name}
                            className="h-full w-full object-cover"
                            unoptimized
                          />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {cuisine.name}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-1">
                          <EditCategoryForm Categryid={cuisine.id} />
                          <DeleteCategoryConfirmation categoryId={cuisine.id} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pied de page */}
      <div className="flex justify-between items-center border-t pt-4 text-sm text-muted-foreground">
        <div>© Dixie.</div>
      </div>
    </div>
  );
}
