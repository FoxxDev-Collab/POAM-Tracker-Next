import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

async function getAuthHeaders() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');
  
  return token ? {
    'Authorization': `Bearer ${token.value}`,
  } : {};
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const headers = await getAuthHeaders();
    const resolvedParams = await params;
    
    const response = await fetch(`${BACKEND_URL}/stps/test-cases/${resolvedParams.id}/evidence`, {
      method: 'GET',
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json({ error: error.message || 'Failed to fetch evidence' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Evidence fetch error:', error);
    return NextResponse.json({ error: "Failed to fetch evidence" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const headers = await getAuthHeaders();
    const resolvedParams = await params;
    
    // Parse form data
    const formData = await req.formData();
    
    // Create a new FormData to forward to backend
    const backendFormData = new FormData();
    
    // Copy all form fields
    for (const [key, value] of formData.entries()) {
      backendFormData.append(key, value);
    }
    
    const response = await fetch(`${BACKEND_URL}/stps/test-cases/${resolvedParams.id}/evidence`, {
      method: 'POST',
      headers: {
        ...headers,
        // Don't set Content-Type for FormData, let the browser set it
      },
      body: backendFormData
    });
    
    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json({ error: error.message || 'Failed to upload evidence' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Evidence upload error:', error);
    return NextResponse.json({ error: "Failed to upload evidence" }, { status: 500 });
  }
}