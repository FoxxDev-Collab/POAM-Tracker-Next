import { NextRequest, NextResponse } from 'next/server';
import { BACKEND_URL, getAuthHeaders } from '@/lib/server-api-helpers';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '50';
    const search = searchParams.get('search');
    const family = searchParams.get('family');

    const params = new URLSearchParams({
      page,
      limit,
      ...(search && { search }),
      ...(family && { family }),
    });

    const headers = await getAuthHeaders();

    const response = await fetch(`${BACKEND_URL}/catalog/controls?${params}`, {
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to fetch controls' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Catalog controls fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
