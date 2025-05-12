/** @format */

// /** @format */

// "use server";

// import { Resend } from "resend";
// import { DeliverymanApprovalEmail
// // import { generateRandomPassword } from "@/utils/password-utils";
// // import { hashPassword } from "@/lib/auth";
// import { doc, getDoc, updateDoc } from "firebase/firestore";
// import { db } from "@/lib/firebase/config";

// // Initialiser Resend avec votre clé API
// const resend = new Resend(process.env.RESEND_API_KEY);

// interface SendApprovalEmailResult {
//   success: boolean;
//   error?: string;
// }

// /**
//  * Envoie un email d'approbation au livreur avec ses identifiants
//  * @param deliverymanId ID du livreur approuvé
//  * @returns Résultat de l'opération
//  */
// export async function sendDeliverymanApprovalEmail(
//   deliverymanId: string,
// ): Promise<SendApprovalEmailResult> {
//   try {
//     // Récupérer les informations du livreur depuis Firebase
//     const deliverymanRef = doc(db, "deliverymen", deliverymanId);
//     const deliverymanSnap = await getDoc(deliverymanRef);

//     if (!deliverymanSnap.exists()) {
//       return {
//         success: false,
//         error: "Livreur introuvable",
//       };
//     }

//     const deliveryman = deliverymanSnap.data();

//     // Générer un mot de passe aléatoire
//     // const generatedPassword = generateRandomPassword();

//     // Hasher le mot de passe pour le stockage
//     // const hashedPassword = await hashPassword(generatedPassword);

//     // Mettre à jour le mot de passe du livreur dans Firebase
//     await updateDoc(deliverymanRef, {
//       updatedAt: new Date().toISOString(),
//     });

//     // Envoyer l'email
//     await resend.emails.send({
//       from: "Dixie Livreur <no-reply@dixie.ma>",
//       to: deliveryman.email,
//       subject: "Bienvenue chez Dixie Livreur - Votre compte a été approuvé",
//       react: DeliverymanApprovalEmail({
//         firstName: deliveryman.firstName,
//         lastName: deliveryman.lastName,
//         email: deliveryman.email,
//         password: deliveryman.password,
//       }),
//     });

//     return { success: true };
//   } catch (error) {
//     console.error("Erreur lors de l'envoi de l'email d'approbation:", error);
//     return {
//       success: false,
//       error: "Échec de l'envoi de l'email d'approbation",
//     };
//   }
// }
