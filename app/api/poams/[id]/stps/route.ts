import { NextRequest, NextResponse } from "next/server";
import { PoamStps } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const poamId = Number(id);
    if (!Number.isFinite(poamId)) {
      return NextResponse.json({ error: "Invalid POAM ID" }, { status: 400 });
    }
    
    const items = PoamStps.byPoam(poamId);
    return NextResponse.json({ items });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to get POAM STPs";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const poamId = Number(id);
    if (!Number.isFinite(poamId)) {
      return NextResponse.json({ error: "Invalid POAM ID" }, { status: 400 });
    }
    
    const body = await req.json();
    const stp_id = Number(body?.stp_id);
    const contribution_percentage = body?.contribution_percentage ? Number(body.contribution_percentage) : 100;
    
    if (!Number.isFinite(stp_id)) {
      return NextResponse.json({ error: "Valid stp_id is required" }, { status: 400 });
    }
    
    if (contribution_percentage < 0 || contribution_percentage > 100) {
      return NextResponse.json({ error: "Contribution percentage must be between 0 and 100" }, { status: 400 });
    }
    
    const created = PoamStps.create({
      poam_id: poamId,
      stp_id,
      contribution_percentage
    });
    
    return NextResponse.json({ item: created }, { status: 201 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to associate STP with POAM";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}