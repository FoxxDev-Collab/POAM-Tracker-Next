import { NextRequest, NextResponse } from "next/server"
import { STIG, Systems } from "@/lib/db"

// Ingest CKLB (STIG JSON) for a system
// POST /api/systems/[id]/cklb
// Body: JSON matching CKLB structure provided
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: pid } = await params
    const systemId = Number(pid)
    if (!Number.isFinite(systemId)) {
      return NextResponse.json({ error: "Invalid system id" }, { status: 400 })
    }

    const system = Systems.get(systemId)
    if (!system) return NextResponse.json({ error: "System not found" }, { status: 404 })

    const body: unknown = await req.json().catch(() => null)
    if (!isPlainObject(body)) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
    }

    const title = typeof body.title === 'string' ? body.title : "STIG Checklist"
    const checklist_id = typeof body.id === "string" ? body.id : null

    const scan = STIG.createScan(systemId, { title, checklist_id: checklist_id ?? undefined })

    const stigs: StigPayload[] = Array.isArray(body.stigs) ? body.stigs.filter(isStigPayload) : []
    let processed = 0

    for (const stig of stigs) {
      const rules: RulePayload[] = Array.isArray(stig.rules) ? stig.rules.filter(isRulePayload) : []
      for (const r of rules) {
        const group_id: string | undefined = r.group_id ?? undefined
        const rule_id: string | undefined = r.rule_id ?? r.rule_id_src ?? r.group_id ?? undefined
        if (!rule_id) continue
        const rule_title: string | undefined = r.rule_title ?? r.group_title ?? undefined
        const rule_version: string | undefined = r.rule_version ?? undefined
        const severity: string | undefined = r.severity ?? undefined
        const status: string | undefined = r.status ?? undefined
        const finding_details: string | undefined = r.finding_details ?? undefined
        const check_content: string | undefined = r.check_content ?? undefined
        const fix_text: string | undefined = r.fix_text ?? undefined
        const cci: string | undefined = Array.isArray(r.ccis) ? r.ccis.filter((x): x is string => typeof x === 'string').join(",") : (typeof r.cci === "string" ? r.cci : undefined)

        STIG.upsertFinding(systemId, scan.id, {
          group_id,
          rule_id,
          rule_title,
          rule_version,
          severity,
          status,
          finding_details,
          check_content,
          fix_text,
          cci,
        })
        processed++
      }
    }

    return NextResponse.json({ scan, processed })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to import CKLB"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// ---- Types and type guards for CKLB payload ----
type StigPayload = {
  rules?: unknown
}

type RulePayload = {
  group_id?: string
  rule_id?: string
  rule_id_src?: string
  group_title?: string
  rule_title?: string
  rule_version?: string
  severity?: string
  status?: string
  finding_details?: string
  check_content?: string
  fix_text?: string
  cci?: string
  ccis?: unknown
}

type BodyPayload = {
  title?: unknown
  id?: unknown
  stigs?: unknown
}

function isPlainObject(v: unknown): v is BodyPayload & Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

function isStigPayload(v: unknown): v is StigPayload {
  return typeof v === 'object' && v !== null
}

function isRulePayload(v: unknown): v is RulePayload {
  if (typeof v !== 'object' || v === null) return false
  // Optional fields; basic object check is sufficient here
  return true
}
