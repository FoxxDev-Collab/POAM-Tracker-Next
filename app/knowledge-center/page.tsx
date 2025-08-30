"use client"

import { useEffect, useState } from "react"
import { BookOpen, Plus, Search, Users, Globe, Lock, FolderOpen } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  page_count?: number;
}

export default function KnowledgeCenterPage() {
  const [spaces, setSpaces] = useState<KCSpace[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSpaces()
  }, [])

  const fetchSpaces = async () => {
    try {
      const response = await fetch('/api/knowledge-center/spaces')
      if (response.ok) {
        const data = await response.json()
        setSpaces(data.spaces || [])
      }
    } catch (error) {
      console.error('Failed to fetch spaces:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredSpaces = spaces.filter(space =>
    space.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    space.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getSpaceIcon = (type: string, visibility: string) => {
    if (type === 'personal') return <Users className="h-4 w-4" />
    if (visibility === 'private') return <Lock className="h-4 w-4" />
    if (visibility === 'restricted') return <Users className="h-4 w-4" />
    return <Globe className="h-4 w-4" />
  }

  const getSpaceTypeColor = (type: string) => {
    switch (type) {
      case 'personal': return 'text-blue-600 bg-blue-50'
      case 'team': return 'text-green-600 bg-green-50'
      case 'global': return 'text-purple-600 bg-purple-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <BookOpen className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Knowledge Center</h1>
                <p className="text-muted-foreground">
                  Collaborative documentation and knowledge management
                </p>
              </div>
            </div>
            <Link href="/knowledge-center/spaces/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Space
              </Button>
            </Link>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search spaces..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spaces</CardTitle>
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{spaces.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Public Spaces</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {spaces.filter(s => s.visibility === 'public').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Spaces</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {spaces.filter(s => s.type === 'team').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Spaces Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-3 bg-muted rounded w-full mb-2"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredSpaces.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSpaces.map((space) => (
              <Link key={space.id} href={`/knowledge-center/spaces/${space.key}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getSpaceIcon(space.type, space.visibility)}
                        <CardTitle className="text-lg">{space.name}</CardTitle>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSpaceTypeColor(space.type)}`}>
                        {space.type}
                      </span>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {space.description || 'No description provided'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{space.page_count || 0} pages</span>
                      <span>Updated {new Date(space.updated_at).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent className="space-y-6">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <CardTitle className="text-xl">
                  {searchQuery ? 'No spaces found' : 'No spaces yet'}
                </CardTitle>
                <CardDescription className="text-base">
                  {searchQuery 
                    ? 'Try adjusting your search terms'
                    : 'Create your first space to start building your knowledge base'
                  }
                </CardDescription>
              </div>
              {!searchQuery && (
                <Link href="/knowledge-center/spaces/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Space
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
