/** @format */
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import AddFoodForm from "./FoodForm";

interface AddFoodDialogProps {
  fullPage?: boolean;
  onSuccess?: () => void;
}

export function AddFoodDialog({
  fullPage = false,
  onSuccess,
}: AddFoodDialogProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleOpenChange = (open: boolean) => {
    // Si on essaie de fermer le dialogue et que le formulaire a du contenu,
    // afficher une alerte de confirmation
    if (
      !open &&
      window.confirm(
        "Êtes-vous sûr de vouloir fermer ? Les modifications non enregistrées seront perdues.",
      )
    ) {
      setOpen(false);
    } else if (open) {
      setOpen(true);
    }
  };

  const handleSuccess = () => {
    setOpen(false);
    toast.success("Plat ajouté avec succès!");

    if (onSuccess) {
      onSuccess();
    } else {
      router.refresh();
    }
  };

  // Si c'est un mode plein écran, rediriger vers la page dédiée
  const handleFullPageClick = () => {
    router.push("/foods/add-new");
  };

  if (fullPage) {
    return (
      <Button
        onClick={handleFullPageClick}
        className="bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2">
        <Plus className="h-4 w-4" />
        Ajouter un Plat
      </Button>
    );
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2">
        <Plus className="h-4 w-4" />
        Ajouter un Plat
      </Button>

      <Dialog
        open={open}
        onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <DialogHeader className="px-6 pt-6 pb-2 sticky top-0 bg-white z-10 border-b">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl font-bold">
                  Ajouter un nouveau plat
                </DialogTitle>
                <DialogDescription>
                  Complétez le formulaire pour ajouter un plat à votre menu
                </DialogDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleOpenChange(false)}
                className="absolute right-4 top-4 rounded-full h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          <Tabs
            defaultValue="form"
            className="w-full">
            <div className="px-6 border-b">
              <TabsList className="justify-start mb-0">
                <TabsTrigger
                  value="form"
                  className="text-sm">
                  Formulaire de plat
                </TabsTrigger>
                <TabsTrigger
                  value="tips"
                  className="text-sm">
                  Conseils
                </TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="max-h-[calc(90vh-14rem)]">
              <TabsContent
                value="form"
                className="m-0 p-6">
                <AddFoodFormWrapper onSuccess={handleSuccess} />
              </TabsContent>

              <TabsContent
                value="tips"
                className="m-0 p-6 space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">
                    Conseils pour de bonnes photos de plats
                  </h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>
                      Utilisez une lumière naturelle pour des couleurs vives
                    </li>
                    <li>Photographiez les plats sous leur meilleur angle</li>
                    <li>
                      Assurez-vous que les images sont nettes et de haute
                      qualité
                    </li>
                    <li>
                      Ajoutez des garnitures pour rendre le plat plus attrayant
                    </li>
                    <li>
                      Utilisez un arrière-plan simple qui met en valeur le plat
                    </li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">
                    Conseils pour les descriptions efficaces
                  </h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>
                      Utilisez des mots évocateurs qui stimulent l'appétit
                    </li>
                    <li>
                      Mentionnez les ingrédients principaux et les saveurs
                    </li>
                    <li>
                      Indiquez si le plat est épicé, sucré, ou a d'autres
                      caractéristiques notables
                    </li>
                    <li>
                      Incluez toute information sur les allergènes importants
                    </li>
                    <li>Gardez la description concise mais informative</li>
                  </ul>
                </div>
              </TabsContent>
            </ScrollArea>

            <DialogFooter className=" top-0 bg-gray-50 p-4 border-t">
              <div className="flex w-full justify-between">
                <Button
                  variant="outline"
                  onClick={() => handleOpenChange(false)}>
                  Annuler
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleFullPageClick}
                  className="ml-auto mr-2">
                  Ouvrir en plein écran
                </Button>
              </div>
            </DialogFooter>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Ce composant enveloppe le formulaire pour gérer les événements de succès
function AddFoodFormWrapper({ onSuccess }: { onSuccess: () => void }) {
  // Ici, nous passons simplement le formulaire avec les propriétés adaptées pour le dialogue
  return (
    <div className="w-full">
      {/* Version simplifiée d'AddFoodForm spécifique pour le dialogue */}
      <SimplifiedFoodForm onSuccess={onSuccess} />
    </div>
  );
}

// Version simplifiée du formulaire pour le dialogue
function SimplifiedFoodForm({ onSuccess }: { onSuccess: () => void }) {
  // Cette version pourrait être une version allégée d'AddFoodForm
  // avec moins de champs ou une disposition différente pour le dialogue
  // Pour cet exemple, je simule simplement les champs essentiels

  return (
    <div className="space-y-4">
      <p className="text-amber-600 bg-amber-50 p-3 rounded-md border border-amber-200 text-sm">
        Pour une meilleure expérience avec toutes les fonctionnalités, utilisez
        le mode plein écran. Cette vue simplifiée vous permet d'ajouter
        rapidement un plat avec les informations essentielles.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Ici, implémenter une version plus simple du formulaire */}
        <AddFoodForm />
        {/* Note: Ce serait idéalement une version allégée du formulaire original */}
        {/* avec seulement les champs essentiels */}

        {/* Message pour rediriger vers la page complète */}
        <div className="text-center col-span-2 py-6">
          <p className="text-gray-500 mb-4">
            Pour utiliser toutes les fonctionnalités (variations, suppléments,
            etc.)
          </p>
          <Button
            onClick={() => (window.location.href = "/foods/add-new")}
            className="bg-blue-600 hover:bg-blue-700">
            Ouvrir le formulaire complet
          </Button>
        </div>
      </div>
    </div>
  );
}
