import { NextRequest, NextResponse } from "next/server";
import { PoamStps } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string; stpId: string }> }) {
  try {
    const { id, stpId } = await params;
    const poamId = Number(id);
    const stpIdNum = Number(stpId);
    
    if (!Number.isFinite(poamId) || !Number.isFinite(stpIdNum)) {
      return NextResponse.json({ error: "Invalid POAM ID or STP ID" }, { status: 400 });
    }
    
    const association = PoamStps.get(poamId, stpIdNum);
    if (!association) {
      return NextResponse.json({ error: "POAM-STP association not found" }, { status: 404 });
    }
    
    return NextResponse.json({ item: association });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to get POAM-STP association";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string; stpId: string }> }) {
  try {
    const { id, stpId } = await params;
    const poamId = Number(id);
    const stpIdNum = Number(stpId);
    
    if (!Number.isFinite(poamId) || !Number.isFinite(stpIdNum)) {
      return NextResponse.json({ error: "Invalid POAM ID or STP ID" }, { status: 400 });
    }
    
    const body = await req.json();
    const contribution_percentage = Number(body?.contribution_percentage ?? 100);
    
    if (contribution_percentage < 0 || contribution_percentage > 100) {
      return NextResponse.json({ error: "Contribution percentage must be between 0 and 100" }, { status: 400 });
    }
    
    const updated = PoamStps.update(poamId, stpIdNum, contribution_percentage);
    
    if (!updated) {
      return NextResponse.json({ error: "POAM-STP association not found" }, { status: 404 });
    }
    
    return NextResponse.json({ item: updated });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to update POAM-STP association";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string; stpId: string }> }) {
  try {
    const { id, stpId } = await params;
    const poamId = Number(id);
    const stpIdNum = Number(stpId);
    
    if (!Number.isFinite(poamId) || !Number.isFinite(stpIdNum)) {
      return NextResponse.json({ error: "Invalid POAM ID or STP ID" }, { status: 400 });
    }
    
    const success = PoamStps.remove(poamId, stpIdNum);
    if (!success) {
      return NextResponse.json({ error: "POAM-STP association not found" }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to remove POAM-STP association";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}