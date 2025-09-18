import { NextRequest, NextResponse } from 'next/server';
import { BACKEND_URL, getAuthHeaders } from '@/lib/server-api-helpers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ controlId: string }> }
) {
  try {
    const { controlId } = await params;

    const headers = await getAuthHeaders();

    const response = await fetch(`${BACKEND_URL}/catalog/controls/${encodeURIComponent(controlId)}`, {
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to fetch control' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Catalog control fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
