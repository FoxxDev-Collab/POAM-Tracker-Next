import { NextRequest, NextResponse } from "next/server";
import { getAuthHeaders, BACKEND_URL } from "@/lib/api-helpers";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${BACKEND_URL}/packages/${id}/systems`, {
      method: 'GET',
      headers,
    });
    
    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json({ error: error.message || 'Failed to fetch package systems' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Package systems fetch error:', error);
    return NextResponse.json({ error: "Failed to fetch package systems" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const headers = await getAuthHeaders();
    const body = await req.json();
    
    // Add packageId to the body for the backend
    const payload = {
      ...body,
      packageId: parseInt(id)
    };
    
    // Use the /systems endpoint instead of /packages/{id}/systems
    const response = await fetch(`${BACKEND_URL}/systems`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json({ error: error.message || 'Failed to create system' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('System creation error:', error);
    return NextResponse.json({ error: "Failed to create system" }, { status: 500 });
  }
}