import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await query("UPDATE accessoires SET est_restitue = TRUE WHERE id_accessoire = ?", [id]);
  return NextResponse.json({ ok: true });
}
