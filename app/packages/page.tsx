import { AppShell } from "@/components/layout/app-shell"
import PackagesManager from "./PackagesManager"
import { Packages } from "@/lib/db"

export const dynamic = "force-dynamic" // ensure fresh data on reload

export default function PackagesPage() {
  const items = Packages.all()
  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-bold">ATO Packages</h2>
          <p className="text-muted-foreground">Create, edit, and organize ATO packages and their systems.</p>
        </div>
        <PackagesManager initial={items} />
      </div>
    </AppShell>
  )
}
