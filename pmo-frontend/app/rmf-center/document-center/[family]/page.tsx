"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  FileText, Upload, Download, Eye, History, Plus,
  FileCheck, Shield, AlertTriangle, Settings, Package,
  Filter, Search, ChevronLeft, Clock, CheckCircle
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"

// Control families configuration
const CONTROL_FAMILIES: Record<string, { name: string; icon: any; description: string }> = {
  AC: { name: "Access Control", icon: Shield, description: "Policies and procedures for controlling access to systems and data" },
  AT: { name: "Awareness and Training", icon: FileCheck, description: "Security awareness and training documentation" },
  AU: { name: "Audit and Accountability", icon: FileText, description: "Audit logging and accountability policies" },
  CA: { name: "Assessment, Authorization, and Monitoring", icon: CheckCircle, description: "Security assessment and authorization documentation" },
  CM: { name: "Configuration Management", icon: Settings, description: "Configuration management policies and baselines" },
  CP: { name: "Contingency Planning", icon: AlertTriangle, description: "Business continuity and disaster recovery plans" },
  IA: { name: "Identification and Authentication", icon: Shield, description: "User identification and authentication policies" },
  IR: { name: "Incident Response", icon: AlertTriangle, description: "Incident response plans and procedures" },
  MA: { name: "Maintenance", icon: Settings, description: "System maintenance policies and schedules" },
  MP: { name: "Media Protection", icon: Shield, description: "Media handling and protection procedures" },
  PE: { name: "Physical and Environmental Protection", icon: Shield, description: "Physical security policies and procedures" },
  PL: { name: "Planning", icon: FileCheck, description: "Security planning documentation" },
  PM: { name: "Program Management", icon: Package, description: "Program management policies and procedures" },
  PS: { name: "Personnel Security", icon: Shield, description: "Personnel security policies and procedures" },
  PT: { name: "PII Processing and Transparency", icon: Shield, description: "Privacy and PII handling documentation" },
  RA: { name: "Risk Assessment", icon: AlertTriangle, description: "Risk assessment and management documentation" },
  SA: { name: "System and Services Acquisition", icon: Package, description: "Acquisition and development policies" },
  SC: { name: "System and Communications Protection", icon: Shield, description: "System and communications security documentation" },
  SI: { name: "System and Information Integrity", icon: FileCheck, description: "System integrity policies and procedures" },
  SR: { name: "Supply Chain Risk Management", icon: Package, description: "Supply chain security documentation" }
}

// Special document subtypes for certain control families
const DOCUMENT_SUBTYPES: Record<string, string[]> = {
  CP: ["Business Continuity Plan", "Disaster Recovery Plan", "Incident Response Plan", "Backup Plan", "Recovery Procedures"],
  IR: ["Incident Response Plan", "Incident Response Procedures", "Forensics Procedures", "Communication Plan"],
  RA: ["Risk Assessment Report", "Risk Management Plan", "Threat Assessment", "Vulnerability Assessment"]
}

interface Document {
  id: string
  title: string
  documentType: "Policy" | "Procedure" | "Plan"
  documentSubType?: string
  version: number
  currentVersion: number
  fileName: string
  fileSize: number
  uploadedAt: string
  uploadedBy: string
  approvalStatus: string
  description?: string
  changeNotes?: string
}

export default function ControlFamilyDocumentsPage() {
  const params = useParams()
  const router = useRouter()
  const familyId = params.family as string
  const family = CONTROL_FAMILIES[familyId]

  const [loading, setLoading] = useState(true)
  const [selectedPackage, setSelectedPackage] = useState<string>("")
  const [packages, setPackages] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<"policies" | "procedures" | "plans">("policies")
  const [documents, setDocuments] = useState<Document[]>([])
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [uploadType, setUploadType] = useState<"Policy" | "Procedure" | "Plan">("Policy")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  useEffect(() => {
    fetchPackages()
  }, [])

  useEffect(() => {
    if (selectedPackage) {
      fetchDocuments()
    }
  }, [selectedPackage, activeTab])

  const fetchPackages = async () => {
    try {
      const response = await fetch("/api/packages")
      if (response.ok) {
        const data = await response.json()
        setPackages(data.items || data || [])
        if (data.items?.length > 0 || data.length > 0) {
          const firstPackage = data.items?.[0] || data[0]
          setSelectedPackage(firstPackage.id.toString())
        }
      }
    } catch (error) {
      console.error("Error fetching packages:", error)
      toast.error("Failed to load packages")
    }
  }

  const fetchDocuments = async () => {
    setLoading(true)
    try {
      const documentType =
        activeTab === "policies" ? "Policy" :
        activeTab === "procedures" ? "Procedure" : "Plan"

      const response = await fetch(
        `/api/documents/package/${selectedPackage}?controlFamily=${familyId}&documentType=${documentType}`
      )

      if (response.ok) {
        const data = await response.json()
        setDocuments(data.documents || [])
      } else {
        setDocuments([])
      }
    } catch (error) {
      console.error("Error fetching documents:", error)
      setDocuments([])
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file")
      return
    }

    const formData = new FormData()
    formData.append("file", selectedFile)
    formData.append("packageId", selectedPackage)
    formData.append("controlFamily", familyId)
    formData.append("documentType", uploadType)

    try {
      const response = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        toast.success("Document uploaded successfully")
        setShowUploadDialog(false)
        setSelectedFile(null)
        fetchDocuments()
      } else {
        const error = await response.json()
        toast.error(error.message || "Failed to upload document")
      }
    } catch (error) {
      console.error("Error uploading document:", error)
      toast.error("Failed to upload document")
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Approved":
        return <Badge className="bg-green-500/10 text-green-700 border-green-500/20">Approved</Badge>
      case "Pending":
        return <Badge className="bg-yellow-500/10 text-yellow-700 border-yellow-500/20">Pending</Badge>
      case "Rejected":
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

  if (!family) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <p className="text-muted-foreground">Invalid control family</p>
              <Button className="mt-4" onClick={() => router.push("/rmf-center/document-center")}>
                Return to Document Center
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const Icon = family.icon

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/rmf-center/document-center")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted">
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {familyId} - {family.name}
              </h1>
              <p className="text-sm text-muted-foreground">
                {family.description}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedPackage} onValueChange={setSelectedPackage}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Select a package" />
            </SelectTrigger>
            <SelectContent>
              {packages.map((pkg) => (
                <SelectItem key={pkg.id} value={pkg.id.toString()}>
                  {pkg.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Document Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
          <CardDescription>
            Manage policies, procedures, and plans for {family.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <div className="flex items-center justify-between mb-4">
              <TabsList>
                <TabsTrigger value="policies">Policies</TabsTrigger>
                <TabsTrigger value="procedures">Procedures</TabsTrigger>
                <TabsTrigger value="plans">Plans</TabsTrigger>
              </TabsList>
              <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Document
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[525px]">
                  <DialogHeader>
                    <DialogTitle>Upload Document</DialogTitle>
                    <DialogDescription>
                      Upload a new document or new version for {family.name}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="type">Document Type</Label>
                      <Select value={uploadType} onValueChange={(v) => setUploadType(v as any)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Policy">Policy</SelectItem>
                          <SelectItem value="Procedure">Procedure</SelectItem>
                          <SelectItem value="Plan">Plan</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {uploadType === "Plan" && DOCUMENT_SUBTYPES[familyId] && (
                      <div className="grid gap-2">
                        <Label htmlFor="subtype">Plan Type</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select plan type" />
                          </SelectTrigger>
                          <SelectContent>
                            {DOCUMENT_SUBTYPES[familyId].map((subtype) => (
                              <SelectItem key={subtype} value={subtype}>
                                {subtype}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    <div className="grid gap-2">
                      <Label htmlFor="file">File</Label>
                      <Input
                        id="file"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="notes">Change Notes (for new versions)</Label>
                      <Textarea
                        id="notes"
                        placeholder="Describe what changed in this version..."
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleFileUpload}>Upload</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <TabsContent value="policies" className="space-y-4">
              <DocumentTable documents={documents} loading={loading} />
            </TabsContent>

            <TabsContent value="procedures" className="space-y-4">
              <DocumentTable documents={documents} loading={loading} />
            </TabsContent>

            <TabsContent value="plans" className="space-y-4">
              <DocumentTable documents={documents} loading={loading} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

function DocumentTable({ documents, loading }: { documents: Document[]; loading: boolean }) {
  const router = useRouter()

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    )
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">No documents uploaded yet</p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Document</TableHead>
          <TableHead>Version</TableHead>
          <TableHead>File Size</TableHead>
          <TableHead>Uploaded</TableHead>
          <TableHead>Uploaded By</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {documents.map((doc) => (
          <TableRow key={doc.id}>
            <TableCell>
              <div>
                <div className="font-medium">{doc.title}</div>
                {doc.description && (
                  <div className="text-sm text-muted-foreground">{doc.description}</div>
                )}
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="outline">v{doc.version}</Badge>
            </TableCell>
            <TableCell>{formatFileSize(doc.fileSize)}</TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-muted-foreground" />
                {new Date(doc.uploadedAt).toLocaleDateString()}
              </div>
            </TableCell>
            <TableCell>{doc.uploadedBy}</TableCell>
            <TableCell>{getStatusBadge(doc.approvalStatus)}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => router.push(`/rmf-center/document-center/view/${doc.id}`)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost">
                  <Download className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost">
                  <History className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i]
}

function getStatusBadge(status: string): JSX.Element {
  switch (status) {
    case "Approved":
      return <Badge className="bg-green-500/10 text-green-700 border-green-500/20">Approved</Badge>
    case "Pending":
      return <Badge className="bg-yellow-500/10 text-yellow-700 border-yellow-500/20">Pending</Badge>
    case "Rejected":
      return <Badge className="bg-red-500/10 text-red-700 border-red-500/20">Rejected</Badge>
    default:
      return <Badge variant="outline">Draft</Badge>
  }
}