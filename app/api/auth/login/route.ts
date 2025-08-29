import { NextRequest, NextResponse } from "next/server"
import { authenticate } from "@/lib/auth"
import { z } from "zod"

export const runtime = 'nodejs';

const loginSchema = z.object({
  email: z.string().email().min(1).max(255),
  password: z.string().min(1).max(255),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    // Validate input
    const validation = loginSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input" }, 
        { status: 400 }
      )
    }

    const { email, password } = validation.data
    
    // Get client IP and User-Agent for logging
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    const userAgent = req.headers.get('user-agent') || 'unknown'
    
    // Authenticate user
    const result = await authenticate(email, password, ipAddress, userAgent)
    
    if (result.success) {
      return NextResponse.json({ 
        success: true,
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          role: result.user.role
        }
      })
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error("Login error:", error)
    
    // Don't expose internal errors
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    )
  }
}