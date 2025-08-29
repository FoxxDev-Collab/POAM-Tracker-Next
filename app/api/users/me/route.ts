import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { SecureErrors, withSecureErrorHandling } from "@/lib/secure-error";

export const dynamic = "force-dynamic";

export const GET = withSecureErrorHandling(async () => {
  const user = await getAuthenticatedUser();
  if (!user) return SecureErrors.Unauthorized();
  
  return NextResponse.json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    active: user.active
  });
});

export const runtime = 'nodejs';
