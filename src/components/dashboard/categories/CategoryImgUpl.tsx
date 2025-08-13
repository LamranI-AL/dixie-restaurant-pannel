/** @format */

import { uploadImage } from "@/utils/uploadthing";
import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { toast } from "sonner";

function CategoryImgUpl({ onUploadComplete }: { onUploadComplete?: (url: string) => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const uploadedUrl = await uploadImage(file);
      if (onUploadComplete) {
        onUploadComplete(uploadedUrl);
      }
      toast.success("Upload terminé");
    } catch (error) {
      toast.error(`ERREUR! ${error instanceof Error ? error.message : 'Upload échoué'}`);
    }
  };

  return (
    <div>
      <Button onClick={() => fileInputRef.current?.click()}>
        <Upload className="h-4 w-4 mr-2" />
        Upload Image
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}

export default CategoryImgUpl;
