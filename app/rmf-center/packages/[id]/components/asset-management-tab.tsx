"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"
import { Plus, Edit, Trash2, Server, Users, ExternalLink } from "lucide-react"
import Link from "next/link"

interface System {
  id: number
  name: string
  description: string | null
  operatingSystem: string | null
  ipAddress: string | null
  macAddress: string | null
  location: string | null
  status: string
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

const SYSTEM_STATUSES = ['Active', 'Inactive', 'Maintenance', 'Decommissioned']
const GROUP_TYPES = ['Department', 'Network Segment', 'Application Tier', 'Security Zone', 'Geographic', 'Functional']

export function AssetManagementTab({ packageId }: AssetManagementTabProps) {
  const [systems, setSystems] = useState<System[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateSystemDialogOpen, setIsCreateSystemDialogOpen] = useState(false)
  const [isCreateGroupDialogOpen, setIsCreateGroupDialogOpen] = useState(false)
  const [editingSystem, setEditingSystem] = useState<System | null>(null)
  const [editingGroup, setEditingGroup] = useState<Group | null>(null)
  
  const [systemFormData, setSystemFormData] = useState({
    name: '',
    description: '',
    operatingSystem: '',
    ipAddress: '',
    macAddress: '',
    location: '',
    status: 'Active'
  })

  const [groupFormData, setGroupFormData] = useState({
    name: '',
    description: '',
    type: ''
  })

  const fetchData = async () => {
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
  }

  useEffect(() => {
    fetchData()
  }, [packageId])

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
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(systemFormData)
      })

      if (!response.ok) {
        throw new Error('Failed to save system')
      }

      toast.success(editingSystem ? "System updated successfully" : "System created successfully")
      fetchData()
      handleCloseSystemDialog()
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
      operatingSystem: system.operatingSystem || '',
      ipAddress: system.ipAddress || '',
      macAddress: system.macAddress || '',
      location: system.location || '',
      status: system.status
    })
    setIsCreateSystemDialogOpen(true)
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

  const handleCloseSystemDialog = () => {
    setIsCreateSystemDialogOpen(false)
    setEditingSystem(null)
    setSystemFormData({
      name: '',
      description: '',
      operatingSystem: '',
      ipAddress: '',
      macAddress: '',
      location: '',
      status: 'Active'
    })
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
      handleCloseGroupDialog()
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
    setIsCreateGroupDialogOpen(true)
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

  const handleCloseGroupDialog = () => {
    setIsCreateGroupDialogOpen(false)
    setEditingGroup(null)
    setGroupFormData({
      name: '',
      description: '',
      type: ''
    })
  }

  const getStatusColor = (status: string) => {
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

  const getGroupTypeColor = (type: string | null) => {
    switch (type) {
      case 'Department':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'Network Segment':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'Application Tier':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'Security Zone':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'Geographic':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'Functional':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
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
          <TabsTrigger value="systems">Systems</TabsTrigger>
          <TabsTrigger value="groups">Groups</TabsTrigger>
        </TabsList>

        <TabsContent value="systems">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Systems Management</CardTitle>
                  <CardDescription>
                    Manage systems, servers, and devices within this package
                  </CardDescription>
                </div>
                <Dialog open={isCreateSystemDialogOpen} onOpenChange={setIsCreateSystemDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setEditingSystem(null)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add System
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingSystem ? 'Edit System' : 'Create System'}
                      </DialogTitle>
                      <DialogDescription>
                        {editingSystem ? 'Update the system details.' : 'Add a new system to the package.'}
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSystemSubmit}>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="systemName">System Name *</Label>
                          <Input
                            id="systemName"
                            value={systemFormData.name}
                            onChange={(e) => setSystemFormData(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Web Server 01"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="systemDescription">Description</Label>
                          <Textarea
                            id="systemDescription"
                            value={systemFormData.description}
                            onChange={(e) => setSystemFormData(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="System description"
                            rows={2}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="operatingSystem">Operating System</Label>
                            <Input
                              id="operatingSystem"
                              value={systemFormData.operatingSystem}
                              onChange={(e) => setSystemFormData(prev => ({ ...prev, operatingSystem: e.target.value }))}
                              placeholder="Ubuntu 22.04"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select value={systemFormData.status} onValueChange={(value) => setSystemFormData(prev => ({ ...prev, status: value }))}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {SYSTEM_STATUSES.map(status => (
                                  <SelectItem key={status} value={status}>{status}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

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
                          <Label htmlFor="location">Location</Label>
                          <Input
                            id="location"
                            value={systemFormData.location}
                            onChange={(e) => setSystemFormData(prev => ({ ...prev, location: e.target.value }))}
                            placeholder="Data Center A, Rack 10"
                          />
                        </div>
                      </div>
                      <DialogFooter className="mt-6">
                        <Button type="button" variant="outline" onClick={handleCloseSystemDialog}>
                          Cancel
                        </Button>
                        <Button type="submit">
                          {editingSystem ? 'Update' : 'Create'}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {systems.length === 0 ? (
                <div className="text-center py-12">
                  <Server className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Systems</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first system to get started
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>OS</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Vulnerabilities</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {systems.map((system) => (
                      <TableRow key={system.id}>
                        <TableCell className="font-medium">
                          <Link href={`/vulnerability-center/systems/${system.id}`} className="flex items-center hover:underline">
                            {system.name}
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </Link>
                        </TableCell>
                        <TableCell>{system.operatingSystem || '-'}</TableCell>
                        <TableCell className="font-mono text-sm">
                          {system.ipAddress || '-'}
                        </TableCell>
                        <TableCell>{system.location || '-'}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusColor(system.status)}>
                            {system.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {system._count?.vulnerabilities || 0}
                          </Badge>
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
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="groups">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Groups Management</CardTitle>
                  <CardDescription>
                    Manage system groups and organizational units within this package
                  </CardDescription>
                </div>
                <Dialog open={isCreateGroupDialogOpen} onOpenChange={setIsCreateGroupDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setEditingGroup(null)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Group
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingGroup ? 'Edit Group' : 'Create Group'}
                      </DialogTitle>
                      <DialogDescription>
                        {editingGroup ? 'Update the group details.' : 'Add a new group to the package.'}
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleGroupSubmit}>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="groupName">Group Name *</Label>
                          <Input
                            id="groupName"
                            value={groupFormData.name}
                            onChange={(e) => setGroupFormData(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Web Servers"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="groupDescription">Description</Label>
                          <Textarea
                            id="groupDescription"
                            value={groupFormData.description}
                            onChange={(e) => setGroupFormData(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Group description"
                            rows={2}
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
                      </div>
                      <DialogFooter className="mt-6">
                        <Button type="button" variant="outline" onClick={handleCloseGroupDialog}>
                          Cancel
                        </Button>
                        <Button type="submit">
                          {editingGroup ? 'Update' : 'Create'}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {groups.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Groups</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first group to get started
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Systems</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {groups.map((group) => (
                      <TableRow key={group.id}>
                        <TableCell className="font-medium">{group.name}</TableCell>
                        <TableCell>
                          {group.type ? (
                            <Badge variant="outline" className={getGroupTypeColor(group.type)}>
                              {group.type}
                            </Badge>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {group.description || '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {group._count?.systems || 0}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(group.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
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
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}