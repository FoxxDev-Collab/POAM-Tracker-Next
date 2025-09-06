"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, FileText, Save, Eye } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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

export default function EditPagePage() {
  const params = useParams()
  const router = useRouter()
  const [space, setSpace] = useState<KCSpace | null>(null)
  const [page, setPage] = useState<KCPage | null>(null)
  const [pages, setPages] = useState<KCPage[]>([])
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    content_type: 'markdown' as 'markdown' | 'html' | 'rich_text',
    status: 'draft' as 'draft' | 'published' | 'archived',
    parent_id: null as number | null,
    version_comment: ''
  })

  const fetchData = useCallback(async () => {
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
        const pageInfo = pageData.page
        setPage(pageInfo)
        setFormData({
          title: pageInfo.title,
          content: pageInfo.content,
          content_type: pageInfo.content_type,
          status: pageInfo.status,
          parent_id: pageInfo.parent_id,
          version_comment: ''
        })
      } else if (pageResponse.status === 404) {
        router.push(`/knowledge-center/spaces/${params.key}`)
        return
      }

      // Fetch all pages for parent selection
      const pagesResponse = await fetch(`/api/knowledge-center/spaces/${params.key}/pages`)
      if (pagesResponse.ok) {
        const pagesData = await pagesResponse.json()
        setPages(pagesData.pages || [])
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setInitialLoading(false)
    }
  }, [params.key, params.slug, router])

  useEffect(() => {
    if (params.key && params.slug) {
      fetchData()
    }
  }, [params.key, params.slug, fetchData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/knowledge-center/spaces/${params.key}/pages/${params.slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push(`/knowledge-center/spaces/${params.key}/pages/${params.slug}`)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update page')
      }
    } catch (error) {
      console.error('Error updating page:', error)
      alert('Failed to update page')
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading || !space || !page) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  // Filter out current page from parent options
  const availableParents = pages.filter(p => p.id !== page.id)

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-8">
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
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Edit Page</h1>
              <p className="text-muted-foreground">
                Editing &ldquo;{page.title}&rdquo; in {space.name}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Page Details</CardTitle>
              <CardDescription>
                Update your page information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Page Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Security Guidelines"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="parent">Parent Page</Label>
                  <Select 
                    value={formData.parent_id?.toString() || ''} 
                    onValueChange={(value) => setFormData(prev => ({ 
                      ...prev, 
                      parent_id: value ? parseInt(value) : null 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="None (root page)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None (root page)</SelectItem>
                      {availableParents.map(p => (
                        <SelectItem key={p.id} value={p.id.toString()}>
                          {p.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content_type">Content Type</Label>
                  <Select 
                    value={formData.content_type} 
                    onValueChange={(value: string) => setFormData(prev => ({ ...prev, content_type: value as 'markdown' | 'html' | 'rich_text' }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="markdown">Markdown</SelectItem>
                      <SelectItem value="rich_text">Rich Text</SelectItem>
                      <SelectItem value="html">HTML</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value: string) => setFormData(prev => ({ ...prev, status: value as 'draft' | 'published' | 'archived' }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="version_comment">Version Comment</Label>
                <Input
                  id="version_comment"
                  value={formData.version_comment}
                  onChange={(e) => setFormData(prev => ({ ...prev, version_comment: e.target.value }))}
                  placeholder="Describe what you changed..."
                />
                <p className="text-xs text-muted-foreground">
                  Optional comment to describe your changes for the version history.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
              <CardDescription>
                Edit your page content using {formData.content_type}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="content">Page Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder={
                    formData.content_type === 'markdown' 
                      ? "# Your page title\n\nStart writing your content here using Markdown syntax..."
                      : "Start writing your content here..."
                  }
                  rows={20}
                  className="font-mono"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
            <Link href={`/knowledge-center/spaces/${space.key}/pages/${page.slug}`}>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Link href={`/knowledge-center/spaces/${space.key}/pages/${page.slug}`}>
              <Button type="button" variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
            </Link>
            <Button type="submit" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  )
}
