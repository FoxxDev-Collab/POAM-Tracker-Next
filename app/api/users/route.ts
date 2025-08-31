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

const createSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().max(320),
  role: z.enum(["Admin", "ISSM", "ISSO", "SysAdmin", "ISSE", "Auditor"]),
  active: z.boolean().optional(),
  password: passwordSchema,
});

export async function GET(req: NextRequest) {
  try {
    const token = extractTokenFromRequest(req);
    const data = await makeBackendRequest('/users', { token });
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
    const parsed = createSchema.parse(body);
    const passwordHash = await bcrypt.hash(parsed.password, 12);
    
    const userData = {
      name: parsed.name,
      email: parsed.email,
      role: parsed.role,
      active: parsed.active ?? true,
      passwordHash,
    };
    
    const created = await makeBackendRequest('/users', {
      method: 'POST',
      body: userData,
      token
    });
    
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return createErrorResponse(error);
    }
    const msg = error instanceof Error ? error.message : "Bad Request";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export const runtime = 'nodejs';
