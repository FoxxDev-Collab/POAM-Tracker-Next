import { NextRequest, NextResponse } from "next/server";
import { POAMs } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const poamId = Number(id);
    if (!Number.isFinite(poamId)) {
      return NextResponse.json({ error: "Invalid POAM ID" }, { status: 400 });
    }
    
    const poam = POAMs.get(poamId);
    if (!poam) {
      return NextResponse.json({ error: "POAM not found" }, { status: 404 });
    }
    
    return NextResponse.json({ item: poam });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to get POAM";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const poamId = Number(id);
    if (!Number.isFinite(poamId)) {
      return NextResponse.json({ error: "Invalid POAM ID" }, { status: 400 });
    }
    
    const body = await req.json();
    const updated = POAMs.update(poamId, {
      title: body?.title,
      weakness_description: body?.weakness_description,
      nist_control_id: body?.nist_control_id,
      severity: body?.severity,
      status: body?.status,
      priority: body?.priority,
      residual_risk_level: body?.residual_risk_level,
      target_completion_date: body?.target_completion_date,
      actual_completion_date: body?.actual_completion_date,
      estimated_cost: body?.estimated_cost ? Number(body.estimated_cost) : undefined,
      actual_cost: body?.actual_cost ? Number(body.actual_cost) : undefined,
      poc_name: body?.poc_name,
      poc_email: body?.poc_email,
      poc_phone: body?.poc_phone,
      assigned_team_id: body?.assigned_team_id ? Number(body.assigned_team_id) : null
    });
    
    if (!updated) {
      return NextResponse.json({ error: "POAM not found" }, { status: 404 });
    }
    
    return NextResponse.json({ item: updated });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to update POAM";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const poamId = Number(id);
    if (!Number.isFinite(poamId)) {
      return NextResponse.json({ error: "Invalid POAM ID" }, { status: 400 });
    }
    
    const body = await req.json();
    const updateData: Record<string, unknown> = {};
    
    // Only update fields that are provided
    if (body?.title !== undefined) updateData.title = body.title;
    if (body?.weakness_description !== undefined) updateData.weakness_description = body.weakness_description;
    if (body?.nist_control_id !== undefined) updateData.nist_control_id = body.nist_control_id;
    if (body?.severity !== undefined) updateData.severity = body.severity;
    if (body?.status !== undefined) updateData.status = body.status;
    if (body?.priority !== undefined) updateData.priority = body.priority;
    if (body?.residual_risk_level !== undefined) updateData.residual_risk_level = body.residual_risk_level;
    if (body?.target_completion_date !== undefined) updateData.target_completion_date = body.target_completion_date;
    if (body?.actual_completion_date !== undefined) updateData.actual_completion_date = body.actual_completion_date;
    if (body?.estimated_cost !== undefined) updateData.estimated_cost = body.estimated_cost ? Number(body.estimated_cost) : null;
    if (body?.actual_cost !== undefined) updateData.actual_cost = body.actual_cost ? Number(body.actual_cost) : null;
    if (body?.poc_name !== undefined) updateData.poc_name = body.poc_name;
    if (body?.poc_email !== undefined) updateData.poc_email = body.poc_email;
    if (body?.poc_phone !== undefined) updateData.poc_phone = body.poc_phone;
    if (body?.assigned_team_id !== undefined) updateData.assigned_team_id = body.assigned_team_id ? Number(body.assigned_team_id) : null;
    
    const updated = POAMs.update(poamId, updateData);
    
    if (!updated) {
      return NextResponse.json({ error: "POAM not found" }, { status: 404 });
    }
    
    return NextResponse.json({ item: updated });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to update POAM";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const poamId = Number(id);
    if (!Number.isFinite(poamId)) {
      return NextResponse.json({ error: "Invalid POAM ID" }, { status: 400 });
    }
    
    const success = POAMs.remove(poamId);
    if (!success) {
      return NextResponse.json({ error: "POAM not found" }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to delete POAM";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}