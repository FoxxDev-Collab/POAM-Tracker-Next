import { NextRequest, NextResponse } from "next/server";
import { STPTestCases } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const stpId = Number(id);
    if (!Number.isFinite(stpId)) {
      return NextResponse.json({ error: "Invalid STP ID" }, { status: 400 });
    }
    
    const items = STPTestCases.bySTP(stpId);
    return NextResponse.json({ items });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to list test cases";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const stpId = Number(id);
    if (!Number.isFinite(stpId)) {
      return NextResponse.json({ error: "Invalid STP ID" }, { status: 400 });
    }
    
    const body = await req.json();
    const title = String(body?.title ?? "").trim();
    
    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    
    const created = STPTestCases.create({
      stp_id: stpId,
      title,
      description: body?.description,
      test_procedure: body?.test_procedure,
      expected_result: body?.expected_result,
      assigned_user_id: body?.assigned_user_id ? Number(body.assigned_user_id) : undefined
    });
    
    return NextResponse.json({ item: created }, { status: 201 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to create test case";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
