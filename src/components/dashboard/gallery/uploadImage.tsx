/** @format */

"use client";

import React, { useCallback, useState } from "react";
import Image from "next/image";
import { ImageIcon, Loader2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { uploadImage } from "@/utils/uploadthing";
import { Button } from "@/components/ui/button";

interface FileUploadProps {
  onChange: (url: any) => Promise<string | null>;
  value?: string;
  disabled?: boolean;
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onChange,
  value,
  disabled,
  className,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [value1, setValue] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  const handleFileUpload = async (file: File) => {
    if (disabled) return;

    if (!file.type.startsWith("image/")) {
      setError("Only image files are allowed");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      const uploadedUrl = await uploadImage(file);
      setValue(uploadedUrl);
      await onChange(uploadedUrl);
    } catch (err) {
      console.error("Upload error:", err);
      setError("Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragActive(false);
      
      const files = Array.from(e.dataTransfer.files);
      if (files[0]) {
        handleFileUpload(files[0]);
      }
    },
    [disabled],
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <div
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragActive(true);
        }}
        onDragLeave={() => setIsDragActive(false)}
        className={cn(
          "border-2 border-dashed rounded-lg p-4 cursor-pointer transition-colors",
          isDragActive ? "border-primary bg-primary/10" : "border-gray-300",
          (isUploading || disabled) && "opacity-50 cursor-not-allowed",
        )}>
        <input 
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
        />

        {value1 ? (
          <div className="relative aspect-video w-full overflow-hidden rounded-md">
            <Image
              src={value1}
              alt="Uploaded image"
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-4">
            {isUploading ? (
              <>
                <Loader2 className="h-10 w-10 text-primary animate-spin mb-2" />
                <p className="text-sm text-gray-500">Uploading image...</p>
              </>
            ) : (
              <>
                <ImageIcon className="h-10 w-10 text-gray-400 mb-2" />
                <p className="text-sm font-medium">
                  Drag & drop or click to upload
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG, WEBP up to 5MB
                </p>
                <Button 
                  type="button"
                  onClick={() => document.getElementById('file-upload')?.click()}
                  className="mt-2"
                  disabled={isUploading || disabled}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Select Image
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
};
