import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, User, UserCheck, Settings } from "lucide-react"
import { WizardFormData } from "../rmf-package-wizard"

interface TeamAssignmentsProps {
  formData: WizardFormData
  updateFormData: (updates: Partial<WizardFormData>) => void
}

export function TeamAssignments({ formData, updateFormData }: TeamAssignmentsProps) {
  return (
    <div className="space-y-6">
      {/* Authorizing Official */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="h-5 w-5 text-blue-600" />
            Authorizing Official (AO)
            <Badge className="bg-red-100 text-red-800">Required</Badge>
          </CardTitle>
          <CardDescription>
            Senior leader responsible for accepting security risk and granting authorization to operate
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="ao-name">Full Name *</Label>
            <Input
              id="ao-name"
              value={formData.authorizedOfficialName}
              onChange={(e) => updateFormData({ authorizedOfficialName: e.target.value })}
              placeholder="e.g., John Smith"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ao-email">Email Address</Label>
            <Input
              id="ao-email"
              type="email"
              value={formData.authorizedOfficialEmail}
              onChange={(e) => updateFormData({ authorizedOfficialEmail: e.target.value })}
              placeholder="john.smith@agency.gov"
            />
          </div>
        </CardContent>
      </Card>

      {/* System Owner */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5 text-green-600" />
            System Owner
            <Badge className="bg-red-100 text-red-800">Required</Badge>
          </CardTitle>
          <CardDescription>
            Individual responsible for the development, procurement, integration, modification, and operation of the system
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="so-name">Full Name *</Label>
            <Input
              id="so-name"
              value={formData.systemOwnerName}
              onChange={(e) => updateFormData({ systemOwnerName: e.target.value })}
              placeholder="e.g., Jane Doe"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="so-email">Email Address</Label>
            <Input
              id="so-email"
              type="email"
              value={formData.systemOwnerEmail}
              onChange={(e) => updateFormData({ systemOwnerEmail: e.target.value })}
              placeholder="jane.doe@agency.gov"
            />
          </div>
        </CardContent>
      </Card>

      {/* ISSSO */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <UserCheck className="h-5 w-5 text-purple-600" />
            Information System Security Officer (ISSO)
            <Badge className="bg-red-100 text-red-800">Required</Badge>
          </CardTitle>
          <CardDescription>
            Individual responsible for ensuring the security posture is maintained throughout the system lifecycle
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="isso-name">Full Name *</Label>
            <Input
              id="isso-name"
              value={formData.isssoName}
              onChange={(e) => updateFormData({ isssoName: e.target.value })}
              placeholder="e.g., Mike Johnson"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="isso-email">Email Address</Label>
            <Input
              id="isso-email"
              type="email"
              value={formData.isssoEmail}
              onChange={(e) => updateFormData({ isssoEmail: e.target.value })}
              placeholder="mike.johnson@agency.gov"
            />
          </div>
        </CardContent>
      </Card>

      {/* ISSM */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Settings className="h-5 w-5 text-orange-600" />
            Information System Security Manager (ISSM)
            <Badge className="bg-blue-100 text-blue-800">Optional</Badge>
          </CardTitle>
          <CardDescription>
            Individual responsible for the information system&apos;s security program and security-related activities
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="issm-name">Full Name</Label>
            <Input
              id="issm-name"
              value={formData.issmName}
              onChange={(e) => updateFormData({ issmName: e.target.value })}
              placeholder="e.g., Sarah Wilson"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="issm-email">Email Address</Label>
            <Input
              id="issm-email"
              type="email"
              value={formData.issmEmail}
              onChange={(e) => updateFormData({ issmEmail: e.target.value })}
              placeholder="sarah.wilson@agency.gov"
            />
          </div>
        </CardContent>
      </Card>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 mb-2">Role Responsibilities</h4>
        <div className="text-sm text-blue-700 space-y-2">
          <p><strong>AO:</strong> Makes risk-based decisions about system operation authorization</p>
          <p><strong>System Owner:</strong> Manages day-to-day operations and ensures mission requirements are met</p>
          <p><strong>ISSO:</strong> Implements and maintains security controls, monitors security posture</p>
          <p><strong>ISSM:</strong> Oversees security program and coordinates with organizational security office</p>
        </div>
      </div>
    </div>
  )
}