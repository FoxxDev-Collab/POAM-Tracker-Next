import { NextRequest, NextResponse } from "next/server";
import { Packages } from "@/lib/db";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: pid } = await params;
    const id = Number(pid);
    const item = Packages.get(id);
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ item });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to get";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: pid } = await params;
    const id = Number(pid);
    const body = await req.json();
    
    const updated = Packages.update(id, {
      name: body?.name,
      description: body?.description,
      team_id: body?.team_id,
      system_type: body?.system_type,
      confidentiality_impact: body?.confidentiality_impact,
      integrity_impact: body?.integrity_impact,
      availability_impact: body?.availability_impact,
      overall_categorization: body?.overall_categorization,
      authorization_status: body?.authorization_status,
      authorization_date: body?.authorization_date,
      authorization_expiry: body?.authorization_expiry,
      risk_assessment_date: body?.risk_assessment_date,
      residual_risk_level: body?.residual_risk_level,
      mission_criticality: body?.mission_criticality,
      data_classification: body?.data_classification,
      system_owner: body?.system_owner,
      authorizing_official: body?.authorizing_official,
      isso_name: body?.isso_name,
      security_control_baseline: body?.security_control_baseline,
      poam_status: body?.poam_status,
      continuous_monitoring_status: body?.continuous_monitoring_status,
    });
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ item: updated });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed to update";
    const status = /UNIQUE/.test(msg) ? 409 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: pid } = await params;
    const id = Number(pid);
    const ok = Packages.remove(id);
    if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to delete";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
