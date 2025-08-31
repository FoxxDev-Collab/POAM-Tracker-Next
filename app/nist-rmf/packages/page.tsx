import { Packages, getDb } from "@/lib/db"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  ArrowRight,
} from "lucide-react"

export const dynamic = "force-dynamic"

export default async function NistRmfPage() {
  const packages = Packages.all()
  
  // Get aggregated stats for each package
  const packageStats = packages.map(pkg => {
    // Get control implementation stats
    const controlStats = getDb().prepare(`
      SELECT 
        COUNT(DISTINCT f.rule_id) as total_controls,
        COUNT(DISTINCT CASE WHEN LOWER(f.status) IN ('not_a_finding', 'not_applicable') THEN f.rule_id END) as implemented_controls,
        COUNT(DISTINCT CASE WHEN LOWER(f.status) IN ('open', 'not_reviewed') THEN f.rule_id END) as open_controls
      FROM stig_findings f
      JOIN systems s ON s.id = f.system_id
      WHERE s.package_id = ?
    `).get(pkg.id) as { total_controls: number, implemented_controls: number, open_controls: number } | undefined

    // Get risk metrics
    const riskStats = getDb().prepare(`
      SELECT 
        COUNT(CASE WHEN LOWER(f.severity) IN ('high', 'cat i', 'cat1') THEN 1 END) as high_risks,
        COUNT(CASE WHEN LOWER(f.severity) IN ('medium', 'cat ii', 'cat2') THEN 1 END) as medium_risks,
        COUNT(CASE WHEN LOWER(f.severity) IN ('low', 'cat iii', 'cat3') THEN 1 END) as low_risks
      FROM stig_findings f
      JOIN systems s ON s.id = f.system_id
      WHERE s.package_id = ? AND LOWER(f.status) IN ('open', 'not_reviewed')
    `).get(pkg.id) as { high_risks: number, medium_risks: number, low_risks: number } | undefined

    const complianceScore = controlStats && controlStats.total_controls > 0
      ? Math.round((controlStats.implemented_controls / controlStats.total_controls) * 100)
      : 0

    return {
      ...pkg,
      totalControls: controlStats?.total_controls ?? 0,
      implementedControls: controlStats?.implemented_controls ?? 0,
      openControls: controlStats?.open_controls ?? 0,
      complianceScore,
      highRisks: riskStats?.high_risks ?? 0,
      mediumRisks: riskStats?.medium_risks ?? 0,
      lowRisks: riskStats?.low_risks ?? 0,
      totalRisks: (riskStats?.high_risks ?? 0) + (riskStats?.medium_risks ?? 0) + (riskStats?.low_risks ?? 0)
    }
  })

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    if (score >= 50) return 'text-orange-600'
    return 'text-red-600'
  }

  const getScoreBadgeClass = (score: number) => {
    if (score >= 90) return 'bg-green-500'
    if (score >= 70) return 'bg-yellow-500'
    if (score >= 50) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const getAuthStatusIcon = (status: string | null | undefined) => {
    switch (status) {
      case 'Authorized': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'In Progress': return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 'Expired': return <XCircle className="h-4 w-4 text-red-500" />
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Shield className="h-8 w-8" />
          NIST Risk Management Framework
        </h1>
        <p className="text-muted-foreground">
          Manage security controls, assess risks, and maintain compliance with NIST RMF requirements
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Packages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{packages.length}</div>
            <p className="text-xs text-muted-foreground">Active ATO packages</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Controls Tracked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {packageStats.reduce((sum, pkg) => sum + pkg.totalControls, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Across all packages</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Average Compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(
              packages.length > 0 
                ? packageStats.reduce((sum, pkg) => sum + pkg.complianceScore, 0) / packages.length
                : 0
            )}`}>
              {packages.length > 0 
                ? Math.round(packageStats.reduce((sum, pkg) => sum + pkg.complianceScore, 0) / packages.length)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Control implementation</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Risks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {packageStats.reduce((sum, pkg) => sum + pkg.totalRisks, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Open risk items</p>
          </CardContent>
        </Card>
      </div>

      {/* Package Cards */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Select ATO Package</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {packageStats.map(pkg => (
            <Card key={pkg.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{pkg.name}</CardTitle>
                    <CardDescription>{pkg.description || 'No description'}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {getAuthStatusIcon(pkg.authorization_status)}
                    <Badge variant="outline">
                      {pkg.authorization_status || 'Not Started'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Compliance Score */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Control Compliance</span>
                    <span className={`font-bold ${getScoreColor(pkg.complianceScore)}`}>
                      {pkg.complianceScore}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getScoreBadgeClass(pkg.complianceScore)}`}
                      style={{ width: `${pkg.complianceScore}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{pkg.implementedControls} implemented</span>
                    <span>{pkg.openControls} open</span>
                    <span>{pkg.totalControls} total</span>
                  </div>
                </div>

                {/* Risk Summary */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Risk Profile</span>
                    <Badge variant="outline" className="text-xs">
                      {pkg.totalRisks} Total Risks
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 bg-red-50 dark:bg-red-950/20 rounded">
                      <div className="text-lg font-bold text-red-600">{pkg.highRisks}</div>
                      <div className="text-xs text-muted-foreground">High</div>
                    </div>
                    <div className="p-2 bg-yellow-50 dark:bg-yellow-950/20 rounded">
                      <div className="text-lg font-bold text-yellow-600">{pkg.mediumRisks}</div>
                      <div className="text-xs text-muted-foreground">Medium</div>
                    </div>
                    <div className="p-2 bg-green-50 dark:bg-green-950/20 rounded">
                      <div className="text-lg font-bold text-green-600">{pkg.lowRisks}</div>
                      <div className="text-xs text-muted-foreground">Low</div>
                    </div>
                  </div>
                </div>

                {/* System Info */}
                <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Impact Level:</span>{' '}
                    <Badge variant="outline" className="ml-1">
                      {pkg.overall_categorization || 'Not Set'}
                    </Badge>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Baseline:</span>{' '}
                    <Badge variant="outline" className="ml-1">
                      {pkg.security_control_baseline || 'Not Set'}
                    </Badge>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button asChild className="flex-1">
                    <Link href={`/nist-rmf/${pkg.id}`}>
                      <Shield className="h-4 w-4 mr-2" />
                      Manage RMF
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {packages.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No ATO packages found. Create a package first.</p>
              <Button asChild className="mt-4">
                <Link href="/vulnerability-center/packages">Go to Packages</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}