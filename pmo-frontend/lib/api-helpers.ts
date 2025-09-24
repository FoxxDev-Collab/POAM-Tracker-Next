// Client-side API helper
export function apiUrl(endpoint?: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
  if (!endpoint) return baseUrl;
  return `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
}