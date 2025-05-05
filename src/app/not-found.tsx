/** @format */

// app/not-found.tsx
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <div className="bg-yellow-100 text-yellow-800 p-4 rounded-full mb-4">
        <AlertTriangle className="w-10 h-10" />
      </div>
      <h1 className="text-3xl font-bold mb-2">
        Page en cours de développement
      </h1>
      <p className="text-muted-foreground max-w-md mb-6">
        Cette page n'est pas encore prête, mais elle sera bientôt disponible{" "}
        <strong>inchallah</strong>. Merci pour votre patience 🙏
      </p>
      <Link href="/dashboard">
        <Button variant="outline">Retour à l'accueil</Button>
      </Link>
    </div>
  );
}
