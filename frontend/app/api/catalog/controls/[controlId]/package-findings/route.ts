import { NextRequest, NextResponse } from 'next/server';
import { BACKEND_URL, getAuthHeaders } from '@/lib/server-api-helpers';

export async function GET(
  request: NextRequest,
  { params }: { params: { controlId: string } }
) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const packageId = searchParams.get('packageId');

    if (!packageId) {
      return NextResponse.json(
        { success: false, message: 'Package ID is required' },
        { status: 400 }
      );
    }

    const headers = await getAuthHeaders();

    const response = await fetch(`${BACKEND_URL}/catalog/controls/${params.controlId}/package-findings?packageId=${packageId}`, {
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to fetch control package findings' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Control package findings fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}