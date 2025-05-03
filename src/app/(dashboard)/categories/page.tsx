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
import { Search } from "lucide-react";
import { Category } from "@/lib/types";
import { useAuth } from "@/providers/auth-provider";
import { PopoverButton } from "@/components/dashboard/categories/Popover";
import Image from "next/image";
import { getAllCategories } from "@/actions/category";
import { EditCategoryForm } from "@/components/dashboard/categories/EditeCategoryForm";
import { DeleteCategoryConfirmation } from "@/components/dashboard/categories/DeleteCategorieForm";

export default function CategoriesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { currentUser } = useAuth();
  console.log("currentUser", currentUser);
  // ustilise use effect to fetch categories from the server
  const [categories, setCategories] = useState<Category[]>([]);
  console.log(categories);
  useEffect(() => {
    const fetchCategories = async () => {
      const { success, categories } = await getAllCategories();
      console.log(categories);
      console.log(success);
      if (success) {
        setCategories(categories as any);
      } else {
        console.error("Error fetching categories");
      }
    };
    fetchCategories();
  }, []);

  // Filter categories based on search query
  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-4">
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
            16
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
          <PopoverButton buttonName="Add New Category" />
          {/* <Button
            className="gap-1"
            onClick={() => alert("Add New Category")}>
            <Plus className="h-4 w-4 mr-1" />
            Add New
          </Button> */}
        </div>
      </div>

      <Card className="border border-gray-200">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-12 text-center">SI</TableHead>
                <TableHead>Image</TableHead>
                {/* <TableHead>Category Id</TableHead> */}
                <TableHead>Category Name</TableHead>
                <TableHead className="w-24 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategories.map((category, index) => (
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
                  {/* <TableCell>{category.id}</TableCell> */}
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>
                    <div className="flex justify-center gap-1">
                      <EditCategoryForm Categryid={category.id} />
                      <DeleteCategoryConfirmation categoryId={category.id} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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
