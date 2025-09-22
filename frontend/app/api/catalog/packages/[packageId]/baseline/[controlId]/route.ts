import { NextRequest, NextResponse } from 'next/server';
import { BACKEND_URL, getAuthHeaders } from '@/lib/server-api-helpers';

export async function PUT(
  request: NextRequest,
  { params }: { params: { packageId: string; controlId: string } }
) {
  try {
    const body = await request.json();
    const headers = await getAuthHeaders();

    const response = await fetch(`${BACKEND_URL}/catalog/packages/${params.packageId}/baseline/${params.controlId}`, {
      method: 'PUT',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to update baseline control' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Baseline control update error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}