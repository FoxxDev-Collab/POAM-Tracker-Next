import { NextRequest } from "next/server"
import { validateSession, validateCSRFToken } from "./session"

export interface CSRFValidationResult {
  isValid: boolean
  error?: string
}

// Validate CSRF token for state-changing operations
export async function validateCSRF(req: NextRequest): Promise<CSRFValidationResult> {
  try {
    // Skip CSRF validation for GET requests
    if (req.method === 'GET') {
      return { isValid: true }
    }

    // Get CSRF token from header or body
    let csrfToken = req.headers.get('x-csrf-token')
    
    if (!csrfToken) {
      // Try to get from request body for form submissions
      try {
        const body = await req.json()
        csrfToken = body.csrfToken
      } catch {
        // If we can't parse JSON, that's okay - token might be in header
      }
    }

    if (!csrfToken) {
      return { isValid: false, error: "Missing CSRF token" }
    }

    // Validate token against session
    const isValid = await validateCSRFToken(csrfToken)
    
    if (!isValid) {
      return { isValid: false, error: "Invalid CSRF token" }
    }

    return { isValid: true }
  } catch (error) {
    console.error("CSRF validation error:", error)
    return { isValid: false, error: "CSRF validation failed" }
  }
}

// Middleware helper to require CSRF token
export async function requireCSRF(req: NextRequest): Promise<void> {
  const result = await validateCSRF(req)
  if (!result.isValid) {
    throw new Error(result.error || "CSRF validation failed")
  }
}

// Get CSRF token for client-side use
export async function getCSRFToken(): Promise<string | null> {
  try {
    const session = await validateSession()
    return session?.csrfToken || null
  } catch {
    return null
  }
}