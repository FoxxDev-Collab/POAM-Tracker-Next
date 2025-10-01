"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  Network, Shield, Server, Globe, Lock, AlertTriangle,
  Plus, Edit2, Trash2, Search, Filter, Download, Upload,
  ChevronLeft, CheckCircle, XCircle, Clock, Activity
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"

interface PPSMEntry {
  id: string
  systemId: number
  port: number
  protocol: string
  service: string
  direction: "Inbound" | "Outbound" | "Bidirectional"
  sourceIP: string
  destinationIP: string
  justification: string
  approvalStatus: "Approved" | "Pending" | "Rejected"
  riskLevel: "Low" | "Medium" | "High" | "Critical"
  notes?: string
  createdAt: string
  updatedAt: string
}

interface SystemDetails {
  id: number
  name: string
  hostname?: string
  ipAddress?: string
  operatingSystem?: string
  isVirtual?: boolean
  description?: string
  packageId: number
  packageName?: string
}

export default function SystemPPSMManagementPage() {
  const params = useParams()
  const router = useRouter()
  const systemId = params?.systemId as string

  const [loading, setLoading] = useState(true)
  const [system, setSystem] = useState<SystemDetails | null>(null)
  const [ppsmEntries, setPpsmEntries] = useState<PPSMEntry[]>([])
  const [filteredEntries, setFilteredEntries] = useState<PPSMEntry[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterProtocol, setFilterProtocol] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingEntry, setEditingEntry] = useState<PPSMEntry | null>(null)

  // Form states
  const [formData, setFormData] = useState({
    port: "",
    protocol: "TCP",
    service: "",
    direction: "Inbound",
    sourceIP: "",
    destinationIP: "",
    justification: "",
    notes: ""
  })

  useEffect(() => {
    fetchSystemDetails()
    fetchPPSMEntries()
  }, [systemId])

  useEffect(() => {
    filterPPSMEntries()
  }, [ppsmEntries, searchQuery, filterProtocol, filterStatus])

  const fetchSystemDetails = async () => {
    try {
      const response = await fetch(`/api/systems/${systemId}`)
      if (response.ok) {
        const data = await response.json()
        setSystem(data)
      }
    } catch (error) {
      console.error("Error fetching system details:", error)
      toast.error("Failed to load system details")
    }
  }

  const fetchPPSMEntries = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/ppsm/system/${systemId}`)
      if (response.ok) {
        const data = await response.json()
        setPpsmEntries(data.entries || [])
      } else {
        setPpsmEntries([])
      }
    } catch (error) {
      console.error("Error fetching PPSM entries:", error)
      setPpsmEntries([])
    } finally {
      setLoading(false)
    }
  }

  const filterPPSMEntries = () => {
    let filtered = [...ppsmEntries]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(entry =>
        entry.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.port.toString().includes(searchQuery) ||
        entry.sourceIP.includes(searchQuery) ||
        entry.destinationIP.includes(searchQuery)
      )
    }

    // Protocol filter
    if (filterProtocol !== "all") {
      filtered = filtered.filter(entry => entry.protocol === filterProtocol)
    }

    // Status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter(entry => entry.approvalStatus === filterStatus)
    }

    setFilteredEntries(filtered)
  }

  const handleAddEntry = async () => {
    try {
      const response = await fetch("/api/ppsm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          systemId: parseInt(systemId),
          port: parseInt(formData.port)
        })
      })

      if (response.ok) {
        toast.success("PPSM entry added successfully")
        setShowAddDialog(false)
        resetForm()
        fetchPPSMEntries()
      } else {
        toast.error("Failed to add PPSM entry")
      }
    } catch (error) {
      console.error("Error adding PPSM entry:", error)
      toast.error("Failed to add PPSM entry")
    }
  }

  const handleUpdateEntry = async () => {
    if (!editingEntry) return

    try {
      const response = await fetch(`/api/ppsm/${editingEntry.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          port: parseInt(formData.port)
        })
      })

      if (response.ok) {
        toast.success("PPSM entry updated successfully")
        setEditingEntry(null)
        setShowAddDialog(false)
        resetForm()
        fetchPPSMEntries()
      } else {
        toast.error("Failed to update PPSM entry")
      }
    } catch (error) {
      console.error("Error updating PPSM entry:", error)
      toast.error("Failed to update PPSM entry")
    }
  }

  const handleDeleteEntry = async (id: string) => {
    if (!confirm("Are you sure you want to delete this PPSM entry?")) return

    try {
      const response = await fetch(`/api/ppsm/${id}`, {
        method: "DELETE"
      })

      if (response.ok) {
        toast.success("PPSM entry deleted successfully")
        fetchPPSMEntries()
      } else {
        toast.error("Failed to delete PPSM entry")
      }
    } catch (error) {
      console.error("Error deleting PPSM entry:", error)
      toast.error("Failed to delete PPSM entry")
    }
  }

  const handleApproveEntry = async (id: string) => {
    try {
      const response = await fetch(`/api/ppsm/${id}/approve`, {
        method: "PUT"
      })

      if (response.ok) {
        toast.success("PPSM entry approved")
        fetchPPSMEntries()
      } else {
        toast.error("Failed to approve PPSM entry")
      }
    } catch (error) {
      console.error("Error approving PPSM entry:", error)
      toast.error("Failed to approve PPSM entry")
    }
  }

  const handleRejectEntry = async (id: string) => {
    const reason = prompt("Please provide a reason for rejection:")
    if (!reason) return

    try {
      const response = await fetch(`/api/ppsm/${id}/reject`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason })
      })

      if (response.ok) {
        toast.success("PPSM entry rejected")
        fetchPPSMEntries()
      } else {
        toast.error("Failed to reject PPSM entry")
      }
    } catch (error) {
      console.error("Error rejecting PPSM entry:", error)
      toast.error("Failed to reject PPSM entry")
    }
  }

  const resetForm = () => {
    setFormData({
      port: "",
      protocol: "TCP",
      service: "",
      direction: "Inbound",
      sourceIP: "",
      destinationIP: "",
      justification: "",
      notes: ""
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Approved":
        return <Badge className="bg-green-500/10 text-green-700 border-green-500/20">Approved</Badge>
      case "Pending":
        return <Badge className="bg-yellow-500/10 text-yellow-700 border-yellow-500/20">Pending</Badge>
      case "Rejected":
        return <Badge className="bg-red-500/10 text-red-700 border-red-500/20">Rejected</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case "Critical":
        return <Badge className="bg-red-500/10 text-red-700 border-red-500/20">Critical</Badge>
      case "High":
        return <Badge className="bg-orange-500/10 text-orange-700 border-orange-500/20">High</Badge>
      case "Medium":
        return <Badge className="bg-yellow-500/10 text-yellow-700 border-yellow-500/20">Medium</Badge>
      case "Low":
        return <Badge className="bg-green-500/10 text-green-700 border-green-500/20">Low</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getDirectionIcon = (direction: string) => {
    switch (direction) {
      case "Inbound":
        return "→"
      case "Outbound":
        return "←"
      case "Bidirectional":
        return "↔"
      default:
        return "?"
    }
  }

  // Stats calculation
  const stats = {
    totalPorts: ppsmEntries.length,
    approved: ppsmEntries.filter(e => e.approvalStatus === "Approved").length,
    pending: ppsmEntries.filter(e => e.approvalStatus === "Pending").length,
    highRisk: ppsmEntries.filter(e => e.riskLevel === "High" || e.riskLevel === "Critical").length,
  }

  // Early return check after all hooks
  if (!systemId) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <p className="text-muted-foreground">Loading system information...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/rmf-center/document-center/ppsm")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              PPSM Management: {system?.name || "Loading..."}
            </h1>
            <p className="text-sm text-muted-foreground">
              {system?.hostname && <span>{system.hostname} • </span>}
              {system?.ipAddress && <span>{system.ipAddress} • </span>}
              {system?.operatingSystem || "Unknown OS"}
            </p>
          </div>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              resetForm()
              setEditingEntry(null)
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Add PPSM Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingEntry ? "Edit PPSM Entry" : "Add PPSM Entry"}
              </DialogTitle>
              <DialogDescription>
                Define port, protocol, and service requirements for {system?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="port">Port Number</Label>
                  <Input
                    id="port"
                    type="number"
                    value={formData.port}
                    onChange={(e) => setFormData({ ...formData, port: e.target.value })}
                    placeholder="443"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="protocol">Protocol</Label>
                  <Select
                    value={formData.protocol}
                    onValueChange={(v) => setFormData({ ...formData, protocol: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TCP">TCP</SelectItem>
                      <SelectItem value="UDP">UDP</SelectItem>
                      <SelectItem value="ICMP">ICMP</SelectItem>
                      <SelectItem value="Any">Any</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="service">Service Name</Label>
                <Input
                  id="service"
                  value={formData.service}
                  onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                  placeholder="HTTPS Web Service"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="justification">Business Justification</Label>
                <Textarea
                  id="justification"
                  value={formData.justification}
                  onChange={(e) => setFormData({ ...formData, justification: e.target.value })}
                  placeholder="Explain why this port/service is required..."
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any additional information..."
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setShowAddDialog(false)
                resetForm()
                setEditingEntry(null)
              }}>
                Cancel
              </Button>
              <Button onClick={editingEntry ? handleUpdateEntry : handleAddEntry}>
                {editingEntry ? "Update" : "Add"} Entry
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPorts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">High Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.highRisk}</div>
          </CardContent>
        </Card>
      </div>

      {/* PPSM Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>PPSM Entries</CardTitle>
              <CardDescription>
                Manage ports, protocols, and services for this system
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-[250px]"
              />
              <Select value={filterProtocol} onValueChange={setFilterProtocol}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Protocol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="TCP">TCP</SelectItem>
                  <SelectItem value="UDP">UDP</SelectItem>
                  <SelectItem value="ICMP">ICMP</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="text-center py-8">
              <Network className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                {ppsmEntries.length === 0 ? "No PPSM entries yet" : "No matching entries found"}
              </p>
              <Button className="mt-4" onClick={() => setShowAddDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add First Entry
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[100px] font-semibold">Port</TableHead>
                    <TableHead className="w-[120px] font-semibold">Protocol</TableHead>
                    <TableHead className="font-semibold">Service</TableHead>
                    <TableHead className="w-[120px] font-semibold">Risk Level</TableHead>
                    <TableHead className="w-[120px] font-semibold">Status</TableHead>
                    <TableHead className="w-[180px] text-right font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntries.map((entry) => (
                    <TableRow key={entry.id} className="hover:bg-muted/30">
                      <TableCell className="font-mono font-semibold text-base">{entry.port}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-medium">{entry.protocol}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{entry.service}</TableCell>
                      <TableCell>{getRiskBadge(entry.riskLevel)}</TableCell>
                      <TableCell>{getStatusBadge(entry.approvalStatus)}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          {entry.approvalStatus === "Pending" && (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 hover:bg-green-100 hover:text-green-700"
                                onClick={() => handleApproveEntry(entry.id)}
                                title="Approve"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-700"
                                onClick={() => handleRejectEntry(entry.id)}
                                title="Reject"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-700"
                            onClick={() => {
                              setEditingEntry(entry)
                              setFormData({
                                port: entry.port.toString(),
                                protocol: entry.protocol,
                                service: entry.service,
                                direction: entry.direction,
                                sourceIP: entry.sourceIP,
                                destinationIP: entry.destinationIP,
                                justification: entry.justification,
                                notes: entry.notes || ""
                              })
                              setShowAddDialog(true)
                            }}
                            title="Edit"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-700"
                            onClick={() => handleDeleteEntry(entry.id)}
                            title="Delete"
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
    </div>
  )
}