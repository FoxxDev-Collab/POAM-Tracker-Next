"use client"

import { useState, useEffect } from "react"
import {
  Shield, ArrowLeft, FileText, AlertTriangle, CheckCircle, Clock, Hash,
  Activity, Settings, Package, Save, Edit, Plus, ChevronDown, Users, Server, FileCheck
} from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

interface ATOPackage {
  id: number
  name: string
  description: string | null
  rmfStep: string
  impactLevel: string | null
}

interface CCI {
  id?: number
  cci: string
  definition: string
  complianceStatus?: string
  complianceNotes?: string
  assessedBy?: number
  assessedAt?: string
  groupCompliance?: GroupCompliance[]
}

interface GroupCompliance {
  groupId: number
  groupName: string
  systems: SystemCompliance[]
  overallStatus: string
  openFindings: number
  totalFindings: number
}

interface SystemCompliance {
  systemId: number
  systemName: string
  status: string
  openFindings: number
  totalFindings: number
  catIOpen: number
  catIIOpen: number
  catIIIOpen: number
  activeStps?: number  // Number of active STPs for this system
  stpsDetails?: Array<{
    id: number
    title: string
    status: string
    testCasesTotal: number
    testCasesPassed: number
  }>
}

interface Control {
  id: string
  name: string
  family: string
  controlText: string
  discussion: string
  relatedControls?: string[]
  ccis?: CCI[]
  complianceStatus?: string
  implementationStatus?: string
}

interface ControlDetailPageProps {
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
  { value: 'CO', label: 'Compliant (Official)', color: 'bg-green-500 dark:bg-green-600' },
  { value: 'CU', label: 'Compliant (Unofficial)', color: 'bg-green-400 dark:bg-green-500' },
  { value: 'NC_O', label: 'Non-Compliant (Official)', color: 'bg-red-500 dark:bg-red-600' },
  { value: 'NC_U', label: 'Non-Compliant (Unofficial)', color: 'bg-yellow-500 dark:bg-yellow-600' },
  { value: 'NA_O', label: 'Not Applicable (Official)', color: 'bg-gray-500 dark:bg-gray-600' },
  { value: 'NA_U', label: 'Not Applicable (Unofficial)', color: 'bg-gray-400 dark:bg-gray-500' },
  { value: 'NOT_ASSESSED', label: 'Not Assessed', color: 'bg-blue-500 dark:bg-blue-600' }
]

export default function ControlDetailPage({ familyId, familyName, familyIconName = 'Shield' }: ControlDetailPageProps) {
  const FamilyIcon = ICON_MAP[familyIconName as keyof typeof ICON_MAP] || Shield
  const params = useParams()
  const controlId = params.id as string
  const { toast } = useToast()
  const [packages, setPackages] = useState<ATOPackage[]>([])
  const [selectedPackageId, setSelectedPackageId] = useState<string>("")
  const [control, setControl] = useState<Control | null>(null)
  const [loading, setLoading] = useState(true)
  const [editingCci, setEditingCci] = useState<CCI | null>(null)
  const [baselineControl, setBaselineControl] = useState<any>(null)
  const [cciComplianceData, setCciComplianceData] = useState<Map<string, GroupCompliance[]>>(new Map())

  useEffect(() => {
    fetchPackages()
    fetchControl()
  }, [controlId])

  useEffect(() => {
    if (selectedPackageId) {
      localStorage.setItem('selectedATOPackage', selectedPackageId)
      fetchBaselineControl()
      fetchCciComplianceData()
    }
  }, [selectedPackageId, controlId])

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

  const fetchControl = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/catalog/controls/${controlId}`)
      if (response.ok) {
        const data = await response.json()
        const controlData = data.data

        // Map backend response to frontend Control interface
        if (controlData) {
          setControl({
            id: controlData.controlId || controlId,
            name: controlData.name,
            family: familyId,
            controlText: controlData.controlText,
            discussion: controlData.discussion,
            relatedControls: controlData.relatedControls?.map((rc: any) => rc.relatedControlId) || [],
            ccis: controlData.ccis || [],
            complianceStatus: controlData.complianceStatus,
            implementationStatus: controlData.implementationStatus
          })
        }
      }
    } catch (error) {
      console.error('Failed to fetch control:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchBaselineControl = async () => {
    if (!selectedPackageId) return
    try {
      const response = await fetch(`/api/catalog/packages/${selectedPackageId}/baseline`)
      if (response.ok) {
        const data = await response.json()
        const baseline = data.data.controls.find((c: any) => c.controlId === controlId)
        setBaselineControl(baseline)
      }
    } catch (error) {
      console.error('Failed to fetch baseline control:', error)
    }
  }

  const fetchCciComplianceData = async () => {
    if (!selectedPackageId || !control?.ccis) return
    try {
      // Fetch compliance data for CCIs from the package's groups and systems
      const response = await fetch(`/api/catalog/controls/${controlId}/cci-compliance?packageId=${selectedPackageId}`)
      if (response.ok) {
        const data = await response.json()
        const complianceMap = new Map<string, GroupCompliance[]>()

        // Process the compliance data for each CCI
        if (data.data?.cciCompliance) {
          Object.entries(data.data.cciCompliance).forEach(([cci, compliance]: [string, any]) => {
            complianceMap.set(cci, compliance)
          })
        }

        setCciComplianceData(complianceMap)
      }
    } catch (error) {
      console.error('Failed to fetch CCI compliance data:', error)
    }
  }

  const updateCciCompliance = async (cci: CCI, updates: Partial<CCI>) => {
    try {
      const response = await fetch(`/api/catalog/ccis/${cci.cci}/compliance`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        // Update local state
        setControl(prev => {
          if (!prev) return prev
          return {
            ...prev,
            ccis: prev.ccis?.map(c =>
              c.cci === cci.cci ? { ...c, ...updates } : c
            )
          }
        })
        toast({
          title: "Success",
          description: `CCI ${cci.cci} updated successfully`,
        })
        setEditingCci(null)
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.message || "Failed to update CCI",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update CCI compliance",
        variant: "destructive"
      })
    }
  }

  const addToBaseline = async () => {
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
        fetchBaselineControl()
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

  const getComplianceStatusBadge = (status?: string) => {
    const config = COMPLIANCE_STATUSES.find(s => s.value === status) || COMPLIANCE_STATUSES[6]
    return <Badge className={`${config.color} text-white`}>{config.label}</Badge>
  }

  const isEnhancement = controlId.includes('(')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href={`/rmf-center/control-catalog/${familyId}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <FamilyIcon className="h-8 w-8 text-primary" />
              {controlId}
            </h1>
            {control && (
              <p className="text-xl text-muted-foreground mt-1">
                {control.name}
              </p>
            )}
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

      {/* Quick Actions */}
      <div className="flex gap-2 flex-wrap">
        <Badge variant={isEnhancement ? "secondary" : "default"}>
          {isEnhancement ? "Enhancement" : "Baseline"}
        </Badge>
        {baselineControl ? (
          <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20">
            <CheckCircle className="h-3 w-3 mr-1" />
            In Baseline
          </Badge>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={addToBaseline}
            disabled={!selectedPackageId}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add to Baseline
          </Button>
        )}
        <Link href={`/rmf-center/control-catalog/${familyId}/${controlId}/stig-map?packageId=${selectedPackageId}`}>
          <Button variant="outline" size="sm" disabled={!selectedPackageId}>
            <FileText className="h-4 w-4 mr-2" />
            Compliance Status - STIG Map
          </Button>
        </Link>
        <Button variant="outline" size="sm" disabled>
          <AlertTriangle className="h-4 w-4 mr-2" />
          POA&Ms - Create/Track
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-[200px] w-full" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      ) : control ? (
        <div className="space-y-6">
          {/* Control Text */}
          <Card>
            <CardHeader>
              <CardTitle>Control Text</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose dark:prose-invert max-w-none">
                <p className="whitespace-pre-wrap">{control.controlText}</p>
              </div>
            </CardContent>
          </Card>

          {/* Discussion */}
          <Card>
            <CardHeader>
              <CardTitle>Discussion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose dark:prose-invert max-w-none">
                <p className="whitespace-pre-wrap">{control.discussion}</p>
              </div>
            </CardContent>
          </Card>

          {/* Implementation Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Implementation Status</CardTitle>
                <CardDescription>
                  Track implementation progress for this control
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b">
                    <span className="font-medium">Implementation Status</span>
                    <Badge variant="secondary">
                      {baselineControl?.implementationStatus || 'Not Implemented'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b">
                    <span className="font-medium">Compliance Status</span>
                    {getComplianceStatusBadge(baselineControl?.complianceStatus || control?.complianceStatus)}
                  </div>
                  <div className="flex items-center justify-between py-3 border-b">
                    <span className="font-medium">Last Assessment</span>
                    <span className="text-muted-foreground">Never</span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className="font-medium">Open POA&Ms</span>
                    <span className="font-semibold">0</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Related Controls */}
            {control.relatedControls && control.relatedControls.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Related Controls</CardTitle>
                  <CardDescription>
                    Other controls related to this requirement
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {control.relatedControls.map((related) => (
                      <Link key={related} href={`/rmf-center/control-catalog/${related.split('-')[0]}/${related}`}>
                        <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                          {related}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* CCIs Table */}
          <Card>
            <CardHeader>
              <CardTitle>Control Correlation Identifiers (CCIs)</CardTitle>
              <CardDescription>
                Detailed implementation requirements for this control - {control.ccis?.length || 0} CCIs
              </CardDescription>
            </CardHeader>
            <CardContent>
              {control.ccis && control.ccis.length > 0 ? (
                <div className="w-full">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[120px]">CCI ID</TableHead>
                        <TableHead>Definition</TableHead>
                        <TableHead className="w-[140px]">Status</TableHead>
                        <TableHead className="w-[200px]">Group/System Compliance</TableHead>
                        <TableHead className="w-[80px] text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {control.ccis.map((cci, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-mono font-semibold align-top">
                            {cci.cci}
                          </TableCell>
                          <TableCell className="text-sm align-top">
                            <p className="whitespace-pre-wrap break-words">
                              {cci.definition}
                            </p>
                          </TableCell>
                          <TableCell className="align-top">
                            {getComplianceStatusBadge(cci.complianceStatus)}
                          </TableCell>
                          <TableCell className="align-top">
                            {cciComplianceData.get(cci.cci)?.length ? (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="outline" size="sm" className="w-full justify-between">
                                    <span className="flex items-center gap-1">
                                      <Users className="h-3 w-3" />
                                      {cciComplianceData.get(cci.cci)?.length || 0} Groups
                                    </span>
                                    <ChevronDown className="h-3 w-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="w-[350px]">
                                  <DropdownMenuLabel>Group Compliance Details</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  {cciComplianceData.get(cci.cci)?.map((group) => (
                                    <div key={group.groupId} className="px-2 py-2">
                                      <div className="flex items-center justify-between font-medium">
                                        <span className="flex items-center gap-1">
                                          <Users className="h-3 w-3" />
                                          {group.groupName}
                                        </span>
                                        <Badge
                                          variant={group.openFindings === 0 ? "default" : "destructive"}
                                          className="text-xs"
                                        >
                                          {group.openFindings} open / {group.totalFindings} total
                                        </Badge>
                                      </div>
                                      {group.systems?.length > 0 && (
                                        <div className="ml-4 mt-2 space-y-1">
                                          {group.systems.map((system) => (
                                            <div key={system.systemId} className="flex items-center justify-between text-sm">
                                              <span className="flex items-center gap-1 text-muted-foreground">
                                                <Server className="h-3 w-3" />
                                                {system.systemName}
                                              </span>
                                              <div className="flex items-center gap-2">
                                                {system.activeStps && system.activeStps > 0 && (
                                                  <Badge
                                                    variant="outline"
                                                    className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700"
                                                  >
                                                    <FileCheck className="h-3 w-3 mr-1" />
                                                    Active STP ({system.activeStps})
                                                  </Badge>
                                                )}
                                                {system.catIOpen > 0 && (
                                                  <span className="text-xs text-red-600 font-medium">
                                                    CAT I: {system.catIOpen}
                                                  </span>
                                                )}
                                                {system.catIIOpen > 0 && (
                                                  <span className="text-xs text-orange-600 font-medium">
                                                    CAT II: {system.catIIOpen}
                                                  </span>
                                                )}
                                                {system.catIIIOpen > 0 && (
                                                  <span className="text-xs text-yellow-600 font-medium">
                                                    CAT III: {system.catIIIOpen}
                                                  </span>
                                                )}
                                                {system.openFindings === 0 && (
                                                  <Badge variant="outline" className="text-xs bg-green-50 dark:bg-green-900/20">
                                                    Compliant
                                                  </Badge>
                                                )}
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            ) : (
                              <span className="text-sm text-muted-foreground">No STIG data</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center align-top">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setEditingCci(cci)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Edit CCI {cci.cci}</DialogTitle>
                                  <DialogDescription>
                                    Update compliance status and notes for this CCI
                                  </DialogDescription>
                                </DialogHeader>
                                {editingCci && (
                                  <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                      <Label>Compliance Status</Label>
                                      <Select
                                        value={editingCci.complianceStatus || 'NOT_ASSESSED'}
                                        onValueChange={(value) =>
                                          setEditingCci({ ...editingCci, complianceStatus: value })
                                        }
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {COMPLIANCE_STATUSES.map(status => (
                                            <SelectItem key={status.value} value={status.value}>
                                              {status.label}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    <div className="space-y-2">
                                      <Label>Compliance Notes</Label>
                                      <Textarea
                                        value={editingCci.complianceNotes || ''}
                                        onChange={(e) =>
                                          setEditingCci({
                                            ...editingCci,
                                            complianceNotes: e.target.value
                                          })
                                        }
                                        placeholder="Add notes about compliance status..."
                                        rows={4}
                                      />
                                    </div>

                                    <div className="bg-muted p-3 rounded-md">
                                      <Label className="font-medium">CCI Definition</Label>
                                      <p className="text-sm text-muted-foreground mt-1">
                                        {editingCci.definition}
                                      </p>
                                    </div>
                                  </div>
                                )}
                                <DialogFooter>
                                  <Button
                                    onClick={() => {
                                      if (editingCci) {
                                        updateCciCompliance(cci, {
                                          complianceStatus: editingCci.complianceStatus,
                                          complianceNotes: editingCci.complianceNotes
                                        })
                                      }
                                    }}
                                  >
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Changes
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No CCIs available for this control
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Control Not Found</h3>
            <p className="text-muted-foreground">
              The control {controlId} could not be found in the catalog
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}