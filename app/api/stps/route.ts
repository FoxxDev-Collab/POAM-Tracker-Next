import { NextRequest, NextResponse } from "next/server";
import { STPs } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const packageId = searchParams.get("package_id");
    const systemId = searchParams.get("system_id");
    
    let items;
    if (packageId) {
      items = STPs.byPackage(Number(packageId));
    } else if (systemId) {
      items = STPs.bySystem(Number(systemId));
    } else {
      items = STPs.all();
    }
    
    return NextResponse.json({ items });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to list STPs";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const title = String(body?.title ?? "").trim();
    const description = String(body?.description ?? "");
    const system_id = Number(body?.system_id);
    const package_id = Number(body?.package_id);
    const priority = body?.priority || "Medium";
    const assigned_team_id = body?.assigned_team_id ? Number(body.assigned_team_id) : undefined;
    const created_by = Number(body?.created_by ?? 1); // TODO: Get from auth
    const due_date = body?.due_date || undefined;
    
    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    if (!Number.isFinite(system_id) || !Number.isFinite(package_id)) {
      return NextResponse.json({ error: "Valid system_id and package_id are required" }, { status: 400 });
    }
    
    const created = STPs.create({
      title,
      description,
      system_id,
      package_id,
      priority,
      assigned_team_id,
      created_by,
      due_date
    });
    
    return NextResponse.json({ item: created }, { status: 201 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to create STP";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
