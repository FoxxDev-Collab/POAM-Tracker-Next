import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { ShieldIcon, Target, CheckCircle } from "lucide-react"
import { WizardFormData } from "../rmf-package-wizard"

interface ComplianceFrameworkProps {
  formData: WizardFormData
  updateFormData: (updates: Partial<WizardFormData>) => void
}

const COMPLIANCE_FRAMEWORKS = [
  {
    id: 'NIST_800_53_rev5',
    name: 'NIST SP 800-53 Rev 5',
    description: 'Security and Privacy Controls for Federal Information Systems (Latest Version)',
    required: false
  },
  {
    id: 'NIST_800_53_rev4',
    name: 'NIST SP 800-53 Rev 4', 
    description: 'Security and Privacy Controls for Federal Information Systems (Previous Version)',
    required: false
  },
]

export function ComplianceFramework({ formData, updateFormData }: ComplianceFrameworkProps) {
  const handleFrameworkToggle = (frameworkId: string) => {
    const isSelected = formData.complianceFrameworks.includes(frameworkId)
    const updatedFrameworks = isSelected
      ? formData.complianceFrameworks.filter(id => id !== frameworkId)
      : [...formData.complianceFrameworks, frameworkId]
    
    updateFormData({ complianceFrameworks: updatedFrameworks })
  }

  const requiredFrameworks = COMPLIANCE_FRAMEWORKS.filter(f => f.required)
  const optionalFrameworks = COMPLIANCE_FRAMEWORKS.filter(f => !f.required)

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
          <Target className="h-4 w-4" />
          NIST SP 800-53 Framework Selection
        </h4>
        <p className="text-sm text-blue-700">
          Select which revision of NIST SP 800-53 applies to your system. You must select at least one framework.
        </p>
      </div>

      {/* Framework Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldIcon className="h-5 w-5 text-blue-600" />
            Available Frameworks
          </CardTitle>
          <CardDescription>
            Choose the appropriate revision(s) of NIST SP 800-53 for your system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {COMPLIANCE_FRAMEWORKS.map((framework) => (
            <div 
              key={framework.id}
              className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Checkbox
                id={framework.id}
                checked={formData.complianceFrameworks.includes(framework.id)}
                onCheckedChange={() => handleFrameworkToggle(framework.id)}
                className="mt-0.5"
              />
              <div className="flex-1">
                <Label htmlFor={framework.id} className="cursor-pointer">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{framework.name}</span>
                    <Badge variant="outline">
                      {framework.id === 'NIST_800_53_rev5' ? 'Latest' : 'Previous'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{framework.description}</p>
                </Label>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Special Requirements */}
      <Card>
        <CardHeader>
          <CardTitle>Special Requirements</CardTitle>
          <CardDescription>
            Document any special security requirements, regulations, or organizational policies that apply
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="special-requirements">Additional Requirements</Label>
            <Textarea
              id="special-requirements"
              value={formData.specialRequirements}
              onChange={(e) => updateFormData({ specialRequirements: e.target.value })}
              placeholder="e.g., PCI DSS compliance for payment processing, ITAR controls for defense systems, state-specific privacy laws..."
              rows={4}
            />
            <p className="text-sm text-muted-foreground">
              Include industry-specific requirements, international regulations, or organizational mandates
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Selected Frameworks Summary */}
      {formData.complianceFrameworks.length > 0 && (
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800">Selected Frameworks Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {formData.complianceFrameworks.map(frameworkId => {
                const framework = COMPLIANCE_FRAMEWORKS.find(f => f.id === frameworkId)
                return framework ? (
                  <Badge key={frameworkId} className="bg-green-100 text-green-800">
                    {framework.name}
                  </Badge>
                ) : null
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}