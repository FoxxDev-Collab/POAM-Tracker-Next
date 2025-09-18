// Client-side API helper
export function apiUrl(endpoint: string): string {
  const baseUrl = 'http://localhost:3001';
  return `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
}