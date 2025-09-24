"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Upload, FileText, Network, Shield, Plus, Edit, Trash2 } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface Port {
  id: string
  port: string
  protocol: string
  service: string
  status: 'open' | 'filtered' | 'closed'
  description: string
}

interface NetworkBoundary {
  id: string
  name: string
  description: string
  type: 'internal' | 'external' | 'dmz'
  diagram?: string
}

export default function PPSMPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [ports] = useState<Port[]>([
    { id: '1', port: '22', protocol: 'TCP', service: 'SSH', status: 'open', description: 'Secure Shell access' },
    { id: '2', port: '80', protocol: 'TCP', service: 'HTTP', status: 'open', description: 'Web server' },
    { id: '3', port: '443', protocol: 'TCP', service: 'HTTPS', status: 'open', description: 'Secure web server' },
    { id: '4', port: '3306', protocol: 'TCP', service: 'MySQL', status: 'filtered', description: 'Database server' },
  ])

  const [boundaries] = useState<NetworkBoundary[]>([
    { id: '1', name: 'DMZ Network', description: 'Demilitarized zone for public-facing services', type: 'dmz' },
    { id: '2', name: 'Internal LAN', description: 'Internal corporate network', type: 'internal' },
    { id: '3', name: 'External Gateway', description: 'Connection to external networks', type: 'external' },
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800 border-green-200'
      case 'filtered': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'closed': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getBoundaryColor = (type: string) => {
    switch (type) {
      case 'internal': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'external': return 'bg-red-100 text-red-800 border-red-200'
      case 'dmz': return 'bg-orange-100 text-orange-800 border-orange-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">PPSM</h1>
          <p className="text-muted-foreground">
            Ports, Protocols, Services Management - System ATO boundaries and network documentation
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add New Entry
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="ports">Ports & Services</TabsTrigger>
          <TabsTrigger value="boundaries">Network Boundaries</TabsTrigger>
          <TabsTrigger value="diagrams">System Diagrams</TabsTrigger>
          <TabsTrigger value="documentation">Documentation</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Open Ports</CardTitle>
                <Network className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{ports.filter(p => p.status === 'open').length}</div>
                <p className="text-xs text-muted-foreground">
                  Currently accessible
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Filtered Ports</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{ports.filter(p => p.status === 'filtered').length}</div>
                <p className="text-xs text-muted-foreground">
                  Behind firewall
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Network Boundaries</CardTitle>
                <Network className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{boundaries.length}</div>
                <p className="text-xs text-muted-foreground">
                  Defined boundaries
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Diagrams</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">
                  Uploaded diagrams
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ports" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Ports & Services Registry</CardTitle>
                  <CardDescription>
                    Manage system ports, protocols, and services for ATO documentation
                  </CardDescription>
                </div>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Port
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ports.map((port) => (
                  <div key={port.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="font-mono text-lg font-semibold">{port.port}</div>
                      <div className="text-sm text-muted-foreground">{port.protocol}</div>
                      <div className="font-medium">{port.service}</div>
                      <Badge className={getStatusColor(port.status)}>
                        {port.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-sm text-muted-foreground max-w-xs truncate">
                        {port.description}
                      </div>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="boundaries" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Network Boundaries</CardTitle>
                  <CardDescription>
                    Define system authorization boundaries for ATO packages
                  </CardDescription>
                </div>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Boundary
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {boundaries.map((boundary) => (
                  <Card key={boundary.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <CardTitle className="text-lg">{boundary.name}</CardTitle>
                          <Badge className={getBoundaryColor(boundary.type)}>
                            {boundary.type.toUpperCase()}
                          </Badge>
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
                      <CardDescription>{boundary.description}</CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="diagrams" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Diagrams</CardTitle>
              <CardDescription>
                Upload network diagrams, data flow diagrams, and system architecture documentation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-12 text-center">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-lg font-medium mb-2">No diagrams uploaded yet</p>
                <p className="text-muted-foreground mb-4">
                  Upload network diagrams, data flow charts, and system architecture documents
                </p>
                <Button>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Diagrams
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documentation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>PPSM Documentation</CardTitle>
              <CardDescription>
                Document ports, protocols, and services for compliance and ATO requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="system-purpose">System Purpose</Label>
                  <Textarea 
                    id="system-purpose" 
                    placeholder="Describe the primary purpose and mission of this system..."
                    className="min-h-[100px]"
                  />
                </div>
                <div>
                  <Label htmlFor="network-description">Network Architecture Description</Label>
                  <Textarea 
                    id="network-description" 
                    placeholder="Provide a detailed description of the network architecture..."
                    className="min-h-[100px]"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="security-controls">Security Controls</Label>
                    <Textarea 
                      id="security-controls" 
                      placeholder="List relevant security controls..."
                      className="min-h-[80px]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="data-flows">Data Flows</Label>
                    <Textarea 
                      id="data-flows" 
                      placeholder="Describe major data flows..."
                      className="min-h-[80px]"
                    />
                  </div>
                </div>
                <Button>
                  Save Documentation
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}