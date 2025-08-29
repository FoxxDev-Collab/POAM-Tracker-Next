import { NextRequest, NextResponse } from "next/server";
import { Users, type Role } from "@/lib/db";
import { getRequestUser, requireAdmin } from "@/lib/auth";
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

export async function GET() {
  // Everyone can list (Auditor is read-only but allowed to read)
  const items = Users.all();
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  try {
    const user = getRequestUser(req);
    requireAdmin(user);
    const body = await req.json();
    const parsed = createSchema.parse(body);
    const passwordHash = await bcrypt.hash(parsed.password, 12);
    const created = Users.create({
      name: parsed.name,
      email: parsed.email,
      role: parsed.role as Role,
      active: parsed.active ?? true,
      passwordHash,
    });
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Bad Request";
    const status = msg === "Forbidden" ? 403 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}
