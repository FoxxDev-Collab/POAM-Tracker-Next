"use client"

import React, { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { 
  Shield, 
  CheckCircle, 
  ArrowLeft, 
  ArrowRight, 
  Package, 
  Users, 
  Settings, 
  FileCheck,
  Target,
  Activity
} from "lucide-react"
import { BasicInfoStep } from "./wizard-steps/basic-info-step"
import { SystemCategorization } from "./wizard-steps/system-categorization"
import { TeamAssignments } from "./wizard-steps/team-assignments"
import { SecurityCategorization } from "./wizard-steps/security-categorization"
import { ComplianceFramework } from "./wizard-steps/compliance-framework"
import { ReviewAndSubmit } from "./wizard-steps/review-and-submit"
import { toast } from "sonner"

interface RmfPackageWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete: () => void
}

export interface WizardFormData {
  // Basic Information
  name: string
  description: string
  systemType: string
  operationalStatus: string
  authorizationExpiry: string
  
  // System Categorization
  impactLevel: string
  dataClassification: string
  systemBoundary: string
  interconnections: string
  environmentType: string
  
  // Team Assignments
  authorizedOfficialName: string
  authorizedOfficialEmail: string
  systemOwnerName: string
  systemOwnerEmail: string
  isssoName: string
  isssoEmail: string
  issmName: string
  issmEmail: string
  
  // Security Categorization (CIA Triad)
  confidentialityImpact: string
  integrityImpact: string
  availabilityImpact: string
  
  // Compliance Framework
  nistControls: string[]
  complianceFrameworks: string[]
  specialRequirements: string
}

const WIZARD_STEPS = [
  {
    id: 'basic-info',
    title: 'Basic Information',
    description: 'Package name, description, and system details',
    icon: Package
  },
  {
    id: 'system-categorization',
    title: 'System Categorization',
    description: 'Impact level, classification, and boundaries',
    icon: Settings
  },
  {
    id: 'team-assignments',
    title: 'Team Assignments',
    description: 'Assign key personnel and responsibilities',
    icon: Users
  },
  {
    id: 'security-categorization',
    title: 'Security Categorization',
    description: 'CIA Triad impact assessment',
    icon: FileCheck
  },
  {
    id: 'compliance-framework',
    title: 'Compliance Framework',
    description: 'NIST controls and framework selection',
    icon: Target
  },
  {
    id: 'review-submit',
    title: 'Review & Submit',
    description: 'Review all information and create package',
    icon: Activity
  }
]

export function RmfPackageWizard({ open, onOpenChange, onComplete }: RmfPackageWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<WizardFormData>({
    // Basic Information
    name: "",
    description: "",
    systemType: "",
    operationalStatus: "DEVELOPMENT",
    authorizationExpiry: "",
    
    // System Categorization
    impactLevel: "",
    dataClassification: "",
    systemBoundary: "",
    interconnections: "",
    environmentType: "",
    
    // Team Assignments
    authorizedOfficialName: "",
    authorizedOfficialEmail: "",
    systemOwnerName: "",
    systemOwnerEmail: "",
    isssoName: "",
    isssoEmail: "",
    issmName: "",
    issmEmail: "",
    
    // Security Categorization
    confidentialityImpact: "",
    integrityImpact: "",
    availabilityImpact: "",
    
    // Compliance Framework
    nistControls: [],
    complianceFrameworks: [],
    specialRequirements: ""
  })

  const updateFormData = (updates: Partial<WizardFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const canProceed = () => {
    switch (currentStep) {
      case 0: // Basic Info
        return formData.name && formData.description && formData.systemType
      case 1: // System Categorization
        return formData.impactLevel && formData.dataClassification && formData.systemBoundary
      case 2: // Team Assignments
        return formData.authorizedOfficialName && formData.systemOwnerName && formData.isssoName
      case 3: // Security Categorization
        return formData.confidentialityImpact && formData.integrityImpact && formData.availabilityImpact
      case 4: // Compliance Framework
        return formData.complianceFrameworks.length > 0
      default:
        return true
    }
  }

  const handleNext = () => {
    if (currentStep < WIZARD_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        authorizationExpiry: formData.authorizationExpiry,
        systemType: formData.systemType,
        operationalStatus: formData.operationalStatus,
        impactLevel: formData.impactLevel,
        dataClassification: formData.dataClassification,
        systemBoundary: formData.systemBoundary,
        interconnections: formData.interconnections,
        environmentType: formData.environmentType,
        authorizedOfficialName: formData.authorizedOfficialName,
        authorizedOfficialEmail: formData.authorizedOfficialEmail,
        systemOwnerName: formData.systemOwnerName,
        systemOwnerEmail: formData.systemOwnerEmail,
        isssoName: formData.isssoName,
        isssoEmail: formData.isssoEmail,
        issmName: formData.issmName,
        issmEmail: formData.issmEmail,
        confidentialityImpact: formData.confidentialityImpact,
        integrityImpact: formData.integrityImpact,
        availabilityImpact: formData.availabilityImpact,
        complianceFrameworks: formData.complianceFrameworks,
        specialRequirements: formData.specialRequirements,
        rmfStep: 'CATEGORIZE'
      }

      const response = await fetch('/api/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error('Failed to create package')
      }

      toast.success("ATO Package created successfully! Starting RMF Categorization phase.")
      onComplete()
      
      // Reset form
      setCurrentStep(0)
      setFormData({
        name: "",
        description: "",
        systemType: "",
        operationalStatus: "DEVELOPMENT",
        authorizationExpiry: "",
        impactLevel: "",
        dataClassification: "",
        systemBoundary: "",
        interconnections: "",
        environmentType: "",
        authorizedOfficialName: "",
        authorizedOfficialEmail: "",
        systemOwnerName: "",
        systemOwnerEmail: "",
        isssoName: "",
        isssoEmail: "",
        issmName: "",
        issmEmail: "",
        confidentialityImpact: "",
        integrityImpact: "",
        availabilityImpact: "",
        nistControls: [],
        complianceFrameworks: [],
        specialRequirements: ""
      })
    } catch (error) {
      console.error('Error creating package:', error)
      toast.error("Failed to create ATO package")
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <BasicInfoStep formData={formData} updateFormData={updateFormData} />
      case 1:
        return <SystemCategorization formData={formData} updateFormData={updateFormData} />
      case 2:
        return <TeamAssignments formData={formData} updateFormData={updateFormData} />
      case 3:
        return <SecurityCategorization formData={formData} updateFormData={updateFormData} />
      case 4:
        return <ComplianceFramework formData={formData} updateFormData={updateFormData} />
      case 5:
        return <ReviewAndSubmit formData={formData} />
      default:
        return null
    }
  }

  const progress = ((currentStep + 1) / WIZARD_STEPS.length) * 100

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            Create New ATO Package - RMF Wizard
          </DialogTitle>
        </DialogHeader>

        {/* Progress Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {WIZARD_STEPS.length}
            </span>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              RMF Step 1: Categorize
            </Badge>
          </div>
          <Progress value={progress} className="h-2" />
          
          {/* Step Indicators */}
          <div className="grid grid-cols-6 gap-2">
            {WIZARD_STEPS.map((step, index) => {
              const StepIcon = step.icon
              const isActive = index === currentStep
              const isCompleted = index < currentStep
              
              return (
                <Card 
                  key={step.id} 
                  className={`p-3 transition-colors ${
                    isActive ? 'border-blue-500 bg-blue-50' : 
                    isCompleted ? 'border-green-500 bg-green-50' : 
                    'border-gray-200'
                  }`}
                >
                  <div className="flex flex-col items-center text-center space-y-1">
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <StepIcon className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                    )}
                    <span className={`text-xs font-medium ${
                      isActive ? 'text-blue-700' : 
                      isCompleted ? 'text-green-700' : 
                      'text-gray-500'
                    }`}>
                      {step.title}
                    </span>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {React.createElement(WIZARD_STEPS[currentStep].icon, { className: "h-5 w-5" })}
                {WIZARD_STEPS[currentStep].title}
              </CardTitle>
              <CardDescription>
                {WIZARD_STEPS[currentStep].description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderStepContent()}
            </CardContent>
          </Card>
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={handleBack} 
            disabled={currentStep === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            
            {currentStep === WIZARD_STEPS.length - 1 ? (
              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting || !canProceed()}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? "Creating..." : "Create ATO Package"}
              </Button>
            ) : (
              <Button 
                onClick={handleNext} 
                disabled={!canProceed()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}