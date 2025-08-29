import UsersManager from "./UsersManager"
import TeamsManager from "./TeamsManager"
import { AppShell } from "@/components/layout/app-shell"

export default function TeamsPage() {
  return (
    <AppShell>
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Teams</h1>
        <p className="text-muted-foreground">
          Manage teams, users, and ATO package assignments
        </p>
      </div>
      <TeamsManager />
      <UsersManager />
    </div>
    </AppShell>
  )
}
