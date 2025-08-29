import { NextRequest, NextResponse } from "next/server";
import { Teams, Users } from "@/lib/db";
import { getRequestUser } from "@/lib/auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

const addMemberSchema = z.object({
  user_id: z.number().int().positive(),
  role: z.enum(["Lead", "Member"]).default("Member"),
});

const canManageTeams = (userRole: string) => {
  return ["Admin", "ISSM", "ISSO", "SysAdmin"].includes(userRole);
};

const canManageTeam = (user: { id: number; role: string }, team: { lead_user_id: number }) => {
  if (user.role === "Admin") return true;
  if (team.lead_user_id === user.id) return true;
  return canManageTeams(user.role);
};

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getRequestUser(req);
    const { id: idStr } = await params;
    const teamId = Number(idStr);
    if (!Number.isFinite(teamId)) return NextResponse.json({ error: "Invalid team id" }, { status: 400 });

    const team = Teams.get(teamId);
    if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });

    if (!user || !canManageTeam(user, team)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = addMemberSchema.parse(body);

    // Verify user exists
    const targetUser = Users.get(parsed.user_id);
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 400 });
    }

    const success = Teams.addMember(teamId, parsed.user_id, parsed.role);
    if (!success) {
      return NextResponse.json({ error: "User is already a member" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
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
    const teamId = Number(idStr);
    if (!Number.isFinite(teamId)) return NextResponse.json({ error: "Invalid team id" }, { status: 400 });

    const team = Teams.get(teamId);
    if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });

    if (!user || !canManageTeam(user, team)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const url = new URL(req.url);
    const userId = Number(url.searchParams.get('user_id'));
    if (!Number.isFinite(userId)) {
      return NextResponse.json({ error: "Invalid user_id parameter" }, { status: 400 });
    }

    // Don't allow removing the team lead
    if (userId === team.lead_user_id) {
      return NextResponse.json({ error: "Cannot remove team lead" }, { status: 400 });
    }

    const success = Teams.removeMember(teamId, userId);
    if (!success) {
      return NextResponse.json({ error: "User is not a member" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Bad Request";
    const status = msg === "Forbidden" ? 403 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}
