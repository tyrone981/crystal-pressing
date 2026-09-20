import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const commandeRows = await query(
    `SELECT c.*, cl.nom_complet, cl.telephone
     FROM commandes c
     JOIN clients cl ON cl.id_client = c.id_client
     WHERE c.id_commande = ?`,
    [id]
  );
  const commande = commandeRows[0] as Record<string, unknown> | undefined;
  if (!commande) {
    return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
  }

  const articles = await query(
    `SELECT a.*, t.libelle AS libelle_type, s.nom_service
     FROM articles_deposes a
     JOIN types_vetement t ON t.id_type = a.id_type
     JOIN services s ON s.id_service = a.id_service
     WHERE a.id_commande = ?`,
    [id]
  );

  const articleIds = (articles as { id_article: number }[]).map((a) => a.id_article);
  const accessoires =
    articleIds.length > 0
      ? await query(
          `SELECT * FROM accessoires WHERE id_article IN (${articleIds.map(() => "?").join(",")})`,
          articleIds
        )
      : [];

  const paiements = await query(
    `SELECT * FROM paiements WHERE id_commande = ? ORDER BY date_paiement ASC`,
    [id]
  );

  const totalPaye = (paiements as { montant_cfa: number }[]).reduce(
    (sum, p) => sum + Number(p.montant_cfa),
    0
  );

  return NextResponse.json({
    commande,
    articles,
    accessoires,
    paiements,
    reste_a_payer: Number(commande.montant_total_cfa) - totalPaye,
  });
}
