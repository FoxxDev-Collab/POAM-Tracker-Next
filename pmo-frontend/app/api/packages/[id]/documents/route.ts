import { NextRequest, NextResponse } from "next/server";
import { getAuthHeaders, BACKEND_URL } from "@/lib/server-api-helpers";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const headers = await getAuthHeaders();

    const response = await fetch(`${BACKEND_URL}/packages/${id}/documents`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json({ error: error.message || 'Failed to fetch documents' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Package documents fetch error:', error);
    return NextResponse.json({ error: "Failed to fetch package documents" }, { status: 500 });
  }
}