/** @format */

"use client";

import React, { useCallback, useState } from "react";
import Image from "next/image";
import { useDropzone } from "@uploadthing/react";
import { ImageIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { UploadButton } from "@/utils/uploadthing";

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

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (disabled) return;

      const file = acceptedFiles[0];

      if (!file) {
        setError("No file selected");
        return;
      }

      // Check if file is an image
      if (!file.type.startsWith("image/")) {
        setError("Only image files are allowed");
        return;
      }

      // Check file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        return;
      }

      setError(null);
      setIsUploading(true);

      try {
        await onChange("file");
        // setValue(file)
      } catch (err) {
        console.error("Upload error:", err);
        setError("Failed to upload file");
      } finally {
        setIsUploading(false);
      }
    },
    [onChange, disabled],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp"],
    },
    maxFiles: 1,
    disabled: isUploading || disabled,
  });

  return (
    <div className={cn("w-full", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-4 cursor-pointer transition-colors",
          isDragActive ? "border-primary bg-primary/10" : "border-gray-300",
          (isUploading || disabled) && "opacity-50 cursor-not-allowed",
        )}>
        <input {...getInputProps()} />

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
                {/* <ImageIcon className="h-10 w-10 text-gray-400 mb-2" />
                <p className="text-sm font-medium">
                  Drag & drop or click to upload
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG, WEBP up to 5MB
                </p> */}
                <UploadButton
                  endpoint="imageUploader"
                  onClientUploadComplete={(res) => {
                    //   onChange(res[0].ufsUrl as any);
                    setValue(res[0].ufsUrl as any);
                    alert("is ok");
                  }}
                  onUploadError={(error: Error) => {
                    setError(error.message);
                    alert(error);
                  }}
                />
              </>
            )}
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
};
