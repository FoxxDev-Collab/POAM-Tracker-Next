import { NextRequest, NextResponse } from "next/server";
import { POAMs } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const packageId = searchParams.get("package_id");
    const groupId = searchParams.get("group_id");
    
    let items;
    if (packageId) {
      items = POAMs.byPackage(Number(packageId));
    } else if (groupId) {
      items = POAMs.byGroup(Number(groupId));
    } else {
      items = POAMs.all();
    }
    
    return NextResponse.json({ items });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to list POAMs";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const package_id = Number(body?.package_id);
    const group_id = body?.group_id ? Number(body.group_id) : undefined;
    const title = String(body?.title ?? "").trim();
    const weakness_description = body?.weakness_description || undefined;
    const nist_control_id = body?.nist_control_id || undefined;
    const severity = body?.severity || "Medium";
    const priority = body?.priority || "Medium";
    const residual_risk_level = body?.residual_risk_level || undefined;
    const target_completion_date = body?.target_completion_date || undefined;
    const estimated_cost = body?.estimated_cost ? Number(body.estimated_cost) : undefined;
    const poc_name = body?.poc_name || undefined;
    const poc_email = body?.poc_email || undefined;
    const poc_phone = body?.poc_phone || undefined;
    const assigned_team_id = body?.assigned_team_id ? Number(body.assigned_team_id) : undefined;
    const created_by = Number(body?.created_by ?? 1); // TODO: Get from auth
    
    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    if (!Number.isFinite(package_id)) {
      return NextResponse.json({ error: "Valid package_id is required" }, { status: 400 });
    }
    
    // Generate POAM number
    const poam_number = POAMs.generatePoamNumber(package_id);
    
    const created = POAMs.create({
      package_id,
      group_id,
      poam_number,
      title,
      weakness_description,
      nist_control_id,
      severity,
      priority,
      residual_risk_level,
      target_completion_date,
      estimated_cost,
      poc_name,
      poc_email,
      poc_phone,
      assigned_team_id,
      created_by
    });
    
    return NextResponse.json({ item: created }, { status: 201 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to create POAM";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}