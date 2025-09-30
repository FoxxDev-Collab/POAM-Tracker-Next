import { NextRequest, NextResponse } from "next/server";
import { getAuthHeaders, BACKEND_URL } from "@/lib/server-api-helpers";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string; documentId: string }> }) {
  try {
    const { id, documentId } = await params;
    const headers = await getAuthHeaders();

    const response = await fetch(`${BACKEND_URL}/packages/${id}/documents/${documentId}/download`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json({ error: error.message || 'Failed to download document' }, { status: response.status });
    }

    // For file downloads, we need to return the blob directly
    const blob = await response.blob();
    const responseHeaders = new Headers();

    // Copy relevant headers from the backend response
    response.headers.forEach((value, name) => {
      if (name.toLowerCase().startsWith('content-')) {
        responseHeaders.set(name, value);
      }
    });

    return new NextResponse(blob, {
      status: 200,
      headers: responseHeaders
    });
  } catch (error) {
    console.error('Package document download error:', error);
    return NextResponse.json({ error: "Failed to download document" }, { status: 500 });
  }
}