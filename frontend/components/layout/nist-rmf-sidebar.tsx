"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
  Package, FileCheck, ShieldCheck, ChevronDown, ChevronRight,
  Shield, Activity, Settings, AlertTriangle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

type SidebarItem = {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  description?: string
}

type ControlFamily = {
  id: string
  name: string
  icon: React.ComponentType<{ className?: string }>
}

const nistRmfItems: SidebarItem[] = [
  {
    href: "/rmf-center/packages",
    label: "ATO Packages",
    icon: Package,
    description: "Authorization to Operate Packages"
  },
]

const controlFamilies: ControlFamily[] = [
  { id: "AC", name: "Access Control", icon: Shield },
  { id: "AT", name: "Awareness and Training", icon: FileCheck },
  { id: "AU", name: "Audit and Accountability", icon: Activity },
  { id: "CA", name: "Assessment, Authorization, and Monitoring", icon: FileCheck },
  { id: "CM", name: "Configuration Management", icon: Settings },
  { id: "CP", name: "Contingency Planning", icon: AlertTriangle },
  { id: "IA", name: "Identification and Authentication", icon: Shield },
  { id: "IR", name: "Incident Response", icon: AlertTriangle },
  { id: "MA", name: "Maintenance", icon: Settings },
  { id: "MP", name: "Media Protection", icon: Shield },
  { id: "PE", name: "Physical and Environmental Protection", icon: Shield },
  { id: "PL", name: "Planning", icon: FileCheck },
  { id: "PM", name: "Program Management", icon: Package },
  { id: "PS", name: "Personnel Security", icon: Shield },
  { id: "PT", name: "Personally Identifiable Information Processing", icon: Shield },
  { id: "RA", name: "Risk Assessment", icon: AlertTriangle },
  { id: "SA", name: "System and Services Acquisition", icon: Package },
  { id: "SC", name: "System and Communications Protection", icon: Shield },
  { id: "SI", name: "System and Information Integrity", icon: FileCheck },
  { id: "SR", name: "Supply Chain Risk Management", icon: Package }
]

export function NistRmfSidebar() {
  const pathname = usePathname()
  const [isControlsOpen, setIsControlsOpen] = useState(
    pathname?.startsWith("/rmf-center/control-catalog") || false
  )

  const isControlCatalogActive = pathname?.startsWith("/rmf-center/control-catalog")

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
        <nav className="flex-1 space-y-1 p-2 overflow-y-auto">
          {/* Main RMF Items */}
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

          {/* NIST Controls Section */}
          <Collapsible open={isControlsOpen} onOpenChange={setIsControlsOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant={isControlCatalogActive ? "secondary" : "ghost"}
                className={`w-full justify-start gap-3 h-auto p-3 ${
                  isControlCatalogActive
                    ? "bg-secondary text-secondary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                <FileCheck className="h-4 w-4 shrink-0" />
                <div className="flex flex-col items-start text-left flex-1">
                  <span className="text-sm font-medium">NIST Controls</span>
                  <span className="text-xs text-muted-foreground">
                    Security control families
                  </span>
                </div>
                {isControlsOpen ? (
                  <ChevronDown className="h-4 w-4 shrink-0" />
                ) : (
                  <ChevronRight className="h-4 w-4 shrink-0" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1">
              {/* Dashboard Link */}
              <Link href="/rmf-center/control-catalog">
                <Button
                  variant={pathname === "/rmf-center/control-catalog" ? "secondary" : "ghost"}
                  className={`w-full justify-start gap-3 h-auto p-2 ml-4 ${
                    pathname === "/rmf-center/control-catalog"
                      ? "bg-secondary text-secondary-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  <FileCheck className="h-3 w-3 shrink-0" />
                  <span className="text-xs font-medium">Dashboard</span>
                </Button>
              </Link>

              {/* Control Families */}
              {controlFamilies.map((family) => {
                const Icon = family.icon
                const isActive = pathname === `/rmf-center/control-catalog/${family.id}` ||
                                pathname?.startsWith(`/rmf-center/control-catalog/${family.id}/`)

                return (
                  <Link key={family.id} href={`/rmf-center/control-catalog/${family.id}`}>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className={`w-full justify-start gap-3 h-auto p-2 ml-4 ${
                        isActive
                          ? "bg-secondary text-secondary-foreground"
                          : "hover:bg-muted"
                      }`}
                    >
                      <Icon className="h-3 w-3 shrink-0" />
                      <span className="text-xs font-medium">{family.id}-Family</span>
                    </Button>
                  </Link>
                )
              })}
            </CollapsibleContent>
          </Collapsible>
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