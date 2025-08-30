"use client"

import { usePathname } from "next/navigation"
import { ReactNode } from "react"
import { TopNav } from "./top-nav"
import { VulnerabilityCenterSidebar } from "./vulnerability-center-sidebar"

interface MainLayoutProps {
  children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname()

  // Determine which sidebar to show based on current path
  const showVulnerabilityCenterSidebar = pathname?.startsWith("/vulnerability-center")

  // For now, we'll only implement the Vulnerability Center sidebar
  // Forum and Knowledge Center sidebars can be added later

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopNav />
      
      <div className="flex flex-1">
        {/* Contextual Sidebar */}
        {showVulnerabilityCenterSidebar && <VulnerabilityCenterSidebar />}
        
        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
