import { NextResponse } from "next/server";
import { randomBytes } from "crypto";

export async function GET() {
  try {
    const token = randomBytes(32).toString('hex');
    
    return NextResponse.json({ csrfToken: token });
  } catch (error) {
    console.error('CSRF token generation error:', error);
    return NextResponse.json({ error: "Failed to generate CSRF token" }, { status: 500 });
  }
}