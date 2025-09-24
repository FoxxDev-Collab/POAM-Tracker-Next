"use client"

import { useState, useEffect } from "react"
import {
  Shield, Search, FileText, AlertTriangle, CheckCircle, ArrowLeft,
  Activity, Settings, Package, Plus, Eye
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
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
  includeInBaseline?: boolean
  stigCompliance?: {
    status: string
    openFindings: number
    totalFindings: number
    systemsAffected: number
  }
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
  const { toast } = useToast()
  const [packages, setPackages] = useState<ATOPackage[]>([])
  const [selectedPackageId, setSelectedPackageId] = useState<string>("")
  const [controls, setControls] = useState<Control[]>([])
  const [filteredControls, setFilteredControls] = useState<Control[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [familyCompliance, setFamilyCompliance] = useState<any>(null)

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
      // Fetch controls for the family
      const controlsResponse = await fetch(`/api/catalog/controls?family=${familyId}&limit=100`)

      // Fetch package baseline if a package is selected
      let baselineData: any = null
      let packageComplianceData: any = null

      if (selectedPackageId) {
        const [baselineResponse, complianceResponse] = await Promise.all([
          fetch(`/api/catalog/packages/${selectedPackageId}/baseline`),
          fetch(`/api/catalog/packages/${selectedPackageId}/control-status`)
        ])

        if (baselineResponse.ok) {
          const baseline = await baselineResponse.json()
          baselineData = baseline.data
        }

        if (complianceResponse.ok) {
          const compliance = await complianceResponse.json()
          packageComplianceData = compliance.data
          setFamilyCompliance(packageComplianceData?.families?.[familyId])
        }
      }

      if (controlsResponse.ok) {
        const data = await controlsResponse.json()
        const controlsData = data.data?.controls || []

        const processedControls = controlsData.map((control: any) => {
          // Check if control is in baseline
          const baselineControl = baselineData?.controls?.find(
            (bc: any) => bc.controlId === control.controlId
          )

          // Get STIG compliance data for this control
          const stigCompliance = packageComplianceData?.controlStatus?.[control.controlId]

          return {
            id: control.controlId,
            name: control.name,
            family: familyId,
            controlText: control.controlText,
            discussion: control.discussion,
            type: control.controlId.includes('(') ? 'enhancement' : 'baseline',
            complianceStatus: baselineControl?.complianceStatus || control.complianceStatus || 'NOT_ASSESSED',
            implementationStatus: baselineControl?.implementationStatus || 'Not_Implemented',
            includeInBaseline: baselineControl?.includeInBaseline || false,
            stigCompliance: stigCompliance
          }
        })

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

  const addToBaseline = async (controlId: string) => {
    if (!selectedPackageId) {
      toast({
        title: "Error",
        description: "Please select a package first",
        variant: "destructive"
      })
      return
    }

    try {
      const response = await fetch(`/api/catalog/packages/${selectedPackageId}/baseline/${controlId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          includeInBaseline: true,
          tailoringAction: 'Added',
          tailoringRationale: `Added ${controlId} to package baseline`
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `${controlId} added to baseline successfully`,
        })
        // Refresh the controls data to show updated status
        fetchControls()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.message || "Failed to add control to baseline",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add control to baseline",
        variant: "destructive"
      })
    }
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
              <div className="text-2xl font-bold" style={{
                color: familyCompliance?.compliancePercentage >= 90 ? '#10b981' :
                       familyCompliance?.compliancePercentage >= 70 ? '#f59e0b' :
                       familyCompliance?.compliancePercentage >= 50 ? '#ef4444' : '#6b7280'
              }}>
                {familyCompliance?.compliancePercentage || 0}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {familyCompliance?.compliantControls || 0} of {familyCompliance?.totalControls || 0} compliant
              </p>
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
                  <TableHead className="w-[100px]">In Baseline</TableHead>
                  <TableHead className="w-[180px]">Implementation Status</TableHead>
                  <TableHead className="w-[180px]">Compliance Status</TableHead>
                  <TableHead className="w-[120px]">STIG Findings</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
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
                        {control.includeInBaseline ? (
                          <Badge variant="outline" className="bg-green-50">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Yes
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">No</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className={`text-sm font-medium ${implStatus.color}`}>
                          {implStatus.text}
                        </span>
                      </TableCell>
                      <TableCell>
                        {getComplianceStatusBadge(control.complianceStatus || 'NOT_ASSESSED')}
                      </TableCell>
                      <TableCell>
                        {control.stigCompliance ? (
                          <div className="text-xs space-y-1">
                            <div className="flex items-center gap-2">
                              <span className={control.stigCompliance.openFindings > 0 ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
                                {control.stigCompliance.openFindings} open
                              </span>
                              <span className="text-muted-foreground">
                                / {control.stigCompliance.totalFindings} total
                              </span>
                            </div>
                            {control.stigCompliance.openFindings > 0 && (
                              <div className="flex gap-2 text-xs">
                                {control.stigCompliance.catIOpen > 0 && (
                                  <span className="text-red-600 font-medium">CAT I: {control.stigCompliance.catIOpen}</span>
                                )}
                                {control.stigCompliance.catIIOpen > 0 && (
                                  <span className="text-orange-600 font-medium">CAT II: {control.stigCompliance.catIIOpen}</span>
                                )}
                                {control.stigCompliance.catIIIOpen > 0 && (
                                  <span className="text-yellow-600 font-medium">CAT III: {control.stigCompliance.catIIIOpen}</span>
                                )}
                              </div>
                            )}
                            <div className="text-muted-foreground">
                              {control.stigCompliance.systemsAffected} system{control.stigCompliance.systemsAffected !== 1 ? 's' : ''}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">No STIG data</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {!control.includeInBaseline && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation()
                                addToBaseline(control.id)
                              }}
                              title="Add to Baseline"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleControlClick(control.id)
                            }}
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
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