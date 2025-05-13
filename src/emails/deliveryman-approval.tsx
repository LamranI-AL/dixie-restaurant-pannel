/** @format */

// /** @format */

// "use server";

// import { Resend } from "resend";
// // import { generateRandomPassword } from "@/utils/password-utils";
// // import { hashPassword } from "@/lib/auth";
// import { doc, getDoc, updateDoc } from "firebase/firestore";
// import { db } from "@/lib/firebase/config";

// // Initialiser Resend avec votre clé API
// const resend = new Resend("re_B715pxh6_Ata5xoEkGS3kTmVeuiY3XfxR");
// // resend.apiKeys.create({ name: "Production" });

// interface SendApprovalEmailResult {
//   success: boolean;
//   error?: string;
// }

// /**
//  * Crée un template HTML simple pour l'email d'approbation
//  */
// function createApprovalEmailHTML(params: {
//   firstName: string;
//   lastName: string;
//   email: string;
//   password: string;
// }) {
//   return `
//   <!DOCTYPE html>
//   <html>
//     <head>
//       <meta charset="utf-8">
//       <title>Bienvenue chez Dixie Livreur</title>
//       <style>
//         body {
//           font-family: Arial, sans-serif;
//           line-height: 1.6;
//           color: #333;
//           background-color: #f5f5f5;
//           margin: 0;
//           padding: 0;
//         }
//         .container {
//           max-width: 600px;
//           margin: 0 auto;
//           padding: 20px;
//           background-color: #ffffff;
//           border-radius: 5px;
//         }
//         .header {
//           text-align: center;
//           padding: 20px 0;
//         }
//         .content {
//           padding: 20px 0;
//         }
//         .credentials {
//           background-color: #f8f9fa;
//           padding: 15px;
//           border-radius: 5px;
//           margin: 20px 0;
//           border: 1px solid #e9ecef;
//         }
//         .button {
//           display: block;
//           width: 200px;
//           margin: 30px auto;
//           padding: 12px 20px;
//           background-color: #4CAF50;
//           color: #ffffff;
//           text-align: center;
//           text-decoration: none;
//           border-radius: 5px;
//           font-weight: bold;
//         }
//         .footer {
//           text-align: center;
//           color: #777;
//           font-size: 14px;
//           padding: 20px 0;
//         }
//       </style>
//     </head>
//     <body>
//       <div class="container">
//         <div class="header">
//           <img src="https://dixie-livreur.ma/logo.png" alt="Dixie Livreur" width="120" height="40">
//           <h1>Félicitations ${params.firstName}!</h1>
//         </div>

//         <div class="content">
//           <p>Nous sommes heureux de vous informer que votre candidature pour devenir livreur chez Dixie Livreur a été approuvée.</p>
//           <p>Vous pouvez dès à présent vous connecter à notre application pour commencer à prendre en charge des livraisons.</p>

//           <div class="credentials">
//             <h2>Vos identifiants de connexion</h2>
//             <p><strong>Email:</strong> ${params.email}</p>
//             <p><strong>Mot de passe temporaire:</strong> ${params.password}</p>
//             <p><em>Pour des raisons de sécurité, nous vous recommandons de changer votre mot de passe après votre première connexion.</em></p>
//           </div>

//           <a href="https://app.dixie-livreur.ma/login" class="button">Se connecter à l'application</a>
//         </div>

//         <div class="footer">
//           <p>Si vous avez des questions, n'hésitez pas à contacter notre équipe de support à <a href="mailto:support@dixie-livreur.ma">support@dixie-livreur.ma</a></p>
//           <p>© ${new Date().getFullYear()} Dixie Livreur. Tous droits réservés.</p>
//         </div>
//       </div>
//     </body>
//   </html>
//   `;
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
//     // console.log("email is " + deliveryman.email);

//     // Générer un mot de passe aléatoire
//     // const generatedPassword = generateRandomPassword();

//     // Hasher le mot de passe pour le stockage
//     // const hashedPassword = await hashPassword(generatedPassword);

//     // Mettre à jour le mot de passe du livreur dans Firebase
//     await updateDoc(deliverymanRef, {
//       updatedAt: new Date().toISOString(),
//     });

//     // Créer le HTML de l'email
//     const htmlContent = createApprovalEmailHTML({
//       firstName: deliveryman.firstName,
//       lastName: deliveryman.lastName,
//       email: deliveryman.email,
//       password: deliveryman.password,
//     });

//     // Envoyer l'email
//     console.log("from actions , email :" + deliveryman.email);
//     await resend.emails
//       .send({
//         from: "Dixie Livreur <no-reply@dixie.ma>",
//         to: deliveryman.email,
//         subject: "Bienvenue chez Dixie Livreur - Votre compte a été approuvé",
//         html: htmlContent,
//       })
//       .then((req) => {
//         console.log(req);
//       })
//       .catch((e) => {
//         console.log(e);
//       });

//     return { success: true };
//   } catch (error) {
//     console.error("Erreur lors de l'envoi de l'email d'approbation:", error);
//     return {
//       success: false,
//       error: "Échec de l'envoi de l'email d'approbation",
//     };
//   }
// }
