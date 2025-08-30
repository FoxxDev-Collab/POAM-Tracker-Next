"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Network, 
  Server, 
  Database, 
  Lock,
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  Monitor,
  Wifi,
  HardDrive,
  Users,
  Globe,
  Building
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SystemComponent {
  id: string
  name: string
  type: 'Hardware' | 'Software' | 'Network' | 'Data' | 'Personnel' | 'Facility'
  description: string
  location?: string
  owner?: string
  criticality: 'Low' | 'Medium' | 'High' | 'Critical'
  inBoundary: boolean
}

interface NetworkInterface {
  id: string
  name: string
  type: 'Internal' | 'External' | 'DMZ' | 'Cloud'
  ipRange?: string
  vlan?: string
  securityZone?: string
  description: string
}

interface DataFlow {
  id: string
  source: string
  destination: string
  dataType: string
  protocol?: string
  encryption: boolean
  description: string
}

interface SystemBoundaryProps {
  components?: SystemComponent[]
  interfaces?: NetworkInterface[]
  dataFlows?: DataFlow[]
  onUpdate?: (data: {
    components: SystemComponent[]
    interfaces: NetworkInterface[]
    dataFlows: DataFlow[]
  }) => Promise<void>
}

export function SystemBoundary({ 
  components = [], 
  interfaces = [], 
  dataFlows = [],
  onUpdate 
}: SystemBoundaryProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [localComponents, setLocalComponents] = useState<SystemComponent[]>(components)
  const [localInterfaces, setLocalInterfaces] = useState<NetworkInterface[]>(interfaces)
  const [localDataFlows, setLocalDataFlows] = useState<DataFlow[]>(dataFlows)
  const [activeTab, setActiveTab] = useState("components")

  const handleSave = async () => {
    if (onUpdate) {
      await onUpdate({
        components: localComponents,
        interfaces: localInterfaces,
        dataFlows: localDataFlows
      })
      setIsEditing(false)
    }
  }

  const addComponent = () => {
    const newComponent: SystemComponent = {
      id: `comp-${Date.now()}`,
      name: "New Component",
      type: "Hardware",
      description: "",
      criticality: "Medium",
      inBoundary: true
    }
    setLocalComponents([...localComponents, newComponent])
  }

  const updateComponent = (id: string, updates: Partial<SystemComponent>) => {
    setLocalComponents(localComponents.map(c => 
      c.id === id ? { ...c, ...updates } : c
    ))
  }

  const deleteComponent = (id: string) => {
    setLocalComponents(localComponents.filter(c => c.id !== id))
  }

  const addInterface = () => {
    const newInterface: NetworkInterface = {
      id: `int-${Date.now()}`,
      name: "New Interface",
      type: "Internal",
      description: ""
    }
    setLocalInterfaces([...localInterfaces, newInterface])
  }

  const updateInterface = (id: string, updates: Partial<NetworkInterface>) => {
    setLocalInterfaces(localInterfaces.map(i => 
      i.id === id ? { ...i, ...updates } : i
    ))
  }

  const deleteInterface = (id: string) => {
    setLocalInterfaces(localInterfaces.filter(i => i.id !== id))
  }

  const addDataFlow = () => {
    const newFlow: DataFlow = {
      id: `flow-${Date.now()}`,
      source: "",
      destination: "",
      dataType: "",
      encryption: false,
      description: ""
    }
    setLocalDataFlows([...localDataFlows, newFlow])
  }

  const updateDataFlow = (id: string, updates: Partial<DataFlow>) => {
    setLocalDataFlows(localDataFlows.map(f => 
      f.id === id ? { ...f, ...updates } : f
    ))
  }

  const deleteDataFlow = (id: string) => {
    setLocalDataFlows(localDataFlows.filter(f => f.id !== id))
  }

  const getComponentIcon = (type: string) => {
    switch (type) {
      case 'Hardware': return <Server className="h-4 w-4" />
      case 'Software': return <Monitor className="h-4 w-4" />
      case 'Network': return <Wifi className="h-4 w-4" />
      case 'Data': return <Database className="h-4 w-4" />
      case 'Personnel': return <Users className="h-4 w-4" />
      case 'Facility': return <Building className="h-4 w-4" />
      default: return <HardDrive className="h-4 w-4" />
    }
  }

  const getCriticalityColor = (criticality: string) => {
    switch (criticality) {
      case 'Critical': return 'bg-red-500'
      case 'High': return 'bg-orange-500'
      case 'Medium': return 'bg-yellow-500'
      case 'Low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getInterfaceColor = (type: string) => {
    switch (type) {
      case 'External': return 'border-red-500 bg-red-50 dark:bg-red-950/20'
      case 'DMZ': return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20'
      case 'Internal': return 'border-green-500 bg-green-50 dark:bg-green-950/20'
      case 'Cloud': return 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
      default: return 'border-gray-500 bg-gray-50 dark:bg-gray-950/20'
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Network className="h-5 w-5" />
              System Boundary Definition
            </CardTitle>
            <CardDescription>
              Define system components, network interfaces, and data flows within the authorization boundary
            </CardDescription>
          </div>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit Boundary
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={() => setIsEditing(false)} variant="outline" size="sm">
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
              <Button onClick={handleSave} size="sm">
                <Save className="h-4 w-4 mr-1" />
                Save Changes
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="components">System Components</TabsTrigger>
            <TabsTrigger value="interfaces">Network Interfaces</TabsTrigger>
            <TabsTrigger value="dataflows">Data Flows</TabsTrigger>
          </TabsList>

          <TabsContent value="components" className="space-y-4">
            {isEditing && (
              <Button onClick={addComponent} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Component
              </Button>
            )}
            
            <div className="grid gap-4">
              {localComponents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No system components defined yet
                </div>
              ) : (
                localComponents.map((component) => (
                  <div 
                    key={component.id} 
                    className={cn(
                      "border rounded-lg p-4 transition-all",
                      component.inBoundary 
                        ? "border-primary/50 bg-primary/5" 
                        : "border-muted bg-muted/5 opacity-75"
                    )}
                  >
                    {isEditing ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <Label>Component Name</Label>
                            <Input 
                              value={component.name}
                              onChange={(e) => updateComponent(component.id, { name: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label>Type</Label>
                            <select 
                              className="w-full h-10 px-3 rounded-md border border-input bg-background"
                              value={component.type}
                              onChange={(e) => updateComponent(component.id, { 
                                type: e.target.value as SystemComponent['type'] 
                              })}
                            >
                              <option value="Hardware">Hardware</option>
                              <option value="Software">Software</option>
                              <option value="Network">Network</option>
                              <option value="Data">Data</option>
                              <option value="Personnel">Personnel</option>
                              <option value="Facility">Facility</option>
                            </select>
                          </div>
                          <div>
                            <Label>Criticality</Label>
                            <select 
                              className="w-full h-10 px-3 rounded-md border border-input bg-background"
                              value={component.criticality}
                              onChange={(e) => updateComponent(component.id, { 
                                criticality: e.target.value as SystemComponent['criticality'] 
                              })}
                            >
                              <option value="Low">Low</option>
                              <option value="Medium">Medium</option>
                              <option value="High">High</option>
                              <option value="Critical">Critical</option>
                            </select>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <Label>Location</Label>
                            <Input 
                              value={component.location || ''}
                              onChange={(e) => updateComponent(component.id, { location: e.target.value })}
                              placeholder="Physical or logical location"
                            />
                          </div>
                          <div>
                            <Label>Owner</Label>
                            <Input 
                              value={component.owner || ''}
                              onChange={(e) => updateComponent(component.id, { owner: e.target.value })}
                              placeholder="Component owner"
                            />
                          </div>
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Textarea 
                            value={component.description}
                            onChange={(e) => updateComponent(component.id, { description: e.target.value })}
                            placeholder="Component description and purpose"
                            rows={2}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <label className="flex items-center gap-2">
                            <input 
                              type="checkbox"
                              checked={component.inBoundary}
                              onChange={(e) => updateComponent(component.id, { inBoundary: e.target.checked })}
                            />
                            <span className="text-sm">Within Authorization Boundary</span>
                          </label>
                          <Button 
                            onClick={() => deleteComponent(component.id)} 
                            size="sm" 
                            variant="destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {getComponentIcon(component.type)}
                            <h4 className="font-medium">{component.name}</h4>
                            <Badge variant="outline">{component.type}</Badge>
                            <Badge className={getCriticalityColor(component.criticality)}>
                              {component.criticality}
                            </Badge>
                            {component.inBoundary && (
                              <Badge variant="default" className="bg-primary">
                                In Boundary
                              </Badge>
                            )}
                          </div>
                        </div>
                        {component.description && (
                          <p className="text-sm text-muted-foreground">{component.description}</p>
                        )}
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          {component.location && (
                            <span>Location: {component.location}</span>
                          )}
                          {component.owner && (
                            <span>Owner: {component.owner}</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="interfaces" className="space-y-4">
            {isEditing && (
              <Button onClick={addInterface} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Interface
              </Button>
            )}
            
            <div className="grid gap-4">
              {localInterfaces.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No network interfaces defined yet
                </div>
              ) : (
                localInterfaces.map((intf) => (
                  <div 
                    key={intf.id} 
                    className={cn(
                      "border-2 rounded-lg p-4",
                      getInterfaceColor(intf.type)
                    )}
                  >
                    {isEditing ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <Label>Interface Name</Label>
                            <Input 
                              value={intf.name}
                              onChange={(e) => updateInterface(intf.id, { name: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label>Type</Label>
                            <select 
                              className="w-full h-10 px-3 rounded-md border border-input bg-background"
                              value={intf.type}
                              onChange={(e) => updateInterface(intf.id, { 
                                type: e.target.value as NetworkInterface['type'] 
                              })}
                            >
                              <option value="Internal">Internal</option>
                              <option value="External">External</option>
                              <option value="DMZ">DMZ</option>
                              <option value="Cloud">Cloud</option>
                            </select>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <Label>IP Range</Label>
                            <Input 
                              value={intf.ipRange || ''}
                              onChange={(e) => updateInterface(intf.id, { ipRange: e.target.value })}
                              placeholder="e.g., 10.0.0.0/24"
                            />
                          </div>
                          <div>
                            <Label>VLAN</Label>
                            <Input 
                              value={intf.vlan || ''}
                              onChange={(e) => updateInterface(intf.id, { vlan: e.target.value })}
                              placeholder="VLAN ID"
                            />
                          </div>
                          <div>
                            <Label>Security Zone</Label>
                            <Input 
                              value={intf.securityZone || ''}
                              onChange={(e) => updateInterface(intf.id, { securityZone: e.target.value })}
                              placeholder="Zone name"
                            />
                          </div>
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Textarea 
                            value={intf.description}
                            onChange={(e) => updateInterface(intf.id, { description: e.target.value })}
                            placeholder="Interface description and purpose"
                            rows={2}
                          />
                        </div>
                        <div className="flex justify-end">
                          <Button 
                            onClick={() => deleteInterface(intf.id)} 
                            size="sm" 
                            variant="destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          <h4 className="font-medium">{intf.name}</h4>
                          <Badge variant="outline">{intf.type}</Badge>
                        </div>
                        {intf.description && (
                          <p className="text-sm text-muted-foreground">{intf.description}</p>
                        )}
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          {intf.ipRange && <span>IP: {intf.ipRange}</span>}
                          {intf.vlan && <span>VLAN: {intf.vlan}</span>}
                          {intf.securityZone && <span>Zone: {intf.securityZone}</span>}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="dataflows" className="space-y-4">
            {isEditing && (
              <Button onClick={addDataFlow} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Data Flow
              </Button>
            )}
            
            <div className="grid gap-4">
              {localDataFlows.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No data flows defined yet
                </div>
              ) : (
                localDataFlows.map((flow) => (
                  <div key={flow.id} className="border rounded-lg p-4">
                    {isEditing ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <Label>Source</Label>
                            <Input 
                              value={flow.source}
                              onChange={(e) => updateDataFlow(flow.id, { source: e.target.value })}
                              placeholder="Source system or component"
                            />
                          </div>
                          <div>
                            <Label>Destination</Label>
                            <Input 
                              value={flow.destination}
                              onChange={(e) => updateDataFlow(flow.id, { destination: e.target.value })}
                              placeholder="Destination system or component"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <Label>Data Type</Label>
                            <Input 
                              value={flow.dataType}
                              onChange={(e) => updateDataFlow(flow.id, { dataType: e.target.value })}
                              placeholder="Type of data transmitted"
                            />
                          </div>
                          <div>
                            <Label>Protocol</Label>
                            <Input 
                              value={flow.protocol || ''}
                              onChange={(e) => updateDataFlow(flow.id, { protocol: e.target.value })}
                              placeholder="e.g., HTTPS, SSH, TLS"
                            />
                          </div>
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Textarea 
                            value={flow.description}
                            onChange={(e) => updateDataFlow(flow.id, { description: e.target.value })}
                            placeholder="Data flow description and purpose"
                            rows={2}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <label className="flex items-center gap-2">
                            <input 
                              type="checkbox"
                              checked={flow.encryption}
                              onChange={(e) => updateDataFlow(flow.id, { encryption: e.target.checked })}
                            />
                            <span className="text-sm">Encrypted</span>
                          </label>
                          <Button 
                            onClick={() => deleteDataFlow(flow.id)} 
                            size="sm" 
                            variant="destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="text-sm">
                              <span className="font-medium">{flow.source}</span>
                              <span className="mx-2">→</span>
                              <span className="font-medium">{flow.destination}</span>
                            </div>
                            {flow.encryption && (
                              <Badge variant="default" className="bg-green-500">
                                <Lock className="h-3 w-3 mr-1" />
                                Encrypted
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <span>Data: {flow.dataType}</span>
                          {flow.protocol && <span className="ml-4">Protocol: {flow.protocol}</span>}
                        </div>
                        {flow.description && (
                          <p className="text-sm text-muted-foreground">{flow.description}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}