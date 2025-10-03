import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    const response = await fetch(`${backendUrl}/api/documents/${id}/track-view`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error('Failed to track view');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error tracking view:', error);
    // Don't fail the request if view tracking fails
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
