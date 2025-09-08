import { cookies } from "next/headers";

export const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

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