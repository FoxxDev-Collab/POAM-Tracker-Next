import { NextRequest, NextResponse } from "next/server"
import { Packages, Systems, Groups, getDb } from "@/lib/db"

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: pid } = await params
    const pkgId = Number(pid)
    const pkg = Packages.get(pkgId)
    if (!pkg) return NextResponse.json({ error: "Package not found" }, { status: 404 })
    const items = Systems.byPackage(pkgId)

    // Vulnerability stats per system
    const systemIds = items.map((s) => s.id)
    let statsBySystem: Record<number, { total: number; high: number; medium: number; low: number }> = {}
    if (systemIds.length > 0) {
      const placeholders = systemIds.map(() => '?').join(',')
      const rows = getDb().prepare(
        `SELECT system_id,
                COUNT(*) as total,
                SUM(CASE WHEN lower(COALESCE(severity,'')) IN ('high', 'cat i', 'cat1') THEN 1 ELSE 0 END) as high,
                SUM(CASE WHEN lower(COALESCE(severity,'')) IN ('medium', 'cat ii', 'cat2') THEN 1 ELSE 0 END) as medium,
                SUM(CASE WHEN lower(COALESCE(severity,'')) IN ('low', 'cat iii', 'cat3') THEN 1 ELSE 0 END) as low
         FROM stig_findings
         WHERE system_id IN (${placeholders})
         GROUP BY system_id`
      ).all(...systemIds) as Array<{ system_id: number; total: number; high: number; medium: number; low: number }>
      statsBySystem = Object.fromEntries(rows.map(r => [r.system_id, { total: r.total ?? 0, high: r.high ?? 0, medium: r.medium ?? 0, low: r.low ?? 0 }]))
    }

    // Group names mapping
    const uniqueGroupIds = Array.from(new Set(items.map(i => i.group_id).filter((x): x is number => typeof x === 'number')))
    const groupNameById = Object.fromEntries(uniqueGroupIds.map(gid => [gid, Groups.get(gid)?.name ?? ''] as const))

    const enriched = items.map((s) => ({
      ...s,
      group_name: s.group_id ? (groupNameById[s.group_id] ?? '') : '',
      ...(statsBySystem[s.id] ?? { total: 0, high: 0, medium: 0, low: 0 })
    }))

    return NextResponse.json({ items: enriched })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to list systems"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: pid } = await params
    const pkgId = Number(pid)
    const pkg = Packages.get(pkgId)
    if (!pkg) return NextResponse.json({ error: "Package not found" }, { status: 404 })
    const body = await req.json()
    const name = String(body?.name ?? "").trim()
    const description = String(body?.description ?? "")
    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 })
    const created = Systems.create(pkgId, { name, description })
    return NextResponse.json({ item: created }, { status: 201 })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to create system"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
