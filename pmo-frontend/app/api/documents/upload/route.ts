import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    // Get the JWT token from the request cookies
    const token = request.cookies.get('token')?.value;

    // Forward the form data to the backend
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${backendUrl}/api/documents/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.message || 'Failed to upload document' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error uploading document:', error);
    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    );
  }
}