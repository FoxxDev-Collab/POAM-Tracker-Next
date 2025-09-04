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
    const severity = url.searchParams.get('severity');
    const plugin_family = url.searchParams.get('plugin_family');
    const limit = url.searchParams.get('limit');
    const offset = url.searchParams.get('offset');
    
    const queryParams = new URLSearchParams();
    if (packageId) queryParams.append('package_id', packageId);
    if (systemId) queryParams.append('system_id', systemId);
    if (severity) queryParams.append('severity', severity);
    if (plugin_family) queryParams.append('plugin_family', plugin_family);
    if (limit) queryParams.append('limit', limit);
    if (offset) queryParams.append('offset', offset);
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    
    const response = await fetch(`${BACKEND_URL}/vulnerabilities${queryString}`, {
      method: 'GET',
      headers,
    });
    
    if (!response.ok) {
      let errorMessage = 'Failed to fetch vulnerabilities';
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
    console.error('Vulnerabilities fetch error:', error);
    return NextResponse.json({ error: "Failed to fetch vulnerabilities" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const headers = await getAuthHeaders();
    const url = new URL(req.url);
    const reportId = url.searchParams.get('report_id');
    
    if (!reportId) {
      return NextResponse.json({ error: 'report_id is required' }, { status: 400 });
    }
    
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