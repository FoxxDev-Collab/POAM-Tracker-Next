"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Activity,
  FileText,
  User,
  BarChart3,
  Target,
  AlertCircle,
  RefreshCw
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { PackageRow } from "@/lib/db"

interface ComplianceMetrics {
  overallScore: number
  controlsImplemented: number
  controlsTotal: number
  openFindings: number
  criticalFindings: number
  highFindings: number
  mediumFindings: number
  lowFindings: number
  poamItems: number
  poamOverdue: number
  riskScore: number
  lastAssessment?: string
  nextAssessment?: string
  continuousMonitoring: 'Active' | 'Partial' | 'Inactive'
  scanFrequency: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly'
  complianceFrameworks: string[]
}

interface ComplianceTrend {
  date: string
  score: number
  findings: number
  risks: number
}

interface ComplianceDashboardProps {
  packageData: PackageRow
  metrics?: ComplianceMetrics
  trends?: ComplianceTrend[]
  onRefresh?: () => Promise<void>
}

export function ComplianceDashboard({ 
  packageData, 
  metrics = {
    overallScore: 0,
    controlsImplemented: 0,
    controlsTotal: 0,
    openFindings: 0,
    criticalFindings: 0,
    highFindings: 0,
    mediumFindings: 0,
    lowFindings: 0,
    poamItems: 0,
    poamOverdue: 0,
    riskScore: 0,
    continuousMonitoring: 'Inactive',
    scanFrequency: 'Monthly',
    complianceFrameworks: ['NIST 800-53', 'FedRAMP']
  },
  trends = [],
  onRefresh
}: ComplianceDashboardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    if (score >= 50) return 'text-orange-600'
    return 'text-red-600'
  }

  const getScoreGrade = (score: number) => {
    if (score >= 90) return 'A'
    if (score >= 80) return 'B'
    if (score >= 70) return 'C'
    if (score >= 60) return 'D'
    return 'F'
  }

  const getAuthStatusIcon = (status: string | null | undefined) => {
    switch (status) {
      case 'Authorized': return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'In Progress': return <Clock className="h-5 w-5 text-yellow-500" />
      case 'Expired': return <XCircle className="h-5 w-5 text-red-500" />
      case 'Denied': return <XCircle className="h-5 w-5 text-red-600" />
      case 'Reauthorization Required': return <AlertCircle className="h-5 w-5 text-orange-500" />
      default: return <AlertCircle className="h-5 w-5 text-gray-500" />
    }
  }

  const getMonitoringColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-500'
      case 'Partial': return 'bg-yellow-500'
      case 'Inactive': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const controlsPercentage = metrics.controlsTotal > 0 
    ? Math.round((metrics.controlsImplemented / metrics.controlsTotal) * 100)
    : 0

  const findingsReduction = trends.length >= 2
    ? trends[0].findings - trends[trends.length - 1].findings
    : 0

  const scoreChange = trends.length >= 2
    ? trends[trends.length - 1].score - trends[0].score
    : 0

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Compliance & Security Dashboard
              </CardTitle>
              <CardDescription>
                Real-time compliance status and security metrics for {packageData.name}
              </CardDescription>
            </div>
            {onRefresh && (
              <Button onClick={onRefresh} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Overall Compliance Score */}
            <div className="flex flex-col items-center justify-center p-6 bg-muted/50 rounded-lg">
              <div className="text-5xl font-bold mb-2">
                <span className={getScoreColor(metrics.overallScore)}>
                  {metrics.overallScore}%
                </span>
              </div>
              <div className="text-sm text-muted-foreground mb-2">Overall Compliance Score</div>
              <div className="flex items-center gap-2">
                <Badge className={cn(
                  "text-lg px-3 py-1",
                  metrics.overallScore >= 90 ? 'bg-green-500' :
                  metrics.overallScore >= 70 ? 'bg-yellow-500' :
                  metrics.overallScore >= 50 ? 'bg-orange-500' :
                  'bg-red-500'
                )}>
                  Grade: {getScoreGrade(metrics.overallScore)}
                </Badge>
                {scoreChange !== 0 && (
                  <div className="flex items-center gap-1">
                    {scoreChange > 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                    <span className={cn(
                      "text-sm",
                      scoreChange > 0 ? 'text-green-500' : 'text-red-500'
                    )}>
                      {Math.abs(scoreChange)}%
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Authorization Status */}
            <div className="p-6 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium">Authorization Status</h3>
                {getAuthStatusIcon(packageData.authorization_status)}
              </div>
              <div className="space-y-3">
                <div>
                  <Badge className={cn(
                    "mb-2",
                    packageData.authorization_status === 'Authorized' ? 'bg-green-500' :
                    packageData.authorization_status === 'In Progress' ? 'bg-yellow-500' :
                    'bg-red-500'
                  )}>
                    {packageData.authorization_status || 'Not Started'}
                  </Badge>
                </div>
                {packageData.authorization_expiry && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Expires:</span>{' '}
                    <span className="font-medium">
                      {new Date(packageData.authorization_expiry).toLocaleDateString()}
                    </span>
                  </div>
                )}
                <div className="text-sm">
                  <span className="text-muted-foreground">POA&M Status:</span>{' '}
                  <Badge variant={
                    packageData.poam_status === 'Green' ? 'default' : 
                    packageData.poam_status === 'Yellow' ? 'secondary' : 
                    'destructive'
                  }>
                    {packageData.poam_status || 'Not Set'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Key Personnel */}
            <div className="p-6 bg-muted/50 rounded-lg">
              <h3 className="text-sm font-medium mb-4">Key Personnel</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">AO:</span>
                  <span className="font-medium">
                    {packageData.authorizing_official || 'Not Assigned'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">SO:</span>
                  <span className="font-medium">
                    {packageData.system_owner || 'Not Assigned'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">ISSO:</span>
                  <span className="font-medium">
                    {packageData.isso_name || 'Not Assigned'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Security Controls */}
        <Card className="border-t-4 border-blue-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security Controls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">
              {metrics.controlsImplemented}/{metrics.controlsTotal}
            </div>
            <Progress value={controlsPercentage} className="mb-2" />
            <p className="text-xs text-muted-foreground">
              {controlsPercentage}% Implemented
            </p>
          </CardContent>
        </Card>

        {/* Open Findings */}
        <Card className="border-t-4 border-red-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Open Findings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">{metrics.openFindings}</div>
            <div className="grid grid-cols-4 gap-1 text-xs">
              <div className="text-center">
                <div className="font-bold text-red-600">{metrics.criticalFindings}</div>
                <div className="text-muted-foreground">Crit</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-orange-600">{metrics.highFindings}</div>
                <div className="text-muted-foreground">High</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-yellow-600">{metrics.mediumFindings}</div>
                <div className="text-muted-foreground">Med</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-green-600">{metrics.lowFindings}</div>
                <div className="text-muted-foreground">Low</div>
              </div>
            </div>
            {findingsReduction !== 0 && (
              <div className="flex items-center gap-1 mt-2">
                {findingsReduction > 0 ? (
                  <>
                    <TrendingDown className="h-3 w-3 text-green-500" />
                    <span className="text-xs text-green-500">
                      {findingsReduction} reduced
                    </span>
                  </>
                ) : (
                  <>
                    <TrendingUp className="h-3 w-3 text-red-500" />
                    <span className="text-xs text-red-500">
                      {Math.abs(findingsReduction)} increased
                    </span>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* POA&M Items */}
        <Card className="border-t-4 border-yellow-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="h-4 w-4" />
              POA&M Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">{metrics.poamItems}</div>
            {metrics.poamOverdue > 0 && (
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-500">
                  {metrics.poamOverdue} overdue
                </span>
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              Active remediation items
            </p>
          </CardContent>
        </Card>

        {/* Risk Score */}
        <Card className="border-t-4 border-purple-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Risk Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cn(
              "text-2xl font-bold mb-2",
              metrics.riskScore <= 25 ? 'text-green-600' :
              metrics.riskScore <= 50 ? 'text-yellow-600' :
              metrics.riskScore <= 75 ? 'text-orange-600' :
              'text-red-600'
            )}>
              {metrics.riskScore}/100
            </div>
            <Badge className={cn(
              metrics.riskScore <= 25 ? 'bg-green-500' :
              metrics.riskScore <= 50 ? 'bg-yellow-500' :
              metrics.riskScore <= 75 ? 'bg-orange-500' :
              'bg-red-500'
            )}>
              {metrics.riskScore <= 25 ? 'Low' :
               metrics.riskScore <= 50 ? 'Moderate' :
               metrics.riskScore <= 75 ? 'High' :
               'Critical'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Continuous Monitoring & Assessment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Continuous Monitoring</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Status</span>
              <Badge className={getMonitoringColor(metrics.continuousMonitoring)}>
                {metrics.continuousMonitoring}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Scan Frequency</span>
              <Badge variant="outline">{metrics.scanFrequency}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">ConMon Status</span>
              <span className="text-sm font-medium">
                {packageData.continuous_monitoring_status || 'Not Implemented'}
              </span>
            </div>
            {metrics.lastAssessment && (
              <div className="flex items-center justify-between">
                <span className="text-sm">Last Assessment</span>
                <span className="text-sm font-medium">
                  {new Date(metrics.lastAssessment).toLocaleDateString()}
                </span>
              </div>
            )}
            {metrics.nextAssessment && (
              <div className="flex items-center justify-between">
                <span className="text-sm">Next Assessment</span>
                <span className="text-sm font-medium">
                  {new Date(metrics.nextAssessment).toLocaleDateString()}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">System Categorization</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center p-3 bg-muted rounded">
                <div className="text-xs text-muted-foreground mb-1">Confidentiality</div>
                <Badge className={cn(
                  packageData.confidentiality_impact === 'High' ? 'bg-red-500' :
                  packageData.confidentiality_impact === 'Moderate' ? 'bg-yellow-500' :
                  'bg-green-500'
                )}>
                  {packageData.confidentiality_impact || 'Not Set'}
                </Badge>
              </div>
              <div className="text-center p-3 bg-muted rounded">
                <div className="text-xs text-muted-foreground mb-1">Integrity</div>
                <Badge className={cn(
                  packageData.integrity_impact === 'High' ? 'bg-red-500' :
                  packageData.integrity_impact === 'Moderate' ? 'bg-yellow-500' :
                  'bg-green-500'
                )}>
                  {packageData.integrity_impact || 'Not Set'}
                </Badge>
              </div>
              <div className="text-center p-3 bg-muted rounded">
                <div className="text-xs text-muted-foreground mb-1">Availability</div>
                <Badge className={cn(
                  packageData.availability_impact === 'High' ? 'bg-red-500' :
                  packageData.availability_impact === 'Moderate' ? 'bg-yellow-500' :
                  'bg-green-500'
                )}>
                  {packageData.availability_impact || 'Not Set'}
                </Badge>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Overall Categorization</span>
                <Badge className={cn(
                  packageData.overall_categorization === 'High' ? 'bg-red-500' :
                  packageData.overall_categorization === 'Moderate' ? 'bg-yellow-500' :
                  'bg-green-500'
                )}>
                  {packageData.overall_categorization || 'Not Set'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Control Baseline</span>
                <Badge variant="outline">
                  {packageData.security_control_baseline || 'Not Set'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">System Type</span>
                <span className="text-sm font-medium">
                  {packageData.system_type || 'Not Specified'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Frameworks */}
      {metrics.complianceFrameworks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Compliance Frameworks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {metrics.complianceFrameworks.map(framework => (
                <Badge key={framework} variant="outline" className="px-3 py-1">
                  <Target className="h-3 w-3 mr-1" />
                  {framework}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trend Chart Placeholder */}
      {trends.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Compliance Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-center justify-center bg-muted/30 rounded">
              <p className="text-sm text-muted-foreground">
                Compliance trend visualization would go here
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}