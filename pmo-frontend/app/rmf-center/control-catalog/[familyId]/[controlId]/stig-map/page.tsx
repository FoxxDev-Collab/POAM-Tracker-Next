"use client"

import React, { useState, useEffect } from "react"
import { useParams, useSearchParams } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft, Shield, Server, Users,
  CheckCircle, Download, RefreshCw, ExternalLink,
  TrendingDown, TrendingUp, ChevronDown
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface SystemFindings {
  systemId: number
  systemName: string
  totalFindings: number
  openFindings: number
  catIOpen: number
  catIIOpen: number
  catIIIOpen: number
  status: 'Compliant' | 'Non-Compliant' | 'Partially Compliant'
  lastScanned: string
  complianceScore: number
}

interface GroupFindings {
  groupId: number
  groupName: string
  totalFindings: number
  openFindings: number
  catIOpen: number
  catIIOpen: number
  catIIIOpen: number
  systemCount: number
  compliantSystems: number
  status: 'Compliant' | 'Non-Compliant' | 'Partially Compliant'
  complianceScore: number
  systems: SystemFindings[]
}

interface PackageControlFindings {
  controlId: string
  controlName: string
  packageId: number
  packageName: string
  totalFindings: number
  openFindings: number
  totalSystems: number
  affectedSystems: number
  groups: GroupFindings[]
  overallCompliance: number
  lastUpdated: string
}

const CONTROL_FAMILIES = [
  { id: "AC", name: "Access Control", icon: Shield },
  { id: "AT", name: "Awareness and Training", icon: Shield },
  { id: "AU", name: "Audit and Accountability", icon: Shield },
  { id: "CA", name: "Assessment, Authorization, and Monitoring", icon: CheckCircle },
  { id: "CM", name: "Configuration Management", icon: Shield },
  { id: "CP", name: "Contingency Planning", icon: AlertTriangle },
  { id: "IA", name: "Identification and Authentication", icon: Shield },
  { id: "IR", name: "Incident Response", icon: AlertTriangle },
  { id: "MA", name: "Maintenance", icon: Shield },
  { id: "MP", name: "Media Protection", icon: Shield },
  { id: "PE", name: "Physical and Environmental Protection", icon: Shield },
  { id: "PL", name: "Planning", icon: Shield },
  { id: "PM", name: "Program Management", icon: Shield },
  { id: "PS", name: "Personnel Security", icon: Shield },
  { id: "PT", name: "Personally Identifiable Information Processing", icon: Shield },
  { id: "RA", name: "Risk Assessment", icon: AlertTriangle },
  { id: "SA", name: "System and Services Acquisition", icon: Shield },
  { id: "SC", name: "System and Communications Protection", icon: Shield },
  { id: "SI", name: "System and Information Integrity", icon: CheckCircle },
  { id: "SR", name: "Supply Chain Risk Management", icon: Shield }
]

export default function ControlStigMapPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const familyId = params.familyId as string
  const controlId = params.controlId as string
  const packageId = searchParams.get('packageId')

  const [loading, setLoading] = useState(true)
  const [findings, setFindings] = useState<PackageControlFindings | null>(null)
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set())

  const family = CONTROL_FAMILIES.find(f => f.id === familyId)
  const FamilyIcon = family?.icon || Shield

  const fetchControlFindings = async () => {
    if (!packageId || !controlId) return

    setLoading(true)
    try {
      const response = await fetch(`/api/catalog/controls/${controlId}/package-findings?packageId=${packageId}`)
      if (response.ok) {
        const data = await response.json()
        setFindings(data.data)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch STIG findings",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Failed to fetch findings:', error)
      toast({
        title: "Error",
        description: "Failed to fetch STIG findings",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (packageId && controlId) {
      fetchControlFindings()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [packageId, controlId])

  const toggleGroup = (groupId: number) => {
    const newExpanded = new Set(expandedGroups)
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId)
    } else {
      newExpanded.add(groupId)
    }
    setExpandedGroups(newExpanded)
  }

  const getStatusBadge = (status: string, score: number): JSX.Element => {
    if (status === 'Compliant') {
      return <Badge className="bg-green-500">Compliant ({score}%)</Badge>
    } else if (status === 'Partially Compliant') {
      return <Badge className="bg-yellow-500">Partially Compliant ({score}%)</Badge>
    } else {
      return <Badge variant="destructive">Non-Compliant ({score}%)</Badge>
    }
  }


  if (!packageId) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Please select a package to view STIG findings.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href={`/rmf-center/control-catalog/${familyId}/${controlId}?packageId=${packageId}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <FamilyIcon className="h-8 w-8 text-primary" />
              {controlId} - STIG Findings Map
            </h1>
            <p className="text-muted-foreground mt-1">
              Groups and systems with STIG findings for this control
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchControlFindings}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" disabled>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : findings ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Findings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{findings.totalFindings}</div>
                <div className="text-xs text-muted-foreground">
                  {findings.openFindings} open
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Affected Systems
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{findings.affectedSystems}</div>
                <div className="text-xs text-muted-foreground">
                  of {findings.totalSystems} total
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Compliance Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold flex items-center gap-2">
                  {findings.overallCompliance}%
                  {findings.overallCompliance >= 90 ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                </div>
                <Progress value={findings.overallCompliance} className="h-2 mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Groups Affected
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{findings.groups.length}</div>
                <div className="text-xs text-muted-foreground">
                  requiring attention
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Groups and Systems Table */}
          <Card>
            <CardHeader>
              <CardTitle>Groups and Systems Detail</CardTitle>
              <CardDescription>
                Detailed breakdown of STIG findings by group and system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {findings.groups.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No STIG findings found for this control across any systems.
                  </div>
                ) : (
                  <div className="rounded-md border overflow-hidden">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="min-w-[250px]">Group / System</TableHead>
                            <TableHead className="min-w-[140px] text-center">STIG Findings</TableHead>
                            <TableHead className="min-w-[200px] text-center">Severity Breakdown</TableHead>
                            <TableHead className="min-w-[140px] text-center">Compliance</TableHead>
                            <TableHead className="min-w-[120px] text-center">Last Scanned</TableHead>
                            <TableHead className="min-w-[100px] text-center">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                      <TableBody>
                        {findings.groups.map((group) => (
                          <React.Fragment key={group.groupId}>
                            {/* Group Row */}
                            <TableRow className="bg-muted/50 hover:bg-muted/70">
                              <TableCell className="py-4">
                                <button
                                  className="flex items-center gap-3 w-full text-left hover:text-primary p-2 rounded-md hover:bg-background/50"
                                  onClick={() => toggleGroup(group.groupId)}
                                >
                                  <ChevronDown
                                    className={`h-4 w-4 text-muted-foreground transition-transform ${
                                      expandedGroups.has(group.groupId) ? 'rotate-180' : ''
                                    }`}
                                  />
                                  <Users className="h-5 w-5 text-blue-600" />
                                  <div className="flex-1">
                                    <div className="font-semibold text-base">{group.groupName}</div>
                                    <div className="text-sm text-muted-foreground mt-1">
                                      {group.systemCount} systems • {group.compliantSystems} compliant
                                    </div>
                                  </div>
                                </button>
                              </TableCell>
                              <TableCell className="text-center py-4">
                                <div className="space-y-1">
                                  <div className="font-semibold text-base">
                                    <span className={group.openFindings > 0 ? "text-red-600" : "text-green-600"}>
                                      {group.openFindings}
                                    </span>
                                    <span className="text-muted-foreground text-sm"> / {group.totalFindings}</span>
                                  </div>
                                  <div className="text-xs text-muted-foreground">open / total</div>
                                </div>
                              </TableCell>
                              <TableCell className="text-center py-4">
                                <div className="flex flex-wrap justify-center gap-1">
                                  {group.catIOpen > 0 && (
                                    <Badge variant="destructive" className="text-xs">
                                      CAT I: {group.catIOpen}
                                    </Badge>
                                  )}
                                  {group.catIIOpen > 0 && (
                                    <Badge className="bg-orange-500 hover:bg-orange-600 text-white text-xs">
                                      CAT II: {group.catIIOpen}
                                    </Badge>
                                  )}
                                  {group.catIIIOpen > 0 && (
                                    <Badge className="bg-yellow-500 hover:bg-yellow-600 text-black text-xs">
                                      CAT III: {group.catIIIOpen}
                                    </Badge>
                                  )}
                                  {group.openFindings === 0 && (
                                    <Badge className="bg-green-500 hover:bg-green-600 text-white text-xs">
                                      All Clear
                                    </Badge>
                                  )}
                                  {group.openFindings > 0 && group.catIOpen === 0 && group.catIIOpen === 0 && group.catIIIOpen === 0 && (
                                    <Badge variant="secondary" className="text-xs">
                                      {group.openFindings} Open (No CAT)
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-center py-4">
                                {getStatusBadge(group.status, group.complianceScore)}
                              </TableCell>
                              <TableCell className="text-center py-4">
                                <span className="text-sm text-muted-foreground">Group Level</span>
                              </TableCell>
                              <TableCell className="text-center py-4">
                                <Link href={`/vulnerability-center/vulnerabilities/${packageId}/groups/${group.groupId}`}>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <ExternalLink className="h-4 w-4" />
                                  </Button>
                                </Link>
                              </TableCell>
                            </TableRow>

                            {/* System Rows */}
                            {expandedGroups.has(group.groupId) && group.systems.map((system) => (
                                  <TableRow key={system.systemId} className="bg-background hover:bg-muted/30">
                                    <TableCell className="pl-12 py-3">
                                      <div className="flex items-center gap-3">
                                        <Server className="h-4 w-4 text-orange-600" />
                                        <div>
                                          <div className="font-medium text-sm">{system.systemName}</div>
                                          <div className="text-xs text-muted-foreground">ID: {system.systemId}</div>
                                        </div>
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-center py-3">
                                      <div className="space-y-1">
                                        <div className="font-medium text-sm">
                                          <span className={system.openFindings > 0 ? "text-red-600" : "text-green-600"}>
                                            {system.openFindings}
                                          </span>
                                          <span className="text-muted-foreground text-xs"> / {system.totalFindings}</span>
                                        </div>
                                        <div className="text-xs text-muted-foreground">open / total</div>
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-center py-3">
                                      <div className="flex flex-wrap justify-center gap-1">
                                        {system.catIOpen > 0 && (
                                          <Badge variant="destructive" className="text-xs">
                                            CAT I: {system.catIOpen}
                                          </Badge>
                                        )}
                                        {system.catIIOpen > 0 && (
                                          <Badge className="bg-orange-500 hover:bg-orange-600 text-white text-xs">
                                            CAT II: {system.catIIOpen}
                                          </Badge>
                                        )}
                                        {system.catIIIOpen > 0 && (
                                          <Badge className="bg-yellow-500 hover:bg-yellow-600 text-black text-xs">
                                            CAT III: {system.catIIIOpen}
                                          </Badge>
                                        )}
                                        {system.openFindings === 0 && (
                                          <Badge className="bg-green-500 hover:bg-green-600 text-white text-xs">
                                            All Clear
                                          </Badge>
                                        )}
                                        {system.openFindings > 0 && system.catIOpen === 0 && system.catIIOpen === 0 && system.catIIIOpen === 0 && (
                                          <Badge variant="secondary" className="text-xs">
                                            {system.openFindings} Open (No CAT)
                                          </Badge>
                                        )}
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-center py-3">
                                      {getStatusBadge(system.status, system.complianceScore)}
                                    </TableCell>
                                    <TableCell className="text-center py-3">
                                      <span className="text-sm text-muted-foreground">
                                        {new Date(system.lastScanned).toLocaleDateString()}
                                      </span>
                                    </TableCell>
                                    <TableCell className="text-center py-3">
                                      <Link href={`/vulnerability-center/vulnerabilities/systems/${system.systemId}/stig`}>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                          <ExternalLink className="h-4 w-4" />
                                        </Button>
                                      </Link>
                                    </TableCell>
                                  </TableRow>
                                ))}
                          </React.Fragment>
                        ))}
                      </TableBody>
                    </Table>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No STIG findings data available for this control.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}