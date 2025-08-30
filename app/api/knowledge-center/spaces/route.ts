import { NextRequest, NextResponse } from "next/server";
import { KCSpaces, getDb } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get spaces accessible to the user
    const spaces = KCSpaces.getByUser(user.id);
    
    // Add page counts for each space
    const spacesWithCounts = spaces.map(space => {
      const pageCount = getDb().prepare("SELECT COUNT(*) as count FROM kc_pages WHERE space_id = ?").get(space.id) as { count: number };
      return {
        ...space,
        page_count: pageCount.count
      };
    });

    return NextResponse.json({ 
      spaces: spacesWithCounts,
      total: spacesWithCounts.length 
    });
  } catch (error) {
    console.error("Error fetching spaces:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { key, name, description, type, visibility } = body;

    if (!key || !name) {
      return NextResponse.json({ error: "Key and name are required" }, { status: 400 });
    }

    // Check if key already exists
    const existingSpace = KCSpaces.getByKey(key);
    if (existingSpace) {
      return NextResponse.json({ error: "Space key already exists" }, { status: 409 });
    }

    // Create the space
    const space = KCSpaces.create({
      key,
      name,
      description,
      type,
      visibility,
      created_by: user.id
    });

    return NextResponse.json({ space }, { status: 201 });
  } catch (error) {
    console.error("Error creating space:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
