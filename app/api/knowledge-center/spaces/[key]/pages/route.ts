import { NextRequest, NextResponse } from "next/server";
import { KCSpaces, KCPages, KCSpacePermissions } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
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

    const pages = KCPages.getBySpace(space.id);
    return NextResponse.json({ pages });
  } catch (error) {
    console.error("Error fetching pages:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
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

    const body = await request.json();
    const { title, slug, content, content_type, status, parent_id } = body;

    if (!title || !slug) {
      return NextResponse.json({ error: "Title and slug are required" }, { status: 400 });
    }

    // Check if slug already exists in this space
    const existingPage = KCPages.getBySpaceAndSlug(space.id, slug);
    if (existingPage) {
      return NextResponse.json({ error: "Page slug already exists in this space" }, { status: 409 });
    }

    const page = KCPages.create({
      space_id: space.id,
      parent_id,
      title,
      slug,
      content,
      content_type,
      status,
      created_by: user.id
    });

    return NextResponse.json({ page }, { status: 201 });
  } catch (error) {
    console.error("Error creating page:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
