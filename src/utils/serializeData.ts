/** @format */

// Créez un fichier utils pour gérer la sérialisation des données Firebase
export function serializeFirebaseData(obj: any): any {
  if (!obj) return null;

  // Si c'est une date Firebase/Firestore (avec seconds et nanoseconds)
  if (
    obj &&
    typeof obj === "object" &&
    obj.seconds !== undefined &&
    obj.nanoseconds !== undefined
  ) {
    return new Date(obj.seconds * 1000).toISOString();
  }

  // Si c'est un tableau, appliquer la fonction à chaque élément
  if (Array.isArray(obj)) {
    return obj.map((item) => serializeFirebaseData(item));
  }

  // Si c'est un objet, appliquer la fonction à chaque propriété
  if (obj && typeof obj === "object" && obj !== null) {
    const newObj: Record<string, any> = {};
    Object.keys(obj).forEach((key) => {
      newObj[key] = serializeFirebaseData(obj[key]);
    });
    return newObj;
  }

  // Sinon, retourner la valeur telle quelle
  return obj;
}

export function serializeFirebaseDocument(doc: any) {
  if (!doc) return null;

  // Commencer par une copie superficielle
  const serialized = { ...doc };

  // Traiter spécifiquement les champs de date connus
  if (serialized.updatedAt) {
    serialized.updatedAt = serializeFirebaseData(serialized.updatedAt);
  }
  if (serialized.createdAt) {
    serialized.createdAt = serializeFirebaseData(serialized.createdAt);
  }

  // Parcourir toutes les autres propriétés et les sérialiser si nécessaire
  Object.keys(serialized).forEach((key) => {
    if (typeof serialized[key] === "object" && serialized[key] !== null) {
      serialized[key] = serializeFirebaseData(serialized[key]);
    }
  });

  return serialized;
}
