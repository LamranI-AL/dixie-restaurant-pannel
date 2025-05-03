/** @format */

// pages/api/auth/logout.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  // Supprimer le cookie de session
  res.setHeader(
    "Set-Cookie",
    "session=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict",
  );

  return res.status(200).json({ success: true });
}
