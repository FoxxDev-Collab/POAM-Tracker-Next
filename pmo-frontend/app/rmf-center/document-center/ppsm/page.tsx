"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Network, Server, Globe, Shield, Activity, Database,
  ChevronRight, Search, Filter, Plus, ExternalLink
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"

interface System {
  id: number
  name: string
  hostname?: string
  ipAddress?: string
  operatingSystem?: string
  systemType?: string
  isVirtual?: boolean
  description?: string
  ppsmCount?: number
  lastReviewed?: string
  complianceStatus?: string
}

export default function PPSMAssetsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [selectedPackage, setSelectedPackage] = useState<string>("")
  const [packages, setPackages] = useState<any[]>([])
  const [systems, setSystems] = useState<System[]>([])
  const [filteredSystems, setFilteredSystems] = useState<System[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<string>("all")

  useEffect(() => {
    fetchPackages()
  }, [])

  useEffect(() => {
    if (selectedPackage) {
      fetchSystems()
    }
  }, [selectedPackage])

  useEffect(() => {
    filterSystemsList()
  }, [systems, searchQuery, filterType])

  const fetchPackages = async () => {
    try {
      const response = await fetch("/api/packages")
      if (response.ok) {
        const data = await response.json()
        setPackages(data.items || data || [])
        if (data.items?.length > 0 || data.length > 0) {
          const firstPackage = data.items?.[0] || data[0]
          setSelectedPackage(firstPackage.id.toString())
        }
      }
    } catch (error) {
      console.error("Error fetching packages:", error)
      toast.error("Failed to load packages")
    }
  }

  const fetchSystems = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/packages/${selectedPackage}/systems`)
      if (response.ok) {
        const data = await response.json()
        // Add mock PPSM count for now
        const systemsWithPPSM = (data.systems || data || []).map((system: System) => ({
          ...system,
          ppsmCount: Math.floor(Math.random() * 20),
          complianceStatus: Math.random() > 0.7 ? "Compliant" : Math.random() > 0.3 ? "Partial" : "Non-Compliant"
        }))
        setSystems(systemsWithPPSM)
      } else {
        setSystems([])
      }
    } catch (error) {
      console.error("Error fetching systems:", error)
      setSystems([])
    } finally {
      setLoading(false)
    }
  }

  const filterSystemsList = () => {
    let filtered = [...systems]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(system =>
        system.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        system.hostname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        system.ipAddress?.includes(searchQuery) ||
        system.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Type filter
    if (filterType !== "all") {
      if (filterType === "virtual") {
        filtered = filtered.filter(system => system.isVirtual === true)
      } else if (filterType === "physical") {
        filtered = filtered.filter(system => system.isVirtual === false)
      }
    }

    setFilteredSystems(filtered)
  }

  const handleSystemClick = (systemId: number) => {
    router.push(`/rmf-center/document-center/ppsm/system/${systemId}`)
  }

  const getComplianceBadge = (status?: string) => {
    switch (status) {
      case "Compliant":
        return <Badge className="bg-green-500/10 text-green-700 border-green-500/20">Compliant</Badge>
      case "Partial":
        return <Badge className="bg-yellow-500/10 text-yellow-700 border-yellow-500/20">Partial</Badge>
      case "Non-Compliant":
        return <Badge className="bg-red-500/10 text-red-700 border-red-500/20">Non-Compliant</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getSystemTypeIcon = (system: System) => {
    if (system.isVirtual) {
      return <Database className="h-4 w-4 text-blue-600" />
    }
    return <Server className="h-4 w-4 text-gray-600" />
  }

  // Stats calculation
  const stats = {
    totalSystems: systems.length,
    virtualSystems: systems.filter(s => s.isVirtual).length,
    physicalSystems: systems.filter(s => !s.isVirtual).length,
    totalPPSM: systems.reduce((sum, s) => sum + (s.ppsmCount || 0), 0),
    compliantSystems: systems.filter(s => s.complianceStatus === "Compliant").length,
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">PPSM Management</h1>
          <p className="text-muted-foreground">
            Select a system to manage its Ports, Protocols, and Services
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedPackage} onValueChange={setSelectedPackage}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Select a package" />
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

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Systems</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSystems}</div>
            <p className="text-xs text-muted-foreground">In this package</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Physical</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.physicalSystems}</div>
            <p className="text-xs text-muted-foreground">Hardware systems</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Virtual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.virtualSystems}</div>
            <p className="text-xs text-muted-foreground">VMs & containers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total PPSM</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPPSM}</div>
            <p className="text-xs text-muted-foreground">Across all systems</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Compliant</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.compliantSystems}</div>
            <p className="text-xs text-muted-foreground">Systems compliant</p>
          </CardContent>
        </Card>
      </div>

      {/* Systems Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Systems & Assets</CardTitle>
              <CardDescription>
                Click on a system to manage its PPSM entries
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search systems..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-[300px]"
              />
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Systems</SelectItem>
                  <SelectItem value="physical">Physical Only</SelectItem>
                  <SelectItem value="virtual">Virtual Only</SelectItem>
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
          ) : filteredSystems.length === 0 ? (
            <div className="text-center py-8">
              <Server className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                {systems.length === 0 ? "No systems found in this package" : "No matching systems found"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Add systems to this package to manage their PPSM entries
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>System Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Operating System</TableHead>
                  <TableHead>PPSM Entries</TableHead>
                  <TableHead>Compliance</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSystems.map((system) => (
                  <TableRow
                    key={system.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSystemClick(system.id)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getSystemTypeIcon(system)}
                        <div>
                          <div className="font-medium">{system.name}</div>
                          {system.hostname && (
                            <div className="text-sm text-muted-foreground">{system.hostname}</div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {system.isVirtual ? "Virtual" : "Physical"}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {system.ipAddress || "N/A"}
                    </TableCell>
                    <TableCell>
                      {system.operatingSystem || "Unknown"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Network className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{system.ppsmCount || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getComplianceBadge(system.complianceStatus)}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSystemClick(system.id)
                        }}
                      >
                        <span className="mr-2">Manage PPSM</span>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
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