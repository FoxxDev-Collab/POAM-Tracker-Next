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
    const { searchParams } = new URL(req.url);
    const packageId = searchParams.get('package_id');
    const systemId = searchParams.get('system_id');
    const reportId = searchParams.get('report_id');

    const headers = await getAuthHeaders();
    
    // Build query parameters
    const queryParams = new URLSearchParams();
    if (packageId) queryParams.append('package_id', packageId);
    if (systemId) queryParams.append('system_id', systemId);
    if (reportId) queryParams.append('report_id', reportId);

    const response = await fetch(`${BACKEND_URL}/vulnerabilities/nessus/stats?${queryParams}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json({ 
        error: error.message || 'Failed to fetch Nessus vulnerability stats' 
      }, { status: response.status });
    }

    const stats = await response.json();
    return NextResponse.json(stats);

  } catch (error) {
    console.error('Nessus stats fetch error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Failed to fetch vulnerability stats" 
    }, { status: 500 });
  }
}