/** @format */

// utils/firebase-admin.ts
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
// import serviceAccount from "../../dixieapp-bcb6b-firebase-adminsdk-fbsvc-7e0b5e8ec0.json";
// Pour ajouter le typage correct au fichier de configuration
interface ServiceAccount {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
  universe_domain?: string;
}

export const initializeFirebaseAdmin = () => {
  if (getApps().length === 0) {
    initializeApp({
      credential: cert("serviceAccount" as any),
    });
  }
  return { auth: getAuth() };
};
