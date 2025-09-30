"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  FileText, Upload, ChevronLeft, Shield, AlertTriangle,
  Settings, Package, FileCheck
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

const CONTROL_FAMILIES = [
  { id: "AC", name: "Access Control", icon: Shield },
  { id: "AT", name: "Awareness and Training", icon: FileCheck },
  { id: "AU", name: "Audit and Accountability", icon: FileText },
  { id: "CA", name: "Assessment, Authorization, and Monitoring", icon: FileCheck },
  { id: "CM", name: "Configuration Management", icon: Settings },
  { id: "CP", name: "Contingency Planning", icon: AlertTriangle },
  { id: "IA", name: "Identification and Authentication", icon: Shield },
  { id: "IR", name: "Incident Response", icon: AlertTriangle },
  { id: "MA", name: "Maintenance", icon: Settings },
  { id: "MP", name: "Media Protection", icon: Shield },
  { id: "PE", name: "Physical and Environmental Protection", icon: Shield },
  { id: "PL", name: "Planning", icon: FileCheck },
  { id: "PM", name: "Program Management", icon: Package },
  { id: "PS", name: "Personnel Security", icon: Shield },
  { id: "PT", name: "PII Processing and Transparency", icon: Shield },
  { id: "RA", name: "Risk Assessment", icon: AlertTriangle },
  { id: "SA", name: "System and Services Acquisition", icon: Package },
  { id: "SC", name: "System and Communications Protection", icon: Shield },
  { id: "SI", name: "System and Information Integrity", icon: FileCheck },
  { id: "SR", name: "Supply Chain Risk Management", icon: Package }
]

export default function DocumentUploadPage() {
  const router = useRouter()
  const [selectedPackage, setSelectedPackage] = useState<string>("")
  const [packages, setPackages] = useState<any[]>([])
  const [selectedFamily, setSelectedFamily] = useState<string>("")
  const [documentType, setDocumentType] = useState<string>("Policy")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchPackages()
  }, [])

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

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file")
      return
    }
    if (!selectedFamily) {
      toast.error("Please select a control family")
      return
    }
    if (!title) {
      toast.error("Please enter a document title")
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append("file", selectedFile)
    formData.append("packageId", selectedPackage)
    formData.append("controlFamily", selectedFamily)
    formData.append("documentType", documentType)
    formData.append("title", title)
    formData.append("description", description)

    try {
      const response = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        toast.success("Document uploaded successfully")
        router.push(`/rmf-center/document-center/${selectedFamily}`)
      } else {
        const error = await response.json()
        toast.error(error.message || "Failed to upload document")
      }
    } catch (error) {
      console.error("Error uploading document:", error)
      toast.error("Failed to upload document")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/rmf-center/document-center")}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Upload Document</h1>
          <p className="text-muted-foreground">
            Upload a new RMF document with version control
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Document Details</CardTitle>
          <CardDescription>
            Provide information about the document you're uploading
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="package">Package</Label>
              <Select value={selectedPackage} onValueChange={setSelectedPackage}>
                <SelectTrigger>
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

            <div className="space-y-2">
              <Label htmlFor="family">Control Family</Label>
              <Select value={selectedFamily} onValueChange={setSelectedFamily}>
                <SelectTrigger>
                  <SelectValue placeholder="Select control family" />
                </SelectTrigger>
                <SelectContent>
                  {CONTROL_FAMILIES.map((family) => (
                    <SelectItem key={family.id} value={family.id}>
                      {family.id} - {family.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="type">Document Type</Label>
              <Select value={documentType} onValueChange={setDocumentType}>
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

            <div className="space-y-2">
              <Label htmlFor="title">Document Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Access Control Policy"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a brief description of the document..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">File</Label>
            <Input
              id="file"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            />
            {selectedFile && (
              <p className="text-sm text-muted-foreground">
                Selected: {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-4 pt-4">
            <Button
              variant="outline"
              onClick={() => router.push("/rmf-center/document-center")}
            >
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={uploading}>
              <Upload className="mr-2 h-4 w-4" />
              {uploading ? "Uploading..." : "Upload Document"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}