import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { WizardFormData } from "../rmf-package-wizard"

interface BasicInfoStepProps {
  formData: WizardFormData
  updateFormData: (updates: Partial<WizardFormData>) => void
}

export function BasicInfoStep({ formData, updateFormData }: BasicInfoStepProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Package Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => updateFormData({ name: e.target.value })}
            placeholder="e.g., Production Web Services ATO"
          />
          <p className="text-sm text-muted-foreground">
            A descriptive name for this authorization package
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="system-type">System Type *</Label>
          <Select value={formData.systemType} onValueChange={(value) => updateFormData({ systemType: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select system type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="INFORMATION_SYSTEM">Information System</SelectItem>
              <SelectItem value="PLATFORM_SYSTEM">Platform System</SelectItem>
              <SelectItem value="GENERAL_SUPPORT_SYSTEM">General Support System</SelectItem>
              <SelectItem value="MAJOR_APPLICATION">Major Application</SelectItem>
              <SelectItem value="MINOR_APPLICATION">Minor Application</SelectItem>
              <SelectItem value="CLOUD_SERVICE">Cloud Service</SelectItem>
              <SelectItem value="MOBILE_APPLICATION">Mobile Application</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => updateFormData({ description: e.target.value })}
          placeholder="Provide a detailed description of the system, its purpose, and scope..."
          rows={4}
        />
        <p className="text-sm text-muted-foreground">
          Include system purpose, scope, and key functionalities
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="operational-status">Operational Status</Label>
          <Select value={formData.operationalStatus} onValueChange={(value) => updateFormData({ operationalStatus: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DEVELOPMENT">Development</SelectItem>
              <SelectItem value="TESTING">Testing</SelectItem>
              <SelectItem value="PRE_PRODUCTION">Pre-Production</SelectItem>
              <SelectItem value="PRODUCTION">Production</SelectItem>
              <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
              <SelectItem value="DECOMMISSIONED">Decommissioned</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="authorization-expiry">Authorization Expiration Date</Label>
          <Input
            id="authorization-expiry"
            type="date"
            value={formData.authorizationExpiry}
            onChange={(e) => updateFormData({ authorizationExpiry: e.target.value })}
          />
          <p className="text-sm text-muted-foreground">
            When the current or planned ATO will expire
          </p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 mb-2">RMF Process Overview</h4>
        <p className="text-sm text-blue-700">
          This wizard will guide you through the initial categorization phase of the Risk Management Framework. 
          You&apos;ll define system characteristics, assign team roles, and establish security requirements that will 
          guide the rest of the RMF process.
        </p>
      </div>
    </div>
  )
}