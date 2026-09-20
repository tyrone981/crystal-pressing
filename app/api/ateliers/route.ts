import { NextResponse } from "next/server";
import { query } from "@/lib/db";

interface ArticleKanban {
  id_article: number;
  couleur: string;
  statut_etape: string;
  etat_initial: string | null;
  code_ticket: string;
  libelle_type: string;
  nom_client: string;
}

export async function GET() {
  const articles = await query<ArticleKanban>(
    `SELECT
      a.id_article, a.couleur, a.statut_etape, a.etat_initial,
      c.code_ticket, t.libelle AS libelle_type, cl.nom_complet AS nom_client
     FROM articles_deposes a
     JOIN commandes c ON c.id_commande = a.id_commande
     JOIN types_vetement t ON t.id_type = a.id_type
     JOIN clients cl ON cl.id_client = c.id_client
     WHERE a.statut_etape IN ("RECEPTION", "LAVAGE", "REPASSAGE", "PRET")
     ORDER BY c.date_depot ASC`
  );
  return NextResponse.json({ articles });
}
