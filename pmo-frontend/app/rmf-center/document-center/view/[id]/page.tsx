"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ChevronLeft, Download, History, CheckCircle, XCircle,
  Clock, FileText, Hash,
  MessageSquare, Send, MoreVertical, Trash2,
  Eye, AlertTriangle, ChevronRight, Upload
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/contexts/auth-context"
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

// Configure PDF.js worker - use local copy to avoid CSP issues
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

interface DocumentVersion {
  id: string
  versionNumber: number
  fileName: string
  fileSize: number
  filePath: string
  uploadedAt: string
  approvalStatus: string
  changeNotes?: string
  uploader: {
    id: string
    firstName: string
    lastName: string
    email: string
    role?: string
  }
  approver?: {
    id: string
    firstName: string
    lastName: string
    role?: string
  }
  approvedAt?: string
}

interface DocumentDetails {
  id: string
  title: string
  controlFamily: string
  documentType: string
  description?: string
  currentVersion: DocumentVersion
  versions: DocumentVersion[]
}

interface Comment {
  id: string
  content: string
  createdAt: string
  updatedAt: string
  documentId: string
  versionNumber: number
  author: {
    id: string
    firstName: string
    lastName: string
    email: string
    role?: string
  }
  parentId?: string
  replies?: Comment[]
  isEdited: boolean
}

export default function DocumentViewerPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const documentId = params.id as string

  const [loading, setLoading] = useState(true)
  const [document, setDocument] = useState<DocumentDetails | null>(null)
  const [selectedVersion, setSelectedVersion] = useState<DocumentVersion | null>(null)
  const [pdfUrl, setPdfUrl] = useState<string>("")
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [loadingComments, setLoadingComments] = useState(false)
  const [activeTab, setActiveTab] = useState<"preview" | "comments" | "history">("preview")
  const [showPdfError, setShowPdfError] = useState(false)
  const [numPages, setNumPages] = useState<number>(0)
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [scale, setScale] = useState<number>(1.5)

   
  useEffect(() => {
    fetchDocument()
    fetchComments()
    trackView()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentId])

  useEffect(() => {
    if (selectedVersion) {
      // Update PDF URL when version changes
      setPdfUrl(`/api/documents/${documentId}/version/${selectedVersion.versionNumber}/preview`)
      setShowPdfError(false)
    }
  }, [selectedVersion, documentId])

  const fetchDocument = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/documents/${documentId}`)
      if (response.ok) {
        const data = await response.json()

        // Map the data to our interface structure
        const mappedDocument: DocumentDetails = {
          id: data.id,
          title: data.title,
          controlFamily: data.controlFamily,
          documentType: data.documentType,
          description: data.description,
          currentVersion: {
            id: data.currentVersion?.id || data.id,
            versionNumber: data.currentVersion?.versionNumber || data.version || 1,
            fileName: data.currentVersion?.fileName || data.fileName,
            fileSize: data.currentVersion?.fileSize || data.fileSize || 0,
            filePath: data.currentVersion?.filePath || '',
            uploadedAt: data.currentVersion?.uploadedAt || data.uploadedAt,
            approvalStatus: data.currentVersion?.approvalStatus || data.approvalStatus || 'Draft',
            changeNotes: data.currentVersion?.changeNotes,
            uploader: data.currentVersion?.uploader || {
              id: '1',
              firstName: 'Unknown',
              lastName: 'User',
              email: 'unknown@email.com',
              role: 'Unknown'
            },
            approver: data.currentVersion?.approver,
            approvedAt: data.currentVersion?.approvedAt
          },
          versions: data.versions || []
        }

        setDocument(mappedDocument)
        setSelectedVersion(mappedDocument.currentVersion)
        // Set initial PDF URL
        setPdfUrl(`/api/documents/${documentId}/preview`)
      } else {
        toast.error("Document not found")
        setTimeout(() => router.push(`/rmf-center/document-center/${data.controlFamily || ''}`), 2000)
      }
    } catch (error) {
      console.error("Error fetching document:", error)
      toast.error("Failed to load document")
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async () => {
    setLoadingComments(true)
    try {
      const response = await fetch(`/api/documents/${documentId}/comments`)
      if (response.ok) {
        const data = await response.json()
        setComments(data.comments || [])
      }
    } catch (error) {
      console.error("Error fetching comments:", error)
    } finally {
      setLoadingComments(false)
    }
  }

  const trackView = async () => {
    try {
      await fetch(`/api/documents/${documentId}/track-view`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id })
      })
    } catch (error) {
      console.error("Error tracking view:", error)
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      toast.error("Please enter a comment")
      return
    }

    try {
      const response = await fetch(`/api/documents/${documentId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newComment,
          versionNumber: selectedVersion?.versionNumber,
          authorId: user?.id
        })
      })

      if (response.ok) {
        setNewComment("")
        fetchComments()
        toast.success("Comment added successfully")
      } else {
        toast.error("Failed to add comment")
      }
    } catch (error) {
      console.error("Error adding comment:", error)
      toast.error("Failed to add comment")
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return

    try {
      const response = await fetch(`/api/documents/${documentId}/comments/${commentId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchComments()
        toast.success("Comment deleted")
      } else {
        toast.error("Failed to delete comment")
      }
    } catch (error) {
      console.error("Error deleting comment:", error)
      toast.error("Failed to delete comment")
    }
  }

  const handleDownload = async () => {
    try {
      const response = await fetch(`/api/documents/${documentId}/download`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = document?.currentVersion.fileName || 'document.pdf'
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success("Document downloaded")
      } else {
        toast.error("Failed to download document")
      }
    } catch (error) {
      console.error("Error downloading document:", error)
      toast.error("Failed to download document")
    }
  }

  const handleApprove = async () => {
    try {
      const response = await fetch(`/api/documents/${documentId}/approve`, {
        method: "PUT",
      })
      if (response.ok) {
        toast.success("Document approved successfully")
        fetchDocument()
      } else {
        toast.error("Failed to approve document")
      }
    } catch (error) {
      console.error("Error approving document:", error)
      toast.error("Failed to approve document")
    }
  }

  const handleReject = async () => {
    try {
      const response = await fetch(`/api/documents/${documentId}/reject`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "Document requires revisions" })
      })
      if (response.ok) {
        toast.success("Document rejected")
        fetchDocument()
      } else {
        toast.error("Failed to reject document")
      }
    } catch (error) {
      console.error("Error rejecting document:", error)
      toast.error("Failed to reject document")
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500/10 text-green-700 border-green-500/20">Approved</Badge>
      case "pending":
        return <Badge className="bg-yellow-500/10 text-yellow-700 border-yellow-500/20">Pending</Badge>
      case "rejected":
        return <Badge className="bg-red-500/10 text-red-700 border-red-500/20">Rejected</Badge>
      default:
        return <Badge variant="outline">Draft</Badge>
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i]
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="space-y-6">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    )
  }

  if (!document) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <p className="text-muted-foreground">Document not found</p>
              <Button className="mt-4" onClick={() => router.push("/rmf-center/document-center")}>
                Return to Document Center
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 max-w-[1600px]">
      {/* Header */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{document.title}</h1>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline">{document.controlFamily}</Badge>
                <Badge variant="outline">{document.documentType}</Badge>
                {getStatusBadge(selectedVersion?.approvalStatus || 'Draft')}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Version Selector */}
            <Select
              value={selectedVersion?.versionNumber?.toString()}
              onValueChange={(value) => {
                const version = document.versions.find(v => v.versionNumber.toString() === value)
                if (version) setSelectedVersion(version)
              }}
            >
              <SelectTrigger className="w-[260px]">
                <SelectValue>
                  {selectedVersion && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Version {selectedVersion.versionNumber}</span>
                      <span className="text-muted-foreground text-sm">
                        • {selectedVersion.uploader.firstName} {selectedVersion.uploader.lastName}
                        {selectedVersion.uploader.role && ` (${selectedVersion.uploader.role})`}
                      </span>
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {document.versions.map((version) => (
                  <SelectItem key={version.id} value={version.versionNumber.toString()}>
                    <div className="flex items-center justify-between w-full">
                      <span className="font-medium">Version {version.versionNumber}</span>
                      <span className="text-muted-foreground text-sm ml-2">
                        {version.uploader.firstName} {version.uploader.lastName}
                        {version.uploader.role && ` (${version.uploader.role})`}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedVersion?.approvalStatus === "pending" && user?.role === "admin" && (
              <>
                <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve
                </Button>
                <Button onClick={handleReject} variant="destructive">
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject
                </Button>
              </>
            )}
            <Button onClick={handleDownload} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>
        </div>

        {/* Document Description */}
        {document.description && (
          <Card className="bg-muted/30">
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">{document.description}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Main Content */}
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-4">
        <TabsList className="grid w-full max-w-[200px] grid-cols-2">
          <TabsTrigger value="preview">
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="mr-2 h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        {/* Preview Tab */}
        <TabsContent value="preview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* PDF Viewer */}
            <div className="lg:col-span-3">
              <Card className="h-[calc(100vh-500px)]">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle>Document Preview</CardTitle>
                    {showPdfError && (
                      <Alert className="w-auto">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          Unable to display PDF. Click download to view locally.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-0 h-[calc(100vh-10px)] flex flex-col">
                  {!showPdfError ? (
                    <>
                      <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPageNumber(prev => Math.max(1, prev - 1))}
                            disabled={pageNumber <= 1}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <span className="text-sm font-medium min-w-[120px] text-center">
                            Page {pageNumber} of {numPages || '...'}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPageNumber(prev => Math.min(numPages, prev + 1))}
                            disabled={pageNumber >= numPages}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Zoom:</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setScale(prev => Math.max(0.5, prev - 0.25))}
                          >
                            -
                          </Button>
                          <span className="text-sm font-medium min-w-[60px] text-center">{Math.round(scale * 100)}%</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setScale(prev => Math.min(3, prev + 0.25))}
                          >
                            +
                          </Button>
                        </div>
                      </div>
                      <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-950 flex items-start justify-center p-6">
                        <Document
                          file={pdfUrl}
                          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                          onLoadError={(error) => {
                            console.error('Error loading PDF:', error)
                            setShowPdfError(true)
                          }}
                          loading={
                            <div className="flex items-center justify-center p-8">
                              <div className="text-center">
                                <Skeleton className="h-[700px] w-[550px]" />
                                <p className="mt-4 text-sm text-muted-foreground">Loading PDF...</p>
                              </div>
                            </div>
                          }
                        >
                          <Page
                            pageNumber={pageNumber}
                            scale={scale}
                            renderTextLayer={true}
                            renderAnnotationLayer={true}
                            className="shadow-2xl border border-gray-200 dark:border-gray-800"
                          />
                        </Document>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                      <FileText className="h-16 w-16 mb-4" />
                      <p className="text-lg font-semibold mb-2">PDF Preview Unavailable</p>
                      <p className="text-sm mb-4">Please download the document to view it</p>
                      <Button onClick={handleDownload}>
                        <Download className="mr-2 h-4 w-4" />
                        Download PDF
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Document Information Sidebar */}
            <div className="space-y-4">
              {/* Upload New Version */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button className="w-full" variant="default">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload New Version
                  </Button>
                </CardContent>
              </Card>

              {/* Version Info */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Version Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Version Number</p>
                      <p className="text-lg font-semibold">Version {selectedVersion?.versionNumber}</p>
                    </div>

                    <Separator />

                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Uploaded By</p>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {selectedVersion?.uploader.firstName?.[0]}{selectedVersion?.uploader.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">
                            {selectedVersion?.uploader.firstName} {selectedVersion?.uploader.lastName}
                          </p>
                          {selectedVersion?.uploader.role && (
                            <p className="text-xs text-muted-foreground">{selectedVersion.uploader.role}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">File Details</p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span>{selectedVersion?.fileName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{selectedVersion && new Date(selectedVersion.uploadedAt).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Hash className="h-4 w-4 text-muted-foreground" />
                          <span>{formatFileSize(selectedVersion?.fileSize || 0)}</span>
                        </div>
                      </div>
                    </div>

                    {selectedVersion?.changeNotes && (
                      <>
                        <Separator />
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-muted-foreground">Change Notes</p>
                          <p className="text-sm">{selectedVersion.changeNotes}</p>
                        </div>
                      </>
                    )}

                    {selectedVersion?.approver && (
                      <>
                        <Separator />
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-muted-foreground">Approval</p>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm">
                              {selectedVersion.approver.firstName} {selectedVersion.approver.lastName}
                            </span>
                          </div>
                          {selectedVersion.approvedAt && (
                            <p className="text-xs text-muted-foreground">
                              {new Date(selectedVersion.approvedAt).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Comments Section */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Comments</CardTitle>
                    <Badge variant="secondary" className="text-xs">{comments.length}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Add Comment */}
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="min-h-[80px] text-sm"
                    />
                    <Button
                      onClick={handleAddComment}
                      disabled={!newComment.trim()}
                      size="sm"
                      className="w-full"
                    >
                      <Send className="mr-2 h-3 w-3" />
                      Post Comment
                    </Button>
                  </div>

                  <Separator />

                  {/* Comments List */}
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3 pr-3">
                      {loadingComments ? (
                        <div className="space-y-2">
                          {[...Array(2)].map((_, i) => (
                            <Skeleton key={i} className="h-20 w-full" />
                          ))}
                        </div>
                      ) : comments.length === 0 ? (
                        <div className="text-center py-8">
                          <MessageSquare className="mx-auto h-8 w-8 text-muted-foreground/50" />
                          <p className="mt-2 text-xs text-muted-foreground">No comments yet</p>
                        </div>
                      ) : (
                        comments.map((comment) => (
                          <Card key={comment.id} className="bg-muted/30 border-muted">
                            <CardContent className="p-3">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-start gap-2 flex-1 min-w-0">
                                  <Avatar className="h-6 w-6 mt-0.5">
                                    <AvatarFallback className="text-xs">
                                      {comment.author.firstName?.[0]}{comment.author.lastName?.[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <p className="font-medium text-xs truncate">
                                        {comment.author.firstName} {comment.author.lastName}
                                      </p>
                                      <span className="text-xs text-muted-foreground">
                                        {new Date(comment.createdAt).toLocaleDateString()}
                                      </span>
                                    </div>
                                    <p className="mt-1 text-xs break-words">{comment.content}</p>
                                  </div>
                                </div>
                                {user?.id === comment.author.id && (
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                        <MoreVertical className="h-3 w-3" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => handleDeleteComment(comment.id)}>
                                        <Trash2 className="mr-2 h-3 w-3" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Version History</CardTitle>
              <CardDescription>
                Complete history of all document versions and their uploaders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Version</TableHead>
                    <TableHead>Uploaded By</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Upload Date</TableHead>
                    <TableHead>File Size</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Change Notes</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {document.versions.map((version) => (
                    <TableRow key={version.id} className="hover:bg-muted/50">
                      <TableCell>
                        <Badge variant="outline">v{version.versionNumber}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {version.uploader.firstName?.[0]}{version.uploader.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">
                              {version.uploader.firstName} {version.uploader.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground">{version.uploader.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {version.uploader.role || 'User'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(version.uploadedAt).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatFileSize(version.fileSize)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(version.approvalStatus)}
                      </TableCell>
                      <TableCell>
                        {version.changeNotes ? (
                          <span className="text-sm text-muted-foreground line-clamp-2">
                            {version.changeNotes}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedVersion(version)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}