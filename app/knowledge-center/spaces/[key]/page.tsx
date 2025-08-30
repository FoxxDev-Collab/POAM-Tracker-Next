"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, BookOpen, Plus, Search, FileText, Settings, Calendar, Edit, Trash2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MainLayout } from "@/components/layout/main-layout"
import Link from "next/link"

type KCSpace = {
  id: number;
  key: string;
  name: string;
  description: string;
  type: 'personal' | 'team' | 'global';
  visibility: 'public' | 'restricted' | 'private';
  created_by: number;
  created_at: string;
  updated_at: string;
}

type KCPage = {
  id: number;
  space_id: number;
  parent_id: number | null;
  title: string;
  slug: string;
  content: string;
  content_type: 'markdown' | 'html' | 'rich_text';
  status: 'draft' | 'published' | 'archived';
  version: number;
  created_by: number;
  created_at: string;
  updated_by: number;
  updated_at: string;
  published_at: string | null;
}

export default function SpacePage() {
  const params = useParams()
  const router = useRouter()
  const [space, setSpace] = useState<KCSpace | null>(null)
  const [pages, setPages] = useState<KCPage[]>([])
  const [permission, setPermission] = useState<'read' | 'write' | 'admin' | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.key) {
      fetchSpace()
      fetchPages()
    }
  }, [params.key])

  const fetchSpace = async () => {
    try {
      const response = await fetch(`/api/knowledge-center/spaces/${params.key}`)
      if (response.ok) {
        const data = await response.json()
        setSpace(data.space)
        setPermission(data.permission)
      } else if (response.status === 404) {
        router.push('/knowledge-center')
      }
    } catch (error) {
      console.error('Failed to fetch space:', error)
    }
  }

  const fetchPages = async () => {
    try {
      const response = await fetch(`/api/knowledge-center/spaces/${params.key}/pages`)
      if (response.ok) {
        const data = await response.json()
        setPages(data.pages || [])
      }
    } catch (error) {
      console.error('Failed to fetch pages:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPages = pages.filter(page =>
    page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    page.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const rootPages = filteredPages.filter(page => !page.parent_id)
  const getChildPages = (parentId: number) => filteredPages.filter(page => page.parent_id === parentId)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800'
      case 'draft': return 'bg-yellow-100 text-yellow-800'
      case 'archived': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const canWrite = permission === 'write' || permission === 'admin'
  const canAdmin = permission === 'admin'

  if (!space) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading space...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <Link href="/knowledge-center" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Knowledge Center
          </Link>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <BookOpen className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-3xl font-bold tracking-tight">{space.name}</h1>
                  <Badge variant="secondary">{space.type}</Badge>
                  <Badge variant={space.visibility === 'public' ? 'default' : 'secondary'}>
                    {space.visibility}
                  </Badge>
                </div>
                <p className="text-muted-foreground">
                  {space.description || 'No description provided'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {canWrite && (
                <Link href={`/knowledge-center/spaces/${space.key}/pages/new`}>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Page
                  </Button>
                </Link>
              )}
              {canAdmin && (
                <Link href={`/knowledge-center/spaces/${space.key}/settings`}>
                  <Button variant="outline" size="icon">
                    <Settings className="h-4 w-4" />
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search pages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pages</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pages.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Published</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {pages.filter(p => p.status === 'published').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Drafts</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {pages.filter(p => p.status === 'draft').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-bold">
                {pages.length > 0 
                  ? new Date(Math.max(...pages.map(p => new Date(p.updated_at).getTime()))).toLocaleDateString()
                  : 'Never'
                }
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pages */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : rootPages.length > 0 ? (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Pages</h2>
            {rootPages.map((page) => (
              <PageCard 
                key={page.id} 
                page={page} 
                spaceKey={space.key}
                childPages={getChildPages(page.id)}
                canWrite={canWrite}
                getStatusColor={getStatusColor}
              />
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent className="space-y-6">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <CardTitle className="text-xl">
                  {searchQuery ? 'No pages found' : 'No pages yet'}
                </CardTitle>
                <CardDescription className="text-base">
                  {searchQuery 
                    ? 'Try adjusting your search terms'
                    : 'Create your first page to start documenting knowledge'
                  }
                </CardDescription>
              </div>
              {!searchQuery && canWrite && (
                <Link href={`/knowledge-center/spaces/${space.key}/pages/new`}>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Page
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  )
}

function PageCard({ 
  page, 
  spaceKey, 
  childPages, 
  canWrite, 
  getStatusColor 
}: { 
  page: KCPage; 
  spaceKey: string; 
  childPages: KCPage[];
  canWrite: boolean;
  getStatusColor: (status: string) => string;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Link href={`/knowledge-center/spaces/${spaceKey}/pages/${page.slug}`}>
                <CardTitle className="hover:text-primary cursor-pointer">{page.title}</CardTitle>
              </Link>
              <Badge className={getStatusColor(page.status)}>
                {page.status}
              </Badge>
            </div>
            <CardDescription className="line-clamp-2">
              {page.content.substring(0, 200)}...
            </CardDescription>
          </div>
          {canWrite && (
            <div className="flex items-center gap-1 ml-4">
              <Link href={`/knowledge-center/spaces/${spaceKey}/pages/${page.slug}/edit`}>
                <Button variant="ghost" size="icon">
                  <Edit className="h-4 w-4" />
                </Button>
              </Link>
              <Button variant="ghost" size="icon">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      {childPages.length > 0 && (
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Child Pages:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {childPages.map((child) => (
                <Link key={child.id} href={`/knowledge-center/spaces/${spaceKey}/pages/${child.slug}`}>
                  <div className="flex items-center gap-2 p-2 rounded hover:bg-muted cursor-pointer">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{child.title}</span>
                    <Badge className={`ml-auto ${getStatusColor(child.status)}`} variant="secondary">
                      {child.status}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
