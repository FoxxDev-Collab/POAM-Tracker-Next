import { NextRequest, NextResponse } from "next/server";
import { STPs } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const stpId = Number(id);
    if (!Number.isFinite(stpId)) {
      return NextResponse.json({ error: "Invalid STP ID" }, { status: 400 });
    }
    
    const stp = STPs.get(stpId);
    if (!stp) {
      return NextResponse.json({ error: "STP not found" }, { status: 404 });
    }
    
    return NextResponse.json({ item: stp });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to get STP";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const stpId = Number(id);
    if (!Number.isFinite(stpId)) {
      return NextResponse.json({ error: "Invalid STP ID" }, { status: 400 });
    }
    
    const body = await req.json();
    const updated = STPs.update(stpId, {
      title: body?.title,
      description: body?.description,
      status: body?.status,
      priority: body?.priority,
      assigned_team_id: body?.assigned_team_id,
      due_date: body?.due_date
    });
    
    if (!updated) {
      return NextResponse.json({ error: "STP not found" }, { status: 404 });
    }
    
    return NextResponse.json({ item: updated });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to update STP";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const stpId = Number(id);
    if (!Number.isFinite(stpId)) {
      return NextResponse.json({ error: "Invalid STP ID" }, { status: 400 });
    }
    
    const body = await req.json();
    const updateData: Record<string, unknown> = {};
    
    // Only update fields that are provided
    if (body?.status !== undefined) updateData.status = body.status;
    if (body?.priority !== undefined) updateData.priority = body.priority;
    if (body?.title !== undefined) updateData.title = body.title;
    if (body?.description !== undefined) updateData.description = body.description;
    if (body?.due_date !== undefined) updateData.due_date = body.due_date;
    
    const updated = STPs.update(stpId, updateData);
    
    if (!updated) {
      return NextResponse.json({ error: "STP not found" }, { status: 404 });
    }
    
    return NextResponse.json({ item: updated });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to update STP";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const stpId = Number(id);
    if (!Number.isFinite(stpId)) {
      return NextResponse.json({ error: "Invalid STP ID" }, { status: 400 });
    }
    
    const success = STPs.remove(stpId);
    if (!success) {
      return NextResponse.json({ error: "STP not found" }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to delete STP";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
