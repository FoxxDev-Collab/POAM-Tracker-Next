import { NextRequest, NextResponse } from "next/server";
import { 
  makeBackendRequest, 
  extractTokenFromRequest, 
  BackendApiError,
  createErrorResponse 
} from "@/lib/backend-api";
import { z } from "zod";

export const dynamic = "force-dynamic";

const updateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  group_id: z.number().optional(),
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: pid } = await params;
    const id = Number(pid);
    if (!Number.isFinite(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }
    
    const token = extractTokenFromRequest(req);
    const item = await makeBackendRequest(`/systems/${id}`, { token });
    return NextResponse.json({ item });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return createErrorResponse(error);
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: pid } = await params;
    const id = Number(pid);
    if (!Number.isFinite(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }
    
    const token = extractTokenFromRequest(req);
    const body = await req.json();
    const parsed = updateSchema.parse(body);
    
    const updated = await makeBackendRequest(`/systems/${id}`, {
      method: 'PATCH',
      body: parsed,
      token
    });
    
    return NextResponse.json({ item: updated });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return createErrorResponse(error);
    }
    const msg = error instanceof Error ? error.message : "Bad Request";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: pid } = await params;
    const id = Number(pid);
    if (!Number.isFinite(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }
    
    const token = extractTokenFromRequest(req);
    const result = await makeBackendRequest(`/systems/${id}`, {
      method: 'DELETE',
      token
    });
    
    return NextResponse.json(result || { ok: true });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return createErrorResponse(error);
    }
    const msg = error instanceof Error ? error.message : "Bad Request";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
