"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Plus, Edit, Trash2, Server, Users, Save, X, ChevronDown, ChevronUp, Monitor, HardDrive, Cpu, MemoryStick } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface System {
  id: number
  name: string
  description: string | null
  operatingSystem: string | null
  osVersion: string | null
  ipAddress: string | null
  macAddress: string | null
  hostname: string | null
  physicalLocation: string | null
  assetTag: string | null
  serialNumber: string | null
  manufacturer: string | null
  model: string | null
  cpuCores: number | null
  ramGB: number | null
  storageGB: number | null
  lifecycleStatus: string | null
  criticality: string | null
  environmentType: string | null
  createdAt: string
  updatedAt: string
  _count?: {
    vulnerabilities: number
  }
}

interface Group {
  id: number
  name: string
  description: string | null
  type: string | null
  createdAt: string
  updatedAt: string
  _count?: {
    systems: number
  }
}

interface AssetManagementTabProps {
  packageId: number
}

const OPERATING_SYSTEMS = [
  'Windows Server 2022', 'Windows Server 2019', 'Windows Server 2016',
  'Windows 11', 'Windows 10',
  'Ubuntu 22.04 LTS', 'Ubuntu 20.04 LTS', 'Ubuntu 18.04 LTS',
  'Red Hat Enterprise Linux 9', 'Red Hat Enterprise Linux 8',
  'CentOS Stream 9', 'CentOS Stream 8',
  'macOS Ventura', 'macOS Monterey', 'macOS Big Sur',
  'VMware ESXi 8.0', 'VMware ESXi 7.0',
  'Other'
]

const LIFECYCLE_STATUSES = ['Active', 'Inactive', 'Maintenance', 'Decommissioned', 'Pending', 'Retired']
const CRITICALITY_LEVELS = ['Critical', 'High', 'Medium', 'Low']
const ENVIRONMENT_TYPES = ['Production', 'Development', 'Test', 'Staging', 'DR', 'Lab']
const GROUP_TYPES = ['Department', 'Network Segment', 'Application Tier', 'Security Zone', 'Geographic', 'Functional']

export function AssetManagementTab({ packageId }: AssetManagementTabProps) {
  const [systems, setSystems] = useState<System[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreatingSystem, setIsCreatingSystem] = useState(false)
  const [isCreatingGroup, setIsCreatingGroup] = useState(false)
  const [editingSystem, setEditingSystem] = useState<System | null>(null)
  const [editingGroup, setEditingGroup] = useState<Group | null>(null)
  const [expandedSections, setExpandedSections] = useState({
    basicInfo: true,
    networkConfig: false,
    hardware: false,
    lifecycle: false
  })
  
  const [systemFormData, setSystemFormData] = useState({
    name: '',
    description: '',
    hostname: '',
    operatingSystem: '',
    osVersion: '',
    ipAddress: '',
    macAddress: '',
    physicalLocation: '',
    assetTag: '',
    serialNumber: '',
    manufacturer: '',
    model: '',
    cpuCores: '',
    ramGB: '',
    storageGB: '',
    lifecycleStatus: 'Active',
    criticality: 'Medium',
    environmentType: 'Production'
  })

  const [groupFormData, setGroupFormData] = useState({
    name: '',
    description: '',
    type: ''
  })

  const fetchData = useCallback(async () => {
    try {
      const [systemsResponse, groupsResponse] = await Promise.all([
        fetch(`/api/packages/${packageId}/systems`),
        fetch(`/api/packages/${packageId}/groups`)
      ])

      if (systemsResponse.ok) {
        const systemsData = await systemsResponse.json()
        setSystems(systemsData.items || systemsData || [])
      }

      if (groupsResponse.ok) {
        const groupsData = await groupsResponse.json()
        setGroups(groupsData.items || groupsData || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error("Failed to load data")
    } finally {
      setLoading(false)
    }
  }, [packageId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const resetSystemForm = () => {
    setSystemFormData({
      name: '',
      description: '',
      hostname: '',
      operatingSystem: '',
      osVersion: '',
      ipAddress: '',
      macAddress: '',
      physicalLocation: '',
      assetTag: '',
      serialNumber: '',
      manufacturer: '',
      model: '',
      cpuCores: '',
      ramGB: '',
      storageGB: '',
      lifecycleStatus: 'Active',
      criticality: 'Medium',
      environmentType: 'Production'
    })
    setEditingSystem(null)
    setIsCreatingSystem(false)
    setExpandedSections({
      basicInfo: true,
      networkConfig: false,
      hardware: false,
      lifecycle: false
    })
  }

  const resetGroupForm = () => {
    setGroupFormData({
      name: '',
      description: '',
      type: ''
    })
    setEditingGroup(null)
    setIsCreatingGroup(false)
  }

  // System handlers
  const handleSystemSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!systemFormData.name) {
      toast.error("System name is required")
      return
    }

    try {
      const url = editingSystem 
        ? `/api/packages/${packageId}/systems/${editingSystem.id}`
        : `/api/packages/${packageId}/systems`
      
      const method = editingSystem ? 'PATCH' : 'POST'
      
      const payload = {
        ...systemFormData,
        cpuCores: systemFormData.cpuCores ? parseInt(systemFormData.cpuCores) : null,
        ramGB: systemFormData.ramGB ? parseInt(systemFormData.ramGB) : null,
        storageGB: systemFormData.storageGB ? parseInt(systemFormData.storageGB) : null
      }
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error('Failed to save system')
      }

      toast.success(editingSystem ? "System updated successfully" : "System created successfully")
      fetchData()
      resetSystemForm()
    } catch (error) {
      console.error('Error saving system:', error)
      toast.error("Failed to save system")
    }
  }

  const handleEditSystem = (system: System) => {
    setEditingSystem(system)
    setSystemFormData({
      name: system.name,
      description: system.description || '',
      hostname: system.hostname || '',
      operatingSystem: system.operatingSystem || '',
      osVersion: system.osVersion || '',
      ipAddress: system.ipAddress || '',
      macAddress: system.macAddress || '',
      physicalLocation: system.physicalLocation || '',
      assetTag: system.assetTag || '',
      serialNumber: system.serialNumber || '',
      manufacturer: system.manufacturer || '',
      model: system.model || '',
      cpuCores: system.cpuCores?.toString() || '',
      ramGB: system.ramGB?.toString() || '',
      storageGB: system.storageGB?.toString() || '',
      lifecycleStatus: system.lifecycleStatus || 'Active',
      criticality: system.criticality || 'Medium',
      environmentType: system.environmentType || 'Production'
    })
    setIsCreatingSystem(true)
    setExpandedSections({
      basicInfo: true,
      networkConfig: true,
      hardware: true,
      lifecycle: true
    })
  }

  const handleDeleteSystem = async (systemId: number) => {
    if (!confirm('Are you sure you want to delete this system?')) return

    try {
      const response = await fetch(`/api/packages/${packageId}/systems/${systemId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete system')
      }

      toast.success("System deleted successfully")
      fetchData()
    } catch (error) {
      console.error('Error deleting system:', error)
      toast.error("Failed to delete system")
    }
  }

  // Group handlers
  const handleGroupSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!groupFormData.name) {
      toast.error("Group name is required")
      return
    }

    try {
      const url = editingGroup 
        ? `/api/packages/${packageId}/groups/${editingGroup.id}`
        : `/api/packages/${packageId}/groups`
      
      const method = editingGroup ? 'PATCH' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(groupFormData)
      })

      if (!response.ok) {
        throw new Error('Failed to save group')
      }

      toast.success(editingGroup ? "Group updated successfully" : "Group created successfully")
      fetchData()
      resetGroupForm()
    } catch (error) {
      console.error('Error saving group:', error)
      toast.error("Failed to save group")
    }
  }

  const handleEditGroup = (group: Group) => {
    setEditingGroup(group)
    setGroupFormData({
      name: group.name,
      description: group.description || '',
      type: group.type || ''
    })
    setIsCreatingGroup(true)
  }

  const handleDeleteGroup = async (groupId: number) => {
    if (!confirm('Are you sure you want to delete this group?')) return

    try {
      const response = await fetch(`/api/packages/${packageId}/groups/${groupId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete group')
      }

      toast.success("Group deleted successfully")
      fetchData()
    } catch (error) {
      console.error('Error deleting group:', error)
      toast.error("Failed to delete group")
    }
  }

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'Inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'Maintenance':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Decommissioned':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getCriticalityColor = (criticality: string | null) => {
    switch (criticality) {
      case 'Critical':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'High':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Low':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="systems" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="systems">Systems & Hardware</TabsTrigger>
          <TabsTrigger value="groups">Groups</TabsTrigger>
        </TabsList>

        <TabsContent value="systems" className="space-y-6">
          {/* Create/Edit System Form */}
          {(isCreatingSystem || editingSystem) && (
            <Card>
              <CardHeader>
                <CardTitle>{editingSystem ? 'Edit System' : 'Create New System'}</CardTitle>
                <CardDescription>
                  {editingSystem ? 'Update the system information' : 'Add a new hardware or virtual system to track'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSystemSubmit} className="space-y-6">
                  {/* Basic Information Section */}
                  <Collapsible
                    open={expandedSections.basicInfo}
                    onOpenChange={(open) => setExpandedSections(prev => ({ ...prev, basicInfo: open }))}
                  >
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-2">
                        <Monitor className="h-5 w-5" />
                        <h3 className="font-semibold">Basic Information</h3>
                      </div>
                      {expandedSections.basicInfo ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-4 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="systemName">System Name *</Label>
                          <Input
                            id="systemName"
                            value={systemFormData.name}
                            onChange={(e) => setSystemFormData(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="e.g., WEB-SERVER-01"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="hostname">Hostname</Label>
                          <Input
                            id="hostname"
                            value={systemFormData.hostname}
                            onChange={(e) => setSystemFormData(prev => ({ ...prev, hostname: e.target.value }))}
                            placeholder="e.g., web01.domain.local"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="systemDescription">Description</Label>
                        <Textarea
                          id="systemDescription"
                          value={systemFormData.description}
                          onChange={(e) => setSystemFormData(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="System purpose and details"
                          rows={3}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="operatingSystem">Operating System</Label>
                          <Select value={systemFormData.operatingSystem} onValueChange={(value) => setSystemFormData(prev => ({ ...prev, operatingSystem: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select OS" />
                            </SelectTrigger>
                            <SelectContent>
                              {OPERATING_SYSTEMS.map(os => (
                                <SelectItem key={os} value={os}>{os}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="osVersion">OS Version</Label>
                          <Input
                            id="osVersion"
                            value={systemFormData.osVersion}
                            onChange={(e) => setSystemFormData(prev => ({ ...prev, osVersion: e.target.value }))}
                            placeholder="e.g., 21H2, 22.04.3"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="environmentType">Environment</Label>
                          <Select value={systemFormData.environmentType} onValueChange={(value) => setSystemFormData(prev => ({ ...prev, environmentType: value }))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ENVIRONMENT_TYPES.map(env => (
                                <SelectItem key={env} value={env}>{env}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Network Configuration Section */}
                  <Collapsible
                    open={expandedSections.networkConfig}
                    onOpenChange={(open) => setExpandedSections(prev => ({ ...prev, networkConfig: open }))}
                  >
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-2">
                        <Server className="h-5 w-5" />
                        <h3 className="font-semibold">Network Configuration</h3>
                      </div>
                      {expandedSections.networkConfig ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-4 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="ipAddress">IP Address</Label>
                          <Input
                            id="ipAddress"
                            value={systemFormData.ipAddress}
                            onChange={(e) => setSystemFormData(prev => ({ ...prev, ipAddress: e.target.value }))}
                            placeholder="192.168.1.100"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="macAddress">MAC Address</Label>
                          <Input
                            id="macAddress"
                            value={systemFormData.macAddress}
                            onChange={(e) => setSystemFormData(prev => ({ ...prev, macAddress: e.target.value }))}
                            placeholder="00:1B:44:11:3A:B7"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="physicalLocation">Physical Location</Label>
                        <Input
                          id="physicalLocation"
                          value={systemFormData.physicalLocation}
                          onChange={(e) => setSystemFormData(prev => ({ ...prev, physicalLocation: e.target.value }))}
                          placeholder="e.g., Data Center A, Rack 10, Unit 23"
                        />
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Hardware Specifications Section */}
                  <Collapsible
                    open={expandedSections.hardware}
                    onOpenChange={(open) => setExpandedSections(prev => ({ ...prev, hardware: open }))}
                  >
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-2">
                        <HardDrive className="h-5 w-5" />
                        <h3 className="font-semibold">Hardware Specifications</h3>
                      </div>
                      {expandedSections.hardware ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-4 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="manufacturer">Manufacturer</Label>
                          <Input
                            id="manufacturer"
                            value={systemFormData.manufacturer}
                            onChange={(e) => setSystemFormData(prev => ({ ...prev, manufacturer: e.target.value }))}
                            placeholder="e.g., Dell, HP, Lenovo"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="model">Model</Label>
                          <Input
                            id="model"
                            value={systemFormData.model}
                            onChange={(e) => setSystemFormData(prev => ({ ...prev, model: e.target.value }))}
                            placeholder="e.g., PowerEdge R740"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="cpuCores">CPU Cores</Label>
                          <Input
                            id="cpuCores"
                            type="number"
                            value={systemFormData.cpuCores}
                            onChange={(e) => setSystemFormData(prev => ({ ...prev, cpuCores: e.target.value }))}
                            placeholder="e.g., 16"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="ramGB">RAM (GB)</Label>
                          <Input
                            id="ramGB"
                            type="number"
                            value={systemFormData.ramGB}
                            onChange={(e) => setSystemFormData(prev => ({ ...prev, ramGB: e.target.value }))}
                            placeholder="e.g., 64"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="storageGB">Storage (GB)</Label>
                          <Input
                            id="storageGB"
                            type="number"
                            value={systemFormData.storageGB}
                            onChange={(e) => setSystemFormData(prev => ({ ...prev, storageGB: e.target.value }))}
                            placeholder="e.g., 2000"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="assetTag">Asset Tag</Label>
                          <Input
                            id="assetTag"
                            value={systemFormData.assetTag}
                            onChange={(e) => setSystemFormData(prev => ({ ...prev, assetTag: e.target.value }))}
                            placeholder="e.g., IT-2024-001"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="serialNumber">Serial Number</Label>
                          <Input
                            id="serialNumber"
                            value={systemFormData.serialNumber}
                            onChange={(e) => setSystemFormData(prev => ({ ...prev, serialNumber: e.target.value }))}
                            placeholder="e.g., ABCD1234567"
                          />
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Lifecycle Management Section */}
                  <Collapsible
                    open={expandedSections.lifecycle}
                    onOpenChange={(open) => setExpandedSections(prev => ({ ...prev, lifecycle: open }))}
                  >
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-2">
                        <MemoryStick className="h-5 w-5" />
                        <h3 className="font-semibold">Lifecycle Management</h3>
                      </div>
                      {expandedSections.lifecycle ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-4 space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="lifecycleStatus">Lifecycle Status</Label>
                          <Select value={systemFormData.lifecycleStatus} onValueChange={(value) => setSystemFormData(prev => ({ ...prev, lifecycleStatus: value }))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {LIFECYCLE_STATUSES.map(status => (
                                <SelectItem key={status} value={status}>{status}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="criticality">Criticality</Label>
                          <Select value={systemFormData.criticality} onValueChange={(value) => setSystemFormData(prev => ({ ...prev, criticality: value }))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {CRITICALITY_LEVELS.map(level => (
                                <SelectItem key={level} value={level}>{level}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Form Actions */}
                  <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={resetSystemForm}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button type="submit">
                      <Save className="h-4 w-4 mr-2" />
                      {editingSystem ? 'Update System' : 'Create System'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Systems List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Hardware & Virtual Systems</CardTitle>
                  <CardDescription>
                    Track hardware and virtual assets with operating systems
                  </CardDescription>
                </div>
                {!isCreatingSystem && !editingSystem && (
                  <Button onClick={() => setIsCreatingSystem(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add System
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {systems.length === 0 ? (
                <div className="text-center py-12">
                  <Server className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Systems</h3>
                  <p className="text-muted-foreground mb-4">
                    Start tracking your hardware and virtual systems
                  </p>
                  {!isCreatingSystem && (
                    <Button onClick={() => setIsCreatingSystem(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First System
                    </Button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Hostname</TableHead>
                        <TableHead>OS</TableHead>
                        <TableHead>IP Address</TableHead>
                        <TableHead>Environment</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Criticality</TableHead>
                        <TableHead>Hardware</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {systems.map((system) => (
                        <TableRow key={system.id}>
                          <TableCell className="font-medium">
                            <div>
                              <div>{system.name}</div>
                              {system.assetTag && (
                                <div className="text-xs text-muted-foreground">{system.assetTag}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {system.hostname || '-'}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="text-sm">{system.operatingSystem || '-'}</div>
                              {system.osVersion && (
                                <div className="text-xs text-muted-foreground">{system.osVersion}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {system.ipAddress || '-'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {system.environmentType || 'Unknown'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getStatusColor(system.lifecycleStatus)}>
                              {system.lifecycleStatus || 'Unknown'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getCriticalityColor(system.criticality)}>
                              {system.criticality || 'Unknown'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {system.manufacturer && system.model ? (
                                <div>
                                  <div>{system.manufacturer} {system.model}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {[
                                      system.cpuCores && `${system.cpuCores} cores`,
                                      system.ramGB && `${system.ramGB}GB RAM`,
                                      system.storageGB && `${system.storageGB}GB`
                                    ].filter(Boolean).join(' • ')}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditSystem(system)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteSystem(system.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="groups" className="space-y-6">
          {/* Create/Edit Group Form */}
          {(isCreatingGroup || editingGroup) && (
            <Card>
              <CardHeader>
                <CardTitle>{editingGroup ? 'Edit Group' : 'Create New Group'}</CardTitle>
                <CardDescription>
                  {editingGroup ? 'Update the group information' : 'Create a logical grouping for systems'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleGroupSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="groupName">Group Name *</Label>
                    <Input
                      id="groupName"
                      value={groupFormData.name}
                      onChange={(e) => setGroupFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Web Servers, Database Cluster"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="groupType">Group Type</Label>
                    <Select value={groupFormData.type} onValueChange={(value) => setGroupFormData(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select group type" />
                      </SelectTrigger>
                      <SelectContent>
                        {GROUP_TYPES.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="groupDescription">Description</Label>
                    <Textarea
                      id="groupDescription"
                      value={groupFormData.description}
                      onChange={(e) => setGroupFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe the purpose and scope of this group"
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={resetGroupForm}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button type="submit">
                      <Save className="h-4 w-4 mr-2" />
                      {editingGroup ? 'Update Group' : 'Create Group'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Groups List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>System Groups</CardTitle>
                  <CardDescription>
                    Organize systems into logical groups for better management
                  </CardDescription>
                </div>
                {!isCreatingGroup && !editingGroup && (
                  <Button onClick={() => setIsCreatingGroup(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Group
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {groups.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Groups</h3>
                  <p className="text-muted-foreground mb-4">
                    Create groups to organize your systems
                  </p>
                  {!isCreatingGroup && (
                    <Button onClick={() => setIsCreatingGroup(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Group
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groups.map((group) => (
                    <Card key={group.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg">{group.name}</CardTitle>
                            {group.type && (
                              <Badge variant="outline" className="mt-2">
                                {group.type}
                              </Badge>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditGroup(group)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteGroup(group.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-3">
                          {group.description || 'No description provided'}
                        </p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Systems</span>
                          <Badge>{group._count?.systems || 0}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}