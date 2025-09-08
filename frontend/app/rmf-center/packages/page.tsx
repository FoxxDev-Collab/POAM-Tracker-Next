"use client"

import { useState, useEffect } from "react"
import { Plus, Package, Shield, Users, Edit, Trash2, MoreVertical } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"

interface Package {
  id: number
  name: string
  description: string | null
  authorizationExpiry: string | null
  rmfStep: string
  impactLevel: string | null
  dataClassification: string | null
  systemType: string | null
  createdAt: string
  updatedAt: string
  _count?: {
    systems: number
    groups: number
  }
}

const RMF_STEPS = [
  { key: 'CATEGORIZE', label: 'Categorize', order: 1 },
  { key: 'SELECT', label: 'Select', order: 2 },
  { key: 'IMPLEMENT', label: 'Implement', order: 3 },
  { key: 'ASSESS', label: 'Assess', order: 4 },
  { key: 'AUTHORIZE', label: 'Authorize', order: 5 },
  { key: 'MONITOR', label: 'Monitor', order: 6 }
]

export default function RmfPackagesPage() {
  const router = useRouter()
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  const fetchPackages = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/packages')
      if (response.ok) {
        const data = await response.json()
        setPackages(data.items || data || [])
      } else {
        throw new Error('Failed to fetch packages')
      }
    } catch (error) {
      console.error('Error fetching packages:', error)
      toast.error("Failed to load packages")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPackages()
  }, [])

  const filteredPackages = packages.filter(pkg => 
    pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pkg.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getRmfProgress = (step: string) => {
    const currentStep = RMF_STEPS.find(s => s.key === step)
    return currentStep ? (currentStep.order / 6) * 100 : 0
  }

  const getRmfStepColor = (step: string) => {
    switch (step) {
      case 'CATEGORIZE':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'SELECT':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'IMPLEMENT':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'ASSESS':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'AUTHORIZE':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'MONITOR':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getClassificationColor = (classification: string | null) => {
    switch (classification) {
      case 'TOP_SECRET':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'SECRET':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'CONFIDENTIAL':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'UNCLASSIFIED':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const handleDeletePackage = async (packageId: number, packageName: string) => {
    if (!confirm(`Are you sure you want to delete the package "${packageName}"? This will also delete all associated systems, groups, and data.`)) {
      return
    }

    try {
      const response = await fetch(`/api/packages/${packageId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete package')
      }

      toast.success("Package deleted successfully")
      fetchPackages()
    } catch (error) {
      console.error('Error deleting package:', error)
      toast.error("Failed to delete package")
    }
  }

  const handleEditPackage = (packageId: number) => {
    router.push(`/rmf-center/packages/${packageId}?tab=details&edit=true`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-blue-600" />
            RMF Center: ATO Packages
          </h1>
          <p className="text-muted-foreground">
            Manage Authorization to Operate packages through the Risk Management Framework
          </p>
        </div>
        <Link href="/rmf-center/packages/new">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            New ATO Package
          </Button>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Packages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{packages.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {packages.filter(p => !['AUTHORIZE', 'MONITOR'].includes(p.rmfStep)).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Authorized</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {packages.filter(p => ['AUTHORIZE', 'MONITOR'].includes(p.rmfStep)).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Systems</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {packages.reduce((acc, p) => acc + (p._count?.systems || 0), 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <Input
          placeholder="Search packages..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Package Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredPackages.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No ATO Packages Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? "No packages match your search" : "Create your first ATO package to get started"}
            </p>
            {!searchTerm && (
              <Link href="/rmf-center/packages/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Package
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPackages.map((pkg) => (
            <Card key={pkg.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-blue-600" />
                      {pkg.name}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {pkg.description || "No description provided"}
                    </CardDescription>
                  </div>
                </div>
                
                {/* RMF Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">RMF Progress</span>
                    <Badge className={getRmfStepColor(pkg.rmfStep)}>
                      {RMF_STEPS.find(s => s.key === pkg.rmfStep)?.label || pkg.rmfStep}
                    </Badge>
                  </div>
                  <Progress value={getRmfProgress(pkg.rmfStep)} className="h-2" />
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  {/* System Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{pkg._count?.systems || 0} Systems</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span>{pkg._count?.groups || 0} Groups</span>
                    </div>
                  </div>

                  {/* Classification & Impact */}
                  <div className="flex gap-2 flex-wrap">
                    {pkg.dataClassification && (
                      <Badge variant="outline" className={getClassificationColor(pkg.dataClassification)}>
                        {pkg.dataClassification}
                      </Badge>
                    )}
                    {pkg.impactLevel && (
                      <Badge variant="outline">
                        {pkg.impactLevel} Impact
                      </Badge>
                    )}
                  </div>

                  {/* ATO Expiration */}
                  {pkg.authorizationExpiry && (
                    <div className="pt-3 border-t">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">ATO Expires</span>
                        <span className="font-medium">
                          {new Date(pkg.authorizationExpiry).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="pt-3 border-t">
                    <div className="flex gap-2">
                      <Link href={`/rmf-center/packages/${pkg.id}`} className="flex-1">
                        <Button className="w-full" variant="outline">
                          <Shield className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => handleEditPackage(pkg.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => handleDeletePackage(pkg.id, pkg.name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

    </div>
  )
}