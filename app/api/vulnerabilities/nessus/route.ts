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
    const reportId = searchParams.get('report_id');
    const hostId = searchParams.get('host_id');
    const severity = searchParams.get('severity');
    const pluginFamily = searchParams.get('plugin_family');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');
    const systemId = searchParams.get('system_id');

    const headers = await getAuthHeaders();
    
    // Build query parameters
    const queryParams = new URLSearchParams();
    if (reportId) queryParams.append('report_id', reportId);
    if (hostId) queryParams.append('host_id', hostId);
    if (severity) queryParams.append('severity', severity);
    if (pluginFamily) queryParams.append('plugin_family', pluginFamily);
    if (limit) queryParams.append('limit', limit);
    if (offset) queryParams.append('offset', offset);
    
    // If system_id is provided, we need to get vulnerabilities for that system
    // This requires finding reports for that system first
    if (systemId && !reportId) {
      // First get reports for this system
      const reportsResponse = await fetch(`${BACKEND_URL}/vulnerabilities/reports?system_id=${systemId}`, {
        method: 'GET',
        headers,
      });
      
      if (reportsResponse.ok) {
        const reports = await reportsResponse.json();
        if (reports.length > 0) {
          // Use the first report's vulnerabilities
          queryParams.set('report_id', reports[0].id.toString());
        }
      }
    }

    const response = await fetch(`${BACKEND_URL}/vulnerabilities/nessus?${queryParams}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json({ 
        error: error.message || 'Failed to fetch Nessus vulnerabilities' 
      }, { status: response.status });
    }

    const vulnerabilities = await response.json();
    return NextResponse.json(vulnerabilities);

  } catch (error) {
    console.error('Nessus vulnerabilities fetch error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Failed to fetch Nessus vulnerabilities" 
    }, { status: 500 });
  }
}