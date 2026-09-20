import { NextResponse } from "next/server";
import { query } from "@/lib/db";

interface LigneCanal {
  mode_reglement: string;
  nombre: number;
  total_cfa: number;
}

interface StatutCompte {
  statut_global: string;
  nombre: number;
}

interface CommandeSouffrance {
  id_commande: number;
  code_ticket: string;
  nom_complet: string;
  telephone: string;
  date_depot: string;
  date_retrait_prevue: string;
  montant_total_cfa: number;
  jours_ecoules: number;
}

export async function GET() {
  const encaissementsJour = await query<LigneCanal>(
    `SELECT mode_reglement, COUNT(*) AS nombre, SUM(montant_cfa) AS total_cfa
     FROM paiements
     WHERE DATE(date_paiement) = CURDATE()
     GROUP BY mode_reglement`
  );

  const statutsCommandes = await query<StatutCompte>(
    `SELECT statut_global, COUNT(*) AS nombre
     FROM commandes
     GROUP BY statut_global`
  );

  const enSouffrance = await query<CommandeSouffrance>(
    `SELECT
      c.id_commande, c.code_ticket, cl.nom_complet, cl.telephone,
      c.date_depot, c.date_retrait_prevue, c.montant_total_cfa,
      DATEDIFF(NOW(), c.date_depot) AS jours_ecoules
     FROM commandes c
     JOIN clients cl ON cl.id_client = c.id_client
     WHERE c.statut_global IN ('PRET', 'EN_COURS')
       AND DATEDIFF(NOW(), c.date_depot) > 30
     ORDER BY jours_ecoules DESC`
  );

  const commandesDuJour = await query<{ total: number }>(
    `SELECT COUNT(*) AS total FROM commandes WHERE DATE(date_depot) = CURDATE()`
  );

  return NextResponse.json({
    encaissementsJour,
    statutsCommandes,
    enSouffrance,
    commandesDuJour: commandesDuJour[0]?.total ?? 0,
  });
}
