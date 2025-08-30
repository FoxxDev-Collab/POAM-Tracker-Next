import { NextRequest, NextResponse } from "next/server";
import { KCSpaces, KCPages, KCSpacePermissions } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string; slug: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const space = KCSpaces.getByKey(resolvedParams.key);
    if (!space) {
      return NextResponse.json({ error: "Space not found" }, { status: 404 });
    }

    // Check permissions
    const permission = KCSpacePermissions.checkPermission(space.id, user.id);
    if (!permission) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const page = KCPages.getBySpaceAndSlug(space.id, resolvedParams.slug);
    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    return NextResponse.json({ page, permission });
  } catch (error) {
    console.error("Error fetching page:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ key: string; slug: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const space = KCSpaces.getByKey(resolvedParams.key);
    if (!space) {
      return NextResponse.json({ error: "Space not found" }, { status: 404 });
    }

    // Check write permissions
    const permission = KCSpacePermissions.checkPermission(space.id, user.id);
    if (!permission || permission === 'read') {
      return NextResponse.json({ error: "Write access required" }, { status: 403 });
    }

    const page = KCPages.getBySpaceAndSlug(space.id, resolvedParams.slug);
    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    const body = await request.json();
    const { title, content, content_type, status, version_comment } = body;

    const updatedPage = KCPages.update(page.id, {
      title,
      content,
      content_type,
      status,
      updated_by: user.id,
      version_comment
    });

    return NextResponse.json({ page: updatedPage });
  } catch (error) {
    console.error("Error updating page:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ key: string; slug: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const space = KCSpaces.getByKey(resolvedParams.key);
    if (!space) {
      return NextResponse.json({ error: "Space not found" }, { status: 404 });
    }

    // Check write permissions
    const permission = KCSpacePermissions.checkPermission(space.id, user.id);
    if (!permission || permission === 'read') {
      return NextResponse.json({ error: "Write access required" }, { status: 403 });
    }

    const page = KCPages.getBySpaceAndSlug(space.id, resolvedParams.slug);
    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    const success = KCPages.remove(page.id);
    if (!success) {
      return NextResponse.json({ error: "Failed to delete page" }, { status: 500 });
    }

    return NextResponse.json({ message: "Page deleted successfully" });
  } catch (error) {
    console.error("Error deleting page:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
