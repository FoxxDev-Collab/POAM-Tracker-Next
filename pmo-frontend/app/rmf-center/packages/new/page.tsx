"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
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
  Activity,
  X
} from "lucide-react"
import { BasicInfoStep } from "../components/wizard-steps/basic-info-step"
import { SystemCategorization } from "../components/wizard-steps/system-categorization"
import { TeamAssignments } from "../components/wizard-steps/team-assignments"
import { SecurityCategorization } from "../components/wizard-steps/security-categorization"
import { ComplianceFramework } from "../components/wizard-steps/compliance-framework"
import { ReviewAndSubmit } from "../components/wizard-steps/review-and-submit"
import { toast } from "sonner"

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

export default function NewPackageWizardPage() {
  const router = useRouter()
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

  const handleCancel = () => {
    router.push('/rmf-center/packages')
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      // Map frontend values to backend enum values
      const mapSystemType = (type: string) => {
        const mapping: Record<string, string> = {
          'MAJOR_APPLICATION': 'Major_Application',
          'GENERAL_SUPPORT_SYSTEM': 'General_Support_System',
          'MINOR_APPLICATION': 'Minor_Application',
          'INFORMATION_SYSTEM': 'Major_Application', // Default mapping
          'PLATFORM_SYSTEM': 'General_Support_System',
          'CLOUD_SERVICE': 'Major_Application',
          'MOBILE_APPLICATION': 'Minor_Application'
        }
        return mapping[type] || 'Major_Application'
      }

      const mapImpactLevel = (level: string) => {
        const mapping: Record<string, string> = {
          'LOW': 'Low',
          'MODERATE': 'Moderate',
          'HIGH': 'High'
        }
        return mapping[level] || level
      }

      const mapDataClassification = (classification: string) => {
        const mapping: Record<string, string> = {
          'UNCLASSIFIED': 'Unclassified',
          'CUI': 'CUI',
          'CONFIDENTIAL': 'Confidential',
          'SECRET': 'Secret',
          'TOP_SECRET': 'Top_Secret',
          'TS_SCI': 'TS_SCI'
        }
        return mapping[classification] || classification
      }

      const payload = {
        // Required field
        name: formData.name,

        // Optional fields that match backend DTO
        description: formData.description || undefined,
        rmfStep: 'Categorize',
        systemType: formData.systemType ? mapSystemType(formData.systemType) : undefined,
        dataClassification: formData.dataClassification ? mapDataClassification(formData.dataClassification) : undefined,
        authorizationExpiry: formData.authorizationExpiry || undefined,

        // People assignments - using correct field names from DTO
        authorizingOfficial: formData.authorizedOfficialName || undefined,
        systemOwner: formData.systemOwnerName || undefined,
        issoName: formData.isssoName || undefined,
        issmName: formData.issmName || undefined,

        // CIA Triad impacts
        confidentialityImpact: formData.confidentialityImpact ? mapImpactLevel(formData.confidentialityImpact) : undefined,
        integrityImpact: formData.integrityImpact ? mapImpactLevel(formData.integrityImpact) : undefined,
        availabilityImpact: formData.availabilityImpact ? mapImpactLevel(formData.availabilityImpact) : undefined,

        // Set overall categorization based on highest impact level
        overallCategorization: formData.confidentialityImpact || formData.integrityImpact || formData.availabilityImpact
          ? mapImpactLevel(
              [formData.confidentialityImpact, formData.integrityImpact, formData.availabilityImpact]
                .filter(Boolean)
                .sort((a, b) => {
                  const order = ['LOW', 'MODERATE', 'HIGH'];
                  return order.indexOf(b) - order.indexOf(a);
                })[0]
            )
          : undefined
      }

      // Remove undefined values to avoid sending them
      const cleanPayload = Object.fromEntries(
        Object.entries(payload).filter(([_, v]) => v !== undefined)
      )

      const response = await fetch('/api/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanPayload)
      })

      if (!response.ok) {
        throw new Error('Failed to create package')
      }

      toast.success("ATO Package created successfully! Starting RMF Categorization phase.")
      router.push('/rmf-center/packages')
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
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold">Create New ATO Package</h1>
              <p className="text-muted-foreground">RMF Wizard - Step {currentStep + 1} of {WIZARD_STEPS.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              RMF Step 1: Categorize
            </Badge>
            <Button variant="outline" size="sm" onClick={handleCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        </div>
        
        {/* Progress Bar */}
        <Progress value={progress} className="h-3 mb-6" />
        
        {/* Step Indicators */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {WIZARD_STEPS.map((step, index) => {
            const StepIcon = step.icon
            const isActive = index === currentStep
            const isCompleted = index < currentStep
            
            return (
              <Card 
                key={step.id} 
                className={`transition-all duration-200 ${
                  isActive ? 'border-blue-500 bg-blue-50 shadow-md' : 
                  isCompleted ? 'border-green-500 bg-green-50' : 
                  'border-border bg-card hover:shadow-sm'
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col items-center text-center space-y-2">
                    {isCompleted ? (
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    ) : (
                      <StepIcon className={`h-6 w-6 ${isActive ? 'text-blue-600' : 'text-muted-foreground'}`} />
                    )}
                    <span className={`text-sm font-medium ${
                      isActive ? 'text-blue-700' : 
                      isCompleted ? 'text-green-700' : 
                      'text-muted-foreground'
                    }`}>
                      {step.title}
                    </span>
                    <span className="text-xs text-muted-foreground line-clamp-2">
                      {step.description}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Step Content */}
      <Card className="mb-8">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-3">
            {React.createElement(WIZARD_STEPS[currentStep].icon, { className: "h-6 w-6 text-primary" })}
            <div>
              <div className="text-xl">{WIZARD_STEPS[currentStep].title}</div>
              <CardDescription className="text-base mt-1">
                {WIZARD_STEPS[currentStep].description}
              </CardDescription>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="max-w-4xl">
            {renderStepContent()}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center">
            <Button 
              variant="outline" 
              onClick={handleBack} 
              disabled={currentStep === 0}
              size="lg"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Step {currentStep + 1} of {WIZARD_STEPS.length}
              </span>
              
              {currentStep === WIZARD_STEPS.length - 1 ? (
                <Button 
                  onClick={handleSubmit} 
                  disabled={isSubmitting || !canProceed()}
                  size="lg"
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? "Creating..." : "Create ATO Package"}
                </Button>
              ) : (
                <Button 
                  onClick={handleNext} 
                  disabled={!canProceed()}
                  size="lg"
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}