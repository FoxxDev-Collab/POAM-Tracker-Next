import { NextRequest, NextResponse } from 'next/server';
import { BACKEND_URL, getAuthHeaders } from '@/lib/server-api-helpers';

export async function POST(
  request: NextRequest,
  { params }: { params: { packageId: string } }
) {
  try {
    const body = await request.json();
    const headers = await getAuthHeaders();

    const response = await fetch(`${BACKEND_URL}/catalog/packages/${params.packageId}/baseline/bulk-update`, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to bulk update baseline' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Baseline bulk update error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}