import { NextRequest, NextResponse } from "next/server";
import { KCSpaces, KCSpacePermissions } from "@/lib/db";
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

    return NextResponse.json({ space, permission });
  } catch (error) {
    console.error("Error fetching space:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
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

    // Check admin permissions
    const permission = KCSpacePermissions.checkPermission(space.id, user.id);
    if (permission !== 'admin' && space.created_by !== user.id) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, type, visibility } = body;

    const updatedSpace = KCSpaces.update(space.id, {
      name,
      description,
      type,
      visibility
    });

    return NextResponse.json({ space: updatedSpace });
  } catch (error) {
    console.error("Error updating space:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
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

    // Check admin permissions
    const permission = KCSpacePermissions.checkPermission(space.id, user.id);
    if (permission !== 'admin' && space.created_by !== user.id) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const success = KCSpaces.remove(space.id);
    if (!success) {
      return NextResponse.json({ error: "Failed to delete space" }, { status: 500 });
    }

    return NextResponse.json({ message: "Space deleted successfully" });
  } catch (error) {
    console.error("Error deleting space:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
