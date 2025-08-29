import { NextRequest, NextResponse } from "next/server"
import { STIG, Systems } from "@/lib/db"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: pid } = await params
    const systemId = Number(pid)
    if (!Number.isFinite(systemId)) return NextResponse.json({ error: "Invalid system id" }, { status: 400 })
    const sys = Systems.get(systemId)
    if (!sys) return NextResponse.json({ error: "System not found" }, { status: 404 })

    const { searchParams } = new URL(req.url)
    const severity = searchParams.get("severity") || undefined
    const status = searchParams.get("status") || undefined
    const q = searchParams.get("q") || undefined
    const page = Number(searchParams.get("page") || "1")
    const pageSize = Number(searchParams.get("pageSize") || "20")

    const { items, total } = STIG.listFindingsBySystem(systemId, { severity, status, q, page, pageSize })
    return NextResponse.json({ items, total, page, pageSize })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to list findings"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
