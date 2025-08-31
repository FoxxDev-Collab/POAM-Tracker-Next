import { NextRequest, NextResponse } from "next/server";
import { PoamMilestones } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const milestoneId = Number(id);
    if (!Number.isFinite(milestoneId)) {
      return NextResponse.json({ error: "Invalid milestone ID" }, { status: 400 });
    }
    
    const milestone = PoamMilestones.get(milestoneId);
    if (!milestone) {
      return NextResponse.json({ error: "Milestone not found" }, { status: 404 });
    }
    
    return NextResponse.json({ item: milestone });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to get milestone";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const milestoneId = Number(id);
    if (!Number.isFinite(milestoneId)) {
      return NextResponse.json({ error: "Invalid milestone ID" }, { status: 400 });
    }
    
    const body = await req.json();
    const updated = PoamMilestones.update(milestoneId, {
      title: body?.title,
      description: body?.description,
      target_date: body?.target_date,
      actual_date: body?.actual_date,
      status: body?.status,
      milestone_type: body?.milestone_type,
      deliverables: body?.deliverables,
      success_criteria: body?.success_criteria,
      assigned_user_id: body?.assigned_user_id ? Number(body.assigned_user_id) : null,
      completion_percentage: body?.completion_percentage ? Number(body.completion_percentage) : undefined
    });
    
    if (!updated) {
      return NextResponse.json({ error: "Milestone not found" }, { status: 404 });
    }
    
    return NextResponse.json({ item: updated });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to update milestone";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const milestoneId = Number(id);
    if (!Number.isFinite(milestoneId)) {
      return NextResponse.json({ error: "Invalid milestone ID" }, { status: 400 });
    }
    
    const body = await req.json();
    const updateData: Record<string, unknown> = {};
    
    // Only update fields that are provided
    if (body?.title !== undefined) updateData.title = body.title;
    if (body?.description !== undefined) updateData.description = body.description;
    if (body?.target_date !== undefined) updateData.target_date = body.target_date;
    if (body?.actual_date !== undefined) updateData.actual_date = body.actual_date;
    if (body?.status !== undefined) updateData.status = body.status;
    if (body?.milestone_type !== undefined) updateData.milestone_type = body.milestone_type;
    if (body?.deliverables !== undefined) updateData.deliverables = body.deliverables;
    if (body?.success_criteria !== undefined) updateData.success_criteria = body.success_criteria;
    if (body?.assigned_user_id !== undefined) updateData.assigned_user_id = body.assigned_user_id ? Number(body.assigned_user_id) : null;
    if (body?.completion_percentage !== undefined) updateData.completion_percentage = Number(body.completion_percentage);
    
    const updated = PoamMilestones.update(milestoneId, updateData);
    
    if (!updated) {
      return NextResponse.json({ error: "Milestone not found" }, { status: 404 });
    }
    
    return NextResponse.json({ item: updated });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to update milestone";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const milestoneId = Number(id);
    if (!Number.isFinite(milestoneId)) {
      return NextResponse.json({ error: "Invalid milestone ID" }, { status: 400 });
    }
    
    const success = PoamMilestones.remove(milestoneId);
    if (!success) {
      return NextResponse.json({ error: "Milestone not found" }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to delete milestone";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}