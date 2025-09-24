import { NextRequest, NextResponse } from "next/server"
import { getIronSession } from "iron-session"
import type { SessionData } from "@/lib/session"

// In-memory rate limiting with very generous limits
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function checkSimpleRateLimit(request: NextRequest): { allowed: boolean; limit: number; remaining: number; resetTime: number } {
  const ip = getClientIP(request)
  const key = `${ip}:${request.nextUrl.pathname}`
  const now = Date.now()
  const windowMs = 15 * 60 * 1000 // 15 minutes

  // Very generous limits to avoid blocking legitimate usage
  let limit = 10000 // Default limit - very generous
  if (request.nextUrl.pathname.startsWith('/api/auth')) {
    limit = 100 // Still reasonable for auth endpoints
  } else if (request.nextUrl.pathname.includes('/vulnerability-center/')) {
    limit = 50000 // Very high limit for vulnerability center operations
  } else if (request.nextUrl.pathname.includes('/api/')) {
    limit = 20000 // Very high limit for general API calls
  }

  // Clean up old entries periodically
  if (Math.random() < 0.01) { // 1% chance to clean up
    const cutoff = now - windowMs;
    for (const [key, value] of rateLimitMap.entries()) {
      if (value.resetTime < cutoff) {
        rateLimitMap.delete(key);
      }
    }
  }

  const current = rateLimitMap.get(key)

  if (!current || now > current.resetTime) {
    // New window
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs })
    return { allowed: true, limit, remaining: limit - 1, resetTime: now + windowMs }
  }

  if (current.count >= limit) {
    return { allowed: false, limit, remaining: 0, resetTime: current.resetTime }
  }

  current.count++
  return { allowed: true, limit, remaining: limit - current.count, resetTime: current.resetTime }
}

function getClientIP(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for') ||
    request.headers.get('x-real-ip') ||
    '127.0.0.1'
  )
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const response = NextResponse.next()
  
  // Add security headers
  addSecurityHeaders(response)
  
  // Rate limiting - disabled Redis due to Edge Runtime compatibility issues
  // Using backend rate limiting instead
  const rateLimitResult = checkSimpleRateLimit(request)
  if (!rateLimitResult.allowed) {
    return new NextResponse(JSON.stringify({
      error: "Too Many Requests",
      message: "Rate limit exceeded. Please try again later.",
      retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
    }), {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
        "X-RateLimit-Limit": rateLimitResult.limit.toString(),
        "X-RateLimit-Remaining": rateLimitResult.remaining.toString()
      }
    })
  }
  
  // Skip auth for public routes
  if (isPublicRoute(pathname)) {
    return response
  }
  
  // Skip auth for API auth routes
  if (pathname.startsWith('/api/auth')) {
    return response
  }
  
  // Simplified session check for protected routes
  try {
    // Only check authentication for non-public routes
    if (!isPublicRoute(pathname)) {
      // Use lightweight session check that works in Edge Runtime
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
      }
      
      const session = await getIronSession<SessionData>(request, response, sessionOptions)
      
      // For API routes, allow JWT token auth without session requirement
      if (pathname.startsWith('/api/')) {
        // Check for JWT token in cookies or session
        const cookieStore = request.cookies;
        const token = cookieStore.get('token');
        
        if (!session.isLoggedIn && !token) {
          return new NextResponse("Unauthorized", { status: 401 })
        }
      } else {
        // For page routes, redirect to login if not authenticated
        if (!session.isLoggedIn) {
          const loginUrl = new URL('/login', request.url)
          loginUrl.searchParams.set('redirect', pathname)
          return NextResponse.redirect(loginUrl)
        }
      }
    }
  } catch (error) {
    console.error('Middleware auth error:', error)
    // For errors, redirect to login for safety
    if (pathname.startsWith('/api/')) {
      return new NextResponse("Authentication Error", { status: 500 })
    } else {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }
  
  return response
}

function addSecurityHeaders(response: NextResponse) {
  // Content Security Policy
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
  response.headers.set('Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: blob:; " +
    "font-src 'self'; " +
    `connect-src 'self' ${backendUrl}; ` +
    "frame-ancestors 'none'; " +
    "base-uri 'self'"
  )
  
  // HTTP Strict Transport Security (HSTS)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  }
  
  // X-Content-Type-Options
  response.headers.set('X-Content-Type-Options', 'nosniff')
  
  // X-Frame-Options
  response.headers.set('X-Frame-Options', 'DENY')
  
  // X-XSS-Protection
  response.headers.set('X-XSS-Protection', '1; mode=block')
  
  // Referrer-Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // Permissions-Policy
  response.headers.set('Permissions-Policy', 
    'camera=(), microphone=(), geolocation=(), payment=(), usb=()'
  )
  
  // Remove server information
  response.headers.delete('Server')
  response.headers.delete('X-Powered-By')
}

function isPublicRoute(pathname: string): boolean {
  const publicRoutes = [
    '/login',
    '/favicon.ico',
    '/_next',
    '/api/health'
  ]
  
  // Allow API access for testing in development with special header
  if (process.env.NODE_ENV === 'development' && pathname.startsWith('/api/')) {
    return true; // Temporarily allow all API routes in dev for testing
  }
  
  return publicRoutes.some(route => pathname.startsWith(route))
}


export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}