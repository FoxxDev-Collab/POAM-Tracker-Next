import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// Increase the maximum file size for this API route
export const maxDuration = 300; // 5 minutes timeout
export const dynamic = 'force-dynamic';

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

export async function POST(req: NextRequest) {
  try {
    // Check file size before processing
    const contentLength = req.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 50 * 1024 * 1024) { // 50MB limit
      return NextResponse.json({ 
        error: 'File too large. Maximum size is 50MB.' 
      }, { status: 413 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!file.name.endsWith('.nessus')) {
      return NextResponse.json({ error: 'Invalid file type. Only .nessus files are supported.' }, { status: 400 });
    }

    // Additional file size check
    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      return NextResponse.json({ 
        error: 'File too large. Maximum size is 50MB.' 
      }, { status: 413 });
    }

    // Send raw file to backend for parsing
    const headers = await getAuthHeaders();
    
    // Create new FormData for backend (preserve original file)
    const backendFormData = new FormData();
    backendFormData.append('file', file);
    backendFormData.append('filename', file.name);
    if (formData.get('package_id')) {
      backendFormData.append('package_id', formData.get('package_id') as string);
    }
    if (formData.get('system_id')) {
      backendFormData.append('system_id', formData.get('system_id') as string);
    }

    // Remove Content-Type header to let browser set boundary for multipart/form-data
    const backendHeaders = { ...headers };
    delete backendHeaders['Content-Type'];

    const response = await fetch(`${BACKEND_URL}/vulnerabilities/upload`, {
      method: 'POST',
      headers: backendHeaders,
      body: backendFormData
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json({ 
        error: error.message || 'Failed to import Nessus data' 
      }, { status: response.status });
    }

    const result = await response.json();
    
    // Backend now returns the full result with summary
    return NextResponse.json(result);

  } catch (error) {
    console.error('Nessus upload error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Failed to process Nessus file" 
    }, { status: 500 });
  }
}