import { NextResponse } from "next/server"

export interface SecureErrorOptions {
  logError?: boolean
  includeRequestId?: boolean
}

// Generate a request ID for error tracking
function generateRequestId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// Create secure error response that doesn't leak sensitive information
export function createSecureErrorResponse(
  error: unknown, 
  publicMessage: string = "An error occurred", 
  status: number = 500,
  options: SecureErrorOptions = {}
): NextResponse {
  const requestId = generateRequestId()
  
  // Log the actual error for debugging (server-side only)
  if (options.logError !== false) {
    console.error(`Error ${requestId}:`, error)
  }
  
  // Create safe response object
  const responseBody: Record<string, unknown> = {
    error: publicMessage,
    timestamp: new Date().toISOString()
  }
  
  // Include request ID for tracking if enabled
  if (options.includeRequestId) {
    responseBody.requestId = requestId
  }
  
  return NextResponse.json(responseBody, { status })
}

// Common secure error responses
export const SecureErrors = {
  // Authentication errors
  Unauthorized: () => createSecureErrorResponse(
    null, 
    "Authentication required", 
    401
  ),
  
  Forbidden: () => createSecureErrorResponse(
    null, 
    "Access denied", 
    403
  ),
  
  InvalidCredentials: () => createSecureErrorResponse(
    null, 
    "Invalid credentials", 
    401
  ),
  
  // Validation errors
  ValidationError: () => createSecureErrorResponse(
    null, 
    "Invalid input provided", 
    400
  ),
  
  // Resource errors
  NotFound: () => createSecureErrorResponse(
    null, 
    "Resource not found", 
    404
  ),
  
  // Rate limiting
  TooManyRequests: () => createSecureErrorResponse(
    null, 
    "Too many requests", 
    429
  ),
  
  // Server errors
  InternalError: (error?: unknown) => createSecureErrorResponse(
    error, 
    "Internal server error", 
    500,
    { logError: true, includeRequestId: true }
  ),
  
  DatabaseError: (error?: unknown) => createSecureErrorResponse(
    error, 
    "Database operation failed", 
    500,
    { logError: true, includeRequestId: true }
  ),
  
  // Security errors
  CSRFError: () => createSecureErrorResponse(
    null, 
    "Invalid security token", 
    403
  ),
  
  SessionError: () => createSecureErrorResponse(
    null, 
    "Session expired or invalid", 
    401
  )
}

// Sanitize error messages for client consumption
export function sanitizeErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // Only return safe, generic messages
    if (error.message.includes('UNIQUE constraint')) {
      return "Resource already exists"
    }
    if (error.message.includes('NOT NULL constraint')) {
      return "Required field missing"
    }
    if (error.message.includes('FOREIGN KEY constraint')) {
      return "Invalid reference"
    }
    if (error.message.includes('Authentication required')) {
      return "Authentication required"
    }
    if (error.message.includes('Access denied') || error.message.includes('Forbidden')) {
      return "Access denied"
    }
  }
  
  // Default generic message for all other errors
  return "An error occurred"
}

// Wrapper for async API route handlers with error handling
export function withSecureErrorHandling<T extends Request = Request, C = unknown>(
  handler: (req: T, context: C) => Promise<NextResponse>
) {
  return async (req: T, context: C) => {
    try {
      return await handler(req, context)
    } catch (error) {
      // Log the full error for debugging
      console.error("API Error:", error)
      
      // Return sanitized error to client
      const message = sanitizeErrorMessage(error)
      return createSecureErrorResponse(error, message, 500, { 
        logError: false, // Already logged above
        includeRequestId: true 
      })
    }
  }
}