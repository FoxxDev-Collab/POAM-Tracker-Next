import { NextRequest, NextResponse } from "next/server";
import { getAuthHeaders, BACKEND_URL } from "@/lib/server-api-helpers";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; systemId: string }> }
) {
  try {
    const { id, systemId } = await params;
    const headers = await getAuthHeaders();
    
    // Use the /systems/{id} endpoint instead of nested route
    const response = await fetch(`${BACKEND_URL}/systems/${systemId}`, {
      method: 'GET',
      headers,
    });
    
    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json({ error: error.message || 'Failed to fetch system' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('System fetch error:', error);
    return NextResponse.json({ error: "Failed to fetch system" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; systemId: string }> }
) {
  try {
    const { id, systemId } = await params;
    const headers = await getAuthHeaders();
    const body = await req.json();
    
    // Use the /systems/{id} endpoint instead of nested route
    const response = await fetch(`${BACKEND_URL}/systems/${systemId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json({ error: error.message || 'Failed to update system' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('System update error:', error);
    return NextResponse.json({ error: "Failed to update system" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; systemId: string }> }
) {
  try {
    const { id, systemId } = await params;
    const headers = await getAuthHeaders();
    
    // Use the /systems/{id} endpoint instead of nested route
    const response = await fetch(`${BACKEND_URL}/systems/${systemId}`, {
      method: 'DELETE',
      headers,
    });
    
    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json({ error: error.message || 'Failed to delete system' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('System deletion error:', error);
    return NextResponse.json({ error: "Failed to delete system" }, { status: 500 });
  }
}