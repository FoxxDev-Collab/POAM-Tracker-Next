import { NextRequest, NextResponse } from "next/server";
import { PoamComments } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const milestoneId = Number(id);
    if (!Number.isFinite(milestoneId)) {
      return NextResponse.json({ error: "Invalid milestone ID" }, { status: 400 });
    }
    
    const items = PoamComments.byMilestone(milestoneId);
    return NextResponse.json({ items });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to get milestone comments";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const milestoneId = Number(id);
    if (!Number.isFinite(milestoneId)) {
      return NextResponse.json({ error: "Invalid milestone ID" }, { status: 400 });
    }
    
    const body = await req.json();
    const comment = String(body?.comment ?? "").trim();
    const comment_type = body?.comment_type || "General";
    const poam_id = Number(body?.poam_id);
    const created_by = Number(body?.created_by ?? 1); // TODO: Get from auth
    
    if (!comment) {
      return NextResponse.json({ error: "Comment is required" }, { status: 400 });
    }
    
    if (!Number.isFinite(poam_id)) {
      return NextResponse.json({ error: "Valid poam_id is required" }, { status: 400 });
    }
    
    const created = PoamComments.create({
      poam_id,
      milestone_id: milestoneId,
      comment,
      comment_type,
      created_by
    });
    
    return NextResponse.json({ item: created }, { status: 201 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to create milestone comment";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}