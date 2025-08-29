import { NextRequest, NextResponse } from "next/server";
import { Groups, Packages, getDb } from "@/lib/db";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: pid } = await params;
    const pkgId = Number(pid);
    const pkg = Packages.get(pkgId);
    if (!pkg) return NextResponse.json({ error: "Package not found" }, { status: 404 });
    const items = Groups.byPackage(pkgId);

    // Aggregate vulnerability counts per group across its systems
    const groupIds = items.map(g => g.id);
    let statsByGroup: Record<number, { total: number; high: number; medium: number; low: number }> = {};
    if (groupIds.length > 0) {
      const placeholders = groupIds.map(() => '?').join(',');
      const rows = getDb().prepare(
        `SELECT s.group_id as gid,
                COUNT(f.id) as total,
                SUM(CASE WHEN lower(COALESCE(f.severity,'')) IN ('high', 'cat i', 'cat1') THEN 1 ELSE 0 END) as high,
                SUM(CASE WHEN lower(COALESCE(f.severity,'')) IN ('medium', 'cat ii', 'cat2') THEN 1 ELSE 0 END) as medium,
                SUM(CASE WHEN lower(COALESCE(f.severity,'')) IN ('low', 'cat iii', 'cat3') THEN 1 ELSE 0 END) as low
         FROM systems s
         JOIN stig_findings f ON f.system_id = s.id
         WHERE s.group_id IN (${placeholders})
         GROUP BY s.group_id`
      ).all(...groupIds) as Array<{ gid: number; total: number; high: number; medium: number; low: number }>;
      statsByGroup = Object.fromEntries(rows.map(r => [r.gid, { total: r.total ?? 0, high: r.high ?? 0, medium: r.medium ?? 0, low: r.low ?? 0 }]));
    }

    const enriched = items.map(g => ({
      ...g,
      ...(statsByGroup[g.id] ?? { total: 0, high: 0, medium: 0, low: 0 })
    }));

    return NextResponse.json({ items: enriched });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to list groups";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: pid } = await params;
    const pkgId = Number(pid);
    const pkg = Packages.get(pkgId);
    if (!pkg) return NextResponse.json({ error: "Package not found" }, { status: 404 });
    const body: unknown = await req.json();
    const record = (body && typeof body === "object") ? (body as Record<string, unknown>) : {};
    const name = String(record.name ?? "").trim();
    const description = String(record.description ?? "");
    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });
    const created = Groups.create(pkgId, { name, description });
    return NextResponse.json({ item: created }, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed to create group";
    const status = /UNIQUE/.test(msg) ? 409 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
