import { NextRequest, NextResponse } from "next/server";
import { getRequestUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const me = getRequestUser(req);
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(me);
}
