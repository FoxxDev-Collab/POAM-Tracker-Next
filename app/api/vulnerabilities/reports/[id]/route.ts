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

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const headers = await getAuthHeaders();
    const reportId = params.id;
    
    const response = await fetch(`${BACKEND_URL}/vulnerabilities/reports/${reportId}`, {
      method: 'GET',
      headers,
    });
    
    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json({ error: error.message || 'Failed to fetch vulnerability report' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Vulnerability report fetch error:', error);
    return NextResponse.json({ error: "Failed to fetch vulnerability report" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const headers = await getAuthHeaders();
    const reportId = params.id;
    
    const response = await fetch(`${BACKEND_URL}/vulnerabilities/reports/${reportId}`, {
      method: 'DELETE',
      headers,
    });
    
    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json({ error: error.message || 'Failed to delete vulnerability report' }, { status: response.status });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Vulnerability report deletion error:', error);
    return NextResponse.json({ error: "Failed to delete vulnerability report" }, { status: 500 });
  }
}