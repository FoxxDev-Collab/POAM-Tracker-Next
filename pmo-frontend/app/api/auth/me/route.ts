import { NextResponse } from "next/server";
import { validateSession } from "@/lib/session";

export async function GET() {
  try {
    const session = await validateSession();
    
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    return NextResponse.json({
      id: session.userId,
      email: session.userEmail,
      name: session.userName,
      role: session.userRole,
      isLoggedIn: session.isLoggedIn
    });
  } catch (error) {
    console.error('Get current user error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}