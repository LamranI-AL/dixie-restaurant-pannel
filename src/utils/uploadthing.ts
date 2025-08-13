/** @format */

// Migrated from uploadthing to upload-real.ts for direct base64 and Firebase uploads
export { 
  uploadImageReal as uploadImage,
  deleteImageReal as deleteImage,
  createImagePreview,
  validateImageFile,
  convertImageToBase64,
  compressImage,
  getUploadedImagesMetadata,
  clearImageCache 
} from "@/lib/upload-real";
