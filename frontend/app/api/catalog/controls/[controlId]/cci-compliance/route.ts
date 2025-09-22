import { NextRequest, NextResponse } from 'next/server';
import { BACKEND_URL, getAuthHeaders } from '@/lib/server-api-helpers';

export async function GET(
  request: NextRequest,
  { params }: { params: { controlId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const packageId = searchParams.get('packageId');
    const queryString = packageId ? `?packageId=${packageId}` : '';

    const headers = await getAuthHeaders();

    const response = await fetch(`${BACKEND_URL}/catalog/controls/${params.controlId}/cci-compliance${queryString}`, {
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to fetch CCI compliance' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('CCI compliance fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}