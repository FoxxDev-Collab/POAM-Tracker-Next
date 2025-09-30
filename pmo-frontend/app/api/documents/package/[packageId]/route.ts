import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ packageId: string }> }
) {
  try {
    const { packageId } = await context.params;
    const searchParams = request.nextUrl.searchParams;
    const controlFamily = searchParams.get('controlFamily');
    const documentType = searchParams.get('documentType');

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    let url = `${backendUrl}/api/documents/package/${packageId}`;

    const queryParams = [];
    if (controlFamily) queryParams.push(`controlFamily=${controlFamily}`);
    if (documentType) queryParams.push(`documentType=${documentType}`);
    if (queryParams.length > 0) {
      url += `?${queryParams.join('&')}`;
    }

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch documents');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching package documents:', error);
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
}