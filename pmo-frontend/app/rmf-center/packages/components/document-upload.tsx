'use client'

import { useState, useCallback, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  FileText,
  Upload,
  X,
  Download,
  Eye,
  Trash2,
  CheckCircle,
  AlertTriangle,
  FileImage,
  File,
  Network,
  Shield,
  ClipboardList,
  TestTube,
  Lock
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { formatBytes, formatDate } from '@/lib/utils'

export enum DocumentType {
  SYSTEM_SECURITY_PLAN = 'SYSTEM_SECURITY_PLAN',
  SECURITY_ASSESSMENT_REPORT = 'SECURITY_ASSESSMENT_REPORT',
  RISK_ASSESSMENT = 'RISK_ASSESSMENT',
  CONTINGENCY_PLAN = 'CONTINGENCY_PLAN',
  CONFIGURATION_MANAGEMENT_PLAN = 'CONFIGURATION_MANAGEMENT_PLAN',
  INCIDENT_RESPONSE_PLAN = 'INCIDENT_RESPONSE_PLAN',
  TOPOLOGY_DIAGRAM = 'TOPOLOGY_DIAGRAM',
  DATA_FLOW_DIAGRAM = 'DATA_FLOW_DIAGRAM',
  NETWORK_DIAGRAM = 'NETWORK_DIAGRAM',
  AUTHORIZATION_LETTER = 'AUTHORIZATION_LETTER',
  CONTROL_IMPLEMENTATION = 'CONTROL_IMPLEMENTATION',
  TEST_RESULTS = 'TEST_RESULTS',
  SCAN_RESULTS = 'SCAN_RESULTS',
  POA_M = 'POA_M',
  OTHER = 'OTHER'
}

const DOCUMENT_TYPE_LABELS: Record<DocumentType, { label: string; icon: any; color: string }> = {
  [DocumentType.SYSTEM_SECURITY_PLAN]: { label: 'System Security Plan', icon: Shield, color: 'text-blue-600' },
  [DocumentType.SECURITY_ASSESSMENT_REPORT]: { label: 'Security Assessment Report', icon: ClipboardList, color: 'text-purple-600' },
  [DocumentType.RISK_ASSESSMENT]: { label: 'Risk Assessment', icon: AlertTriangle, color: 'text-orange-600' },
  [DocumentType.CONTINGENCY_PLAN]: { label: 'Contingency Plan', icon: Shield, color: 'text-indigo-600' },
  [DocumentType.CONFIGURATION_MANAGEMENT_PLAN]: { label: 'Configuration Management Plan', icon: File, color: 'text-gray-600' },
  [DocumentType.INCIDENT_RESPONSE_PLAN]: { label: 'Incident Response Plan', icon: AlertTriangle, color: 'text-red-600' },
  [DocumentType.TOPOLOGY_DIAGRAM]: { label: 'Topology Diagram', icon: Network, color: 'text-green-600' },
  [DocumentType.DATA_FLOW_DIAGRAM]: { label: 'Data Flow Diagram', icon: Network, color: 'text-teal-600' },
  [DocumentType.NETWORK_DIAGRAM]: { label: 'Network Diagram', icon: Network, color: 'text-cyan-600' },
  [DocumentType.AUTHORIZATION_LETTER]: { label: 'Authorization Letter', icon: Lock, color: 'text-yellow-600' },
  [DocumentType.CONTROL_IMPLEMENTATION]: { label: 'Control Implementation', icon: CheckCircle, color: 'text-emerald-600' },
  [DocumentType.TEST_RESULTS]: { label: 'Test Results', icon: TestTube, color: 'text-pink-600' },
  [DocumentType.SCAN_RESULTS]: { label: 'Scan Results', icon: TestTube, color: 'text-rose-600' },
  [DocumentType.POA_M]: { label: 'POA&M', icon: ClipboardList, color: 'text-amber-600' },
  [DocumentType.OTHER]: { label: 'Other Document', icon: File, color: 'text-gray-600' }
}

const REQUIRED_DOCUMENTS_BY_STEP: Record<string, DocumentType[]> = {
  'Categorize': [
    DocumentType.SYSTEM_SECURITY_PLAN,
    DocumentType.TOPOLOGY_DIAGRAM,
    DocumentType.DATA_FLOW_DIAGRAM
  ],
  'Select': [
    DocumentType.CONTROL_IMPLEMENTATION,
    DocumentType.CONFIGURATION_MANAGEMENT_PLAN
  ],
  'Implement': [
    DocumentType.SYSTEM_SECURITY_PLAN,
    DocumentType.CONFIGURATION_MANAGEMENT_PLAN,
    DocumentType.INCIDENT_RESPONSE_PLAN
  ],
  'Assess': [
    DocumentType.SECURITY_ASSESSMENT_REPORT,
    DocumentType.TEST_RESULTS,
    DocumentType.SCAN_RESULTS,
    DocumentType.POA_M
  ],
  'Authorize': [
    DocumentType.RISK_ASSESSMENT,
    DocumentType.AUTHORIZATION_LETTER,
    DocumentType.POA_M
  ],
  'Monitor': [
    DocumentType.SCAN_RESULTS,
    DocumentType.POA_M
  ]
}

interface UploadedDocument {
  id: string
  packageId: number
  filename: string
  originalName: string
  mimeType: string
  size: number
  documentType: DocumentType
  rmfStep: string
  uploadedBy: string
  uploadedAt: string
  description?: string
  version?: number
  isActive: boolean
}

interface DocumentUploadProps {
  packageId: number
  currentRmfStep: string
  onDocumentUploaded?: () => void
}

export default function DocumentUpload({ packageId, currentRmfStep, onDocumentUploaded }: DocumentUploadProps) {
  const [documents, setDocuments] = useState<UploadedDocument[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [documentType, setDocumentType] = useState<DocumentType>(DocumentType.OTHER)
  const [description, setDescription] = useState('')
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const { toast } = useToast()

  // Fetch documents on mount
  useEffect(() => {
    fetchDocuments()
  }, [packageId])

  const fetchDocuments = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/packages/${packageId}/documents`)
      if (response.ok) {
        const data = await response.json()
        setDocuments(data)
      }
    } catch (error) {
      console.error('Error fetching documents:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch documents',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0])
      setShowUploadDialog(true)
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
      setShowUploadDialog(true)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('documentType', documentType)
    formData.append('rmfStep', currentRmfStep)
    if (description) {
      formData.append('description', description)
    }

    try {
      const response = await fetch(`/api/packages/${packageId}/documents/upload`, {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Document uploaded successfully'
        })
        await fetchDocuments()
        setShowUploadDialog(false)
        setSelectedFile(null)
        setDescription('')
        if (onDocumentUploaded) {
          onDocumentUploaded()
        }
      } else {
        throw new Error('Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: 'Upload Failed',
        description: 'Failed to upload document',
        variant: 'destructive'
      })
    } finally {
      setUploading(false)
    }
  }

  const handleDownload = async (documentId: string, originalName: string) => {
    try {
      const response = await fetch(`/api/packages/${packageId}/documents/${documentId}/download`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = originalName
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Download error:', error)
      toast({
        title: 'Download Failed',
        description: 'Failed to download document',
        variant: 'destructive'
      })
    }
  }

  const handleDelete = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return

    try {
      const response = await fetch(`/api/packages/${packageId}/documents/${documentId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Document deleted successfully'
        })
        await fetchDocuments()
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast({
        title: 'Delete Failed',
        description: 'Failed to delete document',
        variant: 'destructive'
      })
    }
  }

  const requiredDocuments = REQUIRED_DOCUMENTS_BY_STEP[currentRmfStep] || []
  const uploadedTypes = new Set(documents.map(doc => doc.documentType))
  const missingRequired = requiredDocuments.filter(type => !uploadedTypes.has(type))

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('image')) return FileImage
    if (mimeType.includes('pdf')) return FileText
    return File
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Document Management</CardTitle>
          <CardDescription>
            Upload and manage documents for the {currentRmfStep} phase
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Required Documents Status */}
          {requiredDocuments.length > 0 && (
            <Alert className={missingRequired.length === 0 ? 'border-green-500' : 'border-orange-500'}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">
                    Required documents for {currentRmfStep} phase:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {requiredDocuments.map(type => {
                      const docInfo = DOCUMENT_TYPE_LABELS[type]
                      const isUploaded = uploadedTypes.has(type)
                      return (
                        <Badge
                          key={type}
                          variant={isUploaded ? 'default' : 'outline'}
                          className={isUploaded ? 'bg-green-500' : ''}
                        >
                          {isUploaded && <CheckCircle className="h-3 w-3 mr-1" />}
                          {docInfo.label}
                        </Badge>
                      )
                    })}
                  </div>
                  {missingRequired.length === 0 && (
                    <p className="text-green-600 font-medium">
                      ✓ All required documents uploaded
                    </p>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">
              Drag and drop files here, or click to browse
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Supports PDF, Word, Excel, Images, and Visio files (Max 50MB)
            </p>
            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={handleFileSelect}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.svg,.txt,.csv,.json,.xml,.vsd,.vsdx"
            />
            <Button onClick={() => document.getElementById('file-upload')?.click()}>
              <Upload className="h-4 w-4 mr-2" />
              Select Files
            </Button>
          </div>

          {/* Document List */}
          {documents.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Uploaded Documents</h3>
              <div className="grid gap-3">
                {documents.map((doc) => {
                  const docInfo = DOCUMENT_TYPE_LABELS[doc.documentType]
                  const IconComponent = docInfo.icon
                  const FileIcon = getFileIcon(doc.mimeType)

                  return (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg bg-muted ${docInfo.color}`}>
                          <IconComponent className="h-6 w-6" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <FileIcon className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{doc.originalName}</span>
                            {doc.version && doc.version > 1 && (
                              <Badge variant="outline" className="text-xs">
                                v{doc.version}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>{docInfo.label}</span>
                            <span>{formatBytes(doc.size)}</span>
                            <span>Uploaded {formatDate(doc.uploadedAt)}</span>
                            <span>by {doc.uploadedBy}</span>
                          </div>
                          {doc.description && (
                            <p className="text-sm text-muted-foreground">{doc.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(doc.id, doc.originalName)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(doc.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Configure the document type and add optional description
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {selectedFile && (
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="font-medium text-sm">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">{formatBytes(selectedFile.size)}</p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="document-type">Document Type *</Label>
              <Select value={documentType} onValueChange={(value) => setDocumentType(value as DocumentType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(DOCUMENT_TYPE_LABELS).map(([type, info]) => (
                    <SelectItem key={type} value={type}>
                      <div className="flex items-center gap-2">
                        <info.icon className={`h-4 w-4 ${info.color}`} />
                        {info.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description for this document..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowUploadDialog(false)
                setSelectedFile(null)
                setDescription('')
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={uploading || !documentType}>
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}