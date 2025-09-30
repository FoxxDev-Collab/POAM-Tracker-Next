'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  ChevronRight,
  FileText,
  Shield,
  Settings,
  Search,
  CheckSquare,
  Lock,
  Activity
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import DocumentUpload from './document-upload'

interface RmfStep {
  key: string
  label: string
  order: number
  description: string
  icon: React.ComponentType<any>
  requirements: string[]
  outputs: string[]
  estimatedDuration: string
  color: string
}

const RMF_STEPS: RmfStep[] = [
  {
    key: 'Categorize',
    label: 'Categorize',
    order: 1,
    description: 'Categorize the information system and the information processed, stored, and transmitted by that system based on an impact analysis.',
    icon: FileText,
    requirements: [
      'System description and boundaries',
      'Information types processed',
      'Mission/business functions',
      'Security categorization documentation'
    ],
    outputs: [
      'Security categorization document',
      'Impact level determination (Low/Moderate/High)',
      'Initial system boundary definition'
    ],
    estimatedDuration: '1-2 weeks',
    color: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20'
  },
  {
    key: 'Select',
    label: 'Select',
    order: 2,
    description: 'Select the set of security controls for the information system based on the security categorization and organizational risk management strategy.',
    icon: Shield,
    requirements: [
      'Completed security categorization',
      'Organizational security control catalog',
      'Risk assessment results',
      'Tailoring guidance'
    ],
    outputs: [
      'Security control baseline',
      'Control tailoring decisions',
      'Control selection rationale',
      'Continuous monitoring strategy'
    ],
    estimatedDuration: '2-3 weeks',
    color: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20'
  },
  {
    key: 'Implement',
    label: 'Implement',
    order: 3,
    description: 'Implement the security controls and describe how the controls are employed within the information system and its environment of operation.',
    icon: Settings,
    requirements: [
      'Selected security controls',
      'System architecture',
      'Implementation guidance',
      'Resource allocation'
    ],
    outputs: [
      'System Security Plan (SSP)',
      'Implementation evidence',
      'Configuration baselines',
      'Control implementation descriptions'
    ],
    estimatedDuration: '8-12 weeks',
    color: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20'
  },
  {
    key: 'Assess',
    label: 'Assess',
    order: 4,
    description: 'Assess the security controls using appropriate assessment procedures to determine the extent to which the controls are implemented correctly and producing desired outcome.',
    icon: Search,
    requirements: [
      'Implemented security controls',
      'Assessment plan',
      'Testing procedures',
      'Independent assessor'
    ],
    outputs: [
      'Security Assessment Report (SAR)',
      'POA&M for identified deficiencies',
      'Risk assessment update',
      'Control effectiveness determination'
    ],
    estimatedDuration: '4-6 weeks',
    color: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20'
  },
  {
    key: 'Authorize',
    label: 'Authorize',
    order: 5,
    description: 'Authorize system operation based on a determination of the risk to organizational operations, assets, individuals, and other organizations.',
    icon: CheckSquare,
    requirements: [
      'Completed assessment',
      'POA&M',
      'Risk assessment',
      'Authorization package'
    ],
    outputs: [
      'Authorization to Operate (ATO)',
      'Authorization decision',
      'Terms and conditions',
      'Risk acceptance documentation'
    ],
    estimatedDuration: '2-4 weeks',
    color: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20'
  },
  {
    key: 'Monitor',
    label: 'Monitor',
    order: 6,
    description: 'Continuously monitor the security controls in the information system to ensure that they remain effective over time.',
    icon: Lock,
    requirements: [
      'Active ATO',
      'Continuous monitoring strategy',
      'Automated tools',
      'Reporting procedures'
    ],
    outputs: [
      'Ongoing authorization',
      'Security status reports',
      'POA&M updates',
      'Risk register updates'
    ],
    estimatedDuration: 'Ongoing',
    color: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20'
  }
]

interface RmfProcessTrackerProps {
  packageId: number
  currentStep: string
  packageData?: any
  onStepUpdate?: (newStep: string) => Promise<void>
  readOnly?: boolean
}

export default function RmfProcessTracker({
  packageId,
  currentStep,
  packageData,
  onStepUpdate,
  readOnly = false
}: RmfProcessTrackerProps) {
  const [selectedStep, setSelectedStep] = useState<RmfStep | null>(null)
  const [transitionStep, setTransitionStep] = useState<RmfStep | null>(null)
  const [transitionNotes, setTransitionNotes] = useState('')
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [showTransitionDialog, setShowTransitionDialog] = useState(false)
  const { toast } = useToast()

  const currentStepIndex = RMF_STEPS.findIndex(s => s.key === currentStep)

  // Calculate real progress based on actual data
  const calculateRealProgress = () => {
    if (!packageData) return 0

    let completedSteps = 0
    let totalRequirements = 0

    // Categorize: Check if system categorization is complete
    if (packageData.systemType && packageData.dataClassification &&
        packageData.confidentialityImpact && packageData.integrityImpact &&
        packageData.availabilityImpact) {
      completedSteps++
    }
    totalRequirements++

    // Select: Check if baseline is selected
    if (packageData.securityControlBaseline) {
      completedSteps++
    }
    totalRequirements++

    // Implement: Check systems/groups exist
    if ((packageData._count?.systems || 0) > 0 && (packageData._count?.groups || 0) > 0) {
      completedSteps++
    }
    totalRequirements++

    // Assess: Check for STPs
    if ((packageData._count?.stps || 0) > 0) {
      completedSteps++
    }
    totalRequirements++

    // Authorize: Check for POAMs and ATO
    if ((packageData._count?.poams || 0) > 0 || packageData.authorizationExpiry) {
      completedSteps++
    }
    totalRequirements++

    // Monitor: Active if ATO exists and not expired
    if (packageData.authorizationExpiry && new Date(packageData.authorizationExpiry) > new Date()) {
      completedSteps++
    }
    totalRequirements++

    return (completedSteps / totalRequirements) * 100
  }

  const progressPercentage = calculateRealProgress()


  const getStepStatus = (step: RmfStep) => {
    const stepIndex = RMF_STEPS.findIndex(s => s.key === step.key)
    if (stepIndex < currentStepIndex) return 'completed'
    if (stepIndex === currentStepIndex) return 'current'
    return 'pending'
  }

  const canTransitionTo = (step: RmfStep) => {
    if (readOnly) return false
    const stepIndex = RMF_STEPS.findIndex(s => s.key === step.key)
    return stepIndex === currentStepIndex + 1 || stepIndex === currentStepIndex - 1
  }

  const handleStepTransition = async () => {
    if (!transitionStep || !onStepUpdate) {
      console.error('No step selected or onStepUpdate not provided')
      return
    }

    setIsTransitioning(true)
    try {
      await onStepUpdate(transitionStep.key)

      toast({
        title: 'RMF Step Updated',
        description: `Successfully transitioned to ${transitionStep.label} phase`,
      })

      setTransitionStep(null)
      setTransitionNotes('')
      setShowTransitionDialog(false)
    } catch (error) {
      console.error('Error transitioning step:', error)
      toast({
        title: 'Update Failed',
        description: 'Failed to update RMF step. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsTransitioning(false)
    }
  }

  const getStepIcon = (step: RmfStep, status: string) => {
    const IconComponent = step.icon

    if (status === 'completed') {
      return <CheckCircle2 className="h-5 w-5 text-green-600" />
    }

    if (status === 'current') {
      return (
        <div className="relative">
          <IconComponent className="h-5 w-5" />
          <div className="absolute -top-1 -right-1 h-2 w-2 bg-blue-600 rounded-full animate-pulse" />
        </div>
      )
    }

    return <Circle className="h-5 w-5 text-gray-400" />
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>RMF Process Tracker</CardTitle>
          <CardDescription>
            Track and manage the Risk Management Framework lifecycle
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span className="font-medium">{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          <Tabs defaultValue="timeline" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="timeline">Process Timeline</TabsTrigger>
              <TabsTrigger value="documents">Document Management</TabsTrigger>
            </TabsList>

            <TabsContent value="timeline" className="space-y-6">
              <div className="relative">
                {RMF_STEPS.map((step, index) => {
                  const status = getStepStatus(step)
                  const isLast = index === RMF_STEPS.length - 1

                  return (
                    <div key={step.key} className="flex items-start pb-8 last:pb-0">
                      {!isLast && (
                        <div className="absolute left-[18px] top-[28px] w-0.5 h-full bg-gray-200 dark:bg-gray-700" />
                      )}

                      <div className="relative z-10 flex items-center gap-4 w-full">
                        <div className={`flex-shrink-0 ${status === 'current' ? 'scale-110' : ''}`}>
                          {getStepIcon(step, status)}
                        </div>

                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h4 className={`font-medium ${status === 'current' ? 'text-primary' : ''}`}>
                                  Step {step.order}: {step.label}
                                </h4>
                                {status === 'current' && (
                                  <Badge variant="default" className="text-xs">
                                    Current
                                  </Badge>
                                )}
                                {status === 'completed' && (
                                  <Badge variant="secondary" className="text-xs">
                                    Completed
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {step.description}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {step.estimatedDuration}
                                </span>
                              </div>
                            </div>

                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedStep(step)}
                              >
                                View Details
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  <step.icon className="h-5 w-5" />
                                  {step.label} - RMF Step {step.order}
                                </DialogTitle>
                                <DialogDescription>
                                  {step.description}
                                </DialogDescription>
                              </DialogHeader>

                              <div className="space-y-4 py-4">
                                {/* Real Data Status */}
                                {packageData && (
                                  <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                                    <h4 className="font-medium mb-2 flex items-center gap-2">
                                      <Activity className="h-4 w-4" />
                                      Actual Status (Based on Real Data)
                                    </h4>

                                    {step.key === 'Categorize' && (
                                      <div className="space-y-1 text-sm">
                                        <div className="flex items-center justify-between">
                                          <span>System Type:</span>
                                          <Badge variant={packageData.systemType ? "default" : "secondary"}>
                                            {packageData.systemType || 'Not Set'}
                                          </Badge>
                                        </div>
                                        <div className="flex items-center justify-between">
                                          <span>Data Classification:</span>
                                          <Badge variant={packageData.dataClassification ? "default" : "secondary"}>
                                            {packageData.dataClassification || 'Not Set'}
                                          </Badge>
                                        </div>
                                        <div className="flex items-center justify-between">
                                          <span>Impact Levels:</span>
                                          <div className="flex gap-1">
                                            <Badge variant={packageData.confidentialityImpact ? "default" : "secondary"} className="text-xs">
                                              C: {packageData.confidentialityImpact || '-'}
                                            </Badge>
                                            <Badge variant={packageData.integrityImpact ? "default" : "secondary"} className="text-xs">
                                              I: {packageData.integrityImpact || '-'}
                                            </Badge>
                                            <Badge variant={packageData.availabilityImpact ? "default" : "secondary"} className="text-xs">
                                              A: {packageData.availabilityImpact || '-'}
                                            </Badge>
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                    {step.key === 'Select' && (
                                      <div className="space-y-1 text-sm">
                                        <div className="flex items-center justify-between">
                                          <span>Security Control Baseline:</span>
                                          <Badge variant={packageData.securityControlBaseline ? "default" : "secondary"}>
                                            {packageData.securityControlBaseline || 'Not Selected'}
                                          </Badge>
                                        </div>
                                      </div>
                                    )}

                                    {step.key === 'Implement' && (
                                      <div className="space-y-1 text-sm">
                                        <div className="flex items-center justify-between">
                                          <span>Systems Defined:</span>
                                          <Badge variant={packageData._count?.systems > 0 ? "default" : "secondary"}>
                                            {packageData._count?.systems || 0} Systems
                                          </Badge>
                                        </div>
                                        <div className="flex items-center justify-between">
                                          <span>Groups Created:</span>
                                          <Badge variant={packageData._count?.groups > 0 ? "default" : "secondary"}>
                                            {packageData._count?.groups || 0} Groups
                                          </Badge>
                                        </div>
                                      </div>
                                    )}

                                    {step.key === 'Assess' && (
                                      <div className="space-y-1 text-sm">
                                        <div className="flex items-center justify-between">
                                          <span>Security Test Procedures:</span>
                                          <Badge variant={packageData._count?.stps > 0 ? "default" : "secondary"}>
                                            {packageData._count?.stps || 0} STPs
                                          </Badge>
                                        </div>
                                      </div>
                                    )}

                                    {step.key === 'Authorize' && (
                                      <div className="space-y-1 text-sm">
                                        <div className="flex items-center justify-between">
                                          <span>POA&Ms:</span>
                                          <Badge variant={packageData._count?.poams > 0 ? "default" : "secondary"}>
                                            {packageData._count?.poams || 0} Items
                                          </Badge>
                                        </div>
                                        <div className="flex items-center justify-between">
                                          <span>ATO Status:</span>
                                          <Badge variant={packageData.authorizationExpiry ? "default" : "secondary"}>
                                            {packageData.authorizationExpiry ?
                                              `Expires: ${new Date(packageData.authorizationExpiry).toLocaleDateString()}` :
                                              'Not Authorized'}
                                          </Badge>
                                        </div>
                                      </div>
                                    )}

                                    {step.key === 'Monitor' && (
                                      <div className="space-y-1 text-sm">
                                        <div className="flex items-center justify-between">
                                          <span>Continuous Monitoring:</span>
                                          <Badge variant={packageData.continuousMonitoringStatus === 'Enabled' ? "default" : "secondary"}>
                                            {packageData.continuousMonitoringStatus || 'Not Configured'}
                                          </Badge>
                                        </div>
                                        {packageData.authorizationExpiry && (
                                          <div className="flex items-center justify-between">
                                            <span>Days Until Expiry:</span>
                                            <Badge variant="outline">
                                              {Math.floor((new Date(packageData.authorizationExpiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days
                                            </Badge>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )}

                                <div>
                                  <h4 className="font-medium mb-2">Requirements</h4>
                                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                                    {step.requirements.map((req, i) => (
                                      <li key={i}>{req}</li>
                                    ))}
                                  </ul>
                                </div>

                                <div>
                                  <h4 className="font-medium mb-2">Expected Outputs</h4>
                                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                                    {step.outputs.map((output, i) => (
                                      <li key={i}>{output}</li>
                                    ))}
                                  </ul>
                                </div>

                                <div>
                                  <Badge variant="outline" className={step.color}>
                                    Estimated Duration: {step.estimatedDuration}
                                  </Badge>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>

                          {canTransitionTo(step) && !readOnly && (
                            <Button
                              size="sm"
                              variant={status === 'current' ? 'default' : 'secondary'}
                              onClick={() => {
                                setTransitionStep(step)
                                setShowTransitionDialog(true)
                              }}
                            >
                              <ChevronRight className="h-4 w-4 mr-1" />
                              Transition Here
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
              </div>
            </TabsContent>

            <TabsContent value="documents" className="space-y-6">
              <DocumentUpload
                packageId={packageId}
                currentRmfStep={currentStep}
                onDocumentUploaded={() => {
                  // Refresh document completion status when new documents are uploaded
                  const checkDocumentCompletion = async () => {
                    const completionStatus: Record<string, boolean> = {}

                    for (const step of RMF_STEPS) {
                      try {
                        const response = await fetch(`/api/packages/${packageId}/documents/required/${step.key}`)
                        if (response.ok) {
                          const data = await response.json()
                          completionStatus[step.key] = data.complete
                        }
                      } catch (error) {
                        console.error(`Error checking documents for ${step.key}:`, error)
                        completionStatus[step.key] = false
                      }
                    }

                    setDocumentCompletionStatus(completionStatus)
                  }

                  checkDocumentCompletion()
                }}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Transition Dialog */}
      <Dialog open={showTransitionDialog} onOpenChange={setShowTransitionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Transition to {transitionStep?.label}
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to transition to the {transitionStep?.label} phase?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This will update the package's RMF status. Ensure all requirements
                for the previous step have been completed.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="transition-notes">Transition Notes (Optional)</Label>
              <Textarea
                id="transition-notes"
                placeholder="Add any notes about this transition..."
                value={transitionNotes}
                onChange={(e) => setTransitionNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setTransitionStep(null)
                setTransitionNotes('')
                setShowTransitionDialog(false)
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleStepTransition}
              disabled={isTransitioning}
            >
              {isTransitioning ? 'Updating...' : 'Confirm Transition'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}