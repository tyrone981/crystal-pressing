import { NextResponse } from "next/server";
import { z } from "zod";
import { query } from "@/lib/db";
import { hashSecret } from "@/lib/hash-pin";

interface UtilisateurPublic {
  id_utilisateur: number;
  nom: string;
  role: string;
}

export async function GET() {
  try {
    const utilisateurs = await query<UtilisateurPublic>(
      "SELECT id_utilisateur, nom, role FROM utilisateurs WHERE est_actif = TRUE ORDER BY role"
    );
    return NextResponse.json({ utilisateurs });
  } catch {
    return NextResponse.json(
      { error: "Base de données indisponible", utilisateurs: [] },
      { status: 500 }
    );
  }
}

const CreateUtilisateurSchema = z.object({
  nom: z.string().trim().min(2).max(60),
  role: z.enum(["RECEPTION", "LAVAGE", "REPASSAGE", "GERANT"]),
  code_pin: z.string().regex(/^\d{4,10}$/),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requete JSON invalide" }, { status: 400 });
  }

  const parsed = CreateUtilisateurSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const actifs = await query<{ total: number }>(
      "SELECT COUNT(*) AS total FROM utilisateurs WHERE est_actif = TRUE"
    );
    if (Number(actifs[0]?.total ?? 0) > 0) {
      return NextResponse.json(
        { error: "La création initiale est déjà terminée" },
        { status: 403 }
      );
    }

    const codePinHash = await hashSecret(parsed.data.code_pin);
    await query(
      "INSERT INTO utilisateurs (nom, role, code_pin_hash) VALUES (?, ?, ?)",
      [parsed.data.nom, parsed.data.role, codePinHash]
    );
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Impossible de créer le premier agent" },
      { status: 500 }
    );
  }
}
