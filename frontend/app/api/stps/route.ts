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

export async function GET(req: NextRequest) {
  try {
    const headers = await getAuthHeaders();
    const url = new URL(req.url);
    const packageId = url.searchParams.get('package_id');
    const systemId = url.searchParams.get('system_id');
    
    const queryParams = new URLSearchParams();
    if (packageId) queryParams.append('package_id', packageId);
    if (systemId) queryParams.append('system_id', systemId);
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    
    const response = await fetch(`${BACKEND_URL}/stps${queryString}`, {
      method: 'GET',
      headers,
    });
    
    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json({ error: error.message || 'Failed to fetch STPs' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('STPs fetch error:', error);
    return NextResponse.json({ error: "Failed to fetch STPs" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const headers = await getAuthHeaders();
    const body = await req.json();
    
    const response = await fetch(`${BACKEND_URL}/stps`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json({ error: error.message || 'Failed to create STP' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('STP creation error:', error);
    return NextResponse.json({ error: "Failed to create STP" }, { status: 500 });
  }
}