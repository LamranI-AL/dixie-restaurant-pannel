/** @format */

// lib/upload-real.ts - Upload avec vraies images en mode développement et Firebase en production
import { toast } from "sonner";
import { uploadFile, deleteFile } from "./firebase/storage";

// Configuration
export const UPLOAD_CONFIG = {
  // Mode développement utilise le stockage local (base64), production utilise Firebase
  devMode: process.env.NODE_ENV === 'development',

  // Dossier local pour stocker les métadonnées (optionnel)
  storageKey: "uploaded-images",

  // Path Firebase pour les images
  firebasePath: "images",
};

interface UploadedImageData {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string; // Base64 URL
  uploadedAt: Date;
}

/**
 * Validation d'un fichier image
 */
export function validateImageFile(file: File): {
  isValid: boolean;
  error?: string;
} {
  if (!file) {
    return { isValid: false, error: "Aucun fichier fourni" };
  }

  if (!file.type.startsWith("image/")) {
    return { isValid: false, error: "Le fichier doit être une image" };
  }

  if (file.size > 4 * 1024 * 1024) {
    return { isValid: false, error: "L'image ne doit pas dépasser 4MB" };
  }

  const supportedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (!supportedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: "Format non supporté. Utilisez JPG, PNG ou WebP",
    };
  }

  return { isValid: true };
}

/**
 * Convertir une image en base64 (pour stockage local)
 */
export function convertImageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      reject(new Error(validation.error));
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string);
      } else {
        reject(new Error("Erreur lors de la conversion"));
      }
    };

    reader.onerror = () => {
      reject(new Error("Erreur lors de la lecture du fichier"));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Compresser une image avant stockage
 */
export function compressImage(
  file: File,
  maxWidth: number = 800,
  quality: number = 0.8,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      // Calculer les nouvelles dimensions en gardant le ratio
      let { width, height } = img;

      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      // Redimensionner
      canvas.width = width;
      canvas.height = height;

      if (ctx) {
        // Améliorer la qualité du redimensionnement
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        // Dessiner l'image redimensionnée
        ctx.drawImage(img, 0, 0, width, height);

        // Convertir en base64 avec compression
        const compressedBase64 = canvas.toDataURL(file.type, quality);
        resolve(compressedBase64);
      } else {
        reject(new Error("Impossible de créer le contexte canvas"));
      }
    };

    img.onerror = () => {
      reject(new Error("Erreur lors du chargement de l'image"));
    };

    img.src = URL.createObjectURL(file);
  });
}

/**
 * Sauvegarder les métadonnées d'image dans le localStorage (optionnel)
 */
function saveImageMetadata(imageData: UploadedImageData): void {
  try {
    const existingData = localStorage.getItem(UPLOAD_CONFIG.storageKey);
    const images: UploadedImageData[] = existingData
      ? JSON.parse(existingData)
      : [];

    // Ajouter la nouvelle image
    images.push(imageData);

    // Garder seulement les 50 dernières images pour éviter de surcharger le localStorage
    if (images.length > 50) {
      images.splice(0, images.length - 50);
    }

    localStorage.setItem(UPLOAD_CONFIG.storageKey, JSON.stringify(images));
  } catch (error) {
    console.warn("Impossible de sauvegarder les métadonnées:", error);
  }
}

/**
 * Upload d'image avec stockage de la vraie image
 */
export async function uploadImageReal(file: File): Promise<string> {
  try {
    // Validation
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // Simuler un délai d'upload réaliste
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Toujours utiliser base64 (même processus dev et prod)
    console.log("📷 Upload image en base64");

    // Compresser l'image pour optimiser la taille
    const compressedBase64 = await compressImage(file, 800, 0.8);

    // Générer un ID unique pour l'image
    const imageId = `img_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Sauvegarder les métadonnées (optionnel)
    const imageData: UploadedImageData = {
      id: imageId,
      name: file.name,
      size: file.size,
      type: file.type,
      url: compressedBase64,
      uploadedAt: new Date(),
    };

    saveImageMetadata(imageData);

    toast.success(`Image "${file.name}" uploadée`);
    return compressedBase64;
  } catch (error) {
    console.error("Erreur lors de l'upload:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Erreur lors de l'upload";
    toast.error(errorMessage);
    throw error;
  }
}

/**
 * Supprimer une image (en mode dev, on ne fait rien car c'est en base64)
 */
export async function deleteImageReal(imageUrl: string): Promise<boolean> {
  try {
    // En mode développement, les images base64 n'ont pas besoin d'être "supprimées"
    if (UPLOAD_CONFIG.devMode || imageUrl.startsWith("data:image/")) {
      console.log("🔧 Image locale - aucune suppression nécessaire");
      return true;
    }

    // Mode production - Supprimer de Firebase Storage
    console.log("🔥 Suppression de Firebase Storage");
    await deleteFile(imageUrl);
    toast.success("Image supprimée avec succès");
    return true;
  } catch (error) {
    console.error("Erreur lors de la suppression:", error);
    toast.error("Erreur lors de la suppression de l'image");
    return false;
  }
}

/**
 * Créer un aperçu d'image (identique à la fonction d'upload en mode dev)
 */
export function createImagePreview(file: File): Promise<string> {
  return compressImage(file, 400, 0.9); // Aperçu plus petit
}

/**
 * Obtenir les métadonnées des images uploadées
 */
export function getUploadedImagesMetadata(): UploadedImageData[] {
  try {
    const data = localStorage.getItem(UPLOAD_CONFIG.storageKey);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Erreur lors de la récupération des métadonnées:", error);
    return [];
  }
}

/**
 * Nettoyer le cache des images (utile pour le développement)
 */
export function clearImageCache(): void {
  try {
    localStorage.removeItem(UPLOAD_CONFIG.storageKey);
    toast.success("Cache des images nettoyé");
  } catch (error) {
    console.error("Erreur lors du nettoyage:", error);
    toast.error("Erreur lors du nettoyage du cache");
  }
}
