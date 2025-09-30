"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { Shield, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

import { DetailsTab } from "./components/details-tab"
import { TopologyTab } from "./components/topology-tab"
import { PPSMTab } from "./components/ppsm-tab"
import { AssetManagementTab } from "./components/asset-management-tab"
import RMFProcessTracker from "../components/rmf-process-tracker"

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
  _count?: {
    systems: number
    groups: number
    stps: number
    poams: number
  }
}

const RMF_STEPS = [
  { key: 'Categorize', label: 'Categorize', order: 1 },
  { key: 'Select', label: 'Select', order: 2 },
  { key: 'Implement', label: 'Implement', order: 3 },
  { key: 'Assess', label: 'Assess', order: 4 },
  { key: 'Authorize', label: 'Authorize', order: 5 },
  { key: 'Monitor', label: 'Monitor', order: 6 }
]

export default function PackageManagementPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const packageId = parseInt(params.id as string)
  
  const [packageData, setPackageData] = useState<Package | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'rmf-process')

  const fetchPackage = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/packages/${packageId}`)
      if (response.ok) {
        const data = await response.json()
        setPackageData(data.item || data)
      } else {
        throw new Error('Failed to fetch package')
      }
    } catch (error) {
      console.error('Error fetching package:', error)
      toast.error("Failed to load package")
    } finally {
      setLoading(false)
    }
  }, [packageId])

  const handleRmfStepUpdate = async (newStep: string) => {
    try {
      const response = await fetch(`/api/packages/${packageId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rmfStep: newStep
        })
      })

      if (response.ok) {
        await fetchPackage()
        toast.success(`Successfully transitioned to ${newStep} phase`)
      } else {
        throw new Error('Failed to update RMF step')
      }
    } catch (error) {
      console.error('Error updating RMF step:', error)
      toast.error('Failed to update RMF step')
      throw error
    }
  }

  useEffect(() => {
    fetchPackage()
  }, [fetchPackage])


  const getRmfStepColor = (step: string) => {
    switch (step) {
      case 'Categorize':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20'
      case 'Select':
        return 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20'
      case 'Implement':
        return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20'
      case 'Assess':
        return 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20'
      case 'Authorize':
        return 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20'
      case 'Monitor':
        return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
      default:
        return 'bg-muted'
    }
  }

  const getClassificationColor = (classification: string | null) => {
    switch (classification) {
      case 'Top_Secret':
        return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20'
      case 'Secret':
        return 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20'
      case 'Confidential':
        return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20'
      case 'Unclassified':
        return 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20'
      default:
        return 'bg-muted'
    }
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    // Update URL without navigation
    const url = new URL(window.location.href)
    url.searchParams.set('tab', tab)
    window.history.replaceState({}, '', url.toString())
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/2"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  if (!packageData) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="text-center py-12">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Package Not Found</h3>
            <p className="text-muted-foreground mb-4">
              The requested package could not be found.
            </p>
            <Link href="/rmf-center/packages">
              <Button>Back to Packages</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/rmf-center/packages">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              {packageData.name}
            </h1>
            <p className="text-muted-foreground">
              Package Management - RMF Center
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getRmfStepColor(packageData.rmfStep)}>
            RMF Step: {RMF_STEPS.find(s => s.key === packageData.rmfStep)?.label || packageData.rmfStep}
          </Badge>
          {packageData.dataClassification && (
            <Badge variant="outline" className={getClassificationColor(packageData.dataClassification)}>
              {packageData.dataClassification.replace('_', ' ')}
            </Badge>
          )}
        </div>
      </div>

      {/* Package Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Package Overview</CardTitle>
          <CardDescription>
            {packageData.description || "No description provided"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{packageData._count?.systems || 0}</div>
              <div className="text-sm text-muted-foreground">Systems</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{packageData._count?.groups || 0}</div>
              <div className="text-sm text-muted-foreground">Groups</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{packageData._count?.stps || 0}</div>
              <div className="text-sm text-muted-foreground">STPs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{packageData._count?.poams || 0}</div>
              <div className="text-sm text-muted-foreground">POAMs</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="rmf-process">RMF Process</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="topology">Topology</TabsTrigger>
          <TabsTrigger value="ppsm">PPSM</TabsTrigger>
          <TabsTrigger value="assets">Asset Management</TabsTrigger>
        </TabsList>

        <TabsContent value="rmf-process">
          <RMFProcessTracker
            packageId={packageId}
            currentStep={packageData.rmfStep}
            packageData={packageData}
            onStepUpdate={handleRmfStepUpdate}
          />
        </TabsContent>

        <TabsContent value="details">
          <DetailsTab packageData={packageData} onUpdate={fetchPackage} />
        </TabsContent>

        <TabsContent value="topology">
          <TopologyTab packageId={packageId} />
        </TabsContent>

        <TabsContent value="ppsm">
          <PPSMTab packageId={packageId} />
        </TabsContent>

        <TabsContent value="assets">
          <AssetManagementTab packageId={packageId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}