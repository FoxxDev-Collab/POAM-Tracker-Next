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

    // Check admin permissions
    const permission = KCSpacePermissions.checkPermission(space.id, user.id);
    if (permission !== 'admin' && space.created_by !== user.id) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const permissions = KCSpacePermissions.getBySpace(space.id);
    return NextResponse.json({ permissions });
  } catch (error) {
    console.error("Error fetching permissions:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
