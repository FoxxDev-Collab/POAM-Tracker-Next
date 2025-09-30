"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  FileText, FolderOpen, Shield, AlertTriangle, Settings,
  Package, Clock, CheckCircle, XCircle, Upload, Search,
  Filter, Download, Eye, History, FileCheck
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"

// Control families configuration
const CONTROL_FAMILIES = [
  { id: "AC", name: "Access Control", icon: Shield, color: "bg-blue-500/10 text-blue-700" },
  { id: "AT", name: "Awareness and Training", icon: FileCheck, color: "bg-green-500/10 text-green-700" },
  { id: "AU", name: "Audit and Accountability", icon: FileText, color: "bg-purple-500/10 text-purple-700" },
  { id: "CA", name: "Assessment, Authorization, and Monitoring", icon: CheckCircle, color: "bg-cyan-500/10 text-cyan-700" },
  { id: "CM", name: "Configuration Management", icon: Settings, color: "bg-orange-500/10 text-orange-700" },
  { id: "CP", name: "Contingency Planning", icon: AlertTriangle, color: "bg-red-500/10 text-red-700" },
  { id: "IA", name: "Identification and Authentication", icon: Shield, color: "bg-indigo-500/10 text-indigo-700" },
  { id: "IR", name: "Incident Response", icon: AlertTriangle, color: "bg-pink-500/10 text-pink-700" },
  { id: "MA", name: "Maintenance", icon: Settings, color: "bg-gray-500/10 text-gray-700" },
  { id: "MP", name: "Media Protection", icon: Shield, color: "bg-teal-500/10 text-teal-700" },
  { id: "PE", name: "Physical and Environmental Protection", icon: Shield, color: "bg-amber-500/10 text-amber-700" },
  { id: "PL", name: "Planning", icon: FileCheck, color: "bg-lime-500/10 text-lime-700" },
  { id: "PM", name: "Program Management", icon: Package, color: "bg-emerald-500/10 text-emerald-700" },
  { id: "PS", name: "Personnel Security", icon: Shield, color: "bg-violet-500/10 text-violet-700" },
  { id: "PT", name: "PII Processing and Transparency", icon: Shield, color: "bg-fuchsia-500/10 text-fuchsia-700" },
  { id: "RA", name: "Risk Assessment", icon: AlertTriangle, color: "bg-rose-500/10 text-rose-700" },
  { id: "SA", name: "System and Services Acquisition", icon: Package, color: "bg-sky-500/10 text-sky-700" },
  { id: "SC", name: "System and Communications Protection", icon: Shield, color: "bg-slate-500/10 text-slate-700" },
  { id: "SI", name: "System and Information Integrity", icon: FileCheck, color: "bg-zinc-500/10 text-zinc-700" },
  { id: "SR", name: "Supply Chain Risk Management", icon: Package, color: "bg-neutral-500/10 text-neutral-700" }
]

interface DocumentStats {
  totalDocuments: number
  policies: number
  procedures: number
  plans: number
  pendingApproval: number
  recentUploads: number
}

interface RecentDocument {
  id: string
  title: string
  controlFamily: string
  documentType: string
  version: number
  uploadedAt: string
  uploadedBy: string
  approvalStatus: string
}

export default function DocumentCenterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [selectedPackage, setSelectedPackage] = useState<string>("")
  const [packages, setPackages] = useState<any[]>([])
  const [stats, setStats] = useState<DocumentStats>({
    totalDocuments: 0,
    policies: 0,
    procedures: 0,
    plans: 0,
    pendingApproval: 0,
    recentUploads: 0
  })
  const [recentDocuments, setRecentDocuments] = useState<RecentDocument[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterFamily, setFilterFamily] = useState<string>("all")
  const [filterType, setFilterType] = useState<string>("all")

  useEffect(() => {
    fetchPackages()
  }, [])

  useEffect(() => {
    if (selectedPackage) {
      fetchDocumentStats()
      fetchRecentDocuments()
    }
  }, [selectedPackage])

  const fetchPackages = async () => {
    try {
      const response = await fetch("/api/packages")
      if (response.ok) {
        const data = await response.json()
        setPackages(data.items || data || [])
        // Auto-select first package if available
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

  const fetchDocumentStats = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/documents/package/${selectedPackage}/stats`)
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else {
        // Set default stats if error
        setStats({
          totalDocuments: 0,
          policies: 0,
          procedures: 0,
          plans: 0,
          pendingApproval: 0,
          recentUploads: 0
        })
      }
    } catch (error) {
      console.error("Error fetching document stats:", error)
      setStats({
        totalDocuments: 0,
        policies: 0,
        procedures: 0,
        plans: 0,
        pendingApproval: 0,
        recentUploads: 0
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchRecentDocuments = async () => {
    try {
      const response = await fetch(`/api/documents/package/${selectedPackage}/recent`)
      if (response.ok) {
        const data = await response.json()
        setRecentDocuments(data.documents || [])
      } else {
        setRecentDocuments([])
      }
    } catch (error) {
      console.error("Error fetching recent documents:", error)
      setRecentDocuments([])
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

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Document Center</h1>
          <p className="text-muted-foreground">
            Centralized RMF documentation management with version control
          </p>
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
          <Button onClick={() => router.push("/rmf-center/document-center/upload")}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Document
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats.totalDocuments}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Policies</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats.policies}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Procedures</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats.procedures}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Plans</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats.plans}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <div className="text-2xl font-bold text-yellow-600">{stats.pendingApproval}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Recent Uploads</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats.recentUploads}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Control Families Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Control Family Documents</CardTitle>
          <CardDescription>
            Navigate to control-specific documentation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {CONTROL_FAMILIES.map((family) => {
              const Icon = family.icon
              return (
                <Button
                  key={family.id}
                  variant="outline"
                  className="h-auto flex flex-col items-center justify-center p-4 hover:shadow-md transition-all"
                  onClick={() => router.push(`/rmf-center/document-center/${family.id}`)}
                >
                  <Icon className="h-6 w-6 mb-2" />
                  <span className="font-medium">{family.id}</span>
                  <span className="text-xs text-muted-foreground text-center line-clamp-1">
                    {family.name}
                  </span>
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Documents Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Documents</CardTitle>
              <CardDescription>
                Latest uploaded documents across all control families
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-[300px]"
              />
              <Select value={filterFamily} onValueChange={setFilterFamily}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All families" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All families</SelectItem>
                  {CONTROL_FAMILIES.map((family) => (
                    <SelectItem key={family.id} value={family.id}>
                      {family.id} - {family.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="Policy">Policies</SelectItem>
                  <SelectItem value="Procedure">Procedures</SelectItem>
                  <SelectItem value="Plan">Plans</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document Title</TableHead>
                <TableHead>Control Family</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead>Uploaded By</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentDocuments.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium">{doc.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{doc.controlFamily}</Badge>
                  </TableCell>
                  <TableCell>{doc.documentType}</TableCell>
                  <TableCell>v{doc.version}</TableCell>
                  <TableCell>
                    {new Date(doc.uploadedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{doc.uploadedBy}</TableCell>
                  <TableCell>{getStatusBadge(doc.approvalStatus)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="ghost">
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
        </CardContent>
      </Card>
    </div>
  )
}