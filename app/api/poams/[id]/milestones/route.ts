import { NextRequest, NextResponse } from "next/server";
import { PoamMilestones } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const poamId = Number(id);
    if (!Number.isFinite(poamId)) {
      return NextResponse.json({ error: "Invalid POAM ID" }, { status: 400 });
    }
    
    const items = PoamMilestones.byPoam(poamId);
    return NextResponse.json({ items });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to get POAM milestones";
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
    const title = String(body?.title ?? "").trim();
    const description = body?.description || "";
    const target_date = body?.target_date || undefined;
    const milestone_type = body?.milestone_type || "Implementation";
    const deliverables = body?.deliverables || "";
    const success_criteria = body?.success_criteria || "";
    const assigned_user_id = body?.assigned_user_id ? Number(body.assigned_user_id) : undefined;
    
    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    
    const created = PoamMilestones.create({
      poam_id: poamId,
      title,
      description,
      target_date,
      milestone_type,
      deliverables,
      success_criteria,
      assigned_user_id
    });
    
    return NextResponse.json({ item: created }, { status: 201 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to create milestone";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}