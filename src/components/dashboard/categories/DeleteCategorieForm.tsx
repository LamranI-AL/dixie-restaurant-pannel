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
import { Loader2, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface DeleteCategoryProps {
  categoryId: string;
  onDelete?: () => void; // Callback function to refresh the category list
}

export function DeleteCategoryConfirmation({
  categoryId,
  onDelete,
}: DeleteCategoryProps) {
  const [category, setCategory] = useState<Category | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCategory, setIsLoadingCategory] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const getCurrentCategory = async (id: string) => {
      if (!id) return;

      setIsLoadingCategory(true);
      try {
        const response = await getCategoryById(id);
        if (response.success) {
          setCategory(response.category as Category);
        } else {
          toast.error("Couldn't load category details");
        }
      } catch (error) {
        console.error("Error getting category:", error);
        toast.error("Failed to load category information");
      } finally {
        setIsLoadingCategory(false);
      }
    };

    if (isOpen && categoryId) {
      getCurrentCategory(categoryId);
    }
  }, [isOpen, categoryId]);

  const handleDeleteCategory = async () => {
    setIsLoading(true);
    try {
      const response = await deleteCategory(categoryId);

      if (response.success) {
        toast.success("Category deleted successfully!");
        setIsOpen(false);

        // Call the callback if provided
        if (onDelete) {
          onDelete();
        } else {
          // Fallback to router refresh
          router.push(`/categories`);
        }
      } else {
        toast.error(response.error || "Failed to delete category");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Something went wrong while deleting the category");
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
          className="h-8 w-8 text-red-500 hover:bg-red-50">
          <Trash className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            {isLoadingCategory ? (
              <div className="flex items-center justify-center py-2">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm">Loading category...</span>
              </div>
            ) : (
              <>
                <h4 className="font-medium leading-none">
                  Delete Confirmation
                </h4>
                <p className="text-sm text-muted-foreground">
                  Are you sure you want to delete this category
                  {category ? `: ${category.name}` : ""}? This action cannot be
                  undone.
                </p>
              </>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteCategory}
              disabled={isLoading || isLoadingCategory}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
