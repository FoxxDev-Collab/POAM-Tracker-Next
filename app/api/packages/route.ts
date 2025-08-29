import { NextRequest, NextResponse } from "next/server";
import { Packages } from "@/lib/db";

export async function GET() {
  try {
    const items = Packages.all();
    return NextResponse.json({ items });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to list";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = String(body?.name ?? "").trim();
    const description = String(body?.description ?? "");
    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });
    const created = Packages.create({ name, description });
    return NextResponse.json({ item: created }, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed to create";
    const status = /UNIQUE/.test(msg) ? 409 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
