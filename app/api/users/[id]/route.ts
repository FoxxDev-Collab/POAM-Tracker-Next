import { NextRequest, NextResponse } from "next/server";
import { 
  makeBackendRequest, 
  extractTokenFromRequest, 
  BackendApiError,
  createErrorResponse 
} from "@/lib/backend-api";
import { z } from "zod";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

const passwordSchema = z
  .string()
  .min(12, "Password must be at least 12 characters")
  .refine((v) => /[A-Z]/.test(v), "Must include at least one uppercase letter")
  .refine((v) => /[a-z]/.test(v), "Must include at least one lowercase letter")
  .refine((v) => /\d/.test(v), "Must include at least one number")
  .refine((v) => /[^A-Za-z0-9]/.test(v), "Must include at least one special character");

const updateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  email: z.string().email().max(320).optional(),
  role: z.enum(["Admin", "ISSM", "ISSO", "SysAdmin", "ISSE", "Auditor"]).optional(),
  active: z.boolean().optional(),
  password: passwordSchema.optional(),
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await params;
    const id = Number(idStr);
    if (!Number.isFinite(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }
    
    const token = extractTokenFromRequest(req);
    const user = await makeBackendRequest(`/users/${id}`, { token });
    return NextResponse.json(user);
  } catch (error) {
    if (error instanceof BackendApiError) {
      return createErrorResponse(error);
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await params;
    const id = Number(idStr);
    if (!Number.isFinite(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }
    
    const token = extractTokenFromRequest(req);
    const body = await req.json();
    const parsed = updateSchema.parse(body);
    
    const updateData: any = {
      name: parsed.name,
      email: parsed.email,
      role: parsed.role,
      active: parsed.active,
    };
    
    // Handle password separately if needed
    if (parsed.password) {
      updateData.passwordHash = await bcrypt.hash(parsed.password, 12);
    }
    
    const updated = await makeBackendRequest(`/users/${id}`, {
      method: 'PATCH',
      body: updateData,
      token
    });
    
    return NextResponse.json(updated);
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
    const { id: idStr } = await params;
    const id = Number(idStr);
    if (!Number.isFinite(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }
    
    const token = extractTokenFromRequest(req);
    const result = await makeBackendRequest(`/users/${id}`, {
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
