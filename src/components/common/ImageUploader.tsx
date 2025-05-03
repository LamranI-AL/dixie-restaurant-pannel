/** @format */

// client/src/components/common/ImageUploader.tsx
import { useState } from "react";
import { UploadDropzone } from "@/utils/uploadthing";
import { ImagePlus, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageUploaderProps {
  imageUrl: string | null;
  onUploadComplete: (url: string) => void;
  onImageRemove?: () => void;
  aspectRatio?: "square" | "banner";
  maxSize?: number; // in MB
  className?: string;
  label?: string;
}

const ImageUploader = ({
  imageUrl,
  onUploadComplete,
  onImageRemove,
  aspectRatio = "square",
  maxSize = 2,
  className = "",
  label = "Upload Image",
}: ImageUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRemoveImage = () => {
    if (onImageRemove) {
      onImageRemove();
    }
  };

  return (
    <div
      className={`border border-gray-200 rounded-md overflow-hidden ${className}`}>
      {imageUrl ? (
        <div className="relative">
          <div
            className={`${
              aspectRatio === "square" ? "aspect-square" : "aspect-[16/9]"
            } relative bg-gray-50 overflow-hidden`}>
            <img
              src={imageUrl}
              alt="Uploaded image"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute top-2 right-2 flex space-x-1">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-7 w-7 bg-white/80 backdrop-blur-sm hover:bg-white"
              onClick={() => setIsUploading(true)}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            {onImageRemove && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-7 w-7 bg-white/80 backdrop-blur-sm hover:bg-white"
                onClick={handleRemoveImage}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      ) : isUploading ? (
        <div
          className={`${
            aspectRatio === "square" ? "aspect-square" : "aspect-[16/9]"
          } relative bg-gray-50`}>
          <UploadDropzone
            endpoint="imageUploader"
            onClientUploadComplete={(res: any) => {
              if (res && res.length > 0) {
                onUploadComplete(res[0].url);
                setIsUploading(false);
                setError(null);
              }
            }}
            onUploadError={(err: any) => {
              setError(err.message);
              setIsUploading(false);
            }}
            config={{ mode: "auto" }}
          />
          {error && (
            <div className="mt-2 text-sm text-red-600 text-center px-3">
              {error}
            </div>
          )}
        </div>
      ) : (
        <div
          className={`${
            aspectRatio === "square" ? "aspect-square" : "aspect-[16/9]"
          } relative bg-gray-50 flex flex-col items-center justify-center p-4 cursor-pointer`}
          onClick={() => setIsUploading(true)}>
          <ImagePlus className="h-10 w-10 text-gray-400 mb-2" />
          <p className="text-sm text-gray-500 text-center">{label}</p>
          <p className="text-xs text-gray-400 mt-1">Max size: {maxSize}MB</p>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
