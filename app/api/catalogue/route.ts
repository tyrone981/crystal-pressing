import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import type { TypeVetement, Service } from "@/lib/types";

export async function GET() {
  const [types, services] = await Promise.all([
    query<TypeVetement>(
      "SELECT * FROM types_vetement WHERE est_actif = TRUE ORDER BY categorie, libelle"
    ),
    query<Service>(
      "SELECT * FROM services WHERE est_actif = TRUE ORDER BY nom_service"
    ),
  ]);
  return NextResponse.json({ types, services });
}