import { NextRequest, NextResponse } from "next/server";
import { KCPages, KCComments, KCSpacePermissions } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const pageId = parseInt(resolvedParams.id);
    const page = KCPages.get(pageId);
    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    // Check permissions
    const permission = KCSpacePermissions.checkPermission(page.space_id, user.id);
    if (!permission) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const comments = KCComments.getByPage(pageId);
    return NextResponse.json({ comments });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const pageId = parseInt(resolvedParams.id);
    const page = KCPages.get(pageId);
    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    // Check write permissions
    const permission = KCSpacePermissions.checkPermission(page.space_id, user.id);
    if (!permission || permission === 'read') {
      return NextResponse.json({ error: "Write access required" }, { status: 403 });
    }

    const body = await request.json();
    const { content, parent_id } = body;

    if (!content?.trim()) {
      return NextResponse.json({ error: "Comment content is required" }, { status: 400 });
    }

    const comment = KCComments.create({
      page_id: pageId,
      parent_id,
      content: content.trim(),
      created_by: user.id
    });

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
