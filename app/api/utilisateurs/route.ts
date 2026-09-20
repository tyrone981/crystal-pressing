import { NextResponse } from "next/server";
import { query } from "@/lib/db";

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
  } catch (error) {
    console.error("Erreur /api/utilisateurs:", error);
    return NextResponse.json(
      { error: (error as Error).message, utilisateurs: [] },
      { status: 500 }
    );
  }
}
