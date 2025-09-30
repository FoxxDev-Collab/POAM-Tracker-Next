'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
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
  Network,
  Upload,
  Image,
  Download,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Eye,
  ZoomIn
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { formatBytes, formatDate } from '@/lib/utils'
import { DocumentType } from './document-upload'

interface TopologyDocument {
  id: string
  packageId: number
  filename: string
  originalName: string
  mimeType: string
  size: number
  documentType: DocumentType | string
  rmfStep: string
  uploadedBy: string
  uploadedAt?: string
  createdAt?: string
  description?: string
  version?: number
  isActive: boolean
}

interface TopologyDiagramUploadProps {
  packageId: number
  onDocumentUploaded?: () => void
}

interface PreviewModalProps {
  isOpen: boolean
  onClose: () => void
  document: TopologyDocument | null
}

const TOPOLOGY_DOCUMENT_TYPES = [
  {
    type: DocumentType.TOPOLOGY_DIAGRAM,
    label: 'System Topology Diagram',
    description: 'Overall system architecture and component relationships',
    required: true,
    icon: Network,
    color: 'text-blue-600'
  },
  {
    type: DocumentType.NETWORK_DIAGRAM,
    label: 'Network Architecture Diagram',
    description: 'Network infrastructure, IP ranges, and connectivity',
    required: true,
    icon: Network,
    color: 'text-green-600'
  },
  {
    type: DocumentType.DATA_FLOW_DIAGRAM,
    label: 'Data Flow Diagram',
    description: 'Data movement and processing flows',
    required: false,
    icon: Network,
    color: 'text-purple-600'
  }
]

export default function TopologyDiagramUpload({ packageId, onDocumentUploaded }: TopologyDiagramUploadProps) {
  const [documents, setDocuments] = useState<TopologyDocument[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedType, setSelectedType] = useState<DocumentType>(DocumentType.TOPOLOGY_DIAGRAM)
  const [description, setDescription] = useState('')
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [previewDocument, setPreviewDocument] = useState<TopologyDocument | null>(null)
  const { toast } = useToast()

  // Fetch topology documents on mount
  useEffect(() => {
    fetchTopologyDocuments()
  }, [packageId])

  const fetchTopologyDocuments = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/packages/${packageId}/documents`)
      if (response.ok) {
        const data = await response.json()
        console.log('Fetched documents:', data)

        // Filter for topology-related documents - also include OTHER type temporarily for debugging
        const topologyDocs = data.filter((doc: TopologyDocument) => {
          const docType = doc.documentType
          // Check if it's a topology type or has image mimetype
          return [DocumentType.TOPOLOGY_DIAGRAM, DocumentType.NETWORK_DIAGRAM, DocumentType.DATA_FLOW_DIAGRAM, 'OTHER'].includes(docType) ||
                 (doc.mimeType && doc.mimeType.startsWith('image/'))
        })

        console.log('Filtered topology docs:', topologyDocs)
        setDocuments(topologyDocs)
      }
    } catch (error) {
      console.error('Error fetching topology documents:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch topology documents',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (isValidImageFile(file)) {
        setSelectedFile(file)
        createImagePreview(file)
        setShowUploadDialog(true)
      } else {
        toast({
          title: 'Invalid File Type',
          description: 'Please upload image files only (PNG, JPG, SVG, or Visio)',
          variant: 'destructive'
        })
      }
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (isValidImageFile(file)) {
        setSelectedFile(file)
        createImagePreview(file)
        setShowUploadDialog(true)
      } else {
        toast({
          title: 'Invalid File Type',
          description: 'Please upload image files only (PNG, JPG, SVG, or Visio)',
          variant: 'destructive'
        })
      }
    }
  }

  const isValidImageFile = (file: File): boolean => {
    const validTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/svg+xml',
      'application/vnd.visio',
      'application/x-visio',
      'application/vnd.ms-visio.drawing'
    ]
    return validTypes.includes(file.type)
  }

  const createImagePreview = (file: File) => {
    if (file.type.startsWith('image/') && file.type !== 'image/svg+xml') {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setPreviewImage(null)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('documentType', selectedType)
    formData.append('rmfStep', 'Categorize')
    if (description) {
      formData.append('description', description)
    }

    try {
      const response = await fetch(`/api/packages/${packageId}/documents/upload`, {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Upload result:', result)

        toast({
          title: 'Success',
          description: 'Topology diagram uploaded successfully'
        })

        // Close dialog and reset state first
        setShowUploadDialog(false)
        setSelectedFile(null)
        setDescription('')
        setPreviewImage(null)

        // Then fetch the updated documents
        await fetchTopologyDocuments()

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
        description: 'Failed to upload topology diagram',
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
    if (!confirm('Are you sure you want to delete this topology diagram?')) return

    try {
      const response = await fetch(`/api/packages/${packageId}/documents/${documentId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Topology diagram deleted successfully'
        })
        await fetchTopologyDocuments()
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

  const handlePreview = (doc: TopologyDocument) => {
    setPreviewDocument(doc)
    setShowPreviewModal(true)
  }

  const getUploadedDocumentsByType = (type: DocumentType) => {
    return documents.filter(doc => doc.documentType === type)
  }

  const isRequiredTypeComplete = (type: DocumentType) => {
    return getUploadedDocumentsByType(type).length > 0
  }

  const allRequiredUploaded = TOPOLOGY_DOCUMENT_TYPES
    .filter(type => type.required)
    .every(type => isRequiredTypeComplete(type.type))

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-6 w-6 text-blue-600" />
            Topology Diagrams
          </CardTitle>
          <CardDescription>
            Upload system topology, network, and data flow diagrams required for RMF categorization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Requirements Status */}
          <Alert className={allRequiredUploaded ? 'border-green-500' : 'border-orange-500'}>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Topology Diagram Requirements:</p>
                <div className="grid gap-2">
                  {TOPOLOGY_DOCUMENT_TYPES.map(docType => {
                    const uploaded = isRequiredTypeComplete(docType.type)
                    const IconComponent = docType.icon
                    return (
                      <div key={docType.type} className="flex items-center justify-between p-2 rounded border">
                        <div className="flex items-center gap-3">
                          <IconComponent className={`h-5 w-5 ${docType.color}`} />
                          <div>
                            <p className="font-medium text-sm">{docType.label}</p>
                            <p className="text-xs text-muted-foreground">{docType.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {docType.required && (
                            <Badge variant="outline" className="text-xs">
                              Required
                            </Badge>
                          )}
                          {uploaded ? (
                            <Badge variant="default" className="text-xs bg-green-500">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Uploaded
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">
                              Pending
                            </Badge>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </AlertDescription>
          </Alert>

          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
            }`}
            onDragEnter={(e) => { e.preventDefault(); setDragActive(true) }}
            onDragLeave={(e) => { e.preventDefault(); setDragActive(false) }}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
            onDrop={handleDrop}
          >
            <Image className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">
              Drag and drop topology diagrams here
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Supports PNG, JPG, SVG, and Visio files (Max 50MB)
            </p>
            <input
              type="file"
              id="topology-upload"
              className="hidden"
              onChange={handleFileSelect}
              accept=".png,.jpg,.jpeg,.gif,.svg,.vsd,.vsdx"
            />
            <Button onClick={() => document.getElementById('topology-upload')?.click()}>
              <Upload className="h-4 w-4 mr-2" />
              Select Diagram Files
            </Button>
          </div>

          {/* Uploaded Diagrams */}
          {documents.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Uploaded Topology Diagrams</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {documents.map((doc) => {
                  const docTypeInfo = TOPOLOGY_DOCUMENT_TYPES.find(t => t.type === doc.documentType)
                  const IconComponent = docTypeInfo?.icon || Network

                  return (
                    <div
                      key={doc.id}
                      className="border rounded-lg overflow-hidden hover:bg-muted/50 transition-colors"
                    >
                      {/* Image Thumbnail Preview */}
                      {doc.mimeType?.startsWith('image/') && (
                        <div
                          className="h-48 bg-muted/20 relative flex items-center justify-center cursor-pointer border-b group"
                          onClick={() => handlePreview(doc)}
                        >
                          <img
                            src={`/api/packages/${packageId}/documents/${doc.id}/download`}
                            alt={doc.originalName}
                            className="w-full h-full object-contain p-2"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                            <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      )}

                      <div className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg bg-muted ${docTypeInfo?.color || 'text-gray-600'}`}>
                              <IconComponent className="h-6 w-6" />
                            </div>
                            <div>
                              <h4 className="font-medium text-sm">{docTypeInfo?.label || doc.documentType}</h4>
                              <p className="text-xs text-muted-foreground">{doc.originalName}</p>
                            </div>
                          </div>
                          {doc.version && doc.version > 1 && (
                            <Badge variant="outline" className="text-xs">
                              v{doc.version}
                            </Badge>
                          )}
                        </div>

                        {doc.description && (
                          <p className="text-sm text-muted-foreground mb-3">{doc.description}</p>
                        )}

                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                          <span>{formatBytes(doc.size)}</span>
                          <span>Uploaded {formatDate(doc.uploadedAt || doc.createdAt)}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePreview(doc)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Preview
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(doc.id, doc.originalName)}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(doc.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload Topology Diagram</DialogTitle>
            <DialogDescription>
              Configure the diagram type and add optional description
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {selectedFile && (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Image className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">{formatBytes(selectedFile.size)}</p>
                  </div>
                </div>

                {previewImage && (
                  <div className="border rounded-lg p-2 max-h-64 overflow-hidden">
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="w-full h-auto object-contain max-h-60"
                    />
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="diagram-type">Diagram Type *</Label>
              <div className="grid gap-2">
                {TOPOLOGY_DOCUMENT_TYPES.map(docType => (
                  <div
                    key={docType.type}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedType === docType.type
                        ? 'border-primary bg-primary/5'
                        : 'border-muted hover:border-muted-foreground/50'
                    }`}
                    onClick={() => setSelectedType(docType.type)}
                  >
                    <div className="flex items-center gap-3">
                      <docType.icon className={`h-5 w-5 ${docType.color}`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{docType.label}</p>
                          {docType.required && (
                            <Badge variant="outline" className="text-xs">
                              Required
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{docType.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description for this topology diagram..."
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
                setPreviewImage(null)
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={uploading || !selectedType}>
              {uploading ? 'Uploading...' : 'Upload Diagram'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Diagram Preview</DialogTitle>
            <DialogDescription>
              {previewDocument?.originalName} - Version {previewDocument?.version || 1}
            </DialogDescription>
          </DialogHeader>

          {previewDocument && (
            <div className="space-y-4">
              {/* Document Info */}
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <Network className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">{previewDocument.originalName}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatBytes(previewDocument.size)} • Uploaded {formatDate(previewDocument.uploadedAt || previewDocument.createdAt)} by {previewDocument.uploadedBy}
                    </p>
                  </div>
                </div>
                <Badge>{TOPOLOGY_DOCUMENT_TYPES.find(t => t.type === previewDocument.documentType)?.label}</Badge>
              </div>

              {previewDocument.description && (
                <Alert>
                  <AlertDescription>{previewDocument.description}</AlertDescription>
                </Alert>
              )}

              {/* Image Preview */}
              <div className="border rounded-lg p-4 bg-muted/20">
                {previewDocument.mimeType?.startsWith('image/') ? (
                  <img
                    src={`/api/packages/${packageId}/documents/${previewDocument.id}/download`}
                    alt={previewDocument.originalName}
                    className="w-full h-auto object-contain max-h-[60vh]"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                    <FileImage className="h-12 w-12 mb-4" />
                    <p className="text-sm">Preview not available for this file type</p>
                    <p className="text-xs mt-2">{previewDocument.mimeType}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => handleDownload(previewDocument.id, previewDocument.originalName)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Original
                </Button>
                <Button onClick={() => setShowPreviewModal(false)}>Close</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}