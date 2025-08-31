import { Packages, getDb } from "@/lib/db"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  ArrowLeft, 
  Shield, 
  Network, 
  AlertTriangle, 
  CheckCircle,
  XCircle,
  AlertCircle,
  ShieldAlert,
} from "lucide-react"
import { SystemBoundary } from "@/app/vulnerability-center/packages/components/system-boundary"
import { ControlImplementation } from "@/app/vulnerability-center/packages/components/control-implementation"
import { RiskManagement } from "@/app/vulnerability-center/packages/components/risk-management"

export const dynamic = "force-dynamic"

// Fake control family data until NIST catalog is provided
const controlFamilies = [
  { id: 'AC', name: 'Access Control', controls: 25, implemented: 18, partial: 4, notImplemented: 3 },
  { id: 'AU', name: 'Audit and Accountability', controls: 16, implemented: 12, partial: 2, notImplemented: 2 },
  { id: 'AT', name: 'Awareness and Training', controls: 6, implemented: 6, partial: 0, notImplemented: 0 },
  { id: 'CM', name: 'Configuration Management', controls: 12, implemented: 8, partial: 3, notImplemented: 1 },
  { id: 'CP', name: 'Contingency Planning', controls: 13, implemented: 10, partial: 2, notImplemented: 1 },
  { id: 'IA', name: 'Identification and Authentication', controls: 12, implemented: 11, partial: 1, notImplemented: 0 },
  { id: 'IR', name: 'Incident Response', controls: 10, implemented: 7, partial: 2, notImplemented: 1 },
  { id: 'MA', name: 'Maintenance', controls: 6, implemented: 5, partial: 1, notImplemented: 0 },
  { id: 'MP', name: 'Media Protection', controls: 8, implemented: 6, partial: 1, notImplemented: 1 },
  { id: 'PE', name: 'Physical and Environmental Protection', controls: 20, implemented: 18, partial: 1, notImplemented: 1 },
  { id: 'PL', name: 'Planning', controls: 9, implemented: 8, partial: 1, notImplemented: 0 },
  { id: 'PS', name: 'Personnel Security', controls: 8, implemented: 8, partial: 0, notImplemented: 0 },
  { id: 'RA', name: 'Risk Assessment', controls: 7, implemented: 5, partial: 1, notImplemented: 1 },
  { id: 'CA', name: 'Security Assessment and Authorization', controls: 9, implemented: 7, partial: 1, notImplemented: 1 },
  { id: 'SC', name: 'System and Communications Protection', controls: 44, implemented: 35, partial: 6, notImplemented: 3 },
  { id: 'SI', name: 'System and Information Integrity', controls: 17, implemented: 14, partial: 2, notImplemented: 1 },
  { id: 'SA', name: 'System and Services Acquisition', controls: 22, implemented: 18, partial: 3, notImplemented: 1 },
]

export default async function NistRmfPackagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: pid } = await params
  const id = Number(pid)
  const pkg = Packages.get(id)
  
  if (!pkg) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="text-sm text-muted-foreground">Package not found.</div>
          <Link href="/nist-rmf"><Button variant="outline">Back to NIST RMF</Button></Link>
        </div>
      </div>
    )
  }

  // Get real STIG-based control data
  const controlStats = getDb().prepare(`
    SELECT 
      COUNT(DISTINCT f.rule_id) as total_controls,
      COUNT(DISTINCT CASE WHEN LOWER(f.status) IN ('not_a_finding', 'not_applicable') THEN f.rule_id END) as implemented,
      COUNT(DISTINCT CASE WHEN LOWER(f.status) = 'open' THEN f.rule_id END) as open,
      COUNT(DISTINCT CASE WHEN LOWER(f.status) = 'not_reviewed' THEN f.rule_id END) as not_reviewed
    FROM stig_findings f
    JOIN systems s ON s.id = f.system_id
    WHERE s.package_id = ?
  `).get(id) as { 
    total_controls: number, 
    implemented: number, 
    open: number,
    not_reviewed: number 
  } | undefined

  // Get vulnerability impact on controls
  const vulnerabilityImpact = getDb().prepare(`
    SELECT 
      f.severity,
      COUNT(DISTINCT f.rule_id) as affected_controls,
      COUNT(*) as total_findings
    FROM stig_findings f
    JOIN systems s ON s.id = f.system_id
    WHERE s.package_id = ? AND LOWER(f.status) IN ('open', 'not_reviewed')
    GROUP BY f.severity
  `).all(id) as { severity: string, affected_controls: number, total_findings: number }[]

  const complianceScore = controlStats && controlStats.total_controls > 0
    ? Math.round((controlStats.implemented / controlStats.total_controls) * 100)
    : 0

  // Calculate totals for control families (using fake data for now)
  const totalControls = controlFamilies.reduce((sum, fam) => sum + fam.controls, 0)
  const totalImplemented = controlFamilies.reduce((sum, fam) => sum + fam.implemented, 0)
  const totalPartial = controlFamilies.reduce((sum, fam) => sum + fam.partial, 0)
  const totalNotImplemented = controlFamilies.reduce((sum, fam) => sum + fam.notImplemented, 0)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="rounded-md border bg-card text-card-foreground p-5">
        <div className="mb-3">
          <Button asChild variant="outline" size="sm">
            <Link href="/nist-rmf">
              <ArrowLeft className="h-4 w-4" />
              Back to NIST RMF
            </Link>
          </Button>
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Shield className="h-6 w-6" />
              {pkg.name} - RMF Management
            </h2>
            <p className="text-sm text-muted-foreground">{pkg.description || "Risk Management Framework controls and compliance"}</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="px-3 py-1">
              {pkg.authorization_status || 'Not Started'}
            </Badge>
            <Badge className={complianceScore >= 80 ? 'bg-green-500' : complianceScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'}>
              {complianceScore}% Compliant
            </Badge>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-t-4 border-blue-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Total Controls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{controlStats?.total_controls ?? 0}</div>
            <p className="text-xs text-muted-foreground">Across all systems</p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-green-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Implemented
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{controlStats?.implemented ?? 0}</div>
            <Progress value={complianceScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="border-t-4 border-yellow-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Under Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{controlStats?.not_reviewed ?? 0}</div>
            <p className="text-xs text-muted-foreground">Pending assessment</p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-red-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              Open Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{controlStats?.open ?? 0}</div>
            <p className="text-xs text-muted-foreground">Requires remediation</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="controls" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="controls" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Controls
          </TabsTrigger>
          <TabsTrigger value="risks" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Risks
          </TabsTrigger>
          <TabsTrigger value="boundary" className="flex items-center gap-2">
            <Network className="h-4 w-4" />
            System Boundary
          </TabsTrigger>
        </TabsList>

        {/* Controls Tab */}
        <TabsContent value="controls" className="space-y-6">
          {/* Vulnerability Impact on Controls */}
          {vulnerabilityImpact.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Vulnerability Impact on Controls</CardTitle>
                <CardDescription>How current vulnerabilities affect control implementation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {vulnerabilityImpact.map(impact => (
                    <div key={impact.severity} className="p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium capitalize">
                          {impact.severity || 'Unknown'} Severity
                        </span>
                        <ShieldAlert className={`h-4 w-4 ${
                          impact.severity?.toLowerCase().includes('high') || impact.severity?.toLowerCase().includes('cat i') ? 'text-red-500' :
                          impact.severity?.toLowerCase().includes('medium') || impact.severity?.toLowerCase().includes('cat ii') ? 'text-yellow-500' :
                          'text-green-500'
                        }`} />
                      </div>
                      <div className="text-2xl font-bold">{impact.affected_controls}</div>
                      <p className="text-xs text-muted-foreground">
                        Controls affected ({impact.total_findings} findings)
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Control Families Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Control Families</CardTitle>
              <CardDescription>NIST 800-53 control implementation by family</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {controlFamilies.map(family => {
                  const familyScore = family.controls > 0 
                    ? Math.round((family.implemented / family.controls) * 100)
                    : 0
                  
                  return (
                    <div key={family.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{family.id}</Badge>
                          <span className="text-sm font-medium">{family.name}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            <span>{family.implemented}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <AlertCircle className="h-3 w-3 text-yellow-500" />
                            <span>{family.partial}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <XCircle className="h-3 w-3 text-red-500" />
                            <span>{family.notImplemented}</span>
                          </div>
                          <Badge className={
                            familyScore >= 80 ? 'bg-green-500' : 
                            familyScore >= 60 ? 'bg-yellow-500' : 
                            'bg-red-500'
                          }>
                            {familyScore}%
                          </Badge>
                        </div>
                      </div>
                      <Progress value={familyScore} className="h-2" />
                    </div>
                  )
                })}
              </div>

              {/* Summary */}
              <div className="mt-6 pt-6 border-t">
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold">{totalControls}</div>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{totalImplemented}</div>
                    <p className="text-xs text-muted-foreground">Implemented</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-600">{totalPartial}</div>
                    <p className="text-xs text-muted-foreground">Partial</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">{totalNotImplemented}</div>
                    <p className="text-xs text-muted-foreground">Not Implemented</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Control Implementation Component */}
          <ControlImplementation />
        </TabsContent>

        {/* Risks Tab */}
        <TabsContent value="risks">
          <RiskManagement />
        </TabsContent>

        {/* System Boundary Tab */}
        <TabsContent value="boundary">
          <SystemBoundary />
        </TabsContent>
      </Tabs>
    </div>
  )
}