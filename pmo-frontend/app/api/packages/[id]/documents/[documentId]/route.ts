import { NextRequest, NextResponse } from "next/server";
import { getAuthHeaders, BACKEND_URL } from "@/lib/server-api-helpers";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string; documentId: string }> }) {
  try {
    const { id, documentId } = await params;
    const headers = await getAuthHeaders();

    const response = await fetch(`${BACKEND_URL}/packages/${id}/documents/${documentId}`, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json({ error: error.message || 'Failed to delete document' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Package document delete error:', error);
    return NextResponse.json({ error: "Failed to delete document" }, { status: 500 });
  }
}