import { NextRequest, NextResponse } from 'next/server';
import { BACKEND_URL, getAuthHeaders } from '@/lib/server-api-helpers';

export async function POST(_request: NextRequest) {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(`${BACKEND_URL}/catalog/import`, {
      method: 'POST',
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || 'Import failed' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Catalog import error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
