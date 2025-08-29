import { NextRequest, NextResponse } from "next/server"
import { getIronSession } from "iron-session"
import type { SessionData } from "@/lib/session"

// Rate limiting storage (in production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const response = NextResponse.next()
  
  // Add security headers
  addSecurityHeaders(response)
  
  // Rate limiting
  const rateLimitResult = checkRateLimit(request)
  if (!rateLimitResult.allowed) {
    return new NextResponse("Too Many Requests", { 
      status: 429,
      headers: {
        "Retry-After": "60",
        "X-RateLimit-Limit": "100",
        "X-RateLimit-Remaining": "0"
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
      
      // For API routes, let the route handlers do detailed auth checks
      if (pathname.startsWith('/api/')) {
        // Just check if there's any session - detailed checks in route handlers
        if (!session.isLoggedIn) {
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
  response.headers.set('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: blob:; " +
    "font-src 'self'; " +
    "connect-src 'self'; " +
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

function checkRateLimit(request: NextRequest): { allowed: boolean; limit: number; remaining: number } {
  const ip = getClientIP(request)
  const key = `${ip}:${request.nextUrl.pathname}`
  const now = Date.now()
  const windowMs = 60 * 1000 // 1 minute window
  const limit = request.nextUrl.pathname.startsWith('/api/auth') ? 5 : 100 // Stricter for auth endpoints
  
  const current = rateLimitMap.get(key)
  
  if (!current || now > current.resetTime) {
    // New window
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs })
    return { allowed: true, limit, remaining: limit - 1 }
  }
  
  if (current.count >= limit) {
    return { allowed: false, limit, remaining: 0 }
  }
  
  current.count++
  return { allowed: true, limit, remaining: limit - current.count }
}

function getClientIP(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for') ||
    request.headers.get('x-real-ip') ||
    '127.0.0.1'
  )
}

function isPublicRoute(pathname: string): boolean {
  const publicRoutes = [
    '/login',
    '/favicon.ico',
    '/_next',
    '/api/health'
  ]
  
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