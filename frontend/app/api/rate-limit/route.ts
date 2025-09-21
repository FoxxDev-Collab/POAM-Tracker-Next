import { NextRequest, NextResponse } from "next/server";

// Use Node.js runtime for Redis compatibility
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { key, limit, windowMs } = await request.json();

    if (!key || !limit || !windowMs) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const { checkRedisRateLimit } = await import("@/lib/redis");
    const result = await checkRedisRateLimit(key, limit, windowMs);

    return NextResponse.json({
      allowed: result.allowed,
      remaining: result.remaining,
      resetTime: result.resetTime,
    });

  } catch (error) {
    console.error('Redis rate limit error:', error);
    return NextResponse.json(
      { error: 'Rate limit check failed', fallback: true },
      { status: 500 }
    );
  }
}