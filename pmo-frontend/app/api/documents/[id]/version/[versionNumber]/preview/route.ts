import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string; versionNumber: string }> }
) {
  try {
    const { id, versionNumber } = await context.params;
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const response = await fetch(`${backendUrl}/api/documents/${id}/version/${versionNumber}/preview`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch version preview');
    }

    const blob = await response.blob();
    const headers = new Headers(response.headers);

    return new NextResponse(blob, {
      headers: {
        'Content-Type': headers.get('content-type') || 'application/pdf',
        'Content-Disposition': 'inline',
      },
    });
  } catch (error) {
    console.error('Error fetching version preview:', error);
    return NextResponse.json({ error: 'Failed to fetch version preview' }, { status: 500 });
  }
}
