/** @format */

// pages/api/auth/user.ts
import { initializeFirebaseAdmin } from "@/lib/firebase/initializeFirebaseAdmin ";
import type { NextApiRequest, NextApiResponse } from "next";
// import { initializeFirebaseAdmin } from "@/utils/firebase-admin";

interface UserData {
  uid: string;
  email: string | null;
  emailVerified: boolean;
  displayName: string | null;
  photoURL: string | null;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UserData | { error: string }>,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  try {
    // Récupérer le cookie de session
    const sessionCookie = req.cookies.session;

    if (!sessionCookie) {
      return res.status(401).json({ error: "Non authentifié" });
    }

    // Initialiser Firebase Admin
    const { auth } = initializeFirebaseAdmin();

    // Vérifier le cookie de session
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);

    // Récupérer les données utilisateur
    const user = await auth.getUser(decodedClaims.uid);

    // Renvoyer les informations utilisateur (sans données sensibles)
    return res.status(200).json({
      uid: user.uid,
      email: user.email!,
      emailVerified: user.emailVerified,
      displayName: user.displayName!,
      photoURL: user.photoURL!,
    });
  } catch (error) {
    console.error("Erreur de vérification de session:", error);
    return res.status(401).json({ error: "Non authentifié" });
  }
}
