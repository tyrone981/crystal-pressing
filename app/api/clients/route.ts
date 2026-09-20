import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { query } from "@/lib/db";
import type { Client } from "@/lib/types";

const CreateClientSchema = z.object({
  nom_complet: z.string().min(2).max(100),
  telephone: z.string().regex(/^6\d{8}$/, "Le numéro doit commencer par 6 et contenir 9 chiffres"),
  quartier: z.string().max(100).optional(),
});

export async function GET(request: NextRequest) {
  const telephone = request.nextUrl.searchParams.get("telephone");
  if (!telephone) {
    return NextResponse.json({ error: "Paramètre telephone requis" }, { status: 400 });
  }
  const rows = await query<Client>(
    "SELECT * FROM clients WHERE telephone LIKE ? ORDER BY date_creation DESC LIMIT 10",
    [`%${telephone}%`]
  );
  return NextResponse.json({ clients: rows });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = CreateClientSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { nom_complet, telephone, quartier } = parsed.data;
  try {
    const result = await query<{ insertId: number }>(
      "INSERT INTO clients (nom_complet, telephone, quartier) VALUES (?, ?, ?)",
      [nom_complet, telephone, quartier ?? "Douala"]
    );
    return NextResponse.json({ id_client: (result as unknown as { insertId: number }).insertId });
  } catch (error) {
    const message = (error as { code?: string }).code === "ER_DUP_ENTRY"
      ? "Ce numéro de téléphone existe déjà"
      : "Erreur lors de la création du client";
    return NextResponse.json({ error: message }, { status: 409 });
  }
}