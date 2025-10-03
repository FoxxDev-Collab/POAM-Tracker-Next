"use client"

import { useState, useEffect } from "react"
import {
  Plus, Package, Shield, Users, Edit, Trash2, Calendar,
  BarChart3
} from "lucide-react"
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

  const getRmfStepBadge = (step: string) => {
    switch (step) {
      case 'CATEGORIZE':
        return { className: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20" }
      case 'SELECT':
        return { className: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20" }
      case 'IMPLEMENT':
        return { className: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20" }
      case 'ASSESS':
        return { className: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20" }
      case 'AUTHORIZE':
        return { className: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20" }
      case 'MONITOR':
        return { className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20" }
      default:
        return { className: "bg-muted" }
    }
  }

  const getClassificationBadge = (classification: string | null) => {
    switch (classification) {
      case 'TOP_SECRET':
        return { className: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20" }
      case 'SECRET':
        return { className: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20" }
      case 'CONFIDENTIAL':
        return { className: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20" }
      case 'UNCLASSIFIED':
        return { className: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20" }
      default:
        return { className: "bg-muted" }
    }
  }

  const getImpactLevelBadge = (level: string | null) => {
    switch (level?.toUpperCase()) {
      case 'HIGH':
        return { className: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20" }
      case 'MODERATE':
        return { className: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20" }
      case 'LOW':
        return { className: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20" }
      default:
        return { className: "bg-muted" }
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

  const stats = {
    totalPackages: packages.length,
    inProgress: packages.filter(p => !['AUTHORIZE', 'MONITOR'].includes(p.rmfStep)).length,
    authorized: packages.filter(p => ['AUTHORIZE', 'MONITOR'].includes(p.rmfStep)).length,
    totalSystems: packages.reduce((acc, p) => acc + (p._count?.systems || 0), 0)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            RMF Center: ATO Packages
          </h1>
          <p className="text-muted-foreground">
            Manage Authorization to Operate packages through the Risk Management Framework
          </p>
        </div>
        <Link href="/rmf-center/packages/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New ATO Package
          </Button>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Packages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPackages}</div>
            <p className="text-xs text-muted-foreground mt-1">Active packages</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground mt-1">Being developed</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Authorized</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.authorized}</div>
            <p className="text-xs text-muted-foreground mt-1">Fully authorized</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Systems</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.totalSystems}</div>
            <p className="text-xs text-muted-foreground mt-1">Across all packages</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="relative flex-1 md:max-w-sm">
          <Package className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search packages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Package Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-full"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
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
          {filteredPackages.map((pkg) => {
            const rmfBadge = getRmfStepBadge(pkg.rmfStep)
            const classificationBadge = getClassificationBadge(pkg.dataClassification)
            const impactBadge = getImpactLevelBadge(pkg.impactLevel)
            const daysUntilExpiry = pkg.authorizationExpiry 
              ? Math.floor((new Date(pkg.authorizationExpiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
              : null
            
            return (
              <Card key={pkg.id} className="hover:shadow-lg transition-all hover:border-primary/50 group">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2 group-hover:text-primary transition-colors">
                        <Package className="h-5 w-5 text-primary" />
                        {pkg.name}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {pkg.description || "No description provided"}
                      </CardDescription>
                    </div>
                  </div>
                  
                  {/* RMF Progress */}
                  <div className="space-y-2 mt-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">RMF Progress</span>
                      <Badge variant="outline" className={rmfBadge.className}>
                        {RMF_STEPS.find(s => s.key === pkg.rmfStep)?.label || pkg.rmfStep}
                      </Badge>
                    </div>
                    <Progress value={getRmfProgress(pkg.rmfStep)} className="h-2" />
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  {/* System Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{pkg._count?.systems || 0} Systems</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <BarChart3 className="h-4 w-4" />
                      <span>{pkg._count?.groups || 0} Groups</span>
                    </div>
                  </div>

                  {/* Classification & Impact */}
                  <div className="flex gap-2 flex-wrap">
                    {pkg.dataClassification && (
                      <Badge variant="outline" className={classificationBadge.className}>
                        {pkg.dataClassification.replace('_', ' ')}
                      </Badge>
                    )}
                    {pkg.impactLevel && (
                      <Badge variant="outline" className={impactBadge.className}>
                        {pkg.impactLevel} Impact
                      </Badge>
                    )}
                  </div>

                  {/* ATO Expiration */}
                  {pkg.authorizationExpiry && (
                    <div className="pt-3 border-t">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>ATO Expires</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {new Date(pkg.authorizationExpiry).toLocaleDateString()}
                          </div>
                          {daysUntilExpiry !== null && (
                            <Badge 
                              variant={daysUntilExpiry < 30 ? "destructive" : daysUntilExpiry < 90 ? "secondary" : "outline"}
                              className="text-xs mt-1"
                            >
                              {daysUntilExpiry > 0 ? `${daysUntilExpiry} days remaining` : 'Expired'}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="pt-3 border-t">
                    <div className="flex gap-2">
                      <Link href={`/rmf-center/packages/${pkg.id}`} className="flex-1">
                        <Button className="w-full" variant="outline">
                          <Shield className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEditPackage(pkg.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeletePackage(pkg.id, pkg.name)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}