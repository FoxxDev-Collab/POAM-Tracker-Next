import { NextRequest, NextResponse } from "next/server";
import { getAuthHeaders, BACKEND_URL } from "@/lib/server-api-helpers";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const headers = await getAuthHeaders();

    // Get the form data from the request
    const formData = await req.formData();

    // Remove the Content-Type header to let fetch set it properly with boundary
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { 'Content-Type': _, ...cleanHeaders } = headers;

    // Forward the form data to the backend
    const response = await fetch(`${BACKEND_URL}/packages/${id}/documents/upload`, {
      method: 'POST',
      headers: cleanHeaders,
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json({ error: error.message || 'Failed to upload document' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Package document upload error:', error);
    return NextResponse.json({ error: "Failed to upload document" }, { status: 500 });
  }
}