import { AppShell } from "@/components/layout/app-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText } from "lucide-react"

export default function StpsPage() {
  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Security Test Plans (STPs)</h2>
          <p className="text-slate-600">Create and manage STPs for affected systems.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> STP Workspace</CardTitle>
            <CardDescription>Collaborative planning and remediation tracking coming soon.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-slate-600">STP builder UI coming soon.</div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
