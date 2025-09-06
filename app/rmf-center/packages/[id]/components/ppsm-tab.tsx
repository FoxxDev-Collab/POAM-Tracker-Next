"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"
import { Plus, Edit, Trash2, Network } from "lucide-react"

interface PPSMEntry {
  id: number
  port: number
  protocol: string
  service: string
  description: string | null
  direction: string
  source: string | null
  destination: string | null
  status: string
  createdAt: string
  updatedAt: string
}

interface PPSMTabProps {
  packageId: number
}

const PROTOCOLS = ['TCP', 'UDP', 'ICMP', 'ESP', 'AH', 'GRE', 'SCTP']
const DIRECTIONS = ['Inbound', 'Outbound', 'Bidirectional']
const STATUSES = ['Active', 'Inactive', 'Pending', 'Blocked']

export function PPSMTab({ packageId }: PPSMTabProps) {
  const [entries, setEntries] = useState<PPSMEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<PPSMEntry | null>(null)
  const [formData, setFormData] = useState({
    port: '',
    protocol: '',
    service: '',
    description: '',
    direction: '',
    source: '',
    destination: '',
    status: 'Active'
  })

  const fetchEntries = useCallback(async () => {
    try {
      const response = await fetch(`/api/packages/${packageId}/ppsm`)
      if (response.ok) {
        const data = await response.json()
        setEntries(data.items || data || [])
      }
    } catch (error) {
      console.error('Error fetching PPSM entries:', error)
      toast.error("Failed to load PPSM entries")
    } finally {
      setLoading(false)
    }
  }, [packageId])

  useEffect(() => {
    fetchEntries()
  }, [fetchEntries])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.port || !formData.protocol || !formData.service || !formData.direction) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      const url = editingEntry 
        ? `/api/packages/${packageId}/ppsm/${editingEntry.id}`
        : `/api/packages/${packageId}/ppsm`
      
      const method = editingEntry ? 'PATCH' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          port: parseInt(formData.port)
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save PPSM entry')
      }

      toast.success(editingEntry ? "Entry updated successfully" : "Entry created successfully")
      fetchEntries()
      handleCloseDialog()
    } catch (error) {
      console.error('Error saving entry:', error)
      toast.error("Failed to save entry")
    }
  }

  const handleEdit = (entry: PPSMEntry) => {
    setEditingEntry(entry)
    setFormData({
      port: entry.port.toString(),
      protocol: entry.protocol,
      service: entry.service,
      description: entry.description || '',
      direction: entry.direction,
      source: entry.source || '',
      destination: entry.destination || '',
      status: entry.status
    })
    setIsCreateDialogOpen(true)
  }

  const handleDelete = async (entryId: number) => {
    if (!confirm('Are you sure you want to delete this PPSM entry?')) return

    try {
      const response = await fetch(`/api/packages/${packageId}/ppsm/${entryId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete entry')
      }

      toast.success("Entry deleted successfully")
      fetchEntries()
    } catch (error) {
      console.error('Error deleting entry:', error)
      toast.error("Failed to delete entry")
    }
  }

  const handleCloseDialog = () => {
    setIsCreateDialogOpen(false)
    setEditingEntry(null)
    setFormData({
      port: '',
      protocol: '',
      service: '',
      description: '',
      direction: '',
      source: '',
      destination: '',
      status: 'Active'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'Inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Blocked':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getDirectionColor = (direction: string) => {
    switch (direction) {
      case 'Inbound':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'Outbound':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'Bidirectional':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Ports, Protocols & Services Management</CardTitle>
              <CardDescription>
                Manage network ports, protocols, and services for this package
              </CardDescription>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingEntry(null)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Entry
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingEntry ? 'Edit PPSM Entry' : 'Create PPSM Entry'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingEntry ? 'Update the PPSM entry details.' : 'Add a new port, protocol, and service entry.'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="port">Port *</Label>
                        <Input
                          id="port"
                          type="number"
                          min="1"
                          max="65535"
                          value={formData.port}
                          onChange={(e) => setFormData(prev => ({ ...prev, port: e.target.value }))}
                          placeholder="80"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="protocol">Protocol *</Label>
                        <Select value={formData.protocol} onValueChange={(value) => setFormData(prev => ({ ...prev, protocol: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select protocol" />
                          </SelectTrigger>
                          <SelectContent>
                            {PROTOCOLS.map(protocol => (
                              <SelectItem key={protocol} value={protocol}>{protocol}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="service">Service *</Label>
                      <Input
                        id="service"
                        value={formData.service}
                        onChange={(e) => setFormData(prev => ({ ...prev, service: e.target.value }))}
                        placeholder="HTTP, HTTPS, SSH, etc."
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Optional description"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="direction">Direction *</Label>
                        <Select value={formData.direction} onValueChange={(value) => setFormData(prev => ({ ...prev, direction: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select direction" />
                          </SelectTrigger>
                          <SelectContent>
                            {DIRECTIONS.map(direction => (
                              <SelectItem key={direction} value={direction}>{direction}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUSES.map(status => (
                              <SelectItem key={status} value={status}>{status}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="source">Source</Label>
                        <Input
                          id="source"
                          value={formData.source}
                          onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value }))}
                          placeholder="Source IP/range"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="destination">Destination</Label>
                        <Input
                          id="destination"
                          value={formData.destination}
                          onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
                          placeholder="Destination IP/range"
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter className="mt-6">
                    <Button type="button" variant="outline" onClick={handleCloseDialog}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingEntry ? 'Update' : 'Create'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <div className="text-center py-12">
              <Network className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No PPSM Entries</h3>
              <p className="text-muted-foreground mb-4">
                Create your first port, protocol, and service entry to get started
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Port</TableHead>
                  <TableHead>Protocol</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Direction</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-mono font-medium">
                      {entry.port}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {entry.protocol}
                      </Badge>
                    </TableCell>
                    <TableCell>{entry.service}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getDirectionColor(entry.direction)}>
                        {entry.direction}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {entry.source || '-'}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {entry.destination || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(entry.status)}>
                        {entry.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(entry)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(entry.id)}
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
    </div>
  )
}