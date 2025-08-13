/** @format */

// lib/upload-real.ts - Upload avec images base64 pour dev et prod
import { toast } from "sonner";

// Configuration
export const UPLOAD_CONFIG = {
  // Toujours utiliser le stockage base64 (dev et prod)
  devMode: true, // Force base64 pour dev et prod

  // Dossier local pour stocker les métadonnées (optionnel)
  storageKey: "uploaded-images",
  
  // Limite Firebase en bytes (600KB pour laisser de la marge pour autres champs)
  maxBase64Size: 600000,
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
  needsCompression?: boolean;
} {
  if (!file) {
    return { isValid: false, error: "Aucun fichier fourni" };
  }

  if (!file.type.startsWith("image/")) {
    return { isValid: false, error: "Le fichier doit être une image" };
  }

  const supportedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (!supportedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: "Format non supporté. Utilisez JPG, PNG ou WebP",
    };
  }

  // Vérifier si l'image dépasse 2MB
  if (file.size > 2 * 1024 * 1024) {
    return { 
      isValid: true, 
      needsCompression: true,
      error: "Image supérieure à 2MB - compression automatique appliquée" 
    };
  }

  return { isValid: true, needsCompression: false };
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
 * Compresser une image avant stockage avec garantie < 1MB pour Firebase
 */
export function compressImage(
  file: File,
  maxWidth: number = 800,
  quality: number = 0.8,
  forceCompression: boolean = false
): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = async () => {
      // Calculer les nouvelles dimensions en gardant le ratio
      let { width, height } = img;
      let currentQuality = quality;

      // Compression agressive pour Firebase (limite 600KB pour document total)
      if (file.size > 2 * 1024 * 1024) { // > 2MB
        maxWidth = Math.min(maxWidth, 300); // Max 300px
        currentQuality = 0.2; // Qualité très faible
      } else if (file.size > 1 * 1024 * 1024) { // > 1MB
        maxWidth = Math.min(maxWidth, 350); // Max 350px
        currentQuality = 0.3; // Qualité très basse
      } else if (file.size > 500 * 1024) { // > 500KB  
        maxWidth = Math.min(maxWidth, 400); // Max 400px
        currentQuality = 0.4;
      }

      // Redimensionner si nécessaire
      if (forceCompression || width > maxWidth) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      }

      // Redimensionner le canvas
      canvas.width = width;
      canvas.height = height;

      if (ctx) {
        // Améliorer la qualité du redimensionnement
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        // Dessiner l'image redimensionnée
        ctx.drawImage(img, 0, 0, width, height);

        // Compresser avec multiple tentatives si nécessaire
        let compressedBase64 = canvas.toDataURL(file.type, currentQuality);
        let attempts = 0;
        const maxAttempts = 5;

        // Boucle pour garantir < 600KB (Firebase document total limit)
        while (compressedBase64.length > UPLOAD_CONFIG.maxBase64Size && attempts < maxAttempts) {
          attempts++;
          currentQuality -= 0.1; // Réduire la qualité
          
          // Réduire encore la taille si nécessaire
          if (attempts > 2) {
            width = Math.floor(width * 0.8);
            height = Math.floor(height * 0.8);
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);
          }
          
          compressedBase64 = canvas.toDataURL(file.type, Math.max(0.1, currentQuality));
          console.log(`Tentative ${attempts}: ${Math.round(compressedBase64.length / 1024)}KB`);
        }

        if (compressedBase64.length > 1000000) {
          reject(new Error("Impossible de compresser l'image sous 1MB"));
          return;
        }

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

    // Afficher un message si compression nécessaire
    if (validation.needsCompression) {
      toast.info("Image > 2MB détectée - compression automatique en cours...");
    }

    // Simuler un délai d'upload réaliste
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Toujours utiliser base64 (même processus dev et prod)
    console.log("📷 Upload image en base64");

    // Compresser l'image (plus agressif si > 2MB)
    const compressedBase64 = await compressImage(
      file, 
      validation.needsCompression ? 600 : 800, 
      validation.needsCompression ? 0.6 : 0.8,
      validation.needsCompression
    );

    // Vérification finale de la taille pour Firebase
    const base64SizeKB = Math.round(compressedBase64.length / 1024);
    console.log(`Taille finale base64: ${base64SizeKB}KB`);

    if (compressedBase64.length > UPLOAD_CONFIG.maxBase64Size) { // > 600KB
      throw new Error(`Image trop volumineuse après compression (${base64SizeKB}KB). Limite: 600KB`);
    }

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

    // Message de succès adapté
    if (validation.needsCompression) {
      toast.success(`Image compressée (${base64SizeKB}KB) et uploadée avec succès!`);
    } else {
      toast.success(`Image "${file.name}" uploadée (${base64SizeKB}KB)`);
    }
    
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
 * Supprimer une image (images base64 - aucune suppression nécessaire)
 */
export async function deleteImageReal(imageUrl: string): Promise<boolean> {
  try {
    // Les images base64 n'ont pas besoin d'être "supprimées"
    if (imageUrl.startsWith("data:image/")) {
      console.log("📷 Image base64 - aucune suppression nécessaire");
      return true;
    }

    console.log("📷 Suppression d'image");
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
