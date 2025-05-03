/** @format */
"use client";
import { deleteCategory, getCategoryById } from "@/actions/category";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Category } from "@/lib/types";
import { useAuth } from "@/providers/auth-provider";
import { Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface DeleteCategoryProps {
  categoryId: string;
}

export function DeleteCategoryConfirmation({
  categoryId,
}: DeleteCategoryProps) {
  // const { currentUser } = useAuth();
  const [category, setCategory] = useState<Category | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const getCurrentCategory = async (id: string) => {
      try {
        const currentCategory = await getCategoryById(id);
        setCategory(currentCategory.category as Category);
      } catch (error) {
        console.error("Error getting category:", error);
      }
    };

    if (isOpen) {
      getCurrentCategory(categoryId);
    }
  }, [categoryId, isOpen]);

  const handleDeleteCategory = async () => {
    try {
      await deleteCategory(categoryId);
      setIsOpen(false);
      router.push("/categories");
      router.refresh(); // Force a refresh of the current route
    } catch (error) {
      console.error("Error deleting category:", error);
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
          className="h-8 w-8 text-red-500">
          <Trash className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Delete Confirmation</h4>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete this category
              {category ? `: ${category.name}` : ""}?
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteCategory}>
              Delete
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
