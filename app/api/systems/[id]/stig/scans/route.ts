import { NextRequest, NextResponse } from "next/server"
import { STIG, Systems } from "@/lib/db"

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: pid } = await params
    const systemId = Number(pid)
    if (!Number.isFinite(systemId)) return NextResponse.json({ error: "Invalid system id" }, { status: 400 })
    const sys = Systems.get(systemId)
    if (!sys) return NextResponse.json({ error: "System not found" }, { status: 404 })
    const items = STIG.listScansBySystem(systemId)
    return NextResponse.json({ items })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to list scans"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
