"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
// import { Progress } from "@/components/ui/progress"
import { 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Shield,
  Activity,
  Plus,
  Edit,
  Save,
  X,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3
} from "lucide-react"
import { cn } from "@/lib/utils"

interface RiskItem {
  id: string
  riskId: string
  title: string
  description: string
  category: 'Technical' | 'Operational' | 'Compliance' | 'Financial' | 'Reputational'
  source: string
  likelihood: 'Very Low' | 'Low' | 'Moderate' | 'High' | 'Very High'
  impact: 'Very Low' | 'Low' | 'Moderate' | 'High' | 'Very High'
  inherentRiskScore: number
  currentControls: string[]
  residualLikelihood: 'Very Low' | 'Low' | 'Moderate' | 'High' | 'Very High'
  residualImpact: 'Very Low' | 'Low' | 'Moderate' | 'High' | 'Very High'
  residualRiskScore: number
  riskResponse: 'Accept' | 'Avoid' | 'Transfer' | 'Mitigate'
  mitigationPlan?: string
  responsibleParty: string
  targetDate?: string
  status: 'Identified' | 'Analyzing' | 'Mitigating' | 'Monitoring' | 'Closed'
  lastAssessed: string
  relatedControls?: string[]
  contingencyPlan?: string
}

// interface RiskTrend {
//   month: string
//   high: number
//   moderate: number
//   low: number
// }

interface RiskManagementProps {
  risks?: RiskItem[]
  onUpdate?: (risks: RiskItem[]) => Promise<void>
}

export function RiskManagement({ risks = [], onUpdate }: RiskManagementProps) {
  const [localRisks, setLocalRisks] = useState<RiskItem[]>(risks)
  const [editingRisk, setEditingRisk] = useState<string | null>(null)
  const [selectedRisk, setSelectedRisk] = useState<RiskItem | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'matrix'>('grid')
  // const trends = []  // Unused parameter

  const calculateRiskScore = (likelihood: string, impact: string): number => {
    const likelihoodScore = { 'Very Low': 1, 'Low': 2, 'Moderate': 3, 'High': 4, 'Very High': 5 }
    const impactScore = { 'Very Low': 1, 'Low': 2, 'Moderate': 3, 'High': 4, 'Very High': 5 }
    return (likelihoodScore[likelihood as keyof typeof likelihoodScore] || 1) * 
           (impactScore[impact as keyof typeof impactScore] || 1)
  }

  const getRiskLevel = (score: number): string => {
    if (score >= 20) return 'Critical'
    if (score >= 15) return 'High'
    if (score >= 10) return 'Moderate'
    if (score >= 5) return 'Low'
    return 'Very Low'
  }

  const getRiskColor = (score: number): string => {
    const level = getRiskLevel(score)
    switch (level) {
      case 'Critical': return 'bg-red-600'
      case 'High': return 'bg-red-500'
      case 'Moderate': return 'bg-yellow-500'
      case 'Low': return 'bg-green-500'
      case 'Very Low': return 'bg-green-600'
      default: return 'bg-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Identified': return <AlertCircle className="h-4 w-4 text-blue-500" />
      case 'Analyzing': return <Activity className="h-4 w-4 text-yellow-500" />
      case 'Mitigating': return <Shield className="h-4 w-4 text-orange-500" />
      case 'Monitoring': return <Clock className="h-4 w-4 text-purple-500" />
      case 'Closed': return <CheckCircle className="h-4 w-4 text-green-500" />
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const addRisk = () => {
    const newRisk: RiskItem = {
      id: `risk-${Date.now()}`,
      riskId: `RISK-${localRisks.length + 1}`,
      title: 'New Risk',
      description: '',
      category: 'Technical',
      source: '',
      likelihood: 'Moderate',
      impact: 'Moderate',
      inherentRiskScore: 9,
      currentControls: [],
      residualLikelihood: 'Low',
      residualImpact: 'Low',
      residualRiskScore: 4,
      riskResponse: 'Mitigate',
      responsibleParty: '',
      status: 'Identified',
      lastAssessed: new Date().toISOString()
    }
    setLocalRisks([...localRisks, newRisk])
    setEditingRisk(newRisk.id)
  }

  const updateRisk = (id: string, updates: Partial<RiskItem>) => {
    setLocalRisks(localRisks.map(r => {
      if (r.id === id) {
        const updated = { ...r, ...updates }
        if (updates.likelihood || updates.impact) {
          updated.inherentRiskScore = calculateRiskScore(
            updated.likelihood,
            updated.impact
          )
        }
        if (updates.residualLikelihood || updates.residualImpact) {
          updated.residualRiskScore = calculateRiskScore(
            updated.residualLikelihood,
            updated.residualImpact
          )
        }
        updated.lastAssessed = new Date().toISOString()
        return updated
      }
      return r
    }))
  }

  const deleteRisk = (id: string) => {
    setLocalRisks(localRisks.filter(r => r.id !== id))
    if (selectedRisk?.id === id) setSelectedRisk(null)
  }

  const handleSaveRisk = async () => {
    if (onUpdate) {
      await onUpdate(localRisks)
    }
    setEditingRisk(null)
  }

  const riskStats = {
    total: localRisks.length,
    critical: localRisks.filter(r => getRiskLevel(r.residualRiskScore) === 'Critical').length,
    high: localRisks.filter(r => getRiskLevel(r.residualRiskScore) === 'High').length,
    moderate: localRisks.filter(r => getRiskLevel(r.residualRiskScore) === 'Moderate').length,
    low: localRisks.filter(r => getRiskLevel(r.residualRiskScore) === 'Low' || getRiskLevel(r.residualRiskScore) === 'Very Low').length,
    mitigated: localRisks.filter(r => r.status === 'Closed' || r.status === 'Monitoring').length
  }

  const RiskMatrix = () => {
    const matrix: { [key: string]: RiskItem[] } = {}
    const likelihoods = ['Very High', 'High', 'Moderate', 'Low', 'Very Low']
    const impacts = ['Very Low', 'Low', 'Moderate', 'High', 'Very High']
    
    likelihoods.forEach(l => {
      impacts.forEach(i => {
        matrix[`${l}-${i}`] = localRisks.filter(
          r => r.residualLikelihood === l && r.residualImpact === i
        )
      })
    })

    return (
      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          <div className="grid grid-cols-6 gap-1">
            <div className="p-2 text-sm font-medium">Likelihood ↓</div>
            {impacts.map(impact => (
              <div key={impact} className="p-2 text-xs text-center font-medium">
                {impact}
              </div>
            ))}
            {likelihoods.map((likelihood) => (
              <React.Fragment key={likelihood}>
                <div className="p-2 text-xs font-medium">{likelihood}</div>
                {impacts.map((impact) => {
                  const cellRisks = matrix[`${likelihood}-${impact}`]
                  const score = calculateRiskScore(likelihood, impact)
                  return (
                    <div
                      key={`${likelihood}-${impact}`}
                      className={cn(
                        "p-2 border rounded cursor-pointer transition-all hover:opacity-80",
                        getRiskColor(score),
                        "bg-opacity-20 hover:bg-opacity-30"
                      )}
                      onClick={() => cellRisks.length > 0 && setSelectedRisk(cellRisks[0])}
                    >
                      <div className="text-center">
                        <div className="text-xs font-bold">{cellRisks.length}</div>
                        {cellRisks.length > 0 && (
                          <div className="text-xs opacity-75">risks</div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </React.Fragment>
            ))}
          </div>
          <div className="mt-2 text-center text-xs text-muted-foreground">
            Impact →
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Risk Management & Analysis
            </CardTitle>
            <CardDescription>
              Identify, assess, and manage system risks with mitigation strategies
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setViewMode(viewMode === 'grid' ? 'matrix' : 'grid')}
              variant="outline"
              size="sm"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              {viewMode === 'grid' ? 'Risk Matrix' : 'Risk List'}
            </Button>
            <Button onClick={addRisk} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Risk
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Risk Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="border-t-4 border-blue-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Total Risks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{riskStats.total}</div>
            </CardContent>
          </Card>
          <Card className="border-t-4 border-red-600">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Critical</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{riskStats.critical}</div>
            </CardContent>
          </Card>
          <Card className="border-t-4 border-red-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">High</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{riskStats.high}</div>
            </CardContent>
          </Card>
          <Card className="border-t-4 border-yellow-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Moderate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">{riskStats.moderate}</div>
            </CardContent>
          </Card>
          <Card className="border-t-4 border-green-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Low</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{riskStats.low}</div>
            </CardContent>
          </Card>
        </div>

        {/* View Mode Content */}
        {viewMode === 'matrix' ? (
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Risk Heat Map</h3>
            <RiskMatrix />
          </div>
        ) : (
          <div className="space-y-4">
            {localRisks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No risks identified yet
              </div>
            ) : (
              localRisks.map(risk => (
                <Card key={risk.id} className="overflow-hidden">
                  {editingRisk === risk.id ? (
                    <CardContent className="p-4 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Risk ID</Label>
                          <Input
                            value={risk.riskId}
                            onChange={(e) => updateRisk(risk.id, { riskId: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Title</Label>
                          <Input
                            value={risk.title}
                            onChange={(e) => updateRisk(risk.id, { title: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Category</Label>
                          <select
                            className="w-full h-10 px-3 rounded-md border border-input bg-background"
                            value={risk.category}
                            onChange={(e) => updateRisk(risk.id, { 
                              category: e.target.value as RiskItem['category'] 
                            })}
                          >
                            <option value="Technical">Technical</option>
                            <option value="Operational">Operational</option>
                            <option value="Compliance">Compliance</option>
                            <option value="Financial">Financial</option>
                            <option value="Reputational">Reputational</option>
                          </select>
                        </div>
                        <div>
                          <Label>Status</Label>
                          <select
                            className="w-full h-10 px-3 rounded-md border border-input bg-background"
                            value={risk.status}
                            onChange={(e) => updateRisk(risk.id, { 
                              status: e.target.value as RiskItem['status'] 
                            })}
                          >
                            <option value="Identified">Identified</option>
                            <option value="Analyzing">Analyzing</option>
                            <option value="Mitigating">Mitigating</option>
                            <option value="Monitoring">Monitoring</option>
                            <option value="Closed">Closed</option>
                          </select>
                        </div>
                      </div>
                      
                      <div>
                        <Label>Description</Label>
                        <Textarea
                          value={risk.description}
                          onChange={(e) => updateRisk(risk.id, { description: e.target.value })}
                          rows={3}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-4">
                          <h4 className="text-sm font-medium">Inherent Risk</h4>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label>Likelihood</Label>
                              <select
                                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                                value={risk.likelihood}
                                onChange={(e) => updateRisk(risk.id, { 
                                  likelihood: e.target.value as RiskItem['likelihood'] 
                                })}
                              >
                                <option value="Very Low">Very Low</option>
                                <option value="Low">Low</option>
                                <option value="Moderate">Moderate</option>
                                <option value="High">High</option>
                                <option value="Very High">Very High</option>
                              </select>
                            </div>
                            <div>
                              <Label>Impact</Label>
                              <select
                                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                                value={risk.impact}
                                onChange={(e) => updateRisk(risk.id, { 
                                  impact: e.target.value as RiskItem['impact'] 
                                })}
                              >
                                <option value="Very Low">Very Low</option>
                                <option value="Low">Low</option>
                                <option value="Moderate">Moderate</option>
                                <option value="High">High</option>
                                <option value="Very High">Very High</option>
                              </select>
                            </div>
                          </div>
                          <div className="p-2 bg-muted rounded">
                            <span className="text-sm">Inherent Risk Score: </span>
                            <Badge className={getRiskColor(risk.inherentRiskScore)}>
                              {risk.inherentRiskScore} - {getRiskLevel(risk.inherentRiskScore)}
                            </Badge>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="text-sm font-medium">Residual Risk</h4>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label>Likelihood</Label>
                              <select
                                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                                value={risk.residualLikelihood}
                                onChange={(e) => updateRisk(risk.id, { 
                                  residualLikelihood: e.target.value as RiskItem['residualLikelihood'] 
                                })}
                              >
                                <option value="Very Low">Very Low</option>
                                <option value="Low">Low</option>
                                <option value="Moderate">Moderate</option>
                                <option value="High">High</option>
                                <option value="Very High">Very High</option>
                              </select>
                            </div>
                            <div>
                              <Label>Impact</Label>
                              <select
                                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                                value={risk.residualImpact}
                                onChange={(e) => updateRisk(risk.id, { 
                                  residualImpact: e.target.value as RiskItem['residualImpact'] 
                                })}
                              >
                                <option value="Very Low">Very Low</option>
                                <option value="Low">Low</option>
                                <option value="Moderate">Moderate</option>
                                <option value="High">High</option>
                                <option value="Very High">Very High</option>
                              </select>
                            </div>
                          </div>
                          <div className="p-2 bg-muted rounded">
                            <span className="text-sm">Residual Risk Score: </span>
                            <Badge className={getRiskColor(risk.residualRiskScore)}>
                              {risk.residualRiskScore} - {getRiskLevel(risk.residualRiskScore)}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Risk Response</Label>
                          <select
                            className="w-full h-10 px-3 rounded-md border border-input bg-background"
                            value={risk.riskResponse}
                            onChange={(e) => updateRisk(risk.id, { 
                              riskResponse: e.target.value as RiskItem['riskResponse'] 
                            })}
                          >
                            <option value="Accept">Accept</option>
                            <option value="Avoid">Avoid</option>
                            <option value="Transfer">Transfer</option>
                            <option value="Mitigate">Mitigate</option>
                          </select>
                        </div>
                        <div>
                          <Label>Responsible Party</Label>
                          <Input
                            value={risk.responsibleParty}
                            onChange={(e) => updateRisk(risk.id, { responsibleParty: e.target.value })}
                          />
                        </div>
                      </div>

                      {risk.riskResponse === 'Mitigate' && (
                        <div>
                          <Label>Mitigation Plan</Label>
                          <Textarea
                            value={risk.mitigationPlan || ''}
                            onChange={(e) => updateRisk(risk.id, { mitigationPlan: e.target.value })}
                            placeholder="Describe the mitigation strategy..."
                            rows={3}
                          />
                        </div>
                      )}

                      <div className="flex justify-between">
                        <Button
                          onClick={() => deleteRisk(risk.id)}
                          variant="destructive"
                          size="sm"
                        >
                          Delete Risk
                        </Button>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => setEditingRisk(null)}
                            variant="outline"
                            size="sm"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                          <Button
                            onClick={handleSaveRisk}
                            size="sm"
                          >
                            <Save className="h-4 w-4 mr-1" />
                            Save
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  ) : (
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3">
                          {getStatusIcon(risk.status)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{risk.riskId}</h4>
                              <span className="text-sm">- {risk.title}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{risk.description}</p>
                          </div>
                        </div>
                        <Button
                          onClick={() => setEditingRisk(risk.id)}
                          size="sm"
                          variant="ghost"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                        <div>
                          <span className="text-xs text-muted-foreground">Category</span>
                          <p className="text-sm font-medium">{risk.category}</p>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground">Response</span>
                          <p className="text-sm font-medium">{risk.riskResponse}</p>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground">Owner</span>
                          <p className="text-sm font-medium">{risk.responsibleParty || 'Unassigned'}</p>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground">Status</span>
                          <p className="text-sm font-medium">{risk.status}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Inherent:</span>
                          <Badge className={cn(getRiskColor(risk.inherentRiskScore), "text-xs")}>
                            {risk.inherentRiskScore}
                          </Badge>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Residual:</span>
                          <Badge className={cn(getRiskColor(risk.residualRiskScore), "text-xs")}>
                            {risk.residualRiskScore}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 ml-auto">
                          {risk.inherentRiskScore > risk.residualRiskScore ? (
                            <>
                              <TrendingDown className="h-4 w-4 text-green-500" />
                              <span className="text-xs text-green-500">
                                -{risk.inherentRiskScore - risk.residualRiskScore}
                              </span>
                            </>
                          ) : risk.inherentRiskScore < risk.residualRiskScore ? (
                            <>
                              <TrendingUp className="h-4 w-4 text-red-500" />
                              <span className="text-xs text-red-500">
                                +{risk.residualRiskScore - risk.inherentRiskScore}
                              </span>
                            </>
                          ) : (
                            <span className="text-xs text-muted-foreground">No change</span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))
            )}
          </div>
        )}

        {/* Selected Risk Details (for Matrix view) */}
        {viewMode === 'matrix' && selectedRisk && (
          <Card className="border-primary">
            <CardHeader>
              <CardTitle className="text-base">
                {selectedRisk.riskId} - {selectedRisk.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm">{selectedRisk.description}</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Category:</span> {selectedRisk.category}
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span> {selectedRisk.status}
                </div>
                <div>
                  <span className="text-muted-foreground">Response:</span> {selectedRisk.riskResponse}
                </div>
                <div>
                  <span className="text-muted-foreground">Owner:</span> {selectedRisk.responsibleParty || 'Unassigned'}
                </div>
              </div>
              <Button
                onClick={() => setEditingRisk(selectedRisk.id)}
                size="sm"
                variant="outline"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Risk
              </Button>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  )
}