"use client"

import { useState, useEffect } from "react"
import {
  Shield, Package, AlertTriangle, CheckCircle,
  FileText, TrendingUp, Activity, Settings
} from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

interface ATOPackage {
  id: number
  name: string
  description: string | null
  rmfStep: string
  impactLevel: string | null
}

interface ControlFamily {
  family: string
  name: string
  description: string
  controlCount: number
  implementedCount: number
  compliance: number
}

interface CatalogStats {
  totalControls: number
  totalCCIs: number
  controlFamilies: number
}

const CONTROL_FAMILIES = [
  { id: "AC", name: "Access Control", icon: Shield },
  { id: "AT", name: "Awareness and Training", icon: FileText },
  { id: "AU", name: "Audit and Accountability", icon: Activity },
  { id: "CA", name: "Assessment, Authorization, and Monitoring", icon: CheckCircle },
  { id: "CM", name: "Configuration Management", icon: Settings },
  { id: "CP", name: "Contingency Planning", icon: AlertTriangle },
  { id: "IA", name: "Identification and Authentication", icon: Shield },
  { id: "IR", name: "Incident Response", icon: AlertTriangle },
  { id: "MA", name: "Maintenance", icon: Settings },
  { id: "MP", name: "Media Protection", icon: Shield },
  { id: "PE", name: "Physical and Environmental Protection", icon: Shield },
  { id: "PL", name: "Planning", icon: FileText },
  { id: "PM", name: "Program Management", icon: Package },
  { id: "PS", name: "Personnel Security", icon: Shield },
  { id: "PT", name: "Personally Identifiable Information Processing", icon: Shield },
  { id: "RA", name: "Risk Assessment", icon: AlertTriangle },
  { id: "SA", name: "System and Services Acquisition", icon: Package },
  { id: "SC", name: "System and Communications Protection", icon: Shield },
  { id: "SI", name: "System and Information Integrity", icon: CheckCircle },
  { id: "SR", name: "Supply Chain Risk Management", icon: Package }
]

export default function ControlCatalogDashboard() {
  const [packages, setPackages] = useState<ATOPackage[]>([])
  const [selectedPackageId, setSelectedPackageId] = useState<string>("")
  const [catalogStats, setCatalogStats] = useState<CatalogStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [familyStats, setFamilyStats] = useState<Map<string, ControlFamily>>(new Map())

  useEffect(() => {
    fetchPackages()
    fetchCatalogStats()
  }, [])

  useEffect(() => {
    if (selectedPackageId) {
      localStorage.setItem('selectedATOPackage', selectedPackageId)
      fetchPackageControlStatus(selectedPackageId)
    }
  }, [selectedPackageId])

  const fetchPackages = async () => {
    try {
      const response = await fetch('/api/packages')
      if (response.ok) {
        const data = await response.json()
        const packagesData = data.items || data || []
        setPackages(packagesData)

        // Set default package or restore from localStorage
        const savedPackageId = localStorage.getItem('selectedATOPackage')
        if (savedPackageId && packagesData.some((p: ATOPackage) => p.id.toString() === savedPackageId)) {
          setSelectedPackageId(savedPackageId)
        } else if (packagesData.length > 0) {
          setSelectedPackageId(packagesData[0].id.toString())
        }
      }
    } catch (error) {
      console.error('Failed to fetch packages:', error)
    }
  }

  const fetchCatalogStats = async () => {
    try {
      const response = await fetch('/api/catalog/stats')
      if (response.ok) {
        const data = await response.json()
        setCatalogStats(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch catalog stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPackageControlStatus = async (_selectedPackageId: string) => {
    // This would fetch package-specific control implementation status
    // For now, we'll use placeholder data
    const tempStats = new Map<string, ControlFamily>()
    CONTROL_FAMILIES.forEach(family => {
      tempStats.set(family.id, {
        family: family.id,
        name: family.name,
        description: "",
        controlCount: Math.floor(Math.random() * 50) + 10,
        implementedCount: Math.floor(Math.random() * 40),
        compliance: Math.floor(Math.random() * 100)
      })
    })
    setFamilyStats(tempStats)
  }

  const getComplianceColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600"
    if (percentage >= 70) return "text-yellow-600"
    if (percentage >= 50) return "text-orange-600"
    return "text-red-600"
  }

  const getComplianceBadge = (percentage: number) => {
    if (percentage >= 90) return <Badge className="bg-green-500">Compliant</Badge>
    if (percentage >= 70) return <Badge className="bg-yellow-500">Partially Compliant</Badge>
    return <Badge variant="destructive">Non-Compliant</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Header with Package Selector */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            NIST Control Catalog
          </h1>
          <p className="text-muted-foreground">
            Manage NIST 800-53 Rev 5 security controls for your ATO packages
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Select value={selectedPackageId} onValueChange={setSelectedPackageId}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Select ATO Package" />
            </SelectTrigger>
            <SelectContent>
              {packages.map((pkg) => (
                <SelectItem key={pkg.id} value={pkg.id.toString()}>
                  {pkg.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Overview Stats */}
      {selectedPackageId && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Controls
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{catalogStats?.totalControls || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                NIST 800-53 Rev 5
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Implemented
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">0</div>
              <p className="text-xs text-muted-foreground mt-1">
                Fully implemented controls
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                In Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">0</div>
              <p className="text-xs text-muted-foreground mt-1">
                Being implemented
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                POA&Ms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">0</div>
              <p className="text-xs text-muted-foreground mt-1">
                Open action items
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Control Families Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Control Families</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {CONTROL_FAMILIES.map((family) => {
            const Icon = family.icon
            const stats = familyStats.get(family.id)
            const compliancePercentage = stats ?
              (stats.implementedCount / stats.controlCount) * 100 : 0

            return (
              <Link key={family.id} href={`/rmf-center/control-catalog/${family.id}`}>
                <Card className="hover:shadow-lg transition-all hover:border-primary/50 cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-5 w-5 text-primary" />
                        <div>
                          <CardTitle className="text-lg">
                            {family.id} - {family.name}
                          </CardTitle>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {loading ? (
                      <Skeleton className="h-20 w-full" />
                    ) : stats ? (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Controls</span>
                          <span className="font-medium">
                            {stats.implementedCount} / {stats.controlCount}
                          </span>
                        </div>
                        <Progress value={compliancePercentage} className="h-2" />
                        <div className="flex items-center justify-between">
                          <span className={`text-sm font-medium ${getComplianceColor(compliancePercentage)}`}>
                            {Math.round(compliancePercentage)}% Complete
                          </span>
                          {getComplianceBadge(compliancePercentage)}
                        </div>
                      </>
                    ) : (
                      <div className="text-center text-muted-foreground py-4">
                        Select a package to view status
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common control management tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <Button variant="outline" disabled>
              <FileText className="h-4 w-4 mr-2" />
              Generate SSP
            </Button>
            <Button variant="outline" disabled>
              <CheckCircle className="h-4 w-4 mr-2" />
              Run Compliance Check
            </Button>
            <Button variant="outline" disabled>
              <TrendingUp className="h-4 w-4 mr-2" />
              Export Control Matrix
            </Button>
            <Button variant="outline" disabled>
              <AlertTriangle className="h-4 w-4 mr-2" />
              View All POA&Ms
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}