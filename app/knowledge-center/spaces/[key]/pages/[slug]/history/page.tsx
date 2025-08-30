"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, FileText, History, Clock, User, Eye, RotateCcw } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MainLayout } from "@/components/layout/main-layout"
import Link from "next/link"

type KCSpace = {
  id: number;
  key: string;
  name: string;
}

type KCPage = {
  id: number;
  title: string;
  slug: string;
}

type KCPageVersion = {
  id: number;
  page_id: number;
  version: number;
  title: string;
  content: string;
  content_type: 'markdown' | 'html' | 'rich_text';
  created_by: number;
  created_at: string;
  comment: string;
  author_name?: string;
  author_email?: string;
}

export default function PageHistoryPage() {
  const params = useParams()
  const router = useRouter()
  const [space, setSpace] = useState<KCSpace | null>(null)
  const [page, setPage] = useState<KCPage | null>(null)
  const [versions, setVersions] = useState<KCPageVersion[]>([])
  const [selectedVersion, setSelectedVersion] = useState<KCPageVersion | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.key && params.slug) {
      fetchData()
    }
  }, [params.key, params.slug])

  const fetchData = async () => {
    try {
      // Fetch space info
      const spaceResponse = await fetch(`/api/knowledge-center/spaces/${params.key}`)
      if (spaceResponse.ok) {
        const spaceData = await spaceResponse.json()
        setSpace(spaceData.space)
      }

      // Fetch page
      const pageResponse = await fetch(`/api/knowledge-center/spaces/${params.key}/pages/${params.slug}`)
      if (pageResponse.ok) {
        const pageData = await pageResponse.json()
        setPage(pageData.page)
        
        // Fetch versions
        const versionsResponse = await fetch(`/api/knowledge-center/pages/${pageData.page.id}/versions`)
        if (versionsResponse.ok) {
          const versionsData = await versionsResponse.json()
          setVersions(versionsData.versions || [])
        }
      } else if (pageResponse.status === 404) {
        router.push(`/knowledge-center/spaces/${params.key}`)
        return
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderContent = (content: string, contentType: string) => {
    if (contentType === 'markdown') {
      // Simple markdown rendering
      return (
        <div className="prose max-w-none">
          {content.split('\n').map((line, index) => {
            if (line.startsWith('# ')) {
              return <h1 key={index} className="text-2xl font-bold mt-4 mb-2">{line.substring(2)}</h1>
            } else if (line.startsWith('## ')) {
              return <h2 key={index} className="text-xl font-bold mt-3 mb-2">{line.substring(3)}</h2>
            } else if (line.startsWith('### ')) {
              return <h3 key={index} className="text-lg font-bold mt-2 mb-1">{line.substring(4)}</h3>
            } else if (line.trim() === '') {
              return <br key={index} />
            } else {
              return <p key={index} className="mb-1">{line}</p>
            }
          })}
        </div>
      )
    } else if (contentType === 'html') {
      return <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
    } else {
      return <div className="prose max-w-none whitespace-pre-wrap">{content}</div>
    }
  }

  if (loading || !space || !page) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading history...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <Link 
            href={`/knowledge-center/spaces/${space.key}/pages/${page.slug}`} 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to {page.title}
          </Link>
          
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <History className="h-8 w-8 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Version History</h1>
              <p className="text-muted-foreground">
                View and compare different versions of &ldquo;{page.title}&rdquo;
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Version List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Versions ({versions.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {versions.length > 0 ? (
                  <div className="space-y-2">
                    {versions.map((version) => (
                      <div
                        key={version.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedVersion?.id === version.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:bg-muted/50'
                        }`}
                        onClick={() => setSelectedVersion(version)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline">v{version.version}</Badge>
                          {version.version === Math.max(...versions.map(v => v.version)) && (
                            <Badge variant="default">Current</Badge>
                          )}
                        </div>
                        <div className="text-sm space-y-1">
                          <div className="font-medium">{version.title}</div>
                          <div className="text-muted-foreground">
                            {new Date(version.created_at).toLocaleDateString()} at{' '}
                            {new Date(version.created_at).toLocaleTimeString()}
                          </div>
                          {version.author_name && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <User className="h-3 w-3" />
                              <span>{version.author_name}</span>
                            </div>
                          )}
                          {version.comment && (
                            <div className="text-xs italic text-muted-foreground">
                              &ldquo;{version.comment}&rdquo;
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No version history available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Version Content */}
          <div className="lg:col-span-2">
            {selectedVersion ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Version {selectedVersion.version}
                      </CardTitle>
                      <CardDescription>
                        {selectedVersion.title} • {new Date(selectedVersion.created_at).toLocaleString()}
                        {selectedVersion.author_name && ` • by ${selectedVersion.author_name}`}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/knowledge-center/spaces/${space.key}/pages/${page.slug}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View Current
                        </Button>
                      </Link>
                      {selectedVersion.version !== Math.max(...versions.map(v => v.version)) && (
                        <Button variant="outline" size="sm" disabled>
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Restore
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {selectedVersion.comment && (
                    <div className="mb-6 p-3 bg-muted rounded-lg">
                      <div className="text-sm font-medium mb-1">Version Comment:</div>
                      <div className="text-sm italic">{selectedVersion.comment}</div>
                    </div>
                  )}
                  <div className="prose max-w-none">
                    {renderContent(selectedVersion.content, selectedVersion.content_type)}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-64">
                  <div className="text-center text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">Select a Version</p>
                    <p>Choose a version from the list to view its content</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
