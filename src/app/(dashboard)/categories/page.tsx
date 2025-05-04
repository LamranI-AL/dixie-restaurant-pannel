/** @format */

"use client";
import { useEffect, useState } from "react";
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
import { Category } from "@/lib/types";
import { useAuth } from "@/providers/auth-provider";
import Image from "next/image";
import { getAllCategories } from "@/actions/category";
import { EditCategoryForm } from "@/components/dashboard/categories/EditeCategoryForm";
import { DeleteCategoryConfirmation } from "@/components/dashboard/categories/DeleteCategorieForm";
import { toast, Toaster } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { addCategory } from "@/actions/category";
import { UploadButton } from "@/utils/uploadthing";

export default function CategoriesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { currentUser } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);

  // New category form state
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [categoryImage, setCategoryImage] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  // Fetch categories
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { success, categories } = await getAllCategories();
      if (success) {
        setCategories(categories as Category[]);
        toast.success("Categories loaded successfully");
      } else {
        toast.error("Error fetching categories");
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Handle new category submission
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!categoryName.trim()) {
      toast.error("Category name is required");
      return;
    }

    if (!categoryImage) {
      toast.error("Please upload an image for the category");
      return;
    }

    setFormLoading(true);

    try {
      const result = await addCategory({
        status: true,
        userId: (await currentUser?.getIdToken()) || "",
        // : categoryId,
        id: "",
        name: categoryName,
        // : categoryDescription,
        image: categoryImage,
      });

      if (result.success) {
        toast.success("Category added successfully!");
        // Reset form
        setCategoryName("");
        setCategoryDescription("");
        setCategoryImage("");
        // Close popover
        setPopoverOpen(false);
        // Refresh categories
        fetchCategories();
      } else {
        toast.error(result.error || "Failed to add category");
      }
    } catch (error) {
      console.error("Error adding category:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setFormLoading(false);
    }
  };

  // Filter categories based on search query
  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      {/* Toast notifications */}
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
          <h2 className="text-2xl font-bold">Category List</h2>
          <div className="ml-2 flex h-7 items-center justify-center rounded-full bg-blue-100 px-3 text-xs font-medium text-blue-500">
            {filteredCategories.length}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Ex : Search by category name.."
              className="w-[240px] pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Button
            variant="outline"
            size="icon">
            <Search className="h-4 w-4" />
          </Button>

          {/* Add Category Popover */}
          <Popover
            open={popoverOpen}
            onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <Button className="gap-1">
                <Plus className="h-4 w-4 mr-1" />
                Add New Category
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <form
                onSubmit={handleAddCategory}
                className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium leading-none">Add New Category</h3>
                  <p className="text-sm text-muted-foreground">
                    Enter details for the new category
                  </p>
                </div>

                {/* Image Upload */}
                <div className="space-y-2">
                  <Label htmlFor="image">Category Image</Label>
                  <div className="bg-gradient-to-b from-blue-50 to-blue-100 rounded-md p-2">
                    <UploadButton
                      endpoint="imageUploader"
                      onClientUploadComplete={(res) => {
                        if (res && res.length > 0 && res[0].ufsUrl) {
                          setCategoryImage(res[0].ufsUrl);
                          toast.success("Image uploaded successfully!");
                          setUploadingImage(false);
                        }
                      }}
                      onUploadBegin={() => {
                        setUploadingImage(true);
                      }}
                      onUploadError={(error: Error) => {
                        toast.error(`Upload error: ${error.message}`);
                        setUploadingImage(false);
                      }}
                    />
                  </div>

                  {/* Image Preview */}
                  {categoryImage && (
                    <div className="mt-2 relative h-24 w-24 mx-auto">
                      <Image
                        src={categoryImage}
                        alt="Category preview"
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>
                  )}
                </div>

                {/* Category Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Category Name</Label>
                  <Input
                    id="name"
                    required
                    placeholder="Enter category name"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                  />
                </div>

                {/* Category Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter category description"
                    value={categoryDescription}
                    onChange={(e) => setCategoryDescription(e.target.value)}
                    className="resize-none"
                    rows={3}
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={formLoading || uploadingImage || !categoryImage}>
                  {formLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Add Category"
                  )}
                </Button>
              </form>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Categories Table */}
      <Card className="border border-gray-200">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-12 text-center">SI</TableHead>
                  <TableHead>Image</TableHead>
                  <TableHead>Category Name</TableHead>
                  <TableHead className="w-24 text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-8 text-gray-500">
                      No categories found. Create your first category!
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCategories.map((category, index) => (
                    <TableRow key={index}>
                      <TableCell className="text-center">{index + 1}</TableCell>
                      <TableCell>
                        <div className="h-12 w-12 rounded-md overflow-hidden">
                          <Image
                            width={300}
                            height={300}
                            src={
                              (category.image as string) ||
                              "https://img.icons8.com/color/96/000000/curry.png"
                            }
                            alt={category.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {category.name}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-1">
                          <EditCategoryForm Categryid={category.id} />
                          <DeleteCategoryConfirmation
                            categoryId={category.id}
                          />
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

      {/* Footer */}
      <div className="flex justify-between items-center border-t pt-4 text-sm text-muted-foreground">
        <div>© dixie.</div>
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground">
            Restaurant settings
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground">
            Profile
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line
                x1="21"
                y1="12"
                x2="9"
                y2="12"
              />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
}
