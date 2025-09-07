import { NextRequest, NextResponse } from "next/server";
import { getAuthHeaders, BACKEND_URL } from "@/lib/api-helpers";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${BACKEND_URL}/groups?packageId=${id}`, {
      method: 'GET',
      headers,
    });
    
    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json({ error: error.message || 'Failed to fetch groups' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Groups fetch error:', error);
    return NextResponse.json({ error: "Failed to fetch groups" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const headers = await getAuthHeaders();
    const body = await req.json();
    
    // Add packageId to the request body
    const groupData = {
      ...body,
      packageId: parseInt(id)
    };
    
    const response = await fetch(`${BACKEND_URL}/groups`, {
      method: 'POST',
      headers,
      body: JSON.stringify(groupData)
    });
    
    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json({ error: error.message || 'Failed to create group' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Group creation error:', error);
    return NextResponse.json({ error: "Failed to create group" }, { status: 500 });
  }
}