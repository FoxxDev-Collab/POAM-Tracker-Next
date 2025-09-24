import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Package, 
  Settings, 
  Users, 
  ShieldIcon, 
  Target, 
  Shield,
  User,
  UserCheck,
  Lock,
  Activity,
  CheckCircle
} from "lucide-react"
import { WizardFormData } from "../rmf-package-wizard"

interface ReviewAndSubmitProps {
  formData: WizardFormData
}

const COMPLIANCE_FRAMEWORKS = [
  { id: 'NIST_800_53_rev4', name: 'NIST SP 800-53-rev4', required: true },
  { id: 'NIST_800_53_rev5', name: 'NIST SP 800-53-rev5', required: false },
]

export function ReviewAndSubmit({ formData }: ReviewAndSubmitProps) {
  const getClassificationBadge = (classification: string) => {
    switch (classification) {
      case 'TOP_SECRET': return 'bg-red-100 text-red-800 border-red-200'
      case 'SECRET': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'CONFIDENTIAL': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'CUI': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'UNCLASSIFIED': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'HIGH': return 'bg-red-100 text-red-800 border-red-200'
      case 'MODERATE': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getOverallImpact = () => {
    const impacts = [formData.confidentialityImpact, formData.integrityImpact, formData.availabilityImpact]
    if (impacts.includes('HIGH')) return 'HIGH'
    if (impacts.includes('MODERATE')) return 'MODERATE'
    if (impacts.every(i => i === 'LOW')) return 'LOW'
    return 'UNKNOWN'
  }


  return (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          Ready to Create ATO Package
        </h4>
        <p className="text-sm text-green-700">
          Review all information below. Once created, the package will enter the RMF Categorization phase and team members will be notified.
        </p>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Package Name</p>
              <p className="font-semibold">{formData.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">System Type</p>
              <Badge variant="outline">{formData.systemType.replace(/_/g, ' ')}</Badge>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Description</p>
            <p className="text-sm">{formData.description}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Operational Status</p>
              <Badge variant="outline">{formData.operationalStatus.replace(/_/g, ' ')}</Badge>
            </div>
            {formData.authorizationExpiry && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">ATO Expiration</p>
                <p className="text-sm">{new Date(formData.authorizationExpiry).toLocaleDateString()}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* System Categorization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-purple-600" />
            System Categorization
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Impact Level</p>
              <Badge className={getImpactBadge(formData.impactLevel)}>
                {formData.impactLevel} IMPACT
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Data Classification</p>
              <Badge className={getClassificationBadge(formData.dataClassification)}>
                {formData.dataClassification}
              </Badge>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">System Boundary</p>
            <p className="text-sm">{formData.systemBoundary}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Environment Type</p>
              <Badge variant="outline">{formData.environmentType?.replace(/_/g, ' ')}</Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Interconnections</p>
              <p className="text-sm">{formData.interconnections || 'None specified'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Assignments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-green-600" />
            Team Assignments
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Authorizing Official</span>
              </div>
              <div className="ml-6">
                <p className="font-semibold">{formData.authorizedOfficialName}</p>
                {formData.authorizedOfficialEmail && (
                  <p className="text-sm text-muted-foreground">{formData.authorizedOfficialEmail}</p>
                )}
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-green-600" />
                <span className="font-medium">System Owner</span>
              </div>
              <div className="ml-6">
                <p className="font-semibold">{formData.systemOwnerName}</p>
                {formData.systemOwnerEmail && (
                  <p className="text-sm text-muted-foreground">{formData.systemOwnerEmail}</p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-purple-600" />
                <span className="font-medium">ISSO</span>
              </div>
              <div className="ml-6">
                <p className="font-semibold">{formData.isssoName}</p>
                {formData.isssoEmail && (
                  <p className="text-sm text-muted-foreground">{formData.isssoEmail}</p>
                )}
              </div>
            </div>

            {formData.issmName && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-orange-600" />
                  <span className="font-medium">ISSM</span>
                </div>
                <div className="ml-6">
                  <p className="font-semibold">{formData.issmName}</p>
                  {formData.issmEmail && (
                    <p className="text-sm text-muted-foreground">{formData.issmEmail}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Security Categorization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldIcon className="h-5 w-5 text-red-600" />
            Security Categorization (CIA Triad)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Confidentiality</span>
              </div>
              <Badge className={getImpactBadge(formData.confidentialityImpact)}>
                {formData.confidentialityImpact}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Integrity</span>
              </div>
              <Badge className={getImpactBadge(formData.integrityImpact)}>
                {formData.integrityImpact}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">Availability</span>
              </div>
              <Badge className={getImpactBadge(formData.availabilityImpact)}>
                {formData.availabilityImpact}
              </Badge>
            </div>
          </div>
          
          <div className="bg-gray-50 p-3 rounded border">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Overall System Categorization:</span>
              <Badge className={`${getImpactBadge(getOverallImpact())} font-semibold`}>
                {getOverallImpact()} IMPACT SYSTEM
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Frameworks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-indigo-600" />
            Compliance Frameworks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {/* Required frameworks */}
              {COMPLIANCE_FRAMEWORKS.filter(f => f.required).map(framework => (
                <Badge key={framework.id} className="bg-red-100 text-red-800">
                  {framework.name} (Required)
                </Badge>
              ))}
              {/* Selected optional frameworks */}
              {formData.complianceFrameworks.map(frameworkId => {
                const framework = COMPLIANCE_FRAMEWORKS.find(f => f.id === frameworkId && !f.required)
                return framework ? (
                  <Badge key={frameworkId} className="bg-blue-100 text-blue-800">
                    {framework.name}
                  </Badge>
                ) : null
              })}
            </div>
            
            {formData.specialRequirements && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Special Requirements</p>
                <p className="text-sm bg-gray-50 p-3 rounded border">{formData.specialRequirements}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800">Next Steps After Creation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-blue-700">
            <p>1. <strong>Package Created:</strong> ATO package will be created in CATEGORIZE phase</p>
            <p>2. <strong>Team Notification:</strong> All assigned team members will be notified</p>
            <p>3. <strong>Control Selection:</strong> Begin selecting appropriate NIST 800-53 controls</p>
            <p>4. <strong>System Registration:</strong> Add systems and components to the package</p>
            <p>5. <strong>Documentation:</strong> Complete system security plan and supporting documents</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}