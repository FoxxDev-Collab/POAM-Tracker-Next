import { NextRequest, NextResponse } from "next/server";
import { 
  makeBackendRequest, 
  BackendApiError,
  createErrorResponse 
} from "@/lib/backend-api";
import { cookies } from "next/headers";
import { z } from "zod";

export const runtime = 'nodejs';

const loginSchema = z.object({
  email: z.string().email().min(1).max(255),
  password: z.string().min(1).max(255),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = loginSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { email, password } = validation.data;
    
    // Get client IP and User-Agent for logging
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';
    
    const response = await makeBackendRequest('/auth/login', {
      method: 'POST',
      body: { 
        email, 
        password,
        ipAddress,
        userAgent
      }
    });
    
    // Set the JWT token in httpOnly cookie
    if (response.access_token) {
      (await cookies()).set("token", response.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24, // 24 hours
      });
    }
    
    return NextResponse.json({ 
      success: true,
      user: response.user || {
        id: response.id,
        email: response.email,
        name: response.name,
        role: response.role
      }
    });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return createErrorResponse(error, 401);
    }
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}