import { NextResponse } from "next/server"
import { logout } from "@/lib/auth"

export const runtime = 'nodejs';

export async function POST() {
  try {
    await logout()
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Logout error:", error)
    
    // Still return success even if there's an error to ensure logout
    return NextResponse.json({ success: true })
  }
}