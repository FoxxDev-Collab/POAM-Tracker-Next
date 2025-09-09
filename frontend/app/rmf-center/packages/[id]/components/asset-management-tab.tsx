"use client"

import React, { useState, useEffect, useCallback } from "react"
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
import { Plus, Edit, Trash2, Server, Users, Save, X, ChevronDown, ChevronUp, Monitor, HardDrive, MemoryStick, Settings } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"

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
  isVirtual?: boolean
  hypervisor?: string | null
  hostSystem?: string | null
  groupId?: number | null
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
  createdAt: string
  _count?: {
    systems: number
  }
  systems?: System[]
}

interface AssetManagementTabProps {
  packageId: number
}

const OPERATING_SYSTEMS = [
  { value: 'Windows_Server_2022', label: 'Windows Server 2022' },
  { value: 'Windows_Server_2019', label: 'Windows Server 2019' },
  { value: 'Windows_Server_2016', label: 'Windows Server 2016' },
  { value: 'Windows_Server_2012_R2', label: 'Windows Server 2012 R2' },
  { value: 'Windows_Server_2012', label: 'Windows Server 2012' },
  { value: 'Windows_11', label: 'Windows 11' },
  { value: 'Windows_10', label: 'Windows 10' },
  { value: 'Windows_8_1', label: 'Windows 8.1' },
  { value: 'Windows_7', label: 'Windows 7' },
  { value: 'RHEL_9', label: 'Red Hat Enterprise Linux 9' },
  { value: 'RHEL_8', label: 'Red Hat Enterprise Linux 8' },
  { value: 'RHEL_7', label: 'Red Hat Enterprise Linux 7' },
  { value: 'CentOS_9', label: 'CentOS 9' },
  { value: 'CentOS_8', label: 'CentOS 8' },
  { value: 'CentOS_7', label: 'CentOS 7' },
  { value: 'Ubuntu_22_04_LTS', label: 'Ubuntu 22.04 LTS' },
  { value: 'Ubuntu_20_04_LTS', label: 'Ubuntu 20.04 LTS' },
  { value: 'Ubuntu_18_04_LTS', label: 'Ubuntu 18.04 LTS' },
  { value: 'SUSE_Linux_Enterprise_15', label: 'SUSE Linux Enterprise 15' },
  { value: 'SUSE_Linux_Enterprise_12', label: 'SUSE Linux Enterprise 12' },
  { value: 'Oracle_Linux_9', label: 'Oracle Linux 9' },
  { value: 'Oracle_Linux_8', label: 'Oracle Linux 8' },
  { value: 'Amazon_Linux_2', label: 'Amazon Linux 2' },
  { value: 'Rocky_Linux_9', label: 'Rocky Linux 9' },
  { value: 'Rocky_Linux_8', label: 'Rocky Linux 8' },
  { value: 'AlmaLinux_9', label: 'AlmaLinux 9' },
  { value: 'AlmaLinux_8', label: 'AlmaLinux 8' },
  { value: 'Ubuntu_Desktop', label: 'Ubuntu Desktop' },
  { value: 'Fedora_Workstation', label: 'Fedora Workstation' },
  { value: 'CentOS_Desktop', label: 'CentOS Desktop' },
  { value: 'RHEL_Workstation', label: 'RHEL Workstation' },
  { value: 'AIX_7_3', label: 'AIX 7.3' },
  { value: 'AIX_7_2', label: 'AIX 7.2' },
  { value: 'Solaris_11_4', label: 'Solaris 11.4' },
  { value: 'HP_UX_11_31', label: 'HP-UX 11.31' },
  { value: 'Cisco_IOS', label: 'Cisco IOS' },
  { value: 'Cisco_IOS_XE', label: 'Cisco IOS XE' },
  { value: 'Cisco_NX_OS', label: 'Cisco NX-OS' },
  { value: 'Juniper_Junos', label: 'Juniper Junos' },
  { value: 'VMware_vSphere_8', label: 'VMware vSphere 8' },
  { value: 'VMware_vSphere_7', label: 'VMware vSphere 7' },
  { value: 'VMware_vSphere_6_7', label: 'VMware vSphere 6.7' },
  { value: 'Citrix_XenServer', label: 'Citrix XenServer' },
  { value: 'Microsoft_Hyper_V', label: 'Microsoft Hyper-V' },
  { value: 'Docker_Engine', label: 'Docker Engine' },
  { value: 'Kubernetes', label: 'Kubernetes' },
  { value: 'OpenShift_4', label: 'OpenShift 4' },
  { value: 'Rancher', label: 'Rancher' },
  { value: 'Amazon_Linux', label: 'Amazon Linux' },
  { value: 'Google_Container_Optimized_OS', label: 'Google Container-Optimized OS' },
  { value: 'Azure_Linux', label: 'Azure Linux' },
  { value: 'Oracle_Database_19c', label: 'Oracle Database 19c' },
  { value: 'Oracle_Database_12c', label: 'Oracle Database 12c' },
  { value: 'SQL_Server_2022', label: 'SQL Server 2022' },
  { value: 'SQL_Server_2019', label: 'SQL Server 2019' },
  { value: 'MySQL_8_0', label: 'MySQL 8.0' },
  { value: 'PostgreSQL_15', label: 'PostgreSQL 15' },
  { value: 'MongoDB_6_0', label: 'MongoDB 6.0' },
  { value: 'Other', label: 'Other' },
  { value: 'Unknown', label: 'Unknown' }
]

const LIFECYCLE_STATUSES = ['Active', 'Inactive', 'Maintenance', 'Decommissioned', 'Pending', 'Retired']
const CRITICALITY_LEVELS = ['Critical', 'High', 'Medium', 'Low']
const ENVIRONMENT_TYPES = [
  { value: 'Production', label: 'Production' },
  { value: 'Staging', label: 'Staging' },
  { value: 'Development', label: 'Development' },
  { value: 'Testing', label: 'Testing' },
  { value: 'Training', label: 'Training' },
  { value: 'Backup', label: 'Backup' },
  { value: 'Disaster_Recovery', label: 'Disaster Recovery' },
  { value: 'Sandbox', label: 'Sandbox' }
]
const HYPERVISORS = [
  { value: 'VMware_vSphere_8', label: 'VMware vSphere 8' },
  { value: 'VMware_vSphere_7', label: 'VMware vSphere 7' },
  { value: 'VMware_vSphere_6_7', label: 'VMware vSphere 6.7' },
  { value: 'Citrix_XenServer', label: 'Citrix XenServer' },
  { value: 'Microsoft_Hyper_V', label: 'Microsoft Hyper-V' },
  { value: 'KVM', label: 'KVM' },
  { value: 'Proxmox', label: 'Proxmox VE' },
  { value: 'Oracle_VM', label: 'Oracle VM' },
  { value: 'Xen', label: 'Xen' },
  { value: 'Other', label: 'Other' }
]

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
  const [managingGroupSystems, setManagingGroupSystems] = useState<Group | null>(null)
  const [selectedSystemIds, setSelectedSystemIds] = useState<number[]>([])
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set())

  // Helper function to get human-readable OS label
  const getOSLabel = (osValue: string | null) => {
    if (!osValue) return '-'
    const os = OPERATING_SYSTEMS.find(o => o.value === osValue)
    return os ? os.label : osValue
  }

  // Helper function to get human-readable environment label
  const getEnvironmentLabel = (envValue: string | null) => {
    if (!envValue) return 'Unknown'
    const env = ENVIRONMENT_TYPES.find(e => e.value === envValue)
    return env ? env.label : envValue
  }

  // Helper function to categorize systems
  const getSystemBreakdown = (systems: System[] | undefined) => {
    if (!systems || systems.length === 0) {
      return { total: 0, virtual: 0, physical: 0, network: 0, database: 0, other: 0 }
    }
    
    const breakdown = {
      total: systems.length,
      virtual: 0,
      physical: 0,
      network: 0,
      database: 0,
      other: 0
    }
    
    systems.forEach(system => {
      if (system.isVirtual) {
        breakdown.virtual++
      } else {
        // Check if it's a network device based on OS
        const networkOS = ['Cisco_IOS', 'Cisco_IOS_XE', 'Cisco_NX_OS', 'Juniper_Junos']
        const databaseOS = ['Oracle_Database_19c', 'Oracle_Database_12c', 'SQL_Server_2022', 'SQL_Server_2019', 'MySQL_8_0', 'PostgreSQL_15', 'MongoDB_6_0']
        
        if (system.operatingSystem && networkOS.includes(system.operatingSystem)) {
          breakdown.network++
        } else if (system.operatingSystem && databaseOS.includes(system.operatingSystem)) {
          breakdown.database++
        } else if (system.operatingSystem === 'Other' || system.operatingSystem === 'Unknown' || !system.operatingSystem) {
          breakdown.other++
        } else {
          breakdown.physical++
        }
      }
    })
    
    return breakdown
  }
  
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
    environmentType: 'Production',
    isVirtual: false,
    hypervisor: '',
    hostSystem: ''
  })

  const [groupFormData, setGroupFormData] = useState({
    name: '',
    description: ''
  })

  const fetchData = useCallback(async () => {
    try {
      const [systemsResponse, groupsResponse] = await Promise.all([
        fetch(`/api/packages/${packageId}/systems`),
        fetch(`/api/packages/${packageId}/groups`)
      ])

      let systemsArray: System[] = []
      let groupsArray: Group[] = []

      if (systemsResponse.ok) {
        const systemsData = await systemsResponse.json()
        systemsArray = systemsData.items || systemsData || []
        setSystems(systemsArray)
      }

      if (groupsResponse.ok) {
        const groupsData = await groupsResponse.json()
        groupsArray = groupsData.items || groupsData || []
        
        // Attach systems to their groups
        const groupsWithSystems = groupsArray.map(group => ({
          ...group,
          systems: systemsArray.filter(system => system.groupId === group.id)
        }))
        
        setGroups(groupsWithSystems)
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
      environmentType: 'Production',
      isVirtual: false,
      hypervisor: '',
      hostSystem: ''
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
      description: ''
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

    if (!systemFormData.operatingSystem) {
      toast.error("Operating system is required")
      return
    }

    // If it's a virtual asset, hypervisor is required
    if (systemFormData.isVirtual && !systemFormData.hypervisor) {
      toast.error("Hypervisor platform is required for virtual assets")
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
      environmentType: system.environmentType || 'Production',
      isVirtual: system.isVirtual || false,
      hypervisor: system.hypervisor || '',
      hostSystem: system.hostSystem || ''
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
      description: group.description || ''
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
        return 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20'
      case 'Inactive':
        return 'bg-muted/50 text-muted-foreground border-border'
      case 'Maintenance':
        return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20'
      case 'Decommissioned':
        return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20'
      default:
        return 'bg-muted/50 text-muted-foreground border-border'
    }
  }

  const getCriticalityColor = (criticality: string | null) => {
    switch (criticality) {
      case 'Critical':
        return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20'
      case 'High':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'Medium':
        return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20'
      case 'Low':
        return 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20'
      default:
        return 'bg-muted/50 text-muted-foreground border-border'
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
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                      <div className="flex items-center gap-2">
                        <Monitor className="h-5 w-5 text-foreground" />
                        <h3 className="font-semibold text-foreground">Basic Information</h3>
                      </div>
                      {expandedSections.basicInfo ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-4 space-y-4">
                      {/* Asset Type Toggle */}
                      <div className="flex items-center space-x-4 p-4 bg-muted/30 rounded-lg">
                        <Label htmlFor="assetType" className="text-base font-medium">Asset Type:</Label>
                        <div className="flex items-center space-x-6">
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="radio"
                              name="assetType"
                              value="physical"
                              checked={!systemFormData.isVirtual}
                              onChange={() => setSystemFormData(prev => ({ ...prev, isVirtual: false, hypervisor: '', hostSystem: '' }))}
                              className="w-4 h-4"
                            />
                            <span>Physical Asset</span>
                          </label>
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="radio"
                              name="assetType"
                              value="virtual"
                              checked={systemFormData.isVirtual}
                              onChange={() => setSystemFormData(prev => ({ ...prev, isVirtual: true }))}
                              className="w-4 h-4"
                            />
                            <span>Virtual Asset</span>
                          </label>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="systemName">System Name *</Label>
                          <Input
                            id="systemName"
                            value={systemFormData.name}
                            onChange={(e) => setSystemFormData(prev => ({ ...prev, name: e.target.value }))}
                            placeholder={systemFormData.isVirtual ? "e.g., VM-WEB-01" : "e.g., WEB-SERVER-01"}
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

                      {/* Virtual Asset Specific Fields */}
                      {systemFormData.isVirtual && (
                        <div className="grid grid-cols-2 gap-4 p-4 bg-blue-500/5 dark:bg-blue-500/10 rounded-lg border border-blue-500/20">
                          <div className="space-y-2">
                            <Label htmlFor="hypervisor">Hypervisor Platform *</Label>
                            <Select
                              value={systemFormData.hypervisor}
                              onValueChange={(value) => setSystemFormData(prev => ({ ...prev, hypervisor: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select hypervisor" />
                              </SelectTrigger>
                              <SelectContent>
                                {HYPERVISORS.map(hv => (
                                  <SelectItem key={hv.value} value={hv.value}>{hv.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="hostSystem">Host System</Label>
                            <Input
                              id="hostSystem"
                              value={systemFormData.hostSystem}
                              onChange={(e) => setSystemFormData(prev => ({ ...prev, hostSystem: e.target.value }))}
                              placeholder="e.g., ESXi-Host-01"
                            />
                          </div>
                        </div>
                      )}

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
                          <Label htmlFor="operatingSystem">Operating System *</Label>
                          <Select 
                            value={systemFormData.operatingSystem} 
                            onValueChange={(value) => setSystemFormData(prev => ({ ...prev, operatingSystem: value }))}
                            required
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select OS (Required)" />
                            </SelectTrigger>
                            <SelectContent>
                              {OPERATING_SYSTEMS.map(os => (
                                <SelectItem key={os.value} value={os.value}>{os.label}</SelectItem>
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
                                <SelectItem key={env.value} value={env.value}>{env.label}</SelectItem>
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
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                      <div className="flex items-center gap-2">
                        <Server className="h-5 w-5 text-foreground" />
                        <h3 className="font-semibold text-foreground">Network Configuration</h3>
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
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                      <div className="flex items-center gap-2">
                        <HardDrive className="h-5 w-5 text-foreground" />
                        <h3 className="font-semibold text-foreground">
                          {systemFormData.isVirtual ? 'Virtual Resource Allocation' : 'Hardware Specifications'}
                        </h3>
                      </div>
                      {expandedSections.hardware ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-4 space-y-4">
                      {/* Physical Hardware Fields - Only show for physical assets */}
                      {!systemFormData.isVirtual && (
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
                      )}

                      {/* Resource Specifications - Show for both physical and virtual */}
                      <div className={systemFormData.isVirtual ? "space-y-4" : ""}>
                        {systemFormData.isVirtual && (
                          <div className="p-3 bg-blue-500/5 dark:bg-blue-500/10 rounded-lg border border-blue-500/20">
                            <p className="text-sm text-blue-700 dark:text-blue-400">
                              Specify the allocated virtual resources for this VM
                            </p>
                          </div>
                        )}
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="cpuCores">
                              {systemFormData.isVirtual ? 'vCPU Cores' : 'CPU Cores'}
                            </Label>
                            <Input
                              id="cpuCores"
                              type="number"
                              value={systemFormData.cpuCores}
                              onChange={(e) => setSystemFormData(prev => ({ ...prev, cpuCores: e.target.value }))}
                              placeholder={systemFormData.isVirtual ? "e.g., 4" : "e.g., 16"}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="ramGB">
                              {systemFormData.isVirtual ? 'Allocated RAM (GB)' : 'RAM (GB)'}
                            </Label>
                            <Input
                              id="ramGB"
                              type="number"
                              value={systemFormData.ramGB}
                              onChange={(e) => setSystemFormData(prev => ({ ...prev, ramGB: e.target.value }))}
                              placeholder={systemFormData.isVirtual ? "e.g., 8" : "e.g., 64"}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="storageGB">
                              {systemFormData.isVirtual ? 'Allocated Storage (GB)' : 'Storage (GB)'}
                            </Label>
                            <Input
                              id="storageGB"
                              type="number"
                              value={systemFormData.storageGB}
                              onChange={(e) => setSystemFormData(prev => ({ ...prev, storageGB: e.target.value }))}
                              placeholder={systemFormData.isVirtual ? "e.g., 100" : "e.g., 2000"}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Physical Asset Only Fields */}
                      {!systemFormData.isVirtual && (
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
                      )}
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Lifecycle Management Section */}
                  <Collapsible
                    open={expandedSections.lifecycle}
                    onOpenChange={(open) => setExpandedSections(prev => ({ ...prev, lifecycle: open }))}
                  >
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                      <div className="flex items-center gap-2">
                        <MemoryStick className="h-5 w-5 text-foreground" />
                        <h3 className="font-semibold text-foreground">Lifecycle Management</h3>
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
                              {system.isVirtual && system.hostSystem && (
                                <div className="text-xs text-muted-foreground">
                                  Host: {system.hostSystem}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {system.hostname || '-'}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="text-sm">{getOSLabel(system.operatingSystem)}</div>
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
                              {getEnvironmentLabel(system.environmentType)}
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
                            <div className="space-y-1">
                              <Badge 
                                variant="outline" 
                                className={system.isVirtual 
                                  ? "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20" 
                                  : "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20"
                                }
                              >
                                {system.isVirtual ? 'Virtual' : 'Bare Metal'}
                              </Badge>
                              <div className="text-xs text-muted-foreground">
                                {system.isVirtual ? (
                                  // For virtual systems, show hypervisor and resources
                                  <>
                                    {system.hypervisor && (
                                      <div>{HYPERVISORS.find(h => h.value === system.hypervisor)?.label || system.hypervisor}</div>
                                    )}
                                    {[
                                      system.cpuCores && `${system.cpuCores} vCPU`,
                                      system.ramGB && `${system.ramGB}GB RAM`,
                                      system.storageGB && `${system.storageGB}GB`
                                    ].filter(Boolean).join(' • ')}
                                  </>
                                ) : (
                                  // For physical systems, show manufacturer/model and resources
                                  <>
                                    {system.manufacturer && system.model && (
                                      <div>{system.manufacturer} {system.model}</div>
                                    )}
                                    {[
                                      system.cpuCores && `${system.cpuCores} cores`,
                                      system.ramGB && `${system.ramGB}GB RAM`,
                                      system.storageGB && `${system.storageGB}GB`
                                    ].filter(Boolean).join(' • ')}
                                  </>
                                )}
                              </div>
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
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Total Systems</TableHead>
                        <TableHead>System Breakdown</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {groups.map((group) => (
                        <React.Fragment key={group.id}>
                          <TableRow>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() => {
                                    const newExpanded = new Set(expandedGroups)
                                    if (newExpanded.has(group.id)) {
                                      newExpanded.delete(group.id)
                                    } else {
                                      newExpanded.add(group.id)
                                    }
                                    setExpandedGroups(newExpanded)
                                  }}
                                >
                                  {expandedGroups.has(group.id) ? (
                                    <ChevronUp className="h-4 w-4" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4" />
                                  )}
                                </Button>
                                <div>
                                  <div className="font-semibold">{group.name}</div>
                                  {group.id && (
                                    <div className="text-xs text-muted-foreground">ID: {group.id}</div>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="max-w-[300px]">
                                {group.description ? (
                                  <p className="text-sm text-muted-foreground truncate" title={group.description}>
                                    {group.description}
                                  </p>
                                ) : (
                                  <span className="text-sm text-muted-foreground italic">No description</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-auto p-1 hover:bg-transparent"
                                onClick={() => {
                                  const newExpanded = new Set(expandedGroups)
                                  if (newExpanded.has(group.id)) {
                                    newExpanded.delete(group.id)
                                  } else {
                                    newExpanded.add(group.id)
                                  }
                                  setExpandedGroups(newExpanded)
                                }}
                              >
                                <div className="flex items-center gap-1">
                                  <Server className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm font-medium">
                                    {group._count?.systems || 0}
                                  </span>
                                  {(group._count?.systems || 0) > 0 && (
                                    <ChevronDown className="h-3 w-3 text-muted-foreground" />
                                  )}
                                </div>
                              </Button>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {(() => {
                                  const breakdown = getSystemBreakdown(group.systems)
                                  return (
                                    <>
                                      {breakdown.virtual > 0 && (
                                        <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20">
                                          Virtual: {breakdown.virtual}
                                        </Badge>
                                      )}
                                      {breakdown.physical > 0 && (
                                        <Badge variant="outline" className="text-xs bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
                                          Physical: {breakdown.physical}
                                        </Badge>
                                      )}
                                      {breakdown.network > 0 && (
                                        <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20">
                                          Network: {breakdown.network}
                                        </Badge>
                                      )}
                                      {breakdown.database > 0 && (
                                        <Badge variant="outline" className="text-xs bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20">
                                          Database: {breakdown.database}
                                        </Badge>
                                      )}
                                      {breakdown.other > 0 && (
                                        <Badge variant="outline" className="text-xs bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20">
                                          Other: {breakdown.other}
                                        </Badge>
                                      )}
                                      {breakdown.total === 0 && (
                                        <span className="text-xs text-muted-foreground">No systems</span>
                                      )}
                                    </>
                                  )
                                })()}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm text-muted-foreground">
                                {group.createdAt && !isNaN(Date.parse(group.createdAt)) 
                                  ? new Date(group.createdAt).toLocaleDateString() 
                                  : '-'}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setManagingGroupSystems(group)
                                    // Initialize with systems already in the group
                                    const systemsInGroup = systems.filter(s => s.groupId === group.id).map(s => s.id)
                                    setSelectedSystemIds(systemsInGroup)
                                  }}
                                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950"
                                >
                                  <Settings className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditGroup(group)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteGroup(group.id)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                          {expandedGroups.has(group.id) && (
                            <TableRow>
                              <TableCell colSpan={6} className="bg-muted/30 p-0">
                                <div className="p-4">
                                  <h4 className="text-sm font-semibold mb-3">Systems in this group:</h4>
                                  {group.systems && group.systems.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                      {group.systems.map((system) => (
                                        <div key={system.id} className="bg-background p-3 rounded-lg border">
                                          <div className="font-medium text-sm">{system.name}</div>
                                          <div className="text-xs text-muted-foreground mt-1">
                                            {system.hostname && <div>Host: {system.hostname}</div>}
                                            {system.ipAddress && <div>IP: {system.ipAddress}</div>}
                                            {system.operatingSystem && <div>OS: {getOSLabel(system.operatingSystem)}</div>}
                                          </div>
                                          {system.isVirtual && (
                                            <Badge variant="outline" className="mt-2 text-xs bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20">
                                              Virtual
                                            </Badge>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="text-sm text-muted-foreground italic">
                                      No systems assigned to this group yet. Click the settings button to add systems.
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Manage Systems in Group Dialog */}
      <Dialog open={!!managingGroupSystems} onOpenChange={(open) => !open && setManagingGroupSystems(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Manage Systems in {managingGroupSystems?.name}</DialogTitle>
            <DialogDescription>
              Select which systems belong to this group. Systems can be part of multiple groups.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto py-4">
            <div className="space-y-4">
              {systems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No systems available. Create systems first to add them to groups.
                </div>
              ) : (
                <div className="space-y-2">
                  {systems.map((system) => (
                    <div
                      key={system.id}
                      className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <Checkbox
                        checked={selectedSystemIds.includes(system.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedSystemIds([...selectedSystemIds, system.id])
                          } else {
                            setSelectedSystemIds(selectedSystemIds.filter(id => id !== system.id))
                          }
                        }}
                      />
                      <Label
                        htmlFor={`system-${system.id}`}
                        className="flex-1 cursor-pointer"
                      >
                        <div className="font-medium">{system.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {system.hostname && <span className="mr-3">{system.hostname}</span>}
                          {system.ipAddress && <span className="mr-3">{system.ipAddress}</span>}
                          {system.operatingSystem && <span>{getOSLabel(system.operatingSystem)}</span>}
                        </div>
                        {system.isVirtual && (
                          <Badge variant="outline" className="mt-1 text-xs bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20">
                            Virtual
                          </Badge>
                        )}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              {selectedSystemIds.length} system{selectedSystemIds.length !== 1 ? 's' : ''} selected
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setManagingGroupSystems(null)}>
                Cancel
              </Button>
              <Button 
                onClick={async () => {
                  if (!managingGroupSystems) return
                  
                  try {
                    // Update each system's groupId
                    const updatePromises = systems.map(async (system) => {
                      const shouldBeInGroup = selectedSystemIds.includes(system.id)
                      const isInGroup = system.groupId === managingGroupSystems.id
                      
                      // Only update if the assignment changed
                      if (shouldBeInGroup !== isInGroup) {
                        const response = await fetch(`/api/packages/${packageId}/systems/${system.id}`, {
                          method: 'PATCH',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            groupId: shouldBeInGroup ? managingGroupSystems.id : null
                          })
                        })
                        
                        if (!response.ok) {
                          throw new Error(`Failed to update system ${system.name}`)
                        }
                      }
                    })
                    
                    await Promise.all(updatePromises)
                    
                    toast.success("System assignments updated successfully")
                    setManagingGroupSystems(null)
                    fetchData() // Refresh the data
                  } catch (error) {
                    console.error('Error updating system assignments:', error)
                    toast.error("Failed to update system assignments")
                  }
                }}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}