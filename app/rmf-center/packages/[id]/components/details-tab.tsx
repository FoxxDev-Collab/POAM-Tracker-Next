"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Save, RefreshCw } from "lucide-react"

interface Package {
  id: number
  name: string
  description: string | null
  authorizationExpiry: string | null
  rmfStep: string
  systemType: string | null
  confidentialityImpact: string | null
  integrityImpact: string | null
  availabilityImpact: string | null
  dataClassification: string | null
  authorizingOfficial: string | null
  systemOwner: string | null
  issoName: string | null
  issmName: string | null
  createdAt: string
  updatedAt: string
}

interface DetailsTabProps {
  packageData: Package
  onUpdate: () => void
}

export function DetailsTab({ packageData, onUpdate }: DetailsTabProps) {
  const [formData, setFormData] = useState({
    name: packageData.name || "",
    description: packageData.description || "",
    systemType: packageData.systemType || "",
    authorizationExpiry: packageData.authorizationExpiry || "",
    confidentialityImpact: packageData.confidentialityImpact || "",
    integrityImpact: packageData.integrityImpact || "",
    availabilityImpact: packageData.availabilityImpact || "",
    dataClassification: packageData.dataClassification || "",
    authorizingOfficial: packageData.authorizingOfficial || "",
    systemOwner: packageData.systemOwner || "",
    issoName: packageData.issoName || "",
    issmName: packageData.issmName || "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/packages/${packageData.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error('Failed to update package')
      }

      toast.success("Package updated successfully")
      onUpdate()
    } catch (error) {
      console.error('Error updating package:', error)
      toast.error("Failed to update package")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setFormData({
      name: packageData.name || "",
      description: packageData.description || "",
      systemType: packageData.systemType || "",
      authorizationExpiry: packageData.authorizationExpiry || "",
      confidentialityImpact: packageData.confidentialityImpact || "",
      integrityImpact: packageData.integrityImpact || "",
      availabilityImpact: packageData.availabilityImpact || "",
      dataClassification: packageData.dataClassification || "",
      authorizingOfficial: packageData.authorizingOfficial || "",
      systemOwner: packageData.systemOwner || "",
      issoName: packageData.issoName || "",
      issmName: packageData.issmName || "",
    })
  }

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            Core package details and system information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Package Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter package name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="systemType">System Type</Label>
              <Select value={formData.systemType} onValueChange={(value) => handleInputChange('systemType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select system type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Major_Application">Major Application</SelectItem>
                  <SelectItem value="General_Support_System">General Support System</SelectItem>
                  <SelectItem value="Minor_Application">Minor Application</SelectItem>
                  <SelectItem value="Subsystem">Subsystem</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter package description"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="authorizationExpiry">Authorization Expiry</Label>
            <Input
              id="authorizationExpiry"
              type="date"
              value={formData.authorizationExpiry}
              onChange={(e) => handleInputChange('authorizationExpiry', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Security Categorization */}
      <Card>
        <CardHeader>
          <CardTitle>Security Categorization</CardTitle>
          <CardDescription>
            CIA Triad impact levels and data classification
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="confidentialityImpact">Confidentiality Impact</Label>
              <Select value={formData.confidentialityImpact} onValueChange={(value) => handleInputChange('confidentialityImpact', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select impact" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Moderate">Moderate</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="integrityImpact">Integrity Impact</Label>
              <Select value={formData.integrityImpact} onValueChange={(value) => handleInputChange('integrityImpact', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select impact" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Moderate">Moderate</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="availabilityImpact">Availability Impact</Label>
              <Select value={formData.availabilityImpact} onValueChange={(value) => handleInputChange('availabilityImpact', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select impact" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Moderate">Moderate</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dataClassification">Data Classification</Label>
            <Select value={formData.dataClassification} onValueChange={(value) => handleInputChange('dataClassification', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select classification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Unclassified">Unclassified</SelectItem>
                <SelectItem value="CUI">CUI</SelectItem>
                <SelectItem value="Confidential">Confidential</SelectItem>
                <SelectItem value="Secret">Secret</SelectItem>
                <SelectItem value="Top_Secret">Top Secret</SelectItem>
                <SelectItem value="TS_SCI">TS/SCI</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Team Assignments */}
      <Card>
        <CardHeader>
          <CardTitle>Team Assignments</CardTitle>
          <CardDescription>
            Key personnel and role assignments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="authorizingOfficial">Authorizing Official</Label>
              <Input
                id="authorizingOfficial"
                value={formData.authorizingOfficial}
                onChange={(e) => handleInputChange('authorizingOfficial', e.target.value)}
                placeholder="Enter name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="systemOwner">System Owner</Label>
              <Input
                id="systemOwner"
                value={formData.systemOwner}
                onChange={(e) => handleInputChange('systemOwner', e.target.value)}
                placeholder="Enter name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="issoName">ISSO Name</Label>
              <Input
                id="issoName"
                value={formData.issoName}
                onChange={(e) => handleInputChange('issoName', e.target.value)}
                placeholder="Information System Security Officer"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="issmName">ISSM Name</Label>
              <Input
                id="issmName"
                value={formData.issmName}
                onChange={(e) => handleInputChange('issmName', e.target.value)}
                placeholder="Information System Security Manager"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={handleReset} disabled={isSubmitting}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Reset
        </Button>
        <Button onClick={handleSave} disabled={isSubmitting}>
          <Save className="h-4 w-4 mr-2" />
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  )
}