"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Scan = { id: number; system_id: number; title: string | null; checklist_id: string | null; created_at: string }

export default function ScanHistory({ systemId }: { systemId: number }) {
  const [items, setItems] = useState<Scan[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const res = await fetch(`/api/systems/${systemId}/stig/scans`, { cache: "no-store" })
        const j = await res.json()
        if (!cancelled) setItems(j.items ?? [])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [systemId])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scan History</CardTitle>
      </CardHeader>
      <CardContent>
        {loading && <div className="text-sm text-muted-foreground">Loading…</div>}
        {!loading && items.length === 0 && (
          <div className="text-sm text-muted-foreground">No scans yet.</div>
        )}
        <div className="space-y-2">
          {items.map((s) => (
            <div key={s.id} className="flex items-center justify-between rounded-md border p-2">
              <div className="truncate">
                <div className="text-sm font-medium truncate">{s.title || `Scan #${s.id}`}</div>
                <div className="text-xs text-muted-foreground truncate">Checklist: {s.checklist_id || "n/a"}</div>
              </div>
              <div className="text-xs text-muted-foreground">{new Date(s.created_at).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
