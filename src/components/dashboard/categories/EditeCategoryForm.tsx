/** @format */
"use client";

import { getCategoryById, updateCategory } from "@/actions/category";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
// import { Category } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { PenBox } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface EditCategoryFormProps {
  Categryid: string;
}

export function EditCategoryForm({ Categryid }: EditCategoryFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
  });
  const router = useRouter();

  useEffect(() => {
    const getCurrentCategory = async (id: string) => {
      try {
        setIsLoading(true);
        const response = await getCategoryById(id);

        if (response?.category) {
          setFormData({
            name: response.category.name || "",
          });
        }
      } catch (error) {
        console.error("Error getting category:", error);
        toast({
          title: "Erreur",
          description: "Impossible de récupérer les données de la catégorie",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (Categryid && isOpen) {
      getCurrentCategory(Categryid);
    }
  }, [Categryid, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom de la catégorie ne peut pas être vide",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      await updateCategory(Categryid, {
        name: formData.name,
      });

      toast({
        title: "Succès",
        description: "Catégorie mise à jour avec succès",
        variant: "default",
      });

      setIsOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Error updating category:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la catégorie",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Popover
      open={isOpen}
      onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 text-blue-500 hover:bg-blue-50">
          <PenBox className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-2 mb-4">
          <h4 className="font-medium leading-none">Modifier la catégorie</h4>
          <p className="text-sm text-muted-foreground">
            Modifier les informations de la catégorie
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin h-6 w-6 border-2 border-blue-500 rounded-full border-t-transparent"></div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="grid gap-4">
            <div className="grid gap-2">
              <div className="grid grid-cols-3 items-center gap-4">
                <Label
                  htmlFor="categoryName"
                  className="text-right">
                  Nom
                </Label>
                <Input
                  id="categoryName"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Nom de la catégorie"
                  className="col-span-2 h-9"
                  autoComplete="off"
                />
              </div>

              <div className="flex justify-end gap-2 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  disabled={isLoading}>
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-blue-500 hover:bg-blue-600">
                  {isLoading ? "Mise à jour..." : "Mettre à jour"}
                </Button>
              </div>
            </div>
          </form>
        )}
      </PopoverContent>
    </Popover>
  );
}
