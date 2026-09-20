import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { transaction } from "@/lib/db";

const PaiementSchema = z.object({
  montant_cfa: z.number().min(1),
  mode_reglement: z.enum(["ESPECES", "MOMO_MARCHAND", "OM_MARCHAND"]),
  reference_transaction: z.string().max(60).optional(),
  id_utilisateur: z.number(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const parsed = PaiementSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  try {
    await transaction(async (conn) => {
      const [commandeRows] = await conn.execute(
        "SELECT montant_total_cfa FROM commandes WHERE id_commande = ?",
        [id]
      );
      const commande = (commandeRows as { montant_total_cfa: number }[])[0];
      if (!commande) throw new Error("Commande introuvable");

      const [paiementsRows] = await conn.execute(
        "SELECT COALESCE(SUM(montant_cfa), 0) AS total FROM paiements WHERE id_commande = ?",
        [id]
      );
      const dejaPaye = Number((paiementsRows as { total: number }[])[0].total);
      const montantTotal = Number(commande.montant_total_cfa);

      if (dejaPaye + data.montant_cfa > montantTotal) {
        throw new Error(`Ce paiement depasse le montant restant (reste ${montantTotal - dejaPaye} FCFA)`);
      }

      await conn.execute(
        `INSERT INTO paiements (montant_cfa, mode_reglement, reference_transaction, id_commande, id_utilisateur)
         VALUES (?, ?, ?, ?, ?)`,
        [data.montant_cfa, data.mode_reglement, data.reference_transaction ?? null, id, data.id_utilisateur]
      );
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
