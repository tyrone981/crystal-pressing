import { query } from "@/lib/db";

export async function genererCodeTicket(): Promise<string> {
  const annee = new Date().getFullYear();
  const rows = await query<{ total: number }>(
    "SELECT COUNT(*) AS total FROM commandes WHERE YEAR(date_depot) = ?",
    [annee]
  );
  const numero = (rows[0].total + 1).toString().padStart(4, "0");
  return `TK-${annee}-${numero}`;
}

export function genererCodeRetrait(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}