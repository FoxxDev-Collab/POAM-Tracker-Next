import { cookies } from "next/headers";

export const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export function serverApiUrl() {
  return BACKEND_URL;
}

// Helper to construct backend API URLs with the /api prefix
export function backendApiUrl(path: string): string {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  // Add /api prefix if not already present
  const apiPath = cleanPath.startsWith('api/') ? cleanPath : `api/${cleanPath}`;
  return `${BACKEND_URL}/${apiPath}`;
}

// Server-side auth headers helper
export async function getAuthHeaders(): Promise<Record<string, string>> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token.value}`;
  }

  return headers;
}