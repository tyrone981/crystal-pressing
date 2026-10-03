import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireSession } from "@/lib/auth-guard";

interface CommandeRecherche {
  id_commande: number;
  code_ticket: string;
  date_depot: Date;
  date_retrait_prevue: Date;
  statut_global: string;
  montant_total_cfa: number;
  nom_client: string;
  telephone: string;
}

export async function GET(request: NextRequest) {
  const guard = await requireSession();
  if ("error" in guard) return guard.error;

  const recherche = request.nextUrl.searchParams.get("q");
  if (!recherche) {
    return NextResponse.json({ commandes: [] });
  }

  const commandes = await query<CommandeRecherche>(
    `SELECT
      c.id_commande, c.code_ticket, c.date_depot, c.date_retrait_prevue,
      c.statut_global, c.montant_total_cfa,
      cl.nom_complet AS nom_client, cl.telephone
     FROM commandes c
     JOIN clients cl ON cl.id_client = c.id_client
     WHERE c.code_ticket LIKE ? OR cl.telephone LIKE ?
     ORDER BY c.date_depot DESC
     LIMIT 20`,
    [`%${recherche}%`, `%${recherche}%`]
  );
  return NextResponse.json({ commandes });
}
