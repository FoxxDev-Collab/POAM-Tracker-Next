"use client"

import { useState, useEffect } from "react"
import {
  Shield, Package, AlertTriangle, CheckCircle,
  FileText, TrendingUp, Activity, Settings,
  Download, RefreshCw, ListChecks, Link2,
  Eye, ExternalLink, ChevronDown, ChevronUp
} from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

interface ATOPackage {
  id: number
  name: string
  description: string | null
  rmfStep: string
  impactLevel: string | null
  securityControlBaseline?: string | null
}

interface ControlFamily {
  family: string
  name: string
  description: string
  controlCount: number
  implementedCount: number
  compliance: number
}

interface CatalogStats {
  totalControls: number
  totalCCIs: number
  controlFamilies: number
}

interface PackageBaseline {
  packageId: number
  controls: any[]
  summary: {
    total: number
    included: number
    tailored: number
    implemented: number
    partiallyImplemented: number
    notImplemented: number
  }
}

interface ComplianceSummary {
  packageId: number
  totalControls: number
  compliancePercentage: number
  breakdown: {
    compliant: number
    nonCompliant: number
    notApplicable: number
    notAssessed: number
  }
}

interface StigMappedControl {
  controlId: string
  controlTitle: string
  family: string
  totalFindings: number
  openFindings: number
  catIOpen: number
  catIIOpen: number
  catIIIOpen: number
  systemsAffected: number
  ccis: string[]
  status: 'Compliant' | 'Non-Compliant' | 'Partially Compliant'
}

const CONTROL_FAMILIES = [
  { id: "AC", name: "Access Control", icon: Shield },
  { id: "AT", name: "Awareness and Training", icon: FileText },
  { id: "AU", name: "Audit and Accountability", icon: Activity },
  { id: "CA", name: "Assessment, Authorization, and Monitoring", icon: CheckCircle },
  { id: "CM", name: "Configuration Management", icon: Settings },
  { id: "CP", name: "Contingency Planning", icon: AlertTriangle },
  { id: "IA", name: "Identification and Authentication", icon: Shield },
  { id: "IR", name: "Incident Response", icon: AlertTriangle },
  { id: "MA", name: "Maintenance", icon: Settings },
  { id: "MP", name: "Media Protection", icon: Shield },
  { id: "PE", name: "Physical and Environmental Protection", icon: Shield },
  { id: "PL", name: "Planning", icon: FileText },
  { id: "PM", name: "Program Management", icon: Package },
  { id: "PS", name: "Personnel Security", icon: Shield },
  { id: "PT", name: "Personally Identifiable Information Processing", icon: Shield },
  { id: "RA", name: "Risk Assessment", icon: AlertTriangle },
  { id: "SA", name: "System and Services Acquisition", icon: Package },
  { id: "SC", name: "System and Communications Protection", icon: Shield },
  { id: "SI", name: "System and Information Integrity", icon: CheckCircle },
  { id: "SR", name: "Supply Chain Risk Management", icon: Package }
]

export default function ControlCatalogDashboard() {
  const { toast } = useToast()
  const [packages, setPackages] = useState<ATOPackage[]>([])
  const [selectedPackageId, setSelectedPackageId] = useState<string>("")
  const [selectedPackage, setSelectedPackage] = useState<ATOPackage | null>(null)
  const [catalogStats, setCatalogStats] = useState<CatalogStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [familyStats, setFamilyStats] = useState<Map<string, ControlFamily>>(new Map())
  const [packageBaseline, setPackageBaseline] = useState<PackageBaseline | null>(null)
  const [complianceSummary, setComplianceSummary] = useState<ComplianceSummary | null>(null)
  const [stigMappedControls, setStigMappedControls] = useState<StigMappedControl[]>([])
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [showStigTable, setShowStigTable] = useState(false)

  useEffect(() => {
    fetchPackages()
    fetchCatalogStats()
  }, [])

  useEffect(() => {
    if (selectedPackageId) {
      localStorage.setItem('selectedATOPackage', selectedPackageId)
      const pkg = packages.find(p => p.id.toString() === selectedPackageId)
      setSelectedPackage(pkg || null)
      fetchPackageControlStatus(selectedPackageId)
      fetchPackageBaseline(selectedPackageId)
      fetchComplianceSummary(selectedPackageId)
      fetchStigMappedControls(selectedPackageId)
    }
  }, [selectedPackageId, packages])

  const fetchPackages = async () => {
    try {
      const response = await fetch('/api/packages')
      if (response.ok) {
        const data = await response.json()
        const packagesData = data.items || data || []
        setPackages(packagesData)

        // Set default package or restore from localStorage
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

  const fetchCatalogStats = async () => {
    try {
      const response = await fetch('/api/catalog/stats')
      if (response.ok) {
        const data = await response.json()
        setCatalogStats(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch catalog stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPackageControlStatus = async (packageId: string) => {
    try {
      // Fetch package-specific control compliance data from backend
      const response = await fetch(`/api/catalog/packages/${packageId}/control-status`)
      if (response.ok) {
        const data = await response.json()
        const statsMap = new Map<string, ControlFamily>()

        // Process the control status data by family
        CONTROL_FAMILIES.forEach(family => {
          const familyData = data.data?.families?.[family.id] || {
            totalControls: 0,
            implementedControls: 0,
            compliantControls: 0,
            compliancePercentage: 0
          }

          statsMap.set(family.id, {
            family: family.id,
            name: family.name,
            description: "",
            controlCount: familyData.totalControls,
            implementedCount: familyData.compliantControls,
            compliance: familyData.compliancePercentage
          })
        })

        setFamilyStats(statsMap)
      } else {
        // Fallback to empty stats if API fails
        const emptyStats = new Map<string, ControlFamily>()
        CONTROL_FAMILIES.forEach(family => {
          emptyStats.set(family.id, {
            family: family.id,
            name: family.name,
            description: "",
            controlCount: 0,
            implementedCount: 0,
            compliance: 0
          })
        })
        setFamilyStats(emptyStats)
      }
    } catch (error) {
      console.error('Failed to fetch package control status:', error)
      // Set empty stats on error
      const emptyStats = new Map<string, ControlFamily>()
      CONTROL_FAMILIES.forEach(family => {
        emptyStats.set(family.id, {
          family: family.id,
          name: family.name,
          description: "",
          controlCount: 0,
          implementedCount: 0,
          compliance: 0
        })
      })
      setFamilyStats(emptyStats)
    }
  }

  const fetchPackageBaseline = async (packageId: string) => {
    try {
      const response = await fetch(`/api/catalog/packages/${packageId}/baseline`)
      if (response.ok) {
        const data = await response.json()
        setPackageBaseline(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch package baseline:', error)
    }
  }

  const fetchComplianceSummary = async (packageId: string) => {
    try {
      const response = await fetch(`/api/catalog/packages/${packageId}/compliance-summary`)
      if (response.ok) {
        const data = await response.json()
        setComplianceSummary(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch compliance summary:', error)
    }
  }

  const fetchStigMappedControls = async (packageId: string) => {
    try {
      const response = await fetch(`/api/catalog/packages/${packageId}/stig-mapped-controls`)
      if (response.ok) {
        const data = await response.json()
        setStigMappedControls(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch STIG mapped controls:', error)
      setStigMappedControls([])
    }
  }

  const toggleRow = (controlId: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(controlId)) {
      newExpanded.delete(controlId)
    } else {
      newExpanded.add(controlId)
    }
    setExpandedRows(newExpanded)
  }


  const getComplianceColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600"
    if (percentage >= 70) return "text-yellow-600"
    if (percentage >= 50) return "text-orange-600"
    return "text-red-600"
  }

  const getComplianceBadge = (percentage: number) => {
    if (percentage >= 90) return <Badge className="bg-green-500">Compliant</Badge>
    if (percentage >= 70) return <Badge className="bg-yellow-500">Partially Compliant</Badge>
    return <Badge variant="destructive">Non-Compliant</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Header with Package Selector */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            NIST Control Catalog
          </h1>
          <p className="text-muted-foreground">
            Manage NIST 800-53 Rev 5 security controls for your ATO packages
          </p>
        </div>

        <div className="flex items-center gap-4">
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
      </div>

      {/* Package Baseline Overview */}
      {selectedPackageId && packageBaseline && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Package Baseline Overview</span>
              <Badge variant="outline" className="text-sm">
                {selectedPackage?.securityControlBaseline || 'Custom'} Baseline
              </Badge>
            </CardTitle>
            <CardDescription>
              Control implementation and compliance status for {selectedPackage?.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Controls</p>
                <p className="text-2xl font-bold">{packageBaseline.summary.total}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">In Baseline</p>
                <p className="text-2xl font-bold">{packageBaseline.summary.included}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Tailored</p>
                <p className="text-2xl font-bold text-blue-600">{packageBaseline.summary.tailored}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Implemented</p>
                <p className="text-2xl font-bold text-green-600">{packageBaseline.summary.implemented}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Partial</p>
                <p className="text-2xl font-bold text-yellow-600">{packageBaseline.summary.partiallyImplemented}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Not Implemented</p>
                <p className="text-2xl font-bold text-red-600">{packageBaseline.summary.notImplemented}</p>
              </div>
            </div>
            {complianceSummary && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Overall Compliance</span>
                  <span className="font-medium">
                    {Math.round(complianceSummary.compliancePercentage)}%
                  </span>
                </div>
                <Progress value={complianceSummary.compliancePercentage} className="h-3" />
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div className="text-center p-2 bg-green-50 rounded">
                    <p className="font-medium text-green-700">{complianceSummary.breakdown.compliant}</p>
                    <p className="text-green-600">Compliant</p>
                  </div>
                  <div className="text-center p-2 bg-red-50 rounded">
                    <p className="font-medium text-red-700">{complianceSummary.breakdown.nonCompliant}</p>
                    <p className="text-red-600">Non-Compliant</p>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <p className="font-medium text-gray-700">{complianceSummary.breakdown.notApplicable}</p>
                    <p className="text-gray-600">N/A</p>
                  </div>
                  <div className="text-center p-2 bg-blue-50 rounded">
                    <p className="font-medium text-blue-700">{complianceSummary.breakdown.notAssessed}</p>
                    <p className="text-blue-600">Not Assessed</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Control Families Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Control Families</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {CONTROL_FAMILIES.map((family) => {
            const Icon = family.icon
            const stats = familyStats.get(family.id)
            const compliancePercentage = stats ?
              (stats.implementedCount / stats.controlCount) * 100 : 0

            return (
              <Link key={family.id} href={`/rmf-center/control-catalog/${family.id}`}>
                <Card className="hover:shadow-lg transition-all hover:border-primary/50 cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-5 w-5 text-primary" />
                        <div>
                          <CardTitle className="text-lg">
                            {family.id} - {family.name}
                          </CardTitle>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {loading ? (
                      <Skeleton className="h-20 w-full" />
                    ) : stats ? (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Controls</span>
                          <span className="font-medium">
                            {stats.implementedCount} / {stats.controlCount}
                          </span>
                        </div>
                        <Progress value={compliancePercentage} className="h-2" />
                        <div className="flex items-center justify-between">
                          <span className={`text-sm font-medium ${getComplianceColor(compliancePercentage)}`}>
                            {Math.round(compliancePercentage)}% Compliant
                          </span>
                          {getComplianceBadge(compliancePercentage)}
                        </div>
                      </>
                    ) : (
                      <div className="text-center text-muted-foreground py-4">
                        Select a package to view status
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>

      {/* STIG to NIST Control Mapping Table */}
      {selectedPackageId && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Link2 className="h-5 w-5" />
                  STIG to NIST Control Mapping
                </CardTitle>
                <CardDescription>
                  Controls with STIG findings from vulnerability scans
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowStigTable(!showStigTable)}
              >
                {showStigTable ? (
                  <><ChevronUp className="h-4 w-4 mr-2" /> Hide Table</>
                ) : (
                  <><ChevronDown className="h-4 w-4 mr-2" /> Show Table</>
                )}
              </Button>
            </div>
          </CardHeader>
          {showStigTable && (
            <CardContent>
              {stigMappedControls.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No STIG findings mapped to controls for this package.
                  <p className="text-sm mt-2">Import STIG scans to see control mappings.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full" />
                        <span>Compliant ({stigMappedControls.filter(c => c.status === 'Compliant').length})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full" />
                        <span>Non-Compliant ({stigMappedControls.filter(c => c.status === 'Non-Compliant').length})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                        <span>Partially Compliant ({stigMappedControls.filter(c => c.status === 'Partially Compliant').length})</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Total: {stigMappedControls.length} controls with STIG findings
                    </p>
                  </div>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[120px]">Control ID</TableHead>
                          <TableHead>Control Title</TableHead>
                          <TableHead className="w-[100px]">Family</TableHead>
                          <TableHead className="w-[120px]">STIG Findings</TableHead>
                          <TableHead className="w-[150px]">Severity Breakdown</TableHead>
                          <TableHead className="w-[100px]">Systems</TableHead>
                          <TableHead className="w-[100px]">Status</TableHead>
                          <TableHead className="w-[80px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {stigMappedControls.map((control) => (
                          <Collapsible key={control.controlId} open={expandedRows.has(control.controlId)}>
                            <TableRow className="hover:bg-muted/50">
                              <TableCell className="font-medium">
                                <CollapsibleTrigger
                                  className="flex items-center gap-1 hover:text-primary cursor-pointer"
                                  onClick={() => toggleRow(control.controlId)}
                                >
                                  {expandedRows.has(control.controlId) ?
                                    <ChevronUp className="h-3 w-3" /> :
                                    <ChevronDown className="h-3 w-3" />
                                  }
                                  {control.controlId}
                                </CollapsibleTrigger>
                              </TableCell>
                              <TableCell className="text-sm">{control.controlTitle}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{control.family}</Badge>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="text-sm font-medium">
                                    <span className={control.openFindings > 0 ? "text-red-600" : "text-green-600"}>
                                      {control.openFindings} open
                                    </span>
                                    <span className="text-muted-foreground"> / {control.totalFindings} total</span>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                {control.openFindings > 0 ? (
                                  <div className="space-y-1 text-xs">
                                    {control.catIOpen > 0 && (
                                      <div className="flex items-center gap-1">
                                        <Badge variant="destructive" className="text-xs px-1 py-0">CAT I</Badge>
                                        <span>{control.catIOpen}</span>
                                      </div>
                                    )}
                                    {control.catIIOpen > 0 && (
                                      <div className="flex items-center gap-1">
                                        <Badge className="bg-orange-500 text-xs px-1 py-0">CAT II</Badge>
                                        <span>{control.catIIOpen}</span>
                                      </div>
                                    )}
                                    {control.catIIIOpen > 0 && (
                                      <div className="flex items-center gap-1">
                                        <Badge className="bg-yellow-500 text-xs px-1 py-0">CAT III</Badge>
                                        <span>{control.catIIIOpen}</span>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-green-600 text-sm">All Closed</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary">{control.systemsAffected}</Badge>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={control.status === 'Compliant' ? 'default' :
                                          control.status === 'Non-Compliant' ? 'destructive' : 'outline'}
                                  className={control.status === 'Compliant' ? 'bg-green-500' :
                                            control.status === 'Partially Compliant' ? 'bg-yellow-500' : ''}
                                >
                                  {control.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Link href={`/rmf-center/control-catalog/${control.family}/${control.controlId}`}>
                                  <Button variant="ghost" size="sm">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </Link>
                              </TableCell>
                            </TableRow>
                            <CollapsibleContent asChild>
                              <TableRow className="bg-muted/30">
                                <TableCell colSpan={8}>
                                  <div className="p-4 space-y-2">
                                    <div>
                                      <span className="font-medium text-sm">CCIs Mapped: </span>
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {control.ccis.map(cci => (
                                          <Badge key={cci} variant="secondary" className="text-xs">
                                            {cci}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                    <div className="flex gap-4 text-sm">
                                      <Link
                                        href={`/vulnerability-center/vulnerabilities/systems/${control.systemsAffected > 0 ? '1' : ''}`}
                                        className="text-primary hover:underline flex items-center gap-1"
                                      >
                                        View STIG Findings <ExternalLink className="h-3 w-3" />
                                      </Link>
                                      <Link
                                        href={`/rmf-center/control-catalog/manage/${selectedPackageId}`}
                                        className="text-primary hover:underline flex items-center gap-1"
                                      >
                                        Manage Baseline <ExternalLink className="h-3 w-3" />
                                      </Link>
                                    </div>
                                  </div>
                                </TableCell>
                              </TableRow>
                            </CollapsibleContent>
                          </Collapsible>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>
          )}
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common control management tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Button
              variant="outline"
              onClick={() => window.location.href = `/rmf-center/control-catalog/manage/${selectedPackageId}`}
            >
              <ListChecks className="h-4 w-4 mr-2" />
              Manage Controls
            </Button>
            <Button variant="outline" disabled>
              <FileText className="h-4 w-4 mr-2" />
              Generate SSP
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                if (selectedPackageId) {
                  fetchComplianceSummary(selectedPackageId)
                  toast({
                    title: "Compliance Check Complete",
                    description: "Compliance summary has been updated",
                  })
                }
              }}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Update Compliance
            </Button>
            <Button variant="outline" disabled>
              <Download className="h-4 w-4 mr-2" />
              Export Matrix
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}