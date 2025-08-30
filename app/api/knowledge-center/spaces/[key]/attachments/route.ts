import { NextRequest, NextResponse } from "next/server";
import { KCSpaces, KCAttachments, KCSpacePermissions } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

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

    const { searchParams } = new URL(request.url);
    const pageId = searchParams.get('page_id');

    let attachments;
    if (pageId) {
      attachments = KCAttachments.getByPage(parseInt(pageId));
    } else {
      attachments = KCAttachments.getBySpace(space.id);
    }
    return NextResponse.json({ attachments });
  } catch (error) {
    console.error("Error fetching attachments:", error);
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
    if (permission !== 'write' && permission !== 'admin') {
      return NextResponse.json({ error: "Write access required" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const pageId = formData.get('page_id') as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File size exceeds 10MB limit" }, { status: 400 });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'uploads', 'knowledge-center');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const originalName = file.name;
    const extension = originalName.split('.').pop();
    const filename = `${timestamp}-${Math.random().toString(36).substring(2)}.${extension}`;
    const filepath = join(uploadsDir, filename);

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Save to database
    const attachment = KCAttachments.create({
      space_id: space.id,
      page_id: pageId ? parseInt(pageId) : undefined,
      filename: filename,
      original_filename: originalName,
      file_size: file.size,
      mime_type: file.type,
      uploaded_by: user.id
    });

    return NextResponse.json({ attachment }, { status: 201 });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
