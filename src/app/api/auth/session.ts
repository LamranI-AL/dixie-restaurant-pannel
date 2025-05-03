/** @format */

// pages/api/auth/session.ts
import { initializeFirebaseAdmin } from "@/lib/firebase/initializeFirebaseAdmin ";
import { NextApiRequest, NextApiResponse } from "next";
// import { initializeFirebaseAdmin } from "@/utils/firebase-admin";

// Durée de vie du cookie en secondes (ici 2 semaines)
const COOKIE_EXPIRES_IN = 60 * 60 * 24 * 14;

interface SessionRequest extends NextApiRequest {
  body: {
    idToken: string;
  };
}

export default async function handler(
  req: SessionRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ error: "Token manquant" });
    }

    // Initialiser Firebase Admin
    const { auth } = initializeFirebaseAdmin();

    // Créer un cookie de session
    const sessionCookie = await auth.createSessionCookie(idToken, {
      expiresIn: COOKIE_EXPIRES_IN * 1000, // Firebase utilise des millisecondes
    });

    // Configurer les options du cookie
    const options = {
      maxAge: COOKIE_EXPIRES_IN,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "strict",
    };

    // Définir le cookie de session
    res.setHeader(
      "Set-Cookie",
      `session=${sessionCookie}; ${Object.entries(options)
        .map(([key, value]) => `${key}=${value}`)
        .join("; ")}`,
    );

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Erreur de création de session:", error);
    return res.status(401).json({ error: "Session non autorisée" });
  }
}
