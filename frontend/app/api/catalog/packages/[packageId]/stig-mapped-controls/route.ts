import { NextRequest, NextResponse } from 'next/server';
import { BACKEND_URL, getAuthHeaders } from '@/lib/server-api-helpers';

export async function GET(
  request: NextRequest,
  { params }: { params: { packageId: string } }
) {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(`${BACKEND_URL}/catalog/packages/${params.packageId}/stig-mapped-controls`, {
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to fetch STIG mapped controls' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('STIG mapped controls fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}