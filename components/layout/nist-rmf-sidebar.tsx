"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Package, FileCheck, Activity, AlertTriangle, ShieldCheck, Network, HardDrive, Monitor } from "lucide-react"
import { Button } from "@/components/ui/button"

type SidebarItem = {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  description?: string
}

const nistRmfItems: SidebarItem[] = [
  { 
    href: "/nist-rmf/packages", 
    label: "ATO Packages", 
    icon: Package,
  },
  { 
    href: "/nist-rmf/controls", 
    label: "Control Catalog", 
    icon: FileCheck,
  },
  { 
    href: "/nist-rmf/assessments", 
    label: "Assessments", 
    icon: Activity,
  },
  { 
    href: "/nist-rmf/risks", 
    label: "Risk Register", 
    icon: AlertTriangle,
  },
  { 
    href: "/nist-rmf/ppsm", 
    label: "PPSM", 
    icon: Network,
    description: "Ports, Protocols, Services Management"
  },
  { 
    href: "/nist-rmf/hardware-list", 
    label: "Hardware List", 
    icon: HardDrive,
    description: "System hardware inventory"
  },
  { 
    href: "/nist-rmf/software-list", 
    label: "Software List", 
    icon: Monitor,
    description: "Software inventory and versions"
  },
]

export function NistRmfSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 shrink-0 border-r border-border bg-muted/10">
      <div className="flex h-full flex-col">
        {/* Sidebar Header */}
        <div className="flex h-14 items-center border-b border-border px-4">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <span className="font-semibold">NIST RMF</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-2">
          {nistRmfItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
            
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={`w-full justify-start gap-3 h-auto p-3 ${
                    isActive 
                      ? "bg-secondary text-secondary-foreground" 
                      : "hover:bg-muted"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <div className="flex flex-col items-start text-left">
                    <span className="text-sm font-medium">{item.label}</span>
                    {item.description && (
                      <span className="text-xs text-muted-foreground line-clamp-2">
                        {item.description}
                      </span>
                    )}
                  </div>
                </Button>
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-border p-3">
          <div className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Jeremiah P.
          </div>
        </div>
      </div>
    </aside>
  )
}