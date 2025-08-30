import { NextRequest, NextResponse } from "next/server";
import { KCPages, KCSpacePermissions, getDb } from "@/lib/db";
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

    // Get versions with author information
    const versions = getDb().prepare(`
      SELECT pv.*, u.name as author_name, u.email as author_email
      FROM kc_page_versions pv
      JOIN users u ON pv.created_by = u.id
      WHERE pv.page_id = ?
      ORDER BY pv.version DESC
    `).all(pageId);

    return NextResponse.json({ versions });
  } catch (error) {
    console.error("Error fetching page versions:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
