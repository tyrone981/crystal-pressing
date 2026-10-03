import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { transaction } from "@/lib/db";
import { requireSession } from "@/lib/auth-guard";

const StatutSchema = z.object({
  statut_etape: z.enum(["RECEPTION", "LAVAGE", "REPASSAGE", "PRET", "LIVRE"]),
  observation: z.string().max(200).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireSession();
  if ("error" in guard) return guard.error;
  const { id } = await params;
  const body = await request.json();
  const parsed = StatutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { statut_etape, observation } = parsed.data;
  const id_utilisateur = guard.session.id_utilisateur;

  try {
    await transaction(async (conn) => {
      await conn.execute(
        "UPDATE articles_deposes SET statut_etape = ? WHERE id_article = ?",
        [statut_etape, id]
      );
      await conn.execute(
        `INSERT INTO etapes_article (etape, observation, id_article, id_utilisateur)
         VALUES (?, ?, ?, ?)`,
        [statut_etape, observation ?? null, id, id_utilisateur]
      );

      const [commandeRows] = await conn.execute(
        `SELECT ad.id_commande FROM articles_deposes ad WHERE ad.id_article = ?`,
        [id]
      );
      const idCommande = (commandeRows as { id_commande: number }[])[0]?.id_commande;

      if (idCommande) {
        const [tousArticles] = await conn.execute(
          `SELECT statut_etape FROM articles_deposes WHERE id_commande = ?`,
          [idCommande]
        );
        const statuts = (tousArticles as { statut_etape: string }[]).map((a) => a.statut_etape);
        const tousPrets = statuts.every((s) => s === "PRET" || s === "LIVRE");
        if (tousPrets) {
          await conn.execute(
            "UPDATE commandes SET statut_global = 'PRET' WHERE id_commande = ? AND statut_global != 'LIVRE'",
            [idCommande]
          );
        }
      }
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
