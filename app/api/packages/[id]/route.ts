import { NextRequest, NextResponse } from "next/server";
import { 
  makeBackendRequest, 
  extractTokenFromRequest, 
  BackendApiError,
  createErrorResponse 
} from "@/lib/backend-api";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: pid } = await params;
    const id = Number(pid);
    if (!Number.isFinite(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }
    
    const token = extractTokenFromRequest(req);
    const item = await makeBackendRequest(`/packages/${id}`, { token });
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
    
    const updated = await makeBackendRequest(`/packages/${id}`, {
      method: 'PATCH',
      body: body,
      token
    });
    
    return NextResponse.json({ item: updated });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return createErrorResponse(error);
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
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
    const result = await makeBackendRequest(`/packages/${id}`, {
      method: 'DELETE',
      token
    });
    
    return NextResponse.json(result || { ok: true });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return createErrorResponse(error);
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
