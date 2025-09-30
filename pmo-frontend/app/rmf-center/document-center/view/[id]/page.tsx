"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ChevronLeft, Download, History, CheckCircle, XCircle,
  Clock, User, FileText, Calendar, Hash, Shield
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
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"

interface DocumentDetails {
  id: string
  title: string
  controlFamily: string
  documentType: string
  version: number
  currentVersion: {
    version: number
    fileName: string
    fileSize: number
    filePath: string
    uploadedAt: string
    approvalStatus: string
    changeNotes?: string
    uploader: {
      firstName: string
      lastName: string
      email: string
    }
    approver?: {
      firstName: string
      lastName: string
    }
    approvedAt?: string
  }
  versions: Array<{
    version: number
    fileName: string
    fileSize: number
    uploadedAt: string
    changeNotes?: string
    approvalStatus: string
    uploader: {
      firstName: string
      lastName: string
    }
  }>
}

export default function DocumentViewerPage() {
  const params = useParams()
  const router = useRouter()
  const documentId = params.id as string

  const [loading, setLoading] = useState(true)
  const [document, setDocument] = useState<DocumentDetails | null>(null)
  const [pdfUrl, setPdfUrl] = useState<string>("")

  useEffect(() => {
    fetchDocument()
  }, [documentId])

  const fetchDocument = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/documents/${documentId}`)
      if (response.ok) {
        const data = await response.json()
        setDocument(data)
        // Set PDF URL for viewing
        setPdfUrl(`/api/documents/${documentId}/download`)
      } else {
        toast.error("Failed to load document")
        router.push("/rmf-center/document-center")
      }
    } catch (error) {
      console.error("Error fetching document:", error)
      toast.error("Failed to load document")
      router.push("/rmf-center/document-center")
    } finally {
      setLoading(false)
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
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
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
            <h1 className="text-2xl font-bold tracking-tight">{document.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline">{document.controlFamily}</Badge>
              <Badge variant="outline">{document.documentType}</Badge>
              <Badge variant="outline">v{document.currentVersion.version}</Badge>
              {getStatusBadge(document.currentVersion.approvalStatus)}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {document.currentVersion.approvalStatus === "pending" && (
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PDF Viewer */}
        <div className="lg:col-span-2">
          <Card className="h-[800px]">
            <CardContent className="p-0 h-full">
              <iframe
                src={pdfUrl}
                className="w-full h-full rounded-lg"
                title={document.title}
              />
            </CardContent>
          </Card>
        </div>

        {/* Document Details */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Document Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">File Name:</span>
                  <span className="text-muted-foreground">{document.currentVersion.fileName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Version:</span>
                  <span className="text-muted-foreground">{document.currentVersion.version}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Control Family:</span>
                  <span className="text-muted-foreground">{document.controlFamily}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Uploaded:</span>
                  <span className="text-muted-foreground">
                    {new Date(document.currentVersion.uploadedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Uploaded by:</span>
                  <span className="text-muted-foreground">
                    {document.currentVersion.uploader.firstName} {document.currentVersion.uploader.lastName}
                  </span>
                </div>
              </div>

              {document.currentVersion.changeNotes && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium mb-1">Change Notes:</p>
                    <p className="text-sm text-muted-foreground">
                      {document.currentVersion.changeNotes}
                    </p>
                  </div>
                </>
              )}

              {document.currentVersion.approver && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-medium">Approved by:</span>
                      <span className="text-muted-foreground">
                        {document.currentVersion.approver.firstName} {document.currentVersion.approver.lastName}
                      </span>
                    </div>
                    {document.currentVersion.approvedAt && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Approved at:</span>
                        <span className="text-muted-foreground">
                          {new Date(document.currentVersion.approvedAt).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Version History */}
          <Card>
            <CardHeader>
              <CardTitle>Version History</CardTitle>
              <CardDescription>
                Track document changes over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {document.versions?.map((version) => (
                  <div
                    key={version.version}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">v{version.version}</Badge>
                        {getStatusBadge(version.approvalStatus)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {version.uploader.firstName} {version.uploader.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(version.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Button size="sm" variant="ghost">
                      <History className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}