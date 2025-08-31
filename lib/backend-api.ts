import { NextRequest } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

interface BackendRequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
  token?: string;
}

export class BackendApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'BackendApiError';
  }
}

export async function makeBackendRequest(
  endpoint: string,
  options: BackendRequestOptions = {}
) {
  const {
    method = 'GET',
    body,
    headers = {},
    token
  } = options;

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (token) {
    requestHeaders['Authorization'] = `Bearer ${token}`;
  }

  const requestInit: RequestInit = {
    method,
    headers: requestHeaders,
  };

  if (body && method !== 'GET') {
    requestInit.body = JSON.stringify(body);
  }

  const url = `${BACKEND_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, requestInit);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new BackendApiError(
        response.status,
        errorData?.message || response.statusText,
        errorData
      );
    }

    if (response.status === 204) {
      return null;
    }

    return await response.json();
  } catch (error) {
    if (error instanceof BackendApiError) {
      throw error;
    }
    throw new BackendApiError(500, 'Failed to connect to backend service', error);
  }
}

export function extractTokenFromRequest(req: NextRequest): string | null {
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Also check cookies for token
  const tokenCookie = req.cookies.get('token');
  if (tokenCookie) {
    return tokenCookie.value;
  }
  
  return null;
}

export function createBackendResponse(
  data: any,
  status: number = 200
) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export function createErrorResponse(
  error: BackendApiError,
  defaultStatus: number = 500
) {
  return createBackendResponse(
    { error: error.message, details: error.data },
    error.status || defaultStatus
  );
}