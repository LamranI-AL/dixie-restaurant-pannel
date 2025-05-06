/** @format */
"use client";
import { addCategory } from "@/actions/category";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Category } from "@/lib/types";
import { useAuth } from "@/providers/auth-provider";
import { UploadButton } from "@/utils/uploadthing";
import { useRouter } from "next/navigation";
import { useState } from "react";
interface PopoverProps {
  buttonName: string;
}
export function PopoverButton({ buttonName }: PopoverProps) {
  const [urlImage, setUrlImage] = useState<string>("");
  const { currentUser } = useAuth();
  const router = useRouter();
  const addNewCategoryClientSide = async (formData: FormData) => {
    const name = formData.get("name") as string;
    // const id = formData.get("id") as string;
    const image =
      urlImage ?? "https://img.icons8.com/color/96/000000/curry.png";
    // const isActivited = true;
    const newCategory: Category = {
      id: "0",
      name,
      image,
      status: true,
      userId: currentUser?.uid as string,
      description: "",
      longDescription: "",
    };
    try {
      await addCategory(newCategory);
      console.log("New category added");

      router.push("/categories");
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button>+ {buttonName}</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <form
          action={addNewCategoryClientSide}
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
                placeholder="le nom de la catégorie"
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
            <div className="grid grid-cols-3 items-center gap-4">
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
            </div>
            <Button className="gap-4">add</Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
}
