/** @format */

import { getPendingDeliverymen } from "@/actions/deliveryman";
import { PendingDeliverymenTable } from "@/components/dashboard/deliveryman/approved-list-deliverymen";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Deliveryman } from "@/lib/types";
import { UsersRound } from "lucide-react";
import React from "react";

async function PendingDeliverymenPage() {
  const result = await getPendingDeliverymen();
  const deliverymen = result.success ? result.deliverymen : [];

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Approbation des livreurs</h1>
        <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
          <UsersRound className="w-4 h-4 mr-2" />
          {deliverymen?.length} candidature(s) en attente
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Candidatures en attente</CardTitle>
          <CardDescription>
            Consultez et gérez les candidatures des livreurs qui souhaitent
            rejoindre la plateforme. Vous pouvez consulter les détails,
            approuver ou refuser chaque candidature.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PendingDeliverymenTable data={deliverymen as Deliveryman[]} />
        </CardContent>
      </Card>
    </div>
  );
}

export default PendingDeliverymenPage;
