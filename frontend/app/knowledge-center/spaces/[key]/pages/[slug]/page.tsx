"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, FileText, Edit, Clock, MessageSquare, History } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { MainLayout } from "@/components/layout/main-layout"
import Link from "next/link"

type KCSpace = {
  id: number;
  key: string;
  name: string;
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

type KCComment = {
  id: number;
  page_id: number;
  parent_id: number | null;
  content: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  author_name: string;
  author_email: string;
}

export default function PageViewPage() {
  const params = useParams()
  const router = useRouter()
  const [space, setSpace] = useState<KCSpace | null>(null)
  const [page, setPage] = useState<KCPage | null>(null)
  const [comments, setComments] = useState<KCComment[]>([])
  const [permission, setPermission] = useState<'read' | 'write' | 'admin' | null>(null)
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      // Fetch space info
      const spaceResponse = await fetch(`/api/knowledge-center/spaces/${params.key}`)
      if (spaceResponse.ok) {
        const spaceData = await spaceResponse.json()
        setSpace(spaceData.space)
        setPermission(spaceData.permission)
      }

      // Fetch page
      const pageResponse = await fetch(`/api/knowledge-center/spaces/${params.key}/pages/${params.slug}`)
      if (pageResponse.ok) {
        const pageData = await pageResponse.json()
        setPage(pageData.page)
      } else if (pageResponse.status === 404) {
        router.push(`/knowledge-center/spaces/${params.key}`)
        return
      }

      // Fetch comments
      const commentsResponse = await fetch(`/api/knowledge-center/pages/${params.slug}/comments`)
      if (commentsResponse.ok) {
        const commentsData = await commentsResponse.json()
        setComments(commentsData.comments || [])
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }, [params.key, params.slug, router])

  useEffect(() => {
    if (params.key && params.slug) {
      fetchData()
    }
  }, [params.key, params.slug, fetchData])

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !page) return

    try {
      const response = await fetch(`/api/knowledge-center/pages/${page.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newComment }),
      })

      if (response.ok) {
        setNewComment('')
        // Refresh comments
        const commentsResponse = await fetch(`/api/knowledge-center/pages/${page.id}/comments`)
        if (commentsResponse.ok) {
          const commentsData = await commentsResponse.json()
          setComments(commentsData.comments || [])
        }
      }
    } catch (error) {
      console.error('Error adding comment:', error)
    }
  }

  const renderContent = (content: string, contentType: string) => {
    if (contentType === 'markdown') {
      // Simple markdown rendering - in production, use a proper markdown library
      return (
        <div className="prose max-w-none">
          {content.split('\n').map((line, index) => {
            if (line.startsWith('# ')) {
              return <h1 key={index} className="text-3xl font-bold mt-6 mb-4">{line.substring(2)}</h1>
            } else if (line.startsWith('## ')) {
              return <h2 key={index} className="text-2xl font-bold mt-5 mb-3">{line.substring(3)}</h2>
            } else if (line.startsWith('### ')) {
              return <h3 key={index} className="text-xl font-bold mt-4 mb-2">{line.substring(4)}</h3>
            } else if (line.trim() === '') {
              return <br key={index} />
            } else {
              return <p key={index} className="mb-2">{line}</p>
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800'
      case 'draft': return 'bg-yellow-100 text-yellow-800'
      case 'archived': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const canWrite = permission === 'write' || permission === 'admin'

  if (loading || !space || !page) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading page...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <Link 
            href={`/knowledge-center/spaces/${space.key}`} 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to {space.name}
          </Link>
          
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-3xl font-bold tracking-tight">{page.title}</h1>
                  <Badge className={getStatusColor(page.status)}>
                    {page.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>Updated {new Date(page.updated_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <History className="h-4 w-4" />
                    <span>Version {page.version}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowComments(!showComments)}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Comments ({comments.length})
              </Button>
              {canWrite && (
                <>
                  <Link href={`/knowledge-center/spaces/${space.key}/pages/${page.slug}/edit`}>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </Link>
                  <Link href={`/knowledge-center/spaces/${space.key}/pages/${page.slug}/history`}>
                    <Button variant="outline" size="sm">
                      <History className="h-4 w-4 mr-2" />
                      History
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <Card>
          <CardContent className="p-8">
            {renderContent(page.content, page.content_type)}
          </CardContent>
        </Card>

        {/* Comments Section */}
        {showComments && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Comments ({comments.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add Comment Form */}
              {canWrite && (
                <form onSubmit={handleAddComment} className="space-y-4">
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    rows={3}
                  />
                  <div className="flex justify-end">
                    <Button type="submit" disabled={!newComment.trim()}>
                      Add Comment
                    </Button>
                  </div>
                </form>
              )}

              {/* Comments List */}
              {comments.length > 0 ? (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="border-l-2 border-muted pl-4 py-2">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs text-primary-foreground">
                          {comment.author_name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-sm">{comment.author_name}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-sm whitespace-pre-wrap">{comment.content}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No comments yet. Be the first to comment!</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  )
}
