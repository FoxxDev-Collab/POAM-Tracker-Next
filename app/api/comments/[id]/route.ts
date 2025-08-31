import { NextRequest, NextResponse } from "next/server";
import { PoamComments } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const commentId = Number(id);
    if (!Number.isFinite(commentId)) {
      return NextResponse.json({ error: "Invalid comment ID" }, { status: 400 });
    }
    
    const comment = PoamComments.get(commentId);
    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }
    
    return NextResponse.json({ item: comment });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to get comment";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const commentId = Number(id);
    if (!Number.isFinite(commentId)) {
      return NextResponse.json({ error: "Invalid comment ID" }, { status: 400 });
    }
    
    const body = await req.json();
    const comment = String(body?.comment ?? "").trim();
    const comment_type = body?.comment_type;
    
    if (!comment) {
      return NextResponse.json({ error: "Comment is required" }, { status: 400 });
    }
    
    const updated = PoamComments.update(commentId, {
      comment,
      comment_type
    });
    
    if (!updated) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }
    
    return NextResponse.json({ item: updated });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to update comment";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const commentId = Number(id);
    if (!Number.isFinite(commentId)) {
      return NextResponse.json({ error: "Invalid comment ID" }, { status: 400 });
    }
    
    const success = PoamComments.remove(commentId);
    if (!success) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to delete comment";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}