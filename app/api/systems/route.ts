import { NextRequest, NextResponse } from "next/server";
import { 
  makeBackendRequest, 
  extractTokenFromRequest, 
  BackendApiError,
  createErrorResponse 
} from "@/lib/backend-api";
import { z } from "zod";

export const dynamic = "force-dynamic";

const systemSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  group_id: z.number().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const token = extractTokenFromRequest(req);
    const data = await makeBackendRequest('/systems', { token });
    return NextResponse.json({ items: data });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return createErrorResponse(error);
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = extractTokenFromRequest(req);
    const body = await req.json();
    const data = systemSchema.parse(body);
    
    const created = await makeBackendRequest('/systems', {
      method: 'POST',
      body: data,
      token
    });
    
    return NextResponse.json({ item: created }, { status: 201 });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return createErrorResponse(error);
    }
    const msg = error instanceof Error ? error.message : "Bad Request";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
