"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Shield, MessageSquare, BookOpen, Sun, Moon, LayoutDashboard, Users, User, LogOut, Settings, ShieldCheck, UserCog } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useThemePalette } from "@/components/ThemePaletteProvider"
import { useAuth } from "@/hooks/use-auth"

type TopNavItem = {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  pattern: string
}

const topNavItems: TopNavItem[] = [
  { 
    href: "/vulnerability-center", 
    label: "Vulnerability Center", 
    icon: Shield,
    pattern: "/vulnerability-center"
  },
  { 
    href: "/rmf-center", 
    label: "RMF Center", 
    icon: ShieldCheck,
    pattern: "/rmf-center"
  },
  { 
    href: "/forum", 
    label: "Forum", 
    icon: MessageSquare,
    pattern: "/forum"
  },
  { 
    href: "/knowledge-center", 
    label: "Knowledge Center", 
    icon: BookOpen,
    pattern: "/knowledge-center"
  },
  { 
    href: "/dashboard", 
    label: "Dashboard", 
    icon: LayoutDashboard,
    pattern: "/dashboard"
  },
  { 
    href: "/teams", 
    label: "Teams", 
    icon: Users,
    pattern: "/teams"
  },
]

export function TopNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { dark, toggleDark } = useThemePalette()
  const { isAdmin } = useAuth()

  const getActiveSection = () => {
    for (const item of topNavItems) {
      if (pathname?.startsWith(item.pattern)) {
        return item.pattern
      }
    }
    return null
  }

  const activeSection = getActiveSection()

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        // Clear any client-side storage
        localStorage.clear()
        sessionStorage.clear()
        
        // Redirect to login page
        router.push('/auth/login')
        
        // Force a hard refresh to clear any cached data
        window.location.href = '/auth/login'
      } else {
        console.error('Logout failed')
        // Still redirect even if logout API fails for security
        router.push('/auth/login')
      }
    } catch (error) {
      console.error('Logout error:', error)
      // Still redirect even if there's an error for security
      router.push('/auth/login')
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        {/* Logo */}
        <div className="mr-8 flex items-center space-x-2">
          <div className="bg-primary p-1.5 rounded-md">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="hidden font-bold sm:inline-block">
            POAM Tracker Next
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="flex items-center space-x-6 text-sm font-medium">
          {topNavItems.map((item) => {
            const Icon = item.icon
            const isActive = activeSection === item.pattern
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-2 transition-colors hover:text-foreground/80 ${
                  isActive 
                    ? "text-foreground" 
                    : "text-foreground/60"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline-block">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Right side actions */}
        <div className="ml-auto flex items-center space-x-2">
          <Button 
            size="icon" 
            variant="ghost" 
            aria-label="Toggle dark mode" 
            onClick={toggleDark}
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          
          {/* Admin Button - Only visible to admins */}
          {isAdmin && (
            <Link href="/admin">
              <Button 
                size="icon" 
                variant="ghost" 
                aria-label="Admin Panel"
              >
                <UserCog className="h-4 w-4" />
              </Button>
            </Link>
          )}

          {/* Settings Button */}
          <Link href="/settings">
            <Button 
              size="icon" 
              variant="ghost" 
              aria-label="Settings"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </Link>

          {/* User Profile Button */}
          <Link href="/profile">
            <Button 
              size="icon" 
              variant="ghost" 
              aria-label="User profile"
            >
              <User className="h-4 w-4" />
            </Button>
          </Link>
          
          {/* Logout Button */}
          <Button 
            size="icon" 
            variant="ghost" 
            aria-label="Logout"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
