import { NextResponse } from "next/server"
import { getCSRFToken } from "@/lib/csrf"
import { validateSession } from "@/lib/session"

export const runtime = 'nodejs';

export async function GET() {
  try {
    const session = await validateSession()
    if (!session) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      )
    }

    const csrfToken = await getCSRFToken()
    if (!csrfToken) {
      return NextResponse.json(
        { error: "Failed to generate CSRF token" },
        { status: 500 }
      )
    }

    return NextResponse.json({ csrfToken })
  } catch (error) {
    console.error("CSRF token error:", error)
    return NextResponse.json(
      { error: "Failed to get CSRF token" },
      { status: 500 }
    )
  }
}