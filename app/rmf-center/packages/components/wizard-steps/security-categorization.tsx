import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Lock, Shield, Activity, AlertTriangle } from "lucide-react"
import { WizardFormData } from "../rmf-package-wizard"

interface SecurityCategorizationProps {
  formData: WizardFormData
  updateFormData: (updates: Partial<WizardFormData>) => void
}

const IMPACT_DEFINITIONS = {
  LOW: {
    description: "Limited adverse effect on operations, assets, or individuals",
    color: "bg-green-100 text-green-800 border-green-200"
  },
  MODERATE: {
    description: "Serious adverse effect on operations, assets, or individuals", 
    color: "bg-yellow-100 text-yellow-800 border-yellow-200"
  },
  HIGH: {
    description: "Severe or catastrophic adverse effect on operations, assets, or individuals",
    color: "bg-red-100 text-red-800 border-red-200"
  }
}

export function SecurityCategorization({ formData, updateFormData }: SecurityCategorizationProps) {
  const getOverallImpact = () => {
    const impacts = [formData.confidentialityImpact, formData.integrityImpact, formData.availabilityImpact]
    if (impacts.includes('HIGH')) return 'HIGH'
    if (impacts.includes('MODERATE')) return 'MODERATE'  
    if (impacts.every(i => i === 'LOW')) return 'LOW'
    return null
  }

  const overallImpact = getOverallImpact()

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          CIA Triad Security Impact Assessment
        </h4>
        <p className="text-sm text-blue-700">
          Assess the potential impact of a security breach on each aspect of the CIA triad. 
          The highest impact level becomes the overall system categorization.
        </p>
      </div>

      {/* Confidentiality */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-blue-600" />
            Confidentiality Impact *
          </CardTitle>
          <CardDescription>
            Potential impact from unauthorized disclosure of information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select 
            value={formData.confidentialityImpact} 
            onValueChange={(value) => updateFormData({ confidentialityImpact: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select confidentiality impact" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LOW">
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-800">Low</Badge>
                  <span>Limited adverse effect</span>
                </div>
              </SelectItem>
              <SelectItem value="MODERATE">
                <div className="flex items-center gap-2">
                  <Badge className="bg-yellow-100 text-yellow-800">Moderate</Badge>
                  <span>Serious adverse effect</span>
                </div>
              </SelectItem>
              <SelectItem value="HIGH">
                <div className="flex items-center gap-2">
                  <Badge className="bg-red-100 text-red-800">High</Badge>
                  <span>Severe or catastrophic effect</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          {formData.confidentialityImpact && (
            <div className={`p-3 rounded border ${IMPACT_DEFINITIONS[formData.confidentialityImpact as keyof typeof IMPACT_DEFINITIONS].color}`}>
              <p className="text-sm font-medium">
                {IMPACT_DEFINITIONS[formData.confidentialityImpact as keyof typeof IMPACT_DEFINITIONS].description}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Integrity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            Integrity Impact *
          </CardTitle>
          <CardDescription>
            Potential impact from unauthorized modification or destruction of information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select 
            value={formData.integrityImpact} 
            onValueChange={(value) => updateFormData({ integrityImpact: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select integrity impact" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LOW">
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-800">Low</Badge>
                  <span>Limited adverse effect</span>
                </div>
              </SelectItem>
              <SelectItem value="MODERATE">
                <div className="flex items-center gap-2">
                  <Badge className="bg-yellow-100 text-yellow-800">Moderate</Badge>
                  <span>Serious adverse effect</span>
                </div>
              </SelectItem>
              <SelectItem value="HIGH">
                <div className="flex items-center gap-2">
                  <Badge className="bg-red-100 text-red-800">High</Badge>
                  <span>Severe or catastrophic effect</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          {formData.integrityImpact && (
            <div className={`p-3 rounded border ${IMPACT_DEFINITIONS[formData.integrityImpact as keyof typeof IMPACT_DEFINITIONS].color}`}>
              <p className="text-sm font-medium">
                {IMPACT_DEFINITIONS[formData.integrityImpact as keyof typeof IMPACT_DEFINITIONS].description}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Availability */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-purple-600" />
            Availability Impact *
          </CardTitle>
          <CardDescription>
            Potential impact from disruption of access to or use of information or system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select 
            value={formData.availabilityImpact} 
            onValueChange={(value) => updateFormData({ availabilityImpact: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select availability impact" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LOW">
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-800">Low</Badge>
                  <span>Limited adverse effect</span>
                </div>
              </SelectItem>
              <SelectItem value="MODERATE">
                <div className="flex items-center gap-2">
                  <Badge className="bg-yellow-100 text-yellow-800">Moderate</Badge>
                  <span>Serious adverse effect</span>
                </div>
              </SelectItem>
              <SelectItem value="HIGH">
                <div className="flex items-center gap-2">
                  <Badge className="bg-red-100 text-red-800">High</Badge>
                  <span>Severe or catastrophic effect</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          {formData.availabilityImpact && (
            <div className={`p-3 rounded border ${IMPACT_DEFINITIONS[formData.availabilityImpact as keyof typeof IMPACT_DEFINITIONS].color}`}>
              <p className="text-sm font-medium">
                {IMPACT_DEFINITIONS[formData.availabilityImpact as keyof typeof IMPACT_DEFINITIONS].description}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Overall Categorization */}
      {overallImpact && (
        <Card className={`border-2 ${IMPACT_DEFINITIONS[overallImpact as keyof typeof IMPACT_DEFINITIONS].color}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Overall System Categorization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Badge className={`text-lg px-4 py-2 ${IMPACT_DEFINITIONS[overallImpact as keyof typeof IMPACT_DEFINITIONS].color}`}>
                {overallImpact} IMPACT
              </Badge>
              <p className="text-sm">
                Based on the highest impact level across all three categories
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}