import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { getIronSession } from "iron-session";
import type { SessionData } from "@/lib/session";

const loginSchema = z.object({
  email: z.string().email().min(1).max(255),
  password: z.string().min(1).max(255),
})

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = loginSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { email, password } = validation.data;
    
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';
    
    const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        email, 
        password,
        ipAddress,
        userAgent
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json({ error: error.message || 'Authentication failed' }, { status: 401 });
    }

    const data = await response.json();
    
    const res = NextResponse.json({ 
      success: true,
      user: data.user || {
        id: data.id,
        email: data.email,
        name: data.name,
        role: data.role
      }
    });
    
    // Set JWT token
    if (data.access_token) {
      (await cookies()).set("token", data.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24,
      });
    }
    
    // Create iron-session for middleware authentication
    const sessionOptions = {
      password: process.env.SESSION_SECRET || "complex_password_at_least_32_characters_long_for_production_use_only",
      cookieName: "poam-session",
      cookieOptions: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict" as const,
        maxAge: 8 * 60 * 60,
        path: "/",
      },
    };
    
    try {
      const session = await getIronSession<SessionData>(req, res, sessionOptions);
      const user = data.user || data;
      session.userId = user.id;
      session.userEmail = user.email;
      session.userName = user.name;
      session.userRole = user.role;
      session.isLoggedIn = true;
      session.loginTime = Date.now();
      session.lastActivity = Date.now();
      session.ipAddress = ipAddress;
      session.userAgent = userAgent;
      await session.save();
    } catch (sessionError) {
      console.error('Failed to save session:', sessionError);
    }
    
    return res;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}