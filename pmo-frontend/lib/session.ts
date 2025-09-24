import { SessionOptions, getIronSession } from "iron-session"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import type { UserRow } from "./db"

export interface SessionData {
  userId?: number
  userEmail?: string
  userName?: string
  userRole?: string
  isLoggedIn?: boolean
  loginTime?: number
  lastActivity?: number
  csrfToken?: string
  ipAddress?: string
  userAgent?: string
}

// Use environment variables for session secrets in production
const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET || "complex_password_at_least_32_characters_long_for_production_use_only",
  cookieName: "poam-session",
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // HTTPS only in production
    sameSite: "strict",
    maxAge: 8 * 60 * 60, // 8 hours
    path: "/",
  },
}

// Server-side session getter (for server components and API routes)
export async function getSession() {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions)
  return session
}

// Session getter for middleware and API routes with request object
export async function getSessionFromRequest(req: NextRequest) {
  const response = NextResponse.next()
  const session = await getIronSession<SessionData>(req, response, sessionOptions)
  return { session, response }
}

// Create session after successful login
export async function createSession(user: UserRow, ipAddress?: string, userAgent?: string) {
  const session = await getSession()
  
  session.userId = user.id
  session.userEmail = user.email
  session.userName = user.name
  session.userRole = user.role
  session.isLoggedIn = true
  session.loginTime = Date.now()
  session.lastActivity = Date.now()
  session.csrfToken = generateCSRFToken()
  session.ipAddress = ipAddress
  session.userAgent = userAgent
  
  await session.save()
  return session
}

// Update session activity
export async function updateSessionActivity() {
  const session = await getSession()
  if (session.isLoggedIn) {
    session.lastActivity = Date.now()
    await session.save()
  }
  return session
}

// Validate session and check for timeout
export async function validateSession(): Promise<SessionData | null> {
  try {
    const session = await getSession()
    
    if (!session.isLoggedIn || !session.userId) {
      return null
    }
    
    const now = Date.now()
    const maxAge = 8 * 60 * 60 * 1000 // 8 hours in milliseconds
    const maxInactivity = 2 * 60 * 60 * 1000 // 2 hours inactivity timeout
    
    // Check session timeout
    if (session.loginTime && (now - session.loginTime > maxAge)) {
      await destroySession()
      return null
    }
    
    // Check inactivity timeout
    if (session.lastActivity && (now - session.lastActivity > maxInactivity)) {
      await destroySession()
      return null
    }
    
    // Update activity timestamp
    session.lastActivity = now
    await session.save()
    
    return session
  } catch (error) {
    console.error("Session validation error:", error)
    return null
  }
}

// Destroy session (logout)
export async function destroySession() {
  const session = await getSession()
  session.destroy()
}

// Generate CSRF token
function generateCSRFToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

// Validate CSRF token
export async function validateCSRFToken(providedToken: string): Promise<boolean> {
  const session = await getSession()
  return session.csrfToken === providedToken
}

// Get current user from session
export async function getCurrentUser(): Promise<UserRow | null> {
  const session = await validateSession()
  if (!session || !session.userId) {
    return null
  }
  
  // Import here to avoid circular dependencies
  const { Users } = await import("./db")
  return Users.get(session.userId) || null
}

// Check if user has required role
export function hasRole(session: SessionData | null, requiredRole: string): boolean {
  if (!session?.isLoggedIn || !session.userRole) return false
  
  // Role hierarchy: Admin > ISSM > ISSO > ISSE > SysAdmin > Auditor
  const roleHierarchy = ['Admin', 'ISSM', 'ISSO', 'ISSE', 'SysAdmin', 'Auditor']
  const userRoleIndex = roleHierarchy.indexOf(session.userRole)
  const requiredRoleIndex = roleHierarchy.indexOf(requiredRole)
  
  return userRoleIndex !== -1 && requiredRoleIndex !== -1 && userRoleIndex <= requiredRoleIndex
}

// Check if user is admin
export function isAdmin(session: SessionData | null): boolean {
  return session?.userRole === 'Admin'
}

// Check if user is read-only
export function isReadOnly(session: SessionData | null): boolean {
  return !session?.isLoggedIn || session.userRole === 'Auditor'
}