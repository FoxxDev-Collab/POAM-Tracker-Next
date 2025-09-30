'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Upload,
  FileText,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface SimpleFileUploadProps {
  packageId: number
}

export default function SimpleFileUpload({ packageId }: SimpleFileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const { toast } = useToast()

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0])
    }
  }

  const handleFileUpload = async (file: File) => {
    setUploading(true)

    const formData = new FormData()
    formData.append('file', file)
    // Determine document type based on file type
    const documentType = file.type.startsWith('image/') ? 'TOPOLOGY_DIAGRAM' : 'OTHER'
    formData.append('documentType', documentType)
    formData.append('rmfStep', 'Categorize')
    formData.append('description', `Package ${packageId} topology: ${file.name}`)

    try {
      const response = await fetch(`/api/packages/${packageId}/documents/upload`, {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const result = await response.json()
        toast({
          title: 'Success',
          description: `${file.name} uploaded successfully`
        })
        console.log('Upload result:', result)

        // Trigger a page refresh to show the uploaded file
        window.location.reload()
      } else {
        const errorText = await response.text()
        console.error('Upload failed:', response.status, errorText)
        throw new Error(`Upload failed: ${response.status}`)
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: 'Upload Failed',
        description: `Failed to upload ${file.name}`,
        variant: 'destructive'
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>File Upload</CardTitle>
        <CardDescription>
          Upload documents for this ATO package
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Basic file upload functionality for testing. This will be enhanced with proper document management.
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
          <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-medium mb-2">
            Drag and drop files here, or click to browse
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Supports PDF, Word, Excel, Images (Max 50MB)
          </p>
          <input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={handleFileSelect}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
          />
          <Button
            onClick={() => document.getElementById('file-upload')?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <>
                <Upload className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Select Files
              </>
            )}
          </Button>
        </div>

        {uploading && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Upload in progress... Please wait.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}