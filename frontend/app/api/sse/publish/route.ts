import { NextRequest, NextResponse } from "next/server";

// Use Node.js runtime for Redis compatibility
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { channel, message } = await request.json();

    if (!channel || !message) {
      return NextResponse.json(
        { error: 'Channel and message are required' },
        { status: 400 }
      );
    }

    const { getRedisClient } = await import("@/lib/redis");
    const redis = getRedisClient();

    // Publish message to Redis channel
    await redis.publish(`sse:${channel}`, JSON.stringify({
      ...message,
      timestamp: Date.now(),
    }));

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error publishing SSE message:', error);
    return NextResponse.json(
      { error: 'Failed to publish message' },
      { status: 500 }
    );
  }
}