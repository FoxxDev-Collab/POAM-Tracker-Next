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
    const systemId = url.searchParams.get('system_id');
    const groupId = url.searchParams.get('group_id');
    const severity = url.searchParams.get('severity');
    const status = url.searchParams.get('status');
    
    const queryParams = new URLSearchParams();
    if (systemId) queryParams.append('system_id', systemId);
    if (groupId) queryParams.append('group_id', groupId);
    if (severity) queryParams.append('severity', severity);
    if (status) queryParams.append('status', status);
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    
    const response = await fetch(`${BACKEND_URL}/vulnerabilities${queryString}`, {
      method: 'GET',
      headers,
    });
    
    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json({ error: error.message || 'Failed to fetch vulnerabilities' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Vulnerabilities fetch error:', error);
    return NextResponse.json({ error: "Failed to fetch vulnerabilities" }, { status: 500 });
  }
}