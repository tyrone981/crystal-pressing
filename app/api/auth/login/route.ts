import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { query } from "@/lib/db";
import { verifierSecret } from "@/lib/hash-pin";

const LoginSchema = z.object({
  id_utilisateur: z.number(),
  code_pin: z.string().min(4).max(10),
});

interface UtilisateurRow {
  id_utilisateur: number;
  nom: string;
  role: string;
  code_pin_hash: string;
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = LoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Requete invalide" }, { status: 400 });
  }

  const rows = await query<UtilisateurRow>(
    "SELECT id_utilisateur, nom, role, code_pin_hash FROM utilisateurs WHERE id_utilisateur = ? AND est_actif = TRUE",
    [parsed.data.id_utilisateur]
  );
  const utilisateur = rows[0];
  if (!utilisateur) {
    return NextResponse.json({ error: "Agent introuvable" }, { status: 401 });
  }

  const valide = await verifierSecret(parsed.data.code_pin, utilisateur.code_pin_hash);
  if (!valide) {
    return NextResponse.json({ error: "Code PIN incorrect" }, { status: 401 });
  }

  const response = NextResponse.json({
    id_utilisateur: utilisateur.id_utilisateur,
    nom: utilisateur.nom,
    role: utilisateur.role,
  });
  response.cookies.set(
    "session",
    JSON.stringify({
      id_utilisateur: utilisateur.id_utilisateur,
      nom: utilisateur.nom,
      role: utilisateur.role,
    }),
    {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 12,
      path: "/",
    }
  );
  return response;
}
