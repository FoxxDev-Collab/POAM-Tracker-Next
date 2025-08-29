import { AppShell } from "@/components/layout/app-shell"
import { Systems } from "@/lib/db"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default async function SystemNessusPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: pid } = await params
  const id = Number(pid)
  const system = Systems.get(id)
  if (!system) {
    return (
      <div className="p-6">
        <div className="text-sm text-muted-foreground">System not found.</div>
        <div className="mt-4">
          <Link href="/packages">Back to Packages</Link>
        </div>
      </div>
    )
  }

  return (
    <AppShell>
      <div className="p-6 grid gap-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Button asChild variant="outline" size="sm">
              <Link href={`/systems/${id}`}>
                <ArrowLeft className="h-4 w-4" />
                Back to System
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link href={`/systems/${id}/stig`}>
                Go to STIG
              </Link>
            </Button>
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold">{system.name} — Nessus</h1>
            <p className="text-sm text-muted-foreground">{system.description}</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Nessus Upload (coming soon)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-3 items-start">
              <Input type="file" accept=".nessus,application/xml,text/xml" disabled />
              <Button disabled>Upload</Button>
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              Parser and API are not yet implemented. This page is a placeholder.
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
