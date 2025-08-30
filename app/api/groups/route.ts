import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"

export async function GET() {
  try {
    const db = getDb()
    const items = db.prepare("SELECT * FROM groups ORDER BY name").all()
    return NextResponse.json({ items })
  } catch (error) {
    console.error('Error fetching groups:', error)
    return NextResponse.json({ error: 'Failed to fetch groups' }, { status: 500 })
  }
}
