import { NextResponse } from "next/server";
import { getSession, type Session } from "@/lib/session";

export async function requireSession(): Promise<
  { session: Session } | { error: NextResponse }
> {
  const session = await getSession();
  if (!session) {
    return {
      error: NextResponse.json({ error: "Non autorise" }, { status: 401 }),
    };
  }
  return { session };
}

export async function requireManager(): Promise<
  { session: Session } | { error: NextResponse }
> {
  const result = await requireSession();
  if ("error" in result) return result;
  if (result.session.role !== "GERANT") {
    return {
      error: NextResponse.json(
        { error: "Reserve au gerant" },
        { status: 403 }
      ),
    };
  }
  return result;
}
