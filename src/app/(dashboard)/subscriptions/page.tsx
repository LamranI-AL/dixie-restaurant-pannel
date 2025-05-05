/** @format */

// app/subscription/page.tsx
import { Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function SubscriptionPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <div className="bg-blue-100 text-blue-800 p-4 rounded-full mb-4">
        <Gift className="w-10 h-10" />
      </div>
      <h1 className="text-3xl font-bold mb-2">Programme de fidélité DIXIE</h1>
      <p className="text-muted-foreground max-w-md mb-6">
        Cette page sera bientôt disponible <strong>inchallah</strong> pour nos
        abonnés fidèles du restaurant <strong>DIXIE</strong>. Restez connectés
        pour profiter de vos cartes de fidélité, réductions, et offres
        exclusives !
      </p>
      <Link href="/dashboard">
        <Button variant="outline">Retour à l'accueil</Button>
      </Link>
    </div>
  );
}
