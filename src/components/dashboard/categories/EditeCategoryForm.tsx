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
import { Category } from "@/lib/types";
// import { useAuth } from "@/providers/auth-provider";
import { PenBox } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
interface EditCategoryFormProps {
  Categryid: string;
}
export function EditCategoryForm({ Categryid }: EditCategoryFormProps) {
  // const { currentUser } = useAuth();
  const [category, setCategory] = useState<Category>();
  const router = useRouter();
  useEffect(() => {
    const getCurrentCategory = async (id: string) => {
      try {
        const currentCategory = await getCategoryById(id);
        setCategory(currentCategory.category as Category);
        console.log("currentCategory", currentCategory?.category?.name);
      } catch (error) {
        console.error("Error getting category:", error);
      }
    };
    getCurrentCategory(Categryid);
  }, []);
  const editCategory = async () => {
    try {
      //   const currentCategory = await getCategoryById(id);
      console.log("currentCategoryid from editFunction ", Categryid);
      await updateCategory(Categryid, {
        name: "Updated Category",
        ...category,
      });
      router.push("/categories");
    } catch (error) {
      console.error("Error getting category:", error);
    }
  };
  //   const addNewCategoryClientSide = async (formData: FormData) => {
  //     const name = formData.get("name") as string;
  //     // const id = formData.get("id") as string;
  //     const image =
  //       urlImage ?? "https://img.icons8.com/color/96/000000/curry.png";
  //     // const isActivited = true;
  //     const newCategory: Category = {
  //       name,
  //       image,
  //       status: true,
  //       userId: currentUser?.uid as string,
  //     };
  //     // Logic to add a new category on the client side
  //     // console.log("New category added");
  //     try {
  //       await addCategory(newCategory);
  //       alert("New category added");
  //     } catch (error) {
  //       alert("error" + error);
  //     }
  //   };
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 text-blue-500">
          <PenBox className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <form
          action={editCategory}
          className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Dimensions</h4>
            <p className="text-sm text-muted-foreground">
              Set the dimensions for the layer.
            </p>
          </div>
          <div className="grid gap-2">
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="width">Name</Label>
              <Input
                id="width"
                name="name"
                defaultValue={category?.name}
                placeholder="name"
                className="col-span-2 h-8"
              />
            </div>
            {/* <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="height">id</Label>
              <Input
                id="id"
                placeholder="0"
                className="col-span-2 h-8"
              />
            </div> */}
            {/* <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="maxHeight">Image</Label>
              <UploadButton
                endpoint="imageUploader"
                onClientUploadComplete={(res) => {
                  // Do something with the response
                  console.log("Files: ", res);
                  console.log(res[0].ufsUrl!);
                  setUrlImage(res[0].ufsUrl! as string);
                  alert("Upload Completed");
                }}
                onUploadError={(error: Error) => {
                  // Do something with the error.
                  alert(`ERROR! ${error.message}`);
                }}
              />
            </div> */}
            <Button className="gap-4">Edit</Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
}
