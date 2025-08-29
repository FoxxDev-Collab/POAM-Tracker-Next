import { AppShell } from "@/components/layout/app-shell"
import { Packages, Groups, getDb } from "@/lib/db"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import GroupsManager, { GroupItem } from "./GroupsManager"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, ShieldAlert, ShieldCheck } from "lucide-react"
import PackageSystemsTable from "./PackageSystemsTable"
import PackageATOUpdater from "./PackageATOUpdater"

export const dynamic = "force-dynamic"

export default async function PackageDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: pid } = await params
  const id = Number(pid)
  const item = Packages.get(id)
  if (!item) {
    return (
      <AppShell>
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="text-sm text-muted-foreground">Package not found.</div>
          <Link href="/packages"><Button variant="outline">Back to Packages</Button></Link>
        </div>
      </AppShell>
    )
  }
  const groups = Groups.byPackage(id)

  // Aggregated STIG stats across all systems in this package
  const totalRow = getDb().prepare(`
    SELECT COUNT(*) as c
    FROM stig_findings f
    JOIN systems s ON s.id = f.system_id
    WHERE s.package_id = ?
  `).get(id) as { c: number } | undefined
  const totalFindings = totalRow?.c ?? 0

  const bySeverity = getDb().prepare(`
    SELECT COALESCE(f.severity, 'unknown') as k, COUNT(*) as c
    FROM stig_findings f
    JOIN systems s ON s.id = f.system_id
    WHERE s.package_id = ?
    GROUP BY k
  `).all(id) as { k: string, c: number }[]

  const byStatus = getDb().prepare(`
    SELECT COALESCE(f.status, 'unknown') as k, COUNT(*) as c
    FROM stig_findings f
    JOIN systems s ON s.id = f.system_id
    WHERE s.package_id = ?
    GROUP BY k
  `).all(id) as { k: string, c: number }[]

  const latestScan = getDb().prepare(`
    SELECT sc.*, s.name as system_name
    FROM stig_scans sc
    JOIN systems s ON s.id = sc.system_id
    WHERE s.package_id = ?
    ORDER BY sc.created_at DESC, sc.id DESC
    LIMIT 1
  `).get(id) as {
    id: number;
    system_id: number;
    title: string | null;
    checklist_id: string | null;
    created_at: string;
    system_name: string;
  } | undefined

  function getCount(arr: { k: string, c: number }[], key: string) {
    return arr.find(x => (x.k || '').toLowerCase() === key.toLowerCase())?.c ?? 0
  }

  function statusAccent(k: string) {
    const v = (k || '').toLowerCase()
    if (v === 'open') return 'border-red-600/70'
    if (v === 'not_reviewed') return 'border-blue-600/70'
    if (v === 'not_applicable') return 'border-gray-500/60'
    if (v === 'not_a_finding') return 'border-green-600/70'
    if (v === 'mitigated') return 'border-amber-600/70'
    return 'border-muted-foreground/40'
  }
  return (
    <AppShell>
      <div className="p-6 grid gap-6">
        {/* Header */}
        <div className="rounded-md border bg-card text-card-foreground p-5">
          <div className="mb-3">
            <Button asChild variant="outline" size="sm">
              <Link href="/packages">
                <ArrowLeft className="h-4 w-4" />
                Back to Packages
              </Link>
            </Button>
          </div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold">{item.name}</h2>
              <p className="text-sm text-muted-foreground">{item.description || "No description"}</p>
            </div>
            <div className="text-sm text-muted-foreground">
              {groups.length} {groups.length === 1 ? 'Group' : 'Groups'}
            </div>
          </div>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-t-4 border-blue-600 bg-blue-50/60 dark:bg-blue-950/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Findings (All Systems)</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-semibold">{totalFindings}</CardContent>
          </Card>
          <Card className="border-t-4 border-red-600 bg-red-50/60 dark:bg-red-950/20">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium">High (CAT I)</CardTitle>
              <ShieldAlert className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent className="text-3xl font-semibold">{getCount(bySeverity, 'high') + getCount(bySeverity, 'cat i') + getCount(bySeverity, 'cat1')}</CardContent>
          </Card>
          <Card className="border-t-4 border-orange-500 bg-orange-50/60 dark:bg-orange-950/20">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium">Medium (CAT II)</CardTitle>
              <ShieldAlert className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent className="text-3xl font-semibold">{getCount(bySeverity, 'medium') + getCount(bySeverity, 'cat ii') + getCount(bySeverity, 'cat2')}</CardContent>
          </Card>
          <Card className="border-t-4 border-yellow-500 bg-yellow-50/60 dark:bg-yellow-950/20">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium">Low (CAT III)</CardTitle>
              <ShieldCheck className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent className="text-3xl font-semibold">{getCount(bySeverity, 'low') + getCount(bySeverity, 'cat iii') + getCount(bySeverity, 'cat3')}</CardContent>
          </Card>
        </div>

        {/* Breakdown Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Status Breakdown (All Systems)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                {byStatus.map((s) => (
                  <div key={s.k} className={`flex items-center justify-between rounded-md border px-3 py-2 bg-background/50 border-l-4 ${statusAccent(s.k)}`}>
                    <span className="truncate capitalize">{(s.k || 'unknown').replace(/_/g, ' ')}</span>
                    <span className="font-semibold">{s.c}</span>
                  </div>
                ))}
                {byStatus.length === 0 && <div className="text-sm text-muted-foreground">No data yet.</div>}
              </div>
            </CardContent>
          </Card>
          <Card className="border-t-4 border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/20">
            <CardHeader>
              <CardTitle>Latest STIG Scan (Any System)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {latestScan ? (
                <>
                  <div className="flex items-center justify-between"><span className="text-muted-foreground">System</span><span className="truncate max-w-[60%] text-right">{latestScan.system_name ?? '—'}</span></div>
                  <div className="flex items-center justify-between"><span className="text-muted-foreground">Title</span><span className="truncate max-w-[60%] text-right">{latestScan.title ?? '—'}</span></div>
                  <div className="flex items-center justify-between"><span className="text-muted-foreground">Checklist ID</span><span className="truncate max-w-[60%] text-right">{latestScan.checklist_id ?? '—'}</span></div>
                  <div className="flex items-center justify-between"><span className="text-muted-foreground">Imported</span><span>{new Date(latestScan.created_at).toLocaleString()}</span></div>
                  <div className="pt-1">
                    <Button asChild size="sm">
                      <Link href={`/systems/${latestScan.system_id}/stig`}>View Findings</Link>
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-muted-foreground">No scans yet.</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ATO Security Details */}
        <PackageATOUpdater packageData={item} />

        {/* Systems in this Package */}
        <PackageSystemsTable pkgId={id} />

        {/* Groups Manager */}
        <GroupsManager pkgId={id} initial={groups as GroupItem[]} />
      </div>
    </AppShell>
  )
}
