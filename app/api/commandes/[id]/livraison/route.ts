import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { transaction } from "@/lib/db";
import { verifierSecret } from "@/lib/hash-pin";

const LivraisonSchema = z.object({
  code_retrait: z.string().min(4).max(6),
  retire_par: z.string().max(100).optional(),
  derogation_gerant: z.boolean().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const parsed = LivraisonSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  try {
    const resultat = await transaction(async (conn) => {
      const [commandeRows] = await conn.execute(
        "SELECT code_retrait_hash, montant_total_cfa FROM commandes WHERE id_commande = ?",
        [id]
      );
      const commande = (commandeRows as { code_retrait_hash: string; montant_total_cfa: number }[])[0];
      if (!commande) throw new Error("Commande introuvable");

      const codeValide = await verifierSecret(data.code_retrait, commande.code_retrait_hash);
      if (!codeValide) throw new Error("Code de retrait incorrect");

      const [accessoiresNonRestitues] = await conn.execute(
        `SELECT acc.id_accessoire FROM accessoires acc
         JOIN articles_deposes ad ON ad.id_article = acc.id_article
         WHERE ad.id_commande = ? AND acc.est_restitue = FALSE`,
        [id]
      );
      if ((accessoiresNonRestitues as unknown[]).length > 0) {
        throw new Error("Des accessoires n'ont pas ete confirmes comme restitues (RG-15)");
      }

      const [paiementsRows] = await conn.execute(
        "SELECT COALESCE(SUM(montant_cfa), 0) AS total FROM paiements WHERE id_commande = ?",
        [id]
      );
      const totalPaye = Number((paiementsRows as { total: number }[])[0].total);
      const resteAPayer = Number(commande.montant_total_cfa) - totalPaye;

      if (resteAPayer > 0 && !data.derogation_gerant) {
        throw new Error(`Solde restant de ${resteAPayer} FCFA - derogation gerant requise (RG-14)`);
      }

      await conn.execute(
        `UPDATE commandes SET statut_global = 'LIVRE', date_retrait_reel = NOW(), retire_par = ? WHERE id_commande = ?`,
        [data.retire_par ?? null, id]
      );
      await conn.execute(
        `UPDATE articles_deposes SET statut_etape = 'LIVRE' WHERE id_commande = ?`,
        [id]
      );

      return { reste_a_payer: resteAPayer };
    });

    return NextResponse.json({ ok: true, ...resultat });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
