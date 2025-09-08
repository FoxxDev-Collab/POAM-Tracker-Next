import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { WizardFormData } from "../rmf-package-wizard"

interface SystemCategorizationProps {
  formData: WizardFormData
  updateFormData: (updates: Partial<WizardFormData>) => void
}

export function SystemCategorization({ formData, updateFormData }: SystemCategorizationProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="impact-level">FIPS 199 Impact Level *</Label>
          <Select value={formData.impactLevel} onValueChange={(value) => updateFormData({ impactLevel: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select impact level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LOW">
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-800">Low</Badge>
                  <span>Low Impact</span>
                </div>
              </SelectItem>
              <SelectItem value="MODERATE">
                <div className="flex items-center gap-2">
                  <Badge className="bg-yellow-100 text-yellow-800">Moderate</Badge>
                  <span>Moderate Impact</span>
                </div>
              </SelectItem>
              <SelectItem value="HIGH">
                <div className="flex items-center gap-2">
                  <Badge className="bg-red-100 text-red-800">High</Badge>
                  <span>High Impact</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            Based on potential impact of loss of confidentiality, integrity, or availability
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="data-classification">Data Classification *</Label>
          <Select value={formData.dataClassification} onValueChange={(value) => updateFormData({ dataClassification: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select classification" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="UNCLASSIFIED">
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-800">U</Badge>
                  <span>Unclassified</span>
                </div>
              </SelectItem>
              <SelectItem value="CUI">
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-100 text-blue-800">CUI</Badge>
                  <span>Controlled Unclassified Information</span>
                </div>
              </SelectItem>
              <SelectItem value="CONFIDENTIAL">
                <div className="flex items-center gap-2">
                  <Badge className="bg-yellow-100 text-yellow-800">C</Badge>
                  <span>Confidential</span>
                </div>
              </SelectItem>
              <SelectItem value="SECRET">
                <div className="flex items-center gap-2">
                  <Badge className="bg-orange-100 text-orange-800">S</Badge>
                  <span>Secret</span>
                </div>
              </SelectItem>
              <SelectItem value="TOP_SECRET">
                <div className="flex items-center gap-2">
                  <Badge className="bg-red-100 text-red-800">TS</Badge>
                  <span>Top Secret</span>
                </div>
              </SelectItem>
              <SelectItem value="TS_SCI">
                <div className="flex items-center gap-2">
                  <Badge className="bg-red-100 text-red-800">TS/SCI</Badge>
                  <span>Top Secret/SCI</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="system-boundary">System Boundary Description *</Label>
        <Textarea
          id="system-boundary"
          value={formData.systemBoundary}
          onChange={(e) => updateFormData({ systemBoundary: e.target.value })}
          placeholder="Describe the logical and physical boundaries of the system..."
          rows={3}
        />
        <p className="text-sm text-muted-foreground">
          Define what components, networks, and facilities are included in this authorization boundary
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="environment-type">Environment Type</Label>
          <Select value={formData.environmentType} onValueChange={(value) => updateFormData({ environmentType: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select environment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ON_PREMISE">On-Premise</SelectItem>
              <SelectItem value="CLOUD">Cloud</SelectItem>
              <SelectItem value="HYBRID">Hybrid</SelectItem>
              <SelectItem value="MULTI_CLOUD">Multi-Cloud</SelectItem>
              <SelectItem value="GOVERNMENT_CLOUD">Government Cloud</SelectItem>
              <SelectItem value="CONTRACTOR_OPERATED">Contractor Operated</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="interconnections">System Interconnections</Label>
          <Input
            id="interconnections"
            value={formData.interconnections}
            onChange={(e) => updateFormData({ interconnections: e.target.value })}
            placeholder="e.g., Internet, GSA Network, DoD SIPR"
          />
          <p className="text-sm text-muted-foreground">
            List key network connections and external systems
          </p>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <h4 className="font-semibold text-amber-800 mb-2">System Categorization Guidelines</h4>
        <div className="text-sm text-amber-700 space-y-1">
          <p><strong>Impact Level:</strong> Consider the worst-case scenario for data loss or system compromise.</p>
          <p><strong>Classification:</strong> Must match the highest level of data processed, stored, or transmitted.</p>
          <p><strong>Boundary:</strong> Include all components that share the same security posture and authorization.</p>
        </div>
      </div>
    </div>
  )
}