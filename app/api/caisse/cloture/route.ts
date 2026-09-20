import { NextResponse } from "next/server";
import { query } from "@/lib/db";

interface LigneCloture {
  mode_reglement: string;
  nombre: number;
  total_cfa: number;
}

export async function GET() {
  const lignes = await query<LigneCloture>(
    `SELECT mode_reglement, COUNT(*) AS nombre, SUM(montant_cfa) AS total_cfa
     FROM paiements
     WHERE DATE(date_paiement) = CURDATE()
     GROUP BY mode_reglement`
  );
  return NextResponse.json({ lignes });
}
