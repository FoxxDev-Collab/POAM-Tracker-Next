"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Shield, LayoutDashboard, Upload, FileText, Package, Users, Settings, Sun, Moon } from "lucide-react"
import { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { useThemePalette } from "@/components/ThemePaletteProvider"

type NavItem = {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  { href: "/packages", label: "ATO Packages", icon: Package },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/imports", label: "Imports", icon: Upload },
  { href: "/stps", label: "STPs", icon: FileText },
  { href: "/teams", label: "Teams", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings },
]


export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const { dark, toggleDark } = useThemePalette()

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
        <div className="h-16 px-4 flex items-center justify-between border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="bg-sidebar-primary p-2 rounded-lg">
              <Shield className="h-6 w-6 text-sidebar-primary-foreground" />
            </div>
            <div>
              <div className="text-sm font-semibold leading-tight">POAM Tracker Next</div>
              <div className="text-xs text-muted-foreground">Vulnerability Management</div>
            </div>
          </div>
          <Button size="icon" variant="ghost" aria-label="Toggle dark mode" onClick={toggleDark}>
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
        <nav className="flex-1 p-2">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const active = pathname === item.href || pathname?.startsWith(item.href + "/")
              const Icon = item.icon
              return (
                <li key={item.href}>
                  <Link href={item.href} className="block">
                    <Button variant={active ? "default" : "ghost"}
                      className={`w-full justify-start gap-3 ${active ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90" : "text-sidebar-foreground hover:bg-sidebar-accent"}`}>
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Button>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
        <div className="p-3 border-t border-sidebar-border text-xs text-muted-foreground">
          <div>© {new Date().getFullYear()} Jeremiah P.</div>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="md:hidden sticky top-0 z-30 bg-background border-b border-border">
          <div className="h-14 px-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-primary p-1.5 rounded-md"><Shield className="h-5 w-5 text-primary-foreground" /></div>
              <span className="text-sm font-semibold">POAM Tracker Next</span>
            </div>
            <Link href="/dashboard">
              <Button variant="outline" size="sm">Home</Button>
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8 bg-background">{children}</main>
      </div>
    </div>
  )
}

