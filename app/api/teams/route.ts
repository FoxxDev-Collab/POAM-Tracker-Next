import { NextRequest, NextResponse } from "next/server";
import { Teams, Users } from "@/lib/db";
import { getRequestUser } from "@/lib/auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  name: z.string().min(1, "Required").max(100),
  description: z.string().max(500).optional(),
  lead_user_id: z.number().int().positive(),
  active: z.boolean().optional(),
});

const canManageTeams = (userRole: string) => {
  return ["Admin", "ISSM", "ISSO", "SysAdmin"].includes(userRole);
};

export async function GET() {
  const teams = Teams.all();
  return NextResponse.json({ items: teams });
}

export async function POST(req: NextRequest) {
  try {
    const user = getRequestUser(req);
    if (!user || !canManageTeams(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = createSchema.parse(body);
    
    // Verify the lead user exists and has appropriate role
    const leadUser = Users.get(parsed.lead_user_id);
    if (!leadUser) {
      return NextResponse.json({ error: "Lead user not found" }, { status: 400 });
    }
    if (!canManageTeams(leadUser.role)) {
      return NextResponse.json({ error: "Lead user must be ISSM, ISSO, SysAdmin, or Admin" }, { status: 400 });
    }

    const created = Teams.create({
      name: parsed.name,
      description: parsed.description,
      lead_user_id: parsed.lead_user_id,
      active: parsed.active ?? true,
    });

    // Auto-add the lead user as a Lead member
    Teams.addMember(created.id, parsed.lead_user_id, 'Lead');

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Bad Request";
    const status = msg === "Forbidden" ? 403 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}
