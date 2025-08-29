import { AppShell } from "@/components/layout/app-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload } from "lucide-react"

export default function ImportsPage() {
  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Imports</h2>
          <p className="text-slate-600">Import Nessus scan results and STIG checklists (CKLB JSON).</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Upload className="h-5 w-5" /> Import Sources</CardTitle>
            <CardDescription>Supported formats: Nessus (.nessus), STIG CKLB JSON.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-slate-600">Upload UI coming soon.</div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
