import { NextRequest, NextResponse } from "next/server";
import { getAuthHeaders, BACKEND_URL } from "@/lib/server-api-helpers";

export async function GET() {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${BACKEND_URL}/packages`, {
      method: 'GET',
      headers,
    });
    
    if (!response.ok) {
      let errorMessage = 'Failed to fetch packages';
      try {
        const errorText = await response.text();
        if (errorText.includes('Too many requests')) {
          errorMessage = 'Too many requests. Please try again later.';
        } else {
          try {
            const error = JSON.parse(errorText);
            errorMessage = error.message || errorMessage;
          } catch {
            errorMessage = errorText || errorMessage;
          }
        }
      } catch {
        // If we can't read the error, use the default message
      }
      return NextResponse.json({ error: errorMessage }, { status: response.status });
    }

    const text = await response.text();
    if (!text) {
      return NextResponse.json([]);
    }

    try {
      const data = JSON.parse(text);
      return NextResponse.json(data);
    } catch (parseError) {
      console.error('Failed to parse backend response:', parseError);
      return NextResponse.json({ error: "Invalid response from backend" }, { status: 500 });
    }
  } catch (error) {
    console.error('Packages fetch error:', error);
    return NextResponse.json({ error: "Failed to fetch packages" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const headers = await getAuthHeaders();
    const body = await req.json();
    
    const response = await fetch(`${BACKEND_URL}/packages`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      let errorMessage = 'Failed to create package';
      try {
        const errorText = await response.text();
        if (errorText.includes('Too many requests')) {
          errorMessage = 'Too many requests. Please try again later.';
        } else {
          try {
            const error = JSON.parse(errorText);
            errorMessage = error.message || errorMessage;
          } catch {
            errorMessage = errorText || errorMessage;
          }
        }
      } catch {
        // If we can't read the error, use the default message
      }
      return NextResponse.json({ error: errorMessage }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Package creation error:', error);
    return NextResponse.json({ error: "Failed to create package" }, { status: 500 });
  }
}