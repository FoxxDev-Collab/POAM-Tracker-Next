"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Clock,
  FileText,
  Plus,
  Search,
  ChevronDown,
  ChevronUp,
  Edit,
  Save,
  X
} from "lucide-react"
// import { cn } from "@/lib/utils"

interface SecurityControl {
  id: string
  controlId: string
  title: string
  family: string
  priority: 'P0' | 'P1' | 'P2' | 'P3'
  status: 'Implemented' | 'Partially Implemented' | 'Planned' | 'Not Applicable' | 'Alternative Implementation'
  implementationStatus: number // 0-100 percentage
  responsibleRole: string
  implementationDetails: string
  assessmentMethod?: string
  assessmentDate?: string
  assessmentResult?: 'Satisfied' | 'Other Than Satisfied' | 'Not Assessed'
  poamItems?: number
  artifacts?: string[]
  lastUpdated: string
}

interface ControlFamily {
  id: string
  name: string
  abbreviation: string
  controlCount: number
  implementedCount: number
  description: string
}

const NIST_FAMILIES: ControlFamily[] = [
  { id: 'AC', name: 'Access Control', abbreviation: 'AC', controlCount: 0, implementedCount: 0, description: 'Limit system access to authorized users' },
  { id: 'AT', name: 'Awareness and Training', abbreviation: 'AT', controlCount: 0, implementedCount: 0, description: 'Ensure personnel are adequately trained' },
  { id: 'AU', name: 'Audit and Accountability', abbreviation: 'AU', controlCount: 0, implementedCount: 0, description: 'Create, protect, and retain audit records' },
  { id: 'CA', name: 'Assessment and Authorization', abbreviation: 'CA', controlCount: 0, implementedCount: 0, description: 'Assess, authorize, and monitor controls' },
  { id: 'CM', name: 'Configuration Management', abbreviation: 'CM', controlCount: 0, implementedCount: 0, description: 'Establish and maintain baseline configurations' },
  { id: 'CP', name: 'Contingency Planning', abbreviation: 'CP', controlCount: 0, implementedCount: 0, description: 'Establish and maintain contingency plans' },
  { id: 'IA', name: 'Identification and Authentication', abbreviation: 'IA', controlCount: 0, implementedCount: 0, description: 'Identify and authenticate users and devices' },
  { id: 'IR', name: 'Incident Response', abbreviation: 'IR', controlCount: 0, implementedCount: 0, description: 'Establish incident response capability' },
  { id: 'MA', name: 'Maintenance', abbreviation: 'MA', controlCount: 0, implementedCount: 0, description: 'Perform periodic and timely maintenance' },
  { id: 'MP', name: 'Media Protection', abbreviation: 'MP', controlCount: 0, implementedCount: 0, description: 'Protect information system media' },
  { id: 'PE', name: 'Physical and Environmental Protection', abbreviation: 'PE', controlCount: 0, implementedCount: 0, description: 'Limit physical access to information systems' },
  { id: 'PL', name: 'Planning', abbreviation: 'PL', controlCount: 0, implementedCount: 0, description: 'Develop system security plans' },
  { id: 'PS', name: 'Personnel Security', abbreviation: 'PS', controlCount: 0, implementedCount: 0, description: 'Ensure trustworthiness of personnel' },
  { id: 'RA', name: 'Risk Assessment', abbreviation: 'RA', controlCount: 0, implementedCount: 0, description: 'Assess risk to operations and assets' },
  { id: 'SA', name: 'System and Services Acquisition', abbreviation: 'SA', controlCount: 0, implementedCount: 0, description: 'Ensure security in system acquisition' },
  { id: 'SC', name: 'System and Communications Protection', abbreviation: 'SC', controlCount: 0, implementedCount: 0, description: 'Protect system communications' },
  { id: 'SI', name: 'System and Information Integrity', abbreviation: 'SI', controlCount: 0, implementedCount: 0, description: 'Identify and correct information system flaws' },
  { id: 'SR', name: 'Supply Chain Risk Management', abbreviation: 'SR', controlCount: 0, implementedCount: 0, description: 'Manage supply chain risks' }
]

interface ControlImplementationProps {
  controls?: SecurityControl[]
  onUpdate?: (controls: SecurityControl[]) => Promise<void>
}

export function ControlImplementation({ controls = [], onUpdate }: ControlImplementationProps) {
  const [localControls, setLocalControls] = useState<SecurityControl[]>(controls)
  const [selectedFamily, setSelectedFamily] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [expandedControl, setExpandedControl] = useState<string | null>(null)
  const [editingControl, setEditingControl] = useState<string | null>(null)

  const filteredControls = localControls.filter(control => {
    const matchesSearch = control.controlId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         control.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFamily = !selectedFamily || control.family === selectedFamily
    const matchesStatus = statusFilter === "all" || control.status === statusFilter
    return matchesSearch && matchesFamily && matchesStatus
  })

  const overallImplementation = localControls.length > 0
    ? Math.round(localControls.reduce((sum, c) => sum + c.implementationStatus, 0) / localControls.length)
    : 0

  // const getStatusColor = (status: string) => {
  //   switch (status) {
  //     case 'Implemented': return 'bg-green-500'
  //     case 'Partially Implemented': return 'bg-yellow-500'
  //     case 'Planned': return 'bg-blue-500'
  //     case 'Not Applicable': return 'bg-gray-500'
  //     case 'Alternative Implementation': return 'bg-purple-500'
  //     default: return 'bg-gray-500'
  //   }
  // }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Implemented': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'Partially Implemented': return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 'Planned': return <Clock className="h-4 w-4 text-blue-500" />
      case 'Not Applicable': return <XCircle className="h-4 w-4 text-gray-500" />
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'P0': return 'bg-red-500'
      case 'P1': return 'bg-orange-500'
      case 'P2': return 'bg-yellow-500'
      case 'P3': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const updateControl = (id: string, updates: Partial<SecurityControl>) => {
    setLocalControls(localControls.map(c => 
      c.id === id ? { ...c, ...updates, lastUpdated: new Date().toISOString() } : c
    ))
  }

  const handleSaveControl = async () => {
    if (onUpdate) {
      await onUpdate(localControls)
    }
    setEditingControl(null)
  }

  const addControl = () => {
    const newControl: SecurityControl = {
      id: `ctrl-${Date.now()}`,
      controlId: 'NEW-1',
      title: 'New Security Control',
      family: 'AC',
      priority: 'P1',
      status: 'Planned',
      implementationStatus: 0,
      responsibleRole: '',
      implementationDetails: '',
      lastUpdated: new Date().toISOString()
    }
    setLocalControls([...localControls, newControl])
    setEditingControl(newControl.id)
  }

  const familyStats = NIST_FAMILIES.map(family => {
    const familyControls = localControls.filter(c => c.family === family.id)
    return {
      ...family,
      controlCount: familyControls.length,
      implementedCount: familyControls.filter(c => c.status === 'Implemented').length
    }
  })

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Control Implementation
            </CardTitle>
            <CardDescription>
              Track and manage NIST 800-53 security control implementation status
            </CardDescription>
          </div>
          <Button onClick={addControl} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Control
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="controls">Controls</TabsTrigger>
            <TabsTrigger value="families">Control Families</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="border-t-4 border-blue-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Total Controls</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{localControls.length}</div>
                </CardContent>
              </Card>
              <Card className="border-t-4 border-green-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Implemented</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {localControls.filter(c => c.status === 'Implemented').length}
                  </div>
                </CardContent>
              </Card>
              <Card className="border-t-4 border-yellow-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">In Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {localControls.filter(c => c.status === 'Partially Implemented' || c.status === 'Planned').length}
                  </div>
                </CardContent>
              </Card>
              <Card className="border-t-4 border-primary">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Overall Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{overallImplementation}%</div>
                  <Progress value={overallImplementation} className="mt-2" />
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Implementation by Priority</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {['P0', 'P1', 'P2', 'P3'].map(priority => {
                  const priorityControls = localControls.filter(c => c.priority === priority)
                  const implemented = priorityControls.filter(c => c.status === 'Implemented').length
                  const percentage = priorityControls.length > 0 
                    ? Math.round((implemented / priorityControls.length) * 100)
                    : 0
                  
                  return (
                    <div key={priority} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <Badge className={getPriorityColor(priority)}>{priority}</Badge>
                          Priority {priority.replace('P', '')} Controls
                        </span>
                        <span className="text-muted-foreground">
                          {implemented}/{priorityControls.length} ({percentage}%)
                        </span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="controls" className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search controls..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                className="px-3 py-2 rounded-md border border-input bg-background"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="Implemented">Implemented</option>
                <option value="Partially Implemented">Partially Implemented</option>
                <option value="Planned">Planned</option>
                <option value="Not Applicable">Not Applicable</option>
                <option value="Alternative Implementation">Alternative</option>
              </select>
              <select
                className="px-3 py-2 rounded-md border border-input bg-background"
                value={selectedFamily || ''}
                onChange={(e) => setSelectedFamily(e.target.value || null)}
              >
                <option value="">All Families</option>
                {NIST_FAMILIES.map(family => (
                  <option key={family.id} value={family.id}>
                    {family.abbreviation} - {family.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              {filteredControls.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No controls found matching your criteria
                </div>
              ) : (
                filteredControls.map(control => (
                  <Card key={control.id} className="overflow-hidden">
                    <div
                      className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => setExpandedControl(
                        expandedControl === control.id ? null : control.id
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(control.status)}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{control.controlId}</span>
                              <span className="text-sm text-muted-foreground">
                                {control.title}
                              </span>
                              <Badge className={getPriorityColor(control.priority)}>
                                {control.priority}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                              <span>Family: {control.family}</span>
                              <span>Status: {control.status}</span>
                              <span>Progress: {control.implementationStatus}%</span>
                            </div>
                          </div>
                        </div>
                        {expandedControl === control.id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </div>
                    
                    {expandedControl === control.id && (
                      <div className="border-t p-4 bg-muted/20">
                        {editingControl === control.id ? (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label>Control ID</Label>
                                <Input
                                  value={control.controlId}
                                  onChange={(e) => updateControl(control.id, { controlId: e.target.value })}
                                />
                              </div>
                              <div>
                                <Label>Title</Label>
                                <Input
                                  value={control.title}
                                  onChange={(e) => updateControl(control.id, { title: e.target.value })}
                                />
                              </div>
                              <div>
                                <Label>Family</Label>
                                <select
                                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                                  value={control.family}
                                  onChange={(e) => updateControl(control.id, { family: e.target.value })}
                                >
                                  {NIST_FAMILIES.map(family => (
                                    <option key={family.id} value={family.id}>
                                      {family.abbreviation} - {family.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <Label>Priority</Label>
                                <select
                                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                                  value={control.priority}
                                  onChange={(e) => updateControl(control.id, { 
                                    priority: e.target.value as SecurityControl['priority'] 
                                  })}
                                >
                                  <option value="P0">P0 - Critical</option>
                                  <option value="P1">P1 - High</option>
                                  <option value="P2">P2 - Medium</option>
                                  <option value="P3">P3 - Low</option>
                                </select>
                              </div>
                              <div>
                                <Label>Status</Label>
                                <select
                                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                                  value={control.status}
                                  onChange={(e) => updateControl(control.id, { 
                                    status: e.target.value as SecurityControl['status'] 
                                  })}
                                >
                                  <option value="Implemented">Implemented</option>
                                  <option value="Partially Implemented">Partially Implemented</option>
                                  <option value="Planned">Planned</option>
                                  <option value="Not Applicable">Not Applicable</option>
                                  <option value="Alternative Implementation">Alternative Implementation</option>
                                </select>
                              </div>
                              <div>
                                <Label>Implementation Progress (%)</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={control.implementationStatus}
                                  onChange={(e) => updateControl(control.id, { 
                                    implementationStatus: parseInt(e.target.value) || 0 
                                  })}
                                />
                              </div>
                              <div>
                                <Label>Responsible Role</Label>
                                <Input
                                  value={control.responsibleRole}
                                  onChange={(e) => updateControl(control.id, { responsibleRole: e.target.value })}
                                  placeholder="e.g., System Administrator"
                                />
                              </div>
                              <div>
                                <Label>Assessment Method</Label>
                                <Input
                                  value={control.assessmentMethod || ''}
                                  onChange={(e) => updateControl(control.id, { assessmentMethod: e.target.value })}
                                  placeholder="e.g., Interview, Test, Examine"
                                />
                              </div>
                            </div>
                            <div>
                              <Label>Implementation Details</Label>
                              <Textarea
                                value={control.implementationDetails}
                                onChange={(e) => updateControl(control.id, { implementationDetails: e.target.value })}
                                placeholder="Describe how this control is implemented..."
                                rows={4}
                              />
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button
                                onClick={() => setEditingControl(null)}
                                variant="outline"
                                size="sm"
                              >
                                <X className="h-4 w-4 mr-1" />
                                Cancel
                              </Button>
                              <Button
                                onClick={() => handleSaveControl()}
                                size="sm"
                              >
                                <Save className="h-4 w-4 mr-1" />
                                Save
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Responsible Role:</span>
                                <p className="font-medium">{control.responsibleRole || 'Not assigned'}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Assessment Method:</span>
                                <p className="font-medium">{control.assessmentMethod || 'Not specified'}</p>
                              </div>
                              {control.assessmentDate && (
                                <div>
                                  <span className="text-muted-foreground">Assessment Date:</span>
                                  <p className="font-medium">
                                    {new Date(control.assessmentDate).toLocaleDateString()}
                                  </p>
                                </div>
                              )}
                              {control.assessmentResult && (
                                <div>
                                  <span className="text-muted-foreground">Assessment Result:</span>
                                  <p className="font-medium">{control.assessmentResult}</p>
                                </div>
                              )}
                              {control.poamItems !== undefined && (
                                <div>
                                  <span className="text-muted-foreground">POA&M Items:</span>
                                  <p className="font-medium">{control.poamItems}</p>
                                </div>
                              )}
                              <div>
                                <span className="text-muted-foreground">Last Updated:</span>
                                <p className="font-medium">
                                  {new Date(control.lastUpdated).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div>
                              <span className="text-sm text-muted-foreground">Implementation Details:</span>
                              <p className="mt-1 text-sm">
                                {control.implementationDetails || 'No details provided'}
                              </p>
                            </div>
                            <div>
                              <Progress value={control.implementationStatus} className="h-2" />
                              <p className="text-xs text-muted-foreground mt-1">
                                {control.implementationStatus}% Complete
                              </p>
                            </div>
                            {control.artifacts && control.artifacts.length > 0 && (
                              <div>
                                <span className="text-sm text-muted-foreground">Artifacts:</span>
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {control.artifacts.map((artifact, idx) => (
                                    <Badge key={idx} variant="outline">
                                      <FileText className="h-3 w-3 mr-1" />
                                      {artifact}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            <div className="flex justify-end">
                              <Button
                                onClick={() => setEditingControl(control.id)}
                                size="sm"
                                variant="outline"
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Edit Control
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="families" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {familyStats.map(family => (
                <Card key={family.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">
                        {family.abbreviation} - {family.name}
                      </CardTitle>
                      <Badge variant="outline">
                        {family.implementedCount}/{family.controlCount}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      {family.description}
                    </p>
                    <Progress 
                      value={family.controlCount > 0 
                        ? (family.implementedCount / family.controlCount) * 100 
                        : 0
                      } 
                      className="h-2"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      {family.controlCount > 0 
                        ? `${Math.round((family.implementedCount / family.controlCount) * 100)}% Complete`
                        : 'No controls assigned'
                      }
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}