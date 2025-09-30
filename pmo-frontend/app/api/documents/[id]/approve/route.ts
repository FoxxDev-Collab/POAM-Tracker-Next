import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const response = await fetch(`${backendUrl}/api/documents/${id}/approve`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to approve document');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error approving document:', error);
    return NextResponse.json({ error: 'Failed to approve document' }, { status: 500 });
  }
}