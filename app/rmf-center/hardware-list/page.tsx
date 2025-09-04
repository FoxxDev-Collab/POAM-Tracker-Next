"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload,
  Server,
  Monitor,
  HardDrive,
  Cpu,
  Edit,
  Trash2
} from "lucide-react"

interface HardwareItem {
  id: string
  name: string
  type: 'server' | 'workstation' | 'network' | 'storage' | 'other'
  manufacturer: string
  model: string
  serialNumber: string
  location: string
  status: 'active' | 'inactive' | 'maintenance' | 'retired'
  purchaseDate: string
  warrantyExpiry?: string
  assignedTo?: string
  ipAddress?: string
  macAddress?: string
  specifications: {
    cpu?: string
    ram?: string
    storage?: string
    os?: string
  }
}

export default function HardwareListPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("inventory")
  
  const [hardwareItems] = useState<HardwareItem[]>([
    {
      id: '1',
      name: 'Web Server 01',
      type: 'server',
      manufacturer: 'Dell',
      model: 'PowerEdge R740',
      serialNumber: 'DEL001234567',
      location: 'Data Center Rack A1',
      status: 'active',
      purchaseDate: '2023-01-15',
      warrantyExpiry: '2026-01-15',
      assignedTo: 'IT Operations',
      ipAddress: '192.168.1.100',
      macAddress: '00:1A:2B:3C:4D:5E',
      specifications: {
        cpu: 'Intel Xeon Silver 4214',
        ram: '64GB DDR4',
        storage: '2TB SSD RAID 1',
        os: 'Ubuntu Server 22.04 LTS'
      }
    },
    {
      id: '2',
      name: 'Database Server',
      type: 'server',
      manufacturer: 'HPE',
      model: 'ProLiant DL380 Gen10',
      serialNumber: 'HPE987654321',
      location: 'Data Center Rack B2',
      status: 'active',
      purchaseDate: '2023-03-20',
      warrantyExpiry: '2026-03-20',
      assignedTo: 'Database Admin',
      ipAddress: '192.168.1.101',
      macAddress: '00:1A:2B:3C:4D:5F',
      specifications: {
        cpu: 'Intel Xeon Gold 6230',
        ram: '128GB DDR4',
        storage: '4TB SSD RAID 10',
        os: 'Red Hat Enterprise Linux 8'
      }
    },
    {
      id: '3',
      name: 'Admin Workstation',
      type: 'workstation',
      manufacturer: 'Lenovo',
      model: 'ThinkStation P340',
      serialNumber: 'LEN555666777',
      location: 'Office Room 205',
      status: 'active',
      purchaseDate: '2023-06-10',
      assignedTo: 'John Smith',
      ipAddress: '192.168.1.50',
      macAddress: '00:1A:2B:3C:4D:60',
      specifications: {
        cpu: 'Intel Core i7-10700',
        ram: '32GB DDR4',
        storage: '1TB NVMe SSD',
        os: 'Windows 11 Pro'
      }
    }
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200'
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'maintenance': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'retired': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'server': return <Server className="h-4 w-4" />
      case 'workstation': return <Monitor className="h-4 w-4" />
      case 'storage': return <HardDrive className="h-4 w-4" />
      default: return <Cpu className="h-4 w-4" />
    }
  }

  const filteredItems = hardwareItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hardware List</h1>
          <p className="text-muted-foreground">
            System hardware inventory and asset management
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Import from Nessus
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Hardware
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="servers">Servers</TabsTrigger>
          <TabsTrigger value="workstations">Workstations</TabsTrigger>
          <TabsTrigger value="network">Network Equipment</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-4">
          {/* Search and Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search hardware items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="server">Servers</SelectItem>
                    <SelectItem value="workstation">Workstations</SelectItem>
                    <SelectItem value="network">Network</SelectItem>
                    <SelectItem value="storage">Storage</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="retired">Retired</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Hardware Items */}
          <div className="space-y-4">
            {filteredItems.map((item) => (
              <Card key={item.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="p-2 bg-muted rounded-lg">
                        {getTypeIcon(item.type)}
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-semibold text-lg">{item.name}</h3>
                          <Badge className={getStatusColor(item.status)}>
                            {item.status.toUpperCase()}
                          </Badge>
                          <Badge variant="outline">
                            {item.type.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Manufacturer:</span>
                            <p className="font-medium">{item.manufacturer}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Model:</span>
                            <p className="font-medium">{item.model}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Serial:</span>
                            <p className="font-mono text-xs">{item.serialNumber}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Location:</span>
                            <p className="font-medium">{item.location}</p>
                          </div>
                        </div>
                        {item.specifications && (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm pt-2 border-t">
                            {item.specifications.cpu && (
                              <div>
                                <span className="text-muted-foreground">CPU:</span>
                                <p className="font-medium">{item.specifications.cpu}</p>
                              </div>
                            )}
                            {item.specifications.ram && (
                              <div>
                                <span className="text-muted-foreground">RAM:</span>
                                <p className="font-medium">{item.specifications.ram}</p>
                              </div>
                            )}
                            {item.specifications.storage && (
                              <div>
                                <span className="text-muted-foreground">Storage:</span>
                                <p className="font-medium">{item.specifications.storage}</p>
                              </div>
                            )}
                            {item.specifications.os && (
                              <div>
                                <span className="text-muted-foreground">OS:</span>
                                <p className="font-medium">{item.specifications.os}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="servers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Server Hardware</CardTitle>
              <CardDescription>
                Dedicated servers and infrastructure components
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Server className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">
                  Server inventory will be displayed here
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Filter applied: Showing only server hardware
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workstations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Workstation Hardware</CardTitle>
              <CardDescription>
                Desktop computers, laptops, and end-user devices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Monitor className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">
                  Workstation inventory will be displayed here
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Filter applied: Showing only workstation hardware
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="network" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Network Equipment</CardTitle>
              <CardDescription>
                Switches, routers, firewalls, and network infrastructure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <HardDrive className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">
                  Network equipment inventory will be displayed here
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Future integration with Nessus scan data planned
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hardware Reports</CardTitle>
              <CardDescription>
                Generate hardware inventory reports for compliance and auditing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card className="p-4">
                    <h4 className="font-semibold mb-2">Asset Summary Report</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Complete hardware inventory with specifications
                    </p>
                    <Button variant="outline" size="sm">Generate Report</Button>
                  </Card>
                  <Card className="p-4">
                    <h4 className="font-semibold mb-2">Warranty Status Report</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Track warranty expiration dates
                    </p>
                    <Button variant="outline" size="sm">Generate Report</Button>
                  </Card>
                  <Card className="p-4">
                    <h4 className="font-semibold mb-2">Compliance Report</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Hardware inventory for ATO documentation
                    </p>
                    <Button variant="outline" size="sm">Generate Report</Button>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}