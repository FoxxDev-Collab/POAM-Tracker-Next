import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ packageId: string }> }
) {
  try {
    const { packageId } = await context.params;
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const response = await fetch(`${backendUrl}/api/ppsm/package/${packageId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      // Return empty entries array if no data found
      return NextResponse.json({ entries: [] });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching PPSM entries:', error);
    return NextResponse.json({ entries: [] }, { status: 200 });
  }
}