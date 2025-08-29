import bcrypt from "bcryptjs"
import { Users, type UserRow, getDb } from "./db"
import { getCurrentUser, createSession, destroySession, validateSession } from "./session"

export type AuthResult = 
  | { success: true; user: UserRow }
  | { success: false; error: string }

// Authenticate user with email and password
export async function authenticate(email: string, password: string, ipAddress?: string, userAgent?: string): Promise<AuthResult> {
  try {
    // Rate limiting check (implement proper rate limiting in production)
    await new Promise(resolve => setTimeout(resolve, 1000)) // Basic delay to prevent brute force
    
    const user = Users.getByEmail(email.toLowerCase().trim())
    if (!user || user.active !== 1) {
      return { success: false, error: "Invalid credentials" }
    }
    
    // Check if user has a password hash
    const userWithPassword = getDb().prepare("SELECT * FROM users WHERE id = ?").get(user.id) as UserRow & { password_hash?: string }
    if (!userWithPassword?.password_hash) {
      return { success: false, error: "Account setup incomplete" }
    }
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, userWithPassword.password_hash)
    if (!isValidPassword) {
      // Log failed login attempt
      await logSecurityEvent("FAILED_LOGIN", { email, ipAddress, userAgent })
      return { success: false, error: "Invalid credentials" }
    }
    
    // Create session
    await createSession(user, ipAddress, userAgent)
    
    // Log successful login
    await logSecurityEvent("SUCCESSFUL_LOGIN", { userId: user.id, email, ipAddress, userAgent })
    
    return { success: true, user }
  } catch (error) {
    console.error("Authentication error:", error)
    return { success: false, error: "Authentication failed" }
  }
}

// Logout user
export async function logout(): Promise<void> {
  const session = await validateSession()
  if (session) {
    await logSecurityEvent("LOGOUT", { userId: session.userId })
  }
  await destroySession()
}

// Hash password for storage
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12 // High cost for security
  return bcrypt.hash(password, saltRounds)
}

// Set user password (for admin password resets)
export async function setUserPassword(userId: number, newPassword: string): Promise<boolean> {
  try {
    const hashedPassword = await hashPassword(newPassword)
    const user = Users.update(userId, { passwordHash: hashedPassword })
    if (user) {
      await logSecurityEvent("PASSWORD_RESET", { userId })
      return true
    }
    return false
  } catch (error) {
    console.error("Password update error:", error)
    return false
  }
}

// Change user password (authenticated user)
export async function changePassword(currentPassword: string, newPassword: string): Promise<AuthResult> {
  try {
    const session = await validateSession()
    if (!session?.userId) {
      return { success: false, error: "Not authenticated" }
    }
    
    const userWithPassword = getDb().prepare("SELECT * FROM users WHERE id = ?").get(session.userId) as UserRow & { password_hash?: string }
    if (!userWithPassword?.password_hash) {
      return { success: false, error: "Current password not set" }
    }
    
    // Verify current password
    const isValidCurrentPassword = await bcrypt.compare(currentPassword, userWithPassword.password_hash)
    if (!isValidCurrentPassword) {
      await logSecurityEvent("FAILED_PASSWORD_CHANGE", { userId: session.userId })
      return { success: false, error: "Current password is incorrect" }
    }
    
    // Validate new password strength
    if (!isPasswordStrong(newPassword)) {
      return { success: false, error: "Password does not meet security requirements" }
    }
    
    // Update password
    const hashedPassword = await hashPassword(newPassword)
    const user = Users.update(session.userId, { passwordHash: hashedPassword })
    if (!user) {
      return { success: false, error: "Failed to update password" }
    }
    
    await logSecurityEvent("PASSWORD_CHANGED", { userId: session.userId })
    
    return { success: true, user }
  } catch (error) {
    console.error("Password change error:", error)
    return { success: false, error: "Password change failed" }
  }
}

// Password strength validation
function isPasswordStrong(password: string): boolean {
  // Minimum 12 characters, uppercase, lowercase, number, special character
  const minLength = 12
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumbers = /\d/.test(password)
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)
  
  return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar
}

// Get current authenticated user
export async function getAuthenticatedUser(): Promise<UserRow | null> {
  return getCurrentUser()
}

// Require authentication middleware
export async function requireAuth(): Promise<UserRow> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error("Authentication required")
  }
  return user
}

// Require admin role
export async function requireAdmin(): Promise<UserRow> {
  const user = await requireAuth()
  if (user.role !== "Admin") {
    await logSecurityEvent("UNAUTHORIZED_ACCESS_ATTEMPT", { userId: user.id, requiredRole: "Admin" })
    throw new Error("Admin access required")
  }
  return user
}

// Check if user has specific role or higher
export async function requireRole(requiredRole: string): Promise<UserRow> {
  const user = await requireAuth()
  const session = await validateSession()
  
  const { hasRole } = await import("./session")
  if (!hasRole(session, requiredRole)) {
    await logSecurityEvent("UNAUTHORIZED_ACCESS_ATTEMPT", { userId: user.id, requiredRole })
    throw new Error(`${requiredRole} access required`)
  }
  return user
}

// Security event logging
async function logSecurityEvent(event: string, data: Record<string, unknown> = {}) {
  try {
    // Insert into audit log table (create this table)
    const logEntry = {
      event,
      timestamp: new Date().toISOString(),
      data: JSON.stringify(data),
      ip_address: data.ipAddress as string || null,
      user_agent: data.userAgent as string || null,
      user_id: data.userId as number || null,
    }
    
    // Store in database audit log
    getDb().prepare(`
      INSERT OR IGNORE INTO audit_logs (event, timestamp, data, ip_address, user_agent, user_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(logEntry.event, logEntry.timestamp, logEntry.data, logEntry.ip_address, logEntry.user_agent, logEntry.user_id)
    
    // Also log to console for monitoring
    console.log(`SECURITY_EVENT: ${event}`, data)
  } catch (error) {
    console.error("Failed to log security event:", error)
  }
}

// Legacy compatibility - DEPRECATED: Use getAuthenticatedUser() instead
export async function getRequestUser(): Promise<UserRow | null> {
  console.warn("getRequestUser is deprecated. Use getAuthenticatedUser() instead.")
  return getAuthenticatedUser()
}
