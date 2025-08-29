import { NextRequest, NextResponse } from "next/server";
import { Teams, Users } from "@/lib/db";
import { getRequestUser } from "@/lib/auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  lead_user_id: z.number().int().positive().optional(),
  active: z.boolean().optional(),
});

const canManageTeams = (userRole: string) => {
  return ["Admin", "ISSM", "ISSO", "SysAdmin"].includes(userRole);
};

const canManageTeam = (user: { id: number; role: string }, team: { lead_user_id: number }) => {
  // Admin can manage all teams
  if (user.role === "Admin") return true;
  // Team leads can manage their own teams
  if (team.lead_user_id === user.id) return true;
  // Other management roles can manage teams they didn't create
  return canManageTeams(user.role);
};

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params;
  const id = Number(idStr);
  if (!Number.isFinite(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  
  const team = Teams.get(id);
  if (!team) return NextResponse.json({ error: "Not found" }, { status: 404 });
  
  const members = Teams.getMembers(id);
  return NextResponse.json({ ...team, members });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getRequestUser(req);
    const { id: idStr } = await params;
    const id = Number(idStr);
    if (!Number.isFinite(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const team = Teams.get(id);
    if (!team) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (!user || !canManageTeam(user, team)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = updateSchema.parse(body);

    // If changing lead, verify the new lead user
    if (parsed.lead_user_id) {
      const leadUser = Users.get(parsed.lead_user_id);
      if (!leadUser) {
        return NextResponse.json({ error: "Lead user not found" }, { status: 400 });
      }
      if (!canManageTeams(leadUser.role)) {
        return NextResponse.json({ error: "Lead user must be ISSM, ISSO, SysAdmin, or Admin" }, { status: 400 });
      }
    }

    const updated = Teams.update(id, parsed);
    if (!updated) return NextResponse.json({ error: "Update failed" }, { status: 500 });

    // If lead changed, update memberships
    if (parsed.lead_user_id && parsed.lead_user_id !== team.lead_user_id) {
      // Remove old lead's Lead role (but keep as Member if they were)
      Teams.updateMemberRole(id, team.lead_user_id, 'Member');
      // Add new lead as Lead (or update existing membership)
      Teams.addMember(id, parsed.lead_user_id, 'Lead');
    }

    return NextResponse.json(updated);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Bad Request";
    const status = msg === "Forbidden" ? 403 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getRequestUser(req);
    const { id: idStr } = await params;
    const id = Number(idStr);
    if (!Number.isFinite(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const team = Teams.get(id);
    if (!team) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (!user || !canManageTeam(user, team)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const ok = Teams.remove(id);
    if (!ok) return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    
    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Bad Request";
    const status = msg === "Forbidden" ? 403 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}
