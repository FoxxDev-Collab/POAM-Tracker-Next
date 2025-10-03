"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import {
  Shield, ArrowLeft, Search, Save,
  AlertCircle,
  Edit, ChevronDown, ChevronRight
} from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

interface Control {
  controlId: string
  controlDetails?: {
    name: string
    controlText: string
  }
  includeInBaseline: boolean
  baselineSource?: string
  tailoringAction?: string
  tailoringRationale?: string
  implementationStatus?: string
  implementationNotes?: string
  complianceStatus?: string
  complianceNotes?: string
}

interface PackageBaseline {
  packageId: number
  controls: Control[]
  summary: {
    total: number
    included: number
    tailored: number
    implemented: number
    partiallyImplemented: number
    notImplemented: number
  }
}

const COMPLIANCE_STATUSES = [
  { value: 'CO', label: 'Compliant (Official)', color: 'bg-green-500' },
  { value: 'CU', label: 'Compliant (Unofficial)', color: 'bg-green-400' },
  { value: 'NC_O', label: 'Non-Compliant (Official)', color: 'bg-red-500' },
  { value: 'NC_U', label: 'Non-Compliant (Unofficial)', color: 'bg-yellow-500' },
  { value: 'NA_O', label: 'Not Applicable (Official)', color: 'bg-gray-500' },
  { value: 'NA_U', label: 'Not Applicable (Unofficial)', color: 'bg-gray-400' },
  { value: 'NOT_ASSESSED', label: 'Not Assessed', color: 'bg-blue-500' }
]

const IMPLEMENTATION_STATUSES = [
  { value: 'Implemented', label: 'Implemented', color: 'text-green-600' },
  { value: 'Partially_Implemented', label: 'Partially Implemented', color: 'text-yellow-600' },
  { value: 'Planned', label: 'Planned', color: 'text-blue-600' },
  { value: 'Not_Implemented', label: 'Not Implemented', color: 'text-red-600' }
]

export default function ManagePackageControls() {
  const params = useParams()
  const { toast } = useToast()
  const packageId = params.packageId as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [baseline, setBaseline] = useState<PackageBaseline | null>(null)
  const [filteredControls, setFilteredControls] = useState<Control[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterFamily, setFilterFamily] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedControls, setSelectedControls] = useState<Set<string>>(new Set())
  const [editingControl, setEditingControl] = useState<Control | null>(null)
  const [tailoringRationale, setTailoringRationale] = useState("")
  const [expandedFamilies, setExpandedFamilies] = useState<Set<string>>(new Set())
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    fetchBaseline()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [packageId])

  useEffect(() => {
    if (baseline) {
      filterControls()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseline, searchTerm, filterFamily, filterStatus])

  const fetchBaseline = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/catalog/packages/${packageId}/baseline`)
      if (response.ok) {
        const data = await response.json()
        setBaseline(data.data)
        setFilteredControls(data.data.controls)
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to load package baseline",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const filterControls = () => {
    if (!baseline) return

    let filtered = [...baseline.controls]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(control =>
        control.controlId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        control.controlDetails?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Family filter
    if (filterFamily !== "all") {
      filtered = filtered.filter(control =>
        control.controlId.startsWith(filterFamily)
      )
    }

    // Status filter
    if (filterStatus !== "all") {
      if (filterStatus === "included") {
        filtered = filtered.filter(control => control.includeInBaseline)
      } else if (filterStatus === "excluded") {
        filtered = filtered.filter(control => !control.includeInBaseline)
      } else if (filterStatus === "tailored") {
        filtered = filtered.filter(control => control.tailoringAction)
      }
    }

    setFilteredControls(filtered)
  }

  const updateControl = async (controlId: string, updates: Partial<Control>) => {
    try {
      const response = await fetch(`/api/catalog/packages/${packageId}/baseline/${controlId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        // Update local state
        setBaseline(prev => {
          if (!prev) return prev
          return {
            ...prev,
            controls: prev.controls.map(c =>
              c.controlId === controlId ? { ...c, ...updates } : c
            )
          }
        })
        setHasChanges(false)
        toast({
          title: "Success",
          description: `Control ${controlId} updated successfully`,
        })
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to update control",
        variant: "destructive"
      })
    }
  }

  const bulkUpdateControls = async () => {
    if (selectedControls.size === 0) return

    setSaving(true)
    const updates = Array.from(selectedControls).map(controlId => ({
      controlId,
      includeInBaseline: true,
      tailoringAction: 'Modified',
      tailoringRationale
    }))

    try {
      const response = await fetch(`/api/catalog/packages/${packageId}/baseline/bulk-update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ controls: updates }),
      })

      if (response.ok) {
        await fetchBaseline()
        setSelectedControls(new Set())
        setTailoringRationale("")
        toast({
          title: "Success",
          description: `${updates.length} controls updated successfully`,
        })
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to update controls",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const toggleControlSelection = (controlId: string) => {
    setSelectedControls(prev => {
      const newSet = new Set(prev)
      if (newSet.has(controlId)) {
        newSet.delete(controlId)
      } else {
        newSet.add(controlId)
      }
      return newSet
    })
  }

  const toggleFamily = (family: string) => {
    setExpandedFamilies(prev => {
      const newSet = new Set(prev)
      if (newSet.has(family)) {
        newSet.delete(family)
      } else {
        newSet.add(family)
      }
      return newSet
    })
  }

  const getComplianceStatusBadge = (status?: string) => {
    const config = COMPLIANCE_STATUSES.find(s => s.value === status) || COMPLIANCE_STATUSES[6]
    return <Badge className={`${config.color} text-white`}>{config.label}</Badge>
  }

  const getImplementationStatusBadge = (status?: string) => {
    const config = IMPLEMENTATION_STATUSES.find(s => s.value === status)
    if (!config) return <Badge variant="outline">Not Set</Badge>
    return <Badge variant="outline" className={config.color}>{config.label}</Badge>
  }

  // Group controls by family
  const controlsByFamily = filteredControls.reduce((acc, control) => {
    const family = control.controlId.split('-')[0]
    if (!acc[family]) acc[family] = []
    acc[family].push(control)
    return acc
  }, {} as Record<string, Control[]>)

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/rmf-center/control-catalog">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              Manage Package Controls
            </h1>
            <p className="text-muted-foreground">
              Configure control baseline and compliance status
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {hasChanges && (
            <Badge variant="outline" className="bg-yellow-50">
              <AlertCircle className="h-3 w-3 mr-1" />
              Unsaved Changes
            </Badge>
          )}
          <Button
            onClick={bulkUpdateControls}
            disabled={selectedControls.size === 0 || saving}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Summary Card */}
      {baseline && (
        <Card>
          <CardHeader>
            <CardTitle>Baseline Summary</CardTitle>
            <CardDescription>
              Overview of control implementation and compliance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Controls</p>
                <p className="text-2xl font-bold">{baseline.summary.total}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">In Baseline</p>
                <p className="text-2xl font-bold">{baseline.summary.included}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Tailored</p>
                <p className="text-2xl font-bold text-blue-600">{baseline.summary.tailored}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Implemented</p>
                <p className="text-2xl font-bold text-green-600">{baseline.summary.implemented}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Partial</p>
                <p className="text-2xl font-bold text-yellow-600">{baseline.summary.partiallyImplemented}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Not Implemented</p>
                <p className="text-2xl font-bold text-red-600">{baseline.summary.notImplemented}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search controls..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterFamily} onValueChange={setFilterFamily}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Families" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Families</SelectItem>
                <SelectItem value="AC">AC - Access Control</SelectItem>
                <SelectItem value="AU">AU - Audit</SelectItem>
                <SelectItem value="CA">CA - Assessment</SelectItem>
                <SelectItem value="CM">CM - Configuration</SelectItem>
                <SelectItem value="CP">CP - Contingency</SelectItem>
                <SelectItem value="IA">IA - Identification</SelectItem>
                <SelectItem value="IR">IR - Incident Response</SelectItem>
                <SelectItem value="MA">MA - Maintenance</SelectItem>
                <SelectItem value="MP">MP - Media Protection</SelectItem>
                <SelectItem value="PE">PE - Physical</SelectItem>
                <SelectItem value="PL">PL - Planning</SelectItem>
                <SelectItem value="PS">PS - Personnel</SelectItem>
                <SelectItem value="RA">RA - Risk Assessment</SelectItem>
                <SelectItem value="SA">SA - System Acquisition</SelectItem>
                <SelectItem value="SC">SC - System Protection</SelectItem>
                <SelectItem value="SI">SI - System Integrity</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="included">In Baseline</SelectItem>
                <SelectItem value="excluded">Not in Baseline</SelectItem>
                <SelectItem value="tailored">Tailored</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Controls Table */}
      <Card>
        <CardHeader>
          <CardTitle>Controls</CardTitle>
          <CardDescription>
            {filteredControls.length} controls found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(controlsByFamily).map(([family, controls]) => (
              <div key={family} className="border rounded-lg">
                <button
                  onClick={() => toggleFamily(family)}
                  className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {expandedFamilies.has(family) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                    <span className="font-medium">{family} Family</span>
                    <Badge variant="secondary">{controls.length} controls</Badge>
                  </div>
                </button>

                {expandedFamilies.has(family) && (
                  <div className="border-t">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">
                            <Checkbox
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  controls.forEach(c => selectedControls.add(c.controlId))
                                } else {
                                  controls.forEach(c => selectedControls.delete(c.controlId))
                                }
                                setSelectedControls(new Set(selectedControls))
                              }}
                            />
                          </TableHead>
                          <TableHead className="w-24">Control</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead className="w-32">In Baseline</TableHead>
                          <TableHead className="w-40">Implementation</TableHead>
                          <TableHead className="w-40">Compliance</TableHead>
                          <TableHead className="w-24">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {controls.map((control) => (
                          <TableRow key={control.controlId}>
                            <TableCell>
                              <Checkbox
                                checked={selectedControls.has(control.controlId)}
                                onCheckedChange={() => toggleControlSelection(control.controlId)}
                              />
                            </TableCell>
                            <TableCell className="font-medium">
                              {control.controlId}
                            </TableCell>
                            <TableCell className="max-w-md truncate">
                              {control.controlDetails?.name || 'N/A'}
                            </TableCell>
                            <TableCell>
                              <Checkbox
                                checked={control.includeInBaseline}
                                onCheckedChange={(checked) => {
                                  updateControl(control.controlId, {
                                    includeInBaseline: checked as boolean,
                                    tailoringAction: checked ? 'Added' : 'Removed'
                                  })
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              {getImplementationStatusBadge(control.implementationStatus)}
                            </TableCell>
                            <TableCell>
                              {getComplianceStatusBadge(control.complianceStatus)}
                            </TableCell>
                            <TableCell>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setEditingControl(control)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>Edit Control {control.controlId}</DialogTitle>
                                    <DialogDescription>
                                      Update implementation and compliance status
                                    </DialogDescription>
                                  </DialogHeader>
                                  {editingControl && (
                                    <div className="space-y-4 py-4">
                                      <div className="space-y-2">
                                        <Label>Implementation Status</Label>
                                        <Select
                                          value={editingControl.implementationStatus || ''}
                                          onValueChange={(value) =>
                                            setEditingControl({ ...editingControl, implementationStatus: value })
                                          }
                                        >
                                          <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {IMPLEMENTATION_STATUSES.map(status => (
                                              <SelectItem key={status.value} value={status.value}>
                                                {status.label}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>

                                      <div className="space-y-2">
                                        <Label>Compliance Status</Label>
                                        <Select
                                          value={editingControl.complianceStatus || ''}
                                          onValueChange={(value) =>
                                            setEditingControl({ ...editingControl, complianceStatus: value })
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
                                        <Label>Implementation Notes</Label>
                                        <Textarea
                                          value={editingControl.implementationNotes || ''}
                                          onChange={(e) =>
                                            setEditingControl({
                                              ...editingControl,
                                              implementationNotes: e.target.value
                                            })
                                          }
                                          placeholder="Describe how this control is implemented..."
                                          rows={3}
                                        />
                                      </div>

                                      <div className="space-y-2">
                                        <Label>Compliance Notes</Label>
                                        <Textarea
                                          value={editingControl.complianceNotes || ''}
                                          onChange={(e) =>
                                            setEditingControl({
                                              ...editingControl,
                                              complianceNotes: e.target.value
                                            })
                                          }
                                          placeholder="Additional compliance information..."
                                          rows={3}
                                        />
                                      </div>

                                      {control.tailoringAction && (
                                        <div className="space-y-2">
                                          <Label>Tailoring Rationale</Label>
                                          <Textarea
                                            value={editingControl.tailoringRationale || ''}
                                            onChange={(e) =>
                                              setEditingControl({
                                                ...editingControl,
                                                tailoringRationale: e.target.value
                                              })
                                            }
                                            placeholder="Explain why this control was tailored..."
                                            rows={3}
                                          />
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  <DialogFooter>
                                    <Button
                                      onClick={() => {
                                        if (editingControl) {
                                          updateControl(editingControl.controlId, editingControl)
                                          setEditingControl(null)
                                        }
                                      }}
                                    >
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
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}