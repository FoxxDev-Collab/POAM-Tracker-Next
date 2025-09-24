"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Upload, FileText, Download, Trash2 } from "lucide-react"
import { useDropzone } from "react-dropzone"

interface TopologyFile {
  id: number
  filename: string
  originalName: string
  size: number
  mimeType: string
  uploadedAt: string
  uploadedBy: string
}

interface TopologyTabProps {
  packageId: number
}

export function TopologyTab({ packageId }: TopologyTabProps) {
  const [files, setFiles] = useState<TopologyFile[]>([])
  const [uploading, setUploading] = useState(false)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true)
    
    for (const file of acceptedFiles) {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'topology')

      try {
        const response = await fetch(`/api/packages/${packageId}/files`, {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`)
        }

        const uploadedFile = await response.json()
        setFiles(prev => [...prev, uploadedFile])
        toast.success(`${file.name} uploaded successfully`)
      } catch (error) {
        console.error('Upload error:', error)
        toast.error(`Failed to upload ${file.name}`)
      }
    }
    
    setUploading(false)
  }, [packageId])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.svg'],
      'application/pdf': ['.pdf'],
      'application/vnd.ms-visio': ['.vsd', '.vsdx'],
      'application/x-drawio': ['.drawio'],
      'text/xml': ['.xml']
    },
    multiple: true
  })

  const handleDelete = async (fileId: number) => {
    try {
      const response = await fetch(`/api/packages/${packageId}/files/${fileId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete file')
      }

      setFiles(prev => prev.filter(f => f.id !== fileId))
      toast.success("File deleted successfully")
    } catch (error) {
      console.error('Delete error:', error)
      toast.error("Failed to delete file")
    }
  }

  const handleDownload = async (file: TopologyFile) => {
    try {
      const response = await fetch(`/api/packages/${packageId}/files/${file.id}/download`)
      
      if (!response.ok) {
        throw new Error('Failed to download file')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = file.originalName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Download error:', error)
      toast.error("Failed to download file")
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileTypeColor = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return 'bg-green-100 text-green-800 border-green-200'
    }
    if (mimeType === 'application/pdf') {
      return 'bg-red-100 text-red-800 border-red-200'
    }
    if (mimeType.includes('visio')) {
      return 'bg-blue-100 text-blue-800 border-blue-200'
    }
    return 'bg-gray-100 text-gray-800 border-gray-200'
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Network Diagrams</CardTitle>
          <CardDescription>
            Upload network topology diagrams, architectural drawings, and related documentation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive 
                ? 'border-blue-400 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            {isDragActive ? (
              <p className="text-lg">Drop the files here...</p>
            ) : (
              <div>
                <p className="text-lg mb-2">Drag & drop files here, or click to select</p>
                <p className="text-sm text-muted-foreground">
                  Supports: Images (PNG, JPG, SVG), PDF, Visio (.vsd, .vsdx), Draw.io (.drawio), XML
                </p>
              </div>
            )}
          </div>
          {uploading && (
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">Uploading files...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Files Table */}
      <Card>
        <CardHeader>
          <CardTitle>Topology Files</CardTitle>
          <CardDescription>
            Manage uploaded network diagrams and topology documentation
          </CardDescription>
        </CardHeader>
        <CardContent>
          {files.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Files Uploaded</h3>
              <p className="text-muted-foreground">
                Upload network diagrams and topology documentation to get started
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead>Uploaded By</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {files.map((file) => (
                  <TableRow key={file.id}>
                    <TableCell className="font-medium">
                      {file.originalName}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getFileTypeColor(file.mimeType)}>
                        {file.mimeType.split('/')[1].toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatFileSize(file.size)}</TableCell>
                    <TableCell>
                      {new Date(file.uploadedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{file.uploadedBy}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(file)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(file.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}