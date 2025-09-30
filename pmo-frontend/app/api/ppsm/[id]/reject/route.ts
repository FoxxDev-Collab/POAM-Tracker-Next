import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const response = await fetch(`${backendUrl}/api/ppsm/${id}/reject`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.message || 'Failed to reject PPSM entry' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error rejecting PPSM entry:', error);
    return NextResponse.json(
      { error: 'Failed to reject PPSM entry' },
      { status: 500 }
    );
  }
}