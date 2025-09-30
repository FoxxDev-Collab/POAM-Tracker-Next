import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const response = await fetch(`${backendUrl}/api/documents/${id}/download`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Failed to download document');
    }

    const blob = await response.blob();
    const headers = new Headers(response.headers);

    return new NextResponse(blob, {
      headers: {
        'Content-Type': headers.get('content-type') || 'application/pdf',
        'Content-Disposition': headers.get('content-disposition') || `attachment; filename="document.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error downloading document:', error);
    return NextResponse.json({ error: 'Failed to download document' }, { status: 500 });
  }
}