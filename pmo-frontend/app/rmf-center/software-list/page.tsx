"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Plus, 
  Search, 
 
  Download, 
  Upload,
  Package,
  Shield,
  AlertTriangle,
  CheckCircle,
  Monitor,
  Database,
  Globe,
  Edit,
  Trash2
} from "lucide-react"

interface SoftwareItem {
  id: string
  name: string
  vendor: string
  version: string
  category: 'operating-system' | 'database' | 'web-server' | 'application' | 'security' | 'development' | 'other'
  license: string
  installDate: string
  lastUpdated: string
  status: 'current' | 'outdated' | 'vulnerable' | 'end-of-life'
  installedOn: string[]
  vulnerabilities?: number
  criticality: 'low' | 'medium' | 'high' | 'critical'
  support: 'supported' | 'deprecated' | 'end-of-life'
  description?: string
}

export default function SoftwareListPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("inventory")
  
  const [softwareItems] = useState<SoftwareItem[]>([
    {
      id: '1',
      name: 'Ubuntu Server',
      vendor: 'Canonical Ltd.',
      version: '22.04.3 LTS',
      category: 'operating-system',
      license: 'GPL',
      installDate: '2023-01-15',
      lastUpdated: '2024-01-10',
      status: 'current',
      installedOn: ['Web Server 01', 'API Server'],
      vulnerabilities: 0,
      criticality: 'high',
      support: 'supported',
      description: 'Long-term support Linux distribution'
    },
    {
      id: '2',
      name: 'PostgreSQL',
      vendor: 'PostgreSQL Global Development Group',
      version: '15.4',
      category: 'database',
      license: 'PostgreSQL License',
      installDate: '2023-03-20',
      lastUpdated: '2023-11-15',
      status: 'current',
      installedOn: ['Database Server', 'Dev Server'],
      vulnerabilities: 1,
      criticality: 'critical',
      support: 'supported',
      description: 'Advanced open-source relational database'
    },
    {
      id: '3',
      name: 'Nginx',
      vendor: 'F5 Networks',
      version: '1.18.0',
      category: 'web-server',
      license: 'BSD-2-Clause',
      installDate: '2023-01-20',
      lastUpdated: '2023-06-10',
      status: 'outdated',
      installedOn: ['Web Server 01', 'Load Balancer'],
      vulnerabilities: 3,
      criticality: 'high',
      support: 'supported',
      description: 'High-performance HTTP server and reverse proxy'
    },
    {
      id: '4',
      name: 'Windows 11 Pro',
      vendor: 'Microsoft Corporation',
      version: '22H2 Build 22621.2715',
      category: 'operating-system',
      license: 'Commercial',
      installDate: '2023-06-10',
      lastUpdated: '2024-01-09',
      status: 'current',
      installedOn: ['Admin Workstation', 'User Workstations'],
      vulnerabilities: 0,
      criticality: 'high',
      support: 'supported',
      description: 'Microsoft Windows desktop operating system'
    },
    {
      id: '5',
      name: 'Adobe Flash Player',
      vendor: 'Adobe Inc.',
      version: '32.0.0.465',
      category: 'application',
      license: 'Commercial',
      installDate: '2020-01-15',
      lastUpdated: '2020-12-08',
      status: 'end-of-life',
      installedOn: ['Legacy System'],
      vulnerabilities: 25,
      criticality: 'critical',
      support: 'end-of-life',
      description: 'Deprecated web browser plugin (EOL)'
    }
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'current': return 'bg-green-100 text-green-800 border-green-200'
      case 'outdated': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'vulnerable': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'end-of-life': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getCriticalityColor = (criticality: string) => {
    switch (criticality) {
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'operating-system': return <Monitor className="h-4 w-4" />
      case 'database': return <Database className="h-4 w-4" />
      case 'web-server': return <Globe className="h-4 w-4" />
      case 'security': return <Shield className="h-4 w-4" />
      default: return <Package className="h-4 w-4" />
    }
  }

  const getVulnerabilityIcon = (count: number) => {
    if (count === 0) return <CheckCircle className="h-4 w-4 text-green-600" />
    if (count <= 3) return <AlertTriangle className="h-4 w-4 text-yellow-600" />
    return <AlertTriangle className="h-4 w-4 text-red-600" />
  }

  const filteredItems = softwareItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.version.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalVulnerabilities = softwareItems.reduce((sum, item) => sum + (item.vulnerabilities || 0), 0)
  const criticalItems = softwareItems.filter(item => item.criticality === 'critical').length
  const outdatedItems = softwareItems.filter(item => item.status === 'outdated' || item.status === 'end-of-life').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Software List</h1>
          <p className="text-muted-foreground">
            Software inventory, version management, and vulnerability tracking
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Import from Nessus
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Software
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Software</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{softwareItems.length}</div>
            <p className="text-xs text-muted-foreground">
              Tracked applications
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vulnerabilities</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{totalVulnerabilities}</div>
            <p className="text-xs text-muted-foreground">
              Known vulnerabilities
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Items</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{criticalItems}</div>
            <p className="text-xs text-muted-foreground">
              High priority items
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outdated</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{outdatedItems}</div>
            <p className="text-xs text-muted-foreground">
              Need updates
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="vulnerabilities">Vulnerabilities</TabsTrigger>
          <TabsTrigger value="licenses">Licenses</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
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
                    placeholder="Search software..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="operating-system">OS</SelectItem>
                    <SelectItem value="database">Database</SelectItem>
                    <SelectItem value="web-server">Web Server</SelectItem>
                    <SelectItem value="application">Application</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="current">Current</SelectItem>
                    <SelectItem value="outdated">Outdated</SelectItem>
                    <SelectItem value="vulnerable">Vulnerable</SelectItem>
                    <SelectItem value="end-of-life">End of Life</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Software Items */}
          <div className="space-y-4">
            {filteredItems.map((item) => (
              <Card key={item.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="p-2 bg-muted rounded-lg">
                        {getCategoryIcon(item.category)}
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-semibold text-lg">{item.name}</h3>
                          <Badge className={getStatusColor(item.status)}>
                            {item.status.toUpperCase()}
                          </Badge>
                          <Badge className={getCriticalityColor(item.criticality)}>
                            {item.criticality.toUpperCase()}
                          </Badge>
                          <div className="flex items-center space-x-1">
                            {getVulnerabilityIcon(item.vulnerabilities || 0)}
                            <span className="text-sm text-muted-foreground">
                              {item.vulnerabilities || 0} vulnerabilities
                            </span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Vendor:</span>
                            <p className="font-medium">{item.vendor}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Version:</span>
                            <p className="font-mono">{item.version}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">License:</span>
                            <p className="font-medium">{item.license}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Last Updated:</span>
                            <p className="font-medium">{item.lastUpdated}</p>
                          </div>
                        </div>
                        <div className="text-sm pt-2 border-t">
                          <span className="text-muted-foreground">Installed on: </span>
                          <span className="font-medium">{item.installedOn.join(', ')}</span>
                        </div>
                        {item.description && (
                          <p className="text-sm text-muted-foreground pt-1">
                            {item.description}
                          </p>
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

        <TabsContent value="vulnerabilities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <span>Software Vulnerabilities</span>
              </CardTitle>
              <CardDescription>
                Track and manage security vulnerabilities in installed software
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredItems
                  .filter(item => (item.vulnerabilities || 0) > 0)
                  .sort((a, b) => (b.vulnerabilities || 0) - (a.vulnerabilities || 0))
                  .map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-muted rounded-lg">
                          {getCategoryIcon(item.category)}
                        </div>
                        <div>
                          <h4 className="font-semibold">{item.name}</h4>
                          <p className="text-sm text-muted-foreground">{item.version}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Badge className={getCriticalityColor(item.criticality)}>
                          {item.criticality}
                        </Badge>
                        <div className="text-right">
                          <p className="font-semibold text-red-600">{item.vulnerabilities} vulnerabilities</p>
                          <p className="text-sm text-muted-foreground">Requires attention</p>
                        </div>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="licenses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>License Management</CardTitle>
              <CardDescription>
                Track software licenses and compliance requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Shield className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">
                  License tracking and compliance features coming soon
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Monitor commercial software licenses and usage
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Tracking</CardTitle>
              <CardDescription>
                Software compliance status for ATO and regulatory requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">End-of-Life Software</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Software that is no longer supported and poses security risks
                    </p>
                    <div className="space-y-2">
                      {softwareItems.filter(item => item.status === 'end-of-life').map(item => (
                        <div key={item.id} className="flex items-center justify-between p-2 bg-red-50 rounded">
                          <span className="font-medium">{item.name} {item.version}</span>
                          <Badge className="bg-red-100 text-red-800 border-red-200">
                            {item.vulnerabilities} vulnerabilities
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Outdated Software</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Software that needs updates for security and compliance
                    </p>
                    <div className="space-y-2">
                      {softwareItems.filter(item => item.status === 'outdated').map(item => (
                        <div key={item.id} className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                          <span className="font-medium">{item.name} {item.version}</span>
                          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                            Update Available
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Software Reports</CardTitle>
              <CardDescription>
                Generate software inventory and compliance reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card className="p-4">
                    <h4 className="font-semibold mb-2">Software Inventory Report</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Complete software inventory with versions and licenses
                    </p>
                    <Button variant="outline" size="sm">Generate Report</Button>
                  </Card>
                  <Card className="p-4">
                    <h4 className="font-semibold mb-2">Vulnerability Report</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Security vulnerabilities and remediation status
                    </p>
                    <Button variant="outline" size="sm">Generate Report</Button>
                  </Card>
                  <Card className="p-4">
                    <h4 className="font-semibold mb-2">License Compliance Report</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Software licensing status and compliance
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