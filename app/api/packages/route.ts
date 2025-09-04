import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

async function getAuthHeaders() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');
  
  return token ? {
    'Authorization': `Bearer ${token.value}`,
    'Content-Type': 'application/json'
  } : {
    'Content-Type': 'application/json'
  };
}

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

    const data = await response.json();
    return NextResponse.json(data);
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