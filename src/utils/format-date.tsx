/** @format */

import React from "react";

/**
 * Formate une date au format "updatedAt[jour] [mois] [année] à [heure]:[minute]:[seconde] [timezone]"
 * @param date - La date à formater (Date, Timestamp, string, number)
 * @returns Un élément React formatant la date
 */
export const formatDate = (date: any): React.ReactNode => {
  console.log("Valeur reçue:", date, "Type:", typeof date);

  // Vérification plus précise des valeurs null/undefined/falsy
  if (date === null || date === undefined) {
    console.log("Date est null ou undefined");
    return <span>Date non disponible (null/undefined)</span>;
  }

  let d: Date;

  try {
    // Si c'est un Timestamp Firebase (avec méthode toDate())
    if (
      typeof date === "object" &&
      date !== null &&
      "toDate" in date &&
      typeof date.toDate === "function"
    ) {
      console.log("Conversion depuis Timestamp Firebase");
      d = date.toDate();
    }
    // Si c'est déjà un objet Date
    else if (date instanceof Date) {
      console.log("Déjà un objet Date");
      d = date;
    }
    // Si c'est une chaîne ou un nombre
    else if (typeof date === "string" || typeof date === "number") {
      console.log("Conversion depuis string/number:", date);
      d = new Date(date);
    }
    // Gestion des cas imprévus
    else {
      console.log("Format inconnu:", date);
      return <span>Format de date invalide (type: {typeof date})</span>;
    }

    // Vérification que la date est valide
    if (isNaN(d.getTime())) {
      console.log("Date invalide après conversion:", d);
      return <span>Date invalide après conversion</span>;
    }

    console.log("Date convertie avec succès:", d);

    // Formatage manuel pour plus de contrôle
    const jour = d.getDate().toString().padStart(2, "0");

    // Tableau des mois en français
    const mois = [
      "janvier",
      "février",
      "mars",
      "avril",
      "mai",
      "juin",
      "juillet",
      "août",
      "septembre",
      "octobre",
      "novembre",
      "décembre",
    ];

    const annee = d.getFullYear();
    const heure = d.getHours().toString().padStart(2, "0");
    const minute = d.getMinutes().toString().padStart(2, "0");
    const seconde = d.getSeconds().toString().padStart(2, "0");

    // Calcul du fuseau horaire
    const timeZoneOffset = d.getTimezoneOffset() * -1; // Convertir en format positif/négatif standard
    const offsetHours = Math.floor(Math.abs(timeZoneOffset) / 60);
    const offsetSign = timeZoneOffset >= 0 ? "+" : "-";

    const timeZoneString = `UTC${offsetSign}${offsetHours}`;

    // Construction du format final
    return (
      <span>
        {jour} {mois[d.getMonth()]} {annee} à {heure}:{minute}:{seconde}{" "}
        {/* {timeZoneString} */}
      </span>
    );
  } catch (error) {
    console.error("Erreur lors du formatage de la date:", error);
    return <span>Erreur de formatage: {String(error)}</span>;
  }
};
