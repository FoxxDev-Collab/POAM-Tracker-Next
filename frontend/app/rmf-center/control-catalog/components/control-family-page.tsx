"use client"

import { useState, useEffect } from "react"
import {
  Shield, Search, FileText, AlertTriangle, CheckCircle, ArrowLeft,
  Activity, Settings, Package
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"

interface ATOPackage {
  id: number
  name: string
  description: string | null
  rmfStep: string
  impactLevel: string | null
}

interface Control {
  id: string
  name: string
  family: string
  controlText: string
  discussion: string
  type: 'baseline' | 'enhancement'
  complianceStatus?: string
  implementationStatus?: string
}

interface ControlFamilyPageProps {
  familyId: string
  familyName: string
  familyIconName?: string
}

const ICON_MAP = {
  Shield,
  FileText,
  Activity,
  CheckCircle,
  Settings,
  AlertTriangle,
  Package
} as const

const COMPLIANCE_STATUSES = [
  { value: 'compliant', label: 'Compliant', color: 'bg-green-500' },
  { value: 'non_compliant_unofficial', label: 'Non-Compliant (Unofficial)', color: 'bg-yellow-500' },
  { value: 'non_compliant_official', label: 'Non-Compliant (Official)', color: 'bg-red-500' },
  { value: 'not_applicable', label: 'Not Applicable', color: 'bg-gray-500' },
  { value: 'not_reviewed', label: 'Not Reviewed', color: 'bg-blue-500' }
]

const IMPLEMENTATION_STATUSES = [
  { value: 'implemented', label: 'Implemented', color: 'text-green-600' },
  { value: 'partially_implemented', label: 'Partially Implemented', color: 'text-yellow-600' },
  { value: 'planned', label: 'Planned', color: 'text-blue-600' },
  { value: 'not_implemented', label: 'Not Implemented', color: 'text-red-600' }
]

export default function ControlFamilyPage({ familyId, familyName, familyIconName = 'Shield' }: ControlFamilyPageProps) {
  const FamilyIcon = ICON_MAP[familyIconName as keyof typeof ICON_MAP] || Shield
  const router = useRouter()
  const [packages, setPackages] = useState<ATOPackage[]>([])
  const [selectedPackageId, setSelectedPackageId] = useState<string>("")
  const [controls, setControls] = useState<Control[]>([])
  const [filteredControls, setFilteredControls] = useState<Control[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchPackages()
  }, [])

  useEffect(() => {
    if (selectedPackageId) {
      localStorage.setItem('selectedATOPackage', selectedPackageId)
      fetchControls()
    }
  }, [selectedPackageId])

  useEffect(() => {
    const filtered = controls.filter(control =>
      control.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      control.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredControls(filtered)
  }, [searchTerm, controls])

  const fetchPackages = async () => {
    try {
      const response = await fetch('/api/packages')
      if (response.ok) {
        const data = await response.json()
        const packagesData = data.items || data || []
        setPackages(packagesData)

        const savedPackageId = localStorage.getItem('selectedATOPackage')
        if (savedPackageId && packagesData.some((p: ATOPackage) => p.id.toString() === savedPackageId)) {
          setSelectedPackageId(savedPackageId)
        } else if (packagesData.length > 0) {
          setSelectedPackageId(packagesData[0].id.toString())
        }
      }
    } catch (error) {
      console.error('Failed to fetch packages:', error)
    }
  }

  const fetchControls = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/catalog/controls?family=${familyId}&limit=100`)
      if (response.ok) {
        const data = await response.json()
        const controlsData = data.data?.controls || []

        const processedControls = controlsData.map((control: any) => ({
          id: control.controlId,
          name: control.name,
          family: familyId,
          controlText: control.controlText,
          discussion: control.discussion,
          type: control.controlId.includes('(') ? 'enhancement' : 'baseline',
          complianceStatus: control.complianceStatus || 'not_reviewed',
          implementationStatus: control.implementationStatus || 'not_implemented'
        }))

        setControls(processedControls)
        setFilteredControls(processedControls)
      }
    } catch (error) {
      console.error('Failed to fetch controls:', error)
    } finally {
      setLoading(false)
    }
  }

  const getComplianceStatusBadge = (status: string) => {
    const statusConfig = COMPLIANCE_STATUSES.find(s => s.value === status)
    if (!statusConfig) return null
    return (
      <Badge className={statusConfig.color}>
        {statusConfig.label}
      </Badge>
    )
  }

  const getImplementationStatusText = (status: string) => {
    const statusConfig = IMPLEMENTATION_STATUSES.find(s => s.value === status)
    if (!statusConfig) return { text: 'Unknown', color: 'text-gray-600' }
    return { text: statusConfig.label, color: statusConfig.color }
  }

  const handleControlClick = (controlId: string) => {
    router.push(`/rmf-center/control-catalog/${familyId}/${controlId}`)
  }

  return (
    <div className="space-y-6">
      {/* Header with Package Selector */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/rmf-center/control-catalog">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <FamilyIcon className="h-8 w-8 text-primary" />
              {familyId} - {familyName}
            </h1>
            <p className="text-muted-foreground">
              Manage {familyName.toLowerCase()} requirements for your systems
            </p>
          </div>
        </div>

        <Select value={selectedPackageId} onValueChange={setSelectedPackageId}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Select ATO Package" />
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

      {/* Quick Stats */}
      {selectedPackageId && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Controls
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{controls.length}</div>
              <p className="text-xs text-muted-foreground mt-1">In {familyId} family</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Baseline Controls
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {controls.filter(c => c.type === 'baseline').length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Primary controls</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Enhancements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {controls.filter(c => c.type === 'enhancement').length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Control enhancements</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Compliance Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">0%</div>
              <p className="text-xs text-muted-foreground mt-1">To be implemented</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search controls..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Controls Table */}
      <Card>
        <CardHeader>
          <CardTitle>{familyName} Family</CardTitle>
          <CardDescription>
            Click on any control to view details and manage implementation
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[...Array(10)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredControls.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? 'No controls found matching your search' : 'No controls available'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Control ID</TableHead>
                  <TableHead>Control Name</TableHead>
                  <TableHead className="w-[120px]">Type</TableHead>
                  <TableHead className="w-[180px]">Implementation Status</TableHead>
                  <TableHead className="w-[180px]">Compliance Status</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredControls.map((control) => {
                  const implStatus = getImplementationStatusText(control.implementationStatus || 'not_implemented')
                  return (
                    <TableRow
                      key={control.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleControlClick(control.id)}
                    >
                      <TableCell className="font-medium">{control.id}</TableCell>
                      <TableCell>{control.name}</TableCell>
                      <TableCell>
                        <Badge variant={control.type === 'baseline' ? 'default' : 'secondary'}>
                          {control.type === 'baseline' ? 'Baseline' : 'Enhancement'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className={`text-sm font-medium ${implStatus.color}`}>
                          {implStatus.text}
                        </span>
                      </TableCell>
                      <TableCell>
                        {getComplianceStatusBadge(control.complianceStatus || 'not_reviewed')}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" disabled>
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" disabled>
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" disabled>
                            <AlertTriangle className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}