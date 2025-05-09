/** @format */

import React, { ReactNode } from "react";

// Define a specific return type for the function
export const formatDate = (date: Date): ReactNode => {
  // Gérer différents types de dates possibles à partir de Firebase
  let d: Date;

  if (!date) {
    return (
      <div>
        <div>Date non disponible</div>
        <div className="text-muted-foreground text-xs">--:-- --</div>
      </div>
    );
  }

  // Si c'est un Timestamp Firebase (avec méthode toDate())
  if (
    date &&
    typeof date === "object" &&
    "toDate" in date &&
    typeof date.toDate === "function"
  ) {
    d = date.toDate();
  }
  // Si c'est déjà un objet Date
  else if (date instanceof Date) {
    d = date;
  }
  // Si c'est une chaîne ou un nombre
  else if (typeof date === "string" || typeof date === "number") {
    d = new Date(date);
  }
  // Gestion des cas imprévus
  else {
    return (
      <div>
        <div>Format de date invalide</div>
        <div className="text-muted-foreground text-xs">--:-- --</div>
        {/* <div className="text-muted-foreground text-xs">{.toUTCString()}</div> */}
      </div>
    );
  }

  // Formatage de la date
  const day = d.getDate().toString().padStart(2, "0");
  const month = new Intl.DateTimeFormat("fr", { month: "short" }).format(d);
  const year = d.getFullYear();
  const hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 || 12;

  return (
    <div>
      <div>{`${day} ${month} ${year}`}</div>
      <div className="text-muted-foreground text-xs">{`${formattedHours}:${minutes} ${ampm}`}</div>
    </div>
  );
};
