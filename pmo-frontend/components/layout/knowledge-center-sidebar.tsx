"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { BookOpen, FolderOpen, FileText, Search, Settings, Plus, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

type KnowledgeCenterSidebarProps = {
  spaces?: Array<{
    id: number;
    key: string;
    name: string;
    type: string;
    visibility: string;
  }>;
  currentSpace?: {
    id: number;
    key: string;
    name: string;
  };
  pages?: Array<{
    id: number;
    title: string;
    slug: string;
    parent_id: number | null;
  }>;
}

export function KnowledgeCenterSidebar({ spaces = [], currentSpace, pages = [] }: KnowledgeCenterSidebarProps) {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path || pathname.startsWith(path)

  const renderPageTree = (parentId: number | null = null, level: number = 0) => {
    const childPages = pages.filter(page => page.parent_id === parentId)
    
    return childPages.map(page => (
      <div key={page.id} style={{ marginLeft: `${level * 16}px` }}>
        <Link
          href={`/knowledge-center/spaces/${currentSpace?.key}/pages/${page.slug}`}
          className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors ${
            isActive(`/knowledge-center/spaces/${currentSpace?.key}/pages/${page.slug}`)
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <FileText className="h-4 w-4" />
          <span className="truncate">{page.title}</span>
        </Link>
        {renderPageTree(page.id, level + 1)}
      </div>
    ))
  }

  return (
    <div className="w-64 border-r bg-muted/10 h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="h-5 w-5 text-green-600" />
          <span className="font-semibold">Knowledge Center</span>
        </div>
        
        {/* Quick Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search..."
            className="pl-9 h-8"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Main Navigation */}
          <div className="space-y-1">
            <Link
              href="/knowledge-center"
              className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors ${
                pathname === "/knowledge-center"
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <BookOpen className="h-4 w-4" />
              All Spaces
            </Link>
          </div>

          <Separator />

          {/* Current Space Navigation */}
          {currentSpace ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-foreground">Current Space</h3>
                <Link href={`/knowledge-center/spaces/${currentSpace.key}/pages/new`}>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <Plus className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
              
              <div className="space-y-1">
                <Link
                  href={`/knowledge-center/spaces/${currentSpace.key}`}
                  className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors ${
                    pathname === `/knowledge-center/spaces/${currentSpace.key}`
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <FolderOpen className="h-4 w-4" />
                  {currentSpace.name}
                </Link>

                <Link
                  href={`/knowledge-center/spaces/${currentSpace.key}/settings`}
                  className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors ${
                    isActive(`/knowledge-center/spaces/${currentSpace.key}/settings`)
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
              </div>

              {/* Pages Tree */}
              {pages.length > 0 && (
                <div className="space-y-1">
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3">
                    Pages ({pages.length})
                  </h4>
                  <div className="space-y-1">
                    {renderPageTree()}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* All Spaces */
            spaces.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-foreground">Spaces</h3>
                  <Link href="/knowledge-center/spaces/new">
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <Plus className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
                
                <div className="space-y-1">
                  {spaces.slice(0, 10).map((space) => (
                    <Link
                      key={space.id}
                      href={`/knowledge-center/spaces/${space.key}`}
                      className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors ${
                        isActive(`/knowledge-center/spaces/${space.key}`)
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <FolderOpen className="h-4 w-4" />
                      <span className="truncate">{space.name}</span>
                      {space.visibility === 'private' && <Users className="h-3 w-3 ml-auto" />}
                    </Link>
                  ))}
                  
                  {spaces.length > 10 && (
                    <Link
                      href="/knowledge-center"
                      className="flex items-center gap-2 px-3 py-2 text-sm rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    >
                      <span>View all {spaces.length} spaces...</span>
                    </Link>
                  )}
                </div>
              </div>
            )
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
