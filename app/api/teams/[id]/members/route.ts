import { NextRequest, NextResponse } from "next/server";
import { Teams, Users } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { SecureErrors, withSecureErrorHandling } from "@/lib/secure-error";
import { z } from "zod";

export const runtime = 'nodejs';

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

export const POST = withSecureErrorHandling(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const user = await requireAuth();
  const { id: idStr } = await params;
  const teamId = Number(idStr);
  if (!Number.isFinite(teamId)) return SecureErrors.ValidationError();

  const team = Teams.get(teamId);
  if (!team) return SecureErrors.NotFound();

  if (!canManageTeam(user, team)) {
    return SecureErrors.Forbidden();
  }

  const body = await req.json();
  const validation = addMemberSchema.safeParse(body);
  if (!validation.success) {
    return SecureErrors.ValidationError();
  }

  const { user_id, role } = validation.data;
  
  const targetUser = Users.get(user_id);
  if (!targetUser) {
    return SecureErrors.NotFound();
  }

  const success = Teams.addMember(teamId, user_id, role);
  if (!success) {
    return NextResponse.json({ error: "Failed to add member" }, { status: 400 });
  }

  return NextResponse.json({ success: true });
});

export const GET = withSecureErrorHandling(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  await requireAuth();
  const { id: idStr } = await params;
  const teamId = Number(idStr);
  
  if (!Number.isFinite(teamId)) return SecureErrors.ValidationError();
  
  const members = Teams.getMembers(teamId);
  return NextResponse.json({ members });
});