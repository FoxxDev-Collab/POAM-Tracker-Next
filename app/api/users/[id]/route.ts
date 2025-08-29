import { NextRequest, NextResponse } from "next/server";
import { Users, type Role } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
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

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params;
  const id = Number(idStr);
  if (!Number.isFinite(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  const found = Users.get(id);
  if (!found) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(found);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id: idStr } = await params;
    const id = Number(idStr);
    if (!Number.isFinite(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    const body = await req.json();
    const parsed = updateSchema.parse(body);
    const passwordHash = parsed.password ? await bcrypt.hash(parsed.password, 12) : undefined;
    const updated = Users.update(id, {
      name: parsed.name,
      email: parsed.email,
      role: parsed.role as Role | undefined,
      active: parsed.active,
      passwordHash,
    });
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Bad Request";
    const status = msg === "Forbidden" ? 403 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id: idStr } = await params;
    const id = Number(idStr);
    if (!Number.isFinite(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    const ok = Users.remove(id);
    if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Bad Request";
    const status = msg === "Forbidden" ? 403 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}
