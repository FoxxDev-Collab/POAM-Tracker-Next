"use client"

import { useState, useEffect } from "react"
import {
  Shield, ArrowLeft, FileText, AlertTriangle, CheckCircle, Clock, Hash,
  Activity, Settings, Package
} from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface ATOPackage {
  id: number
  name: string
  description: string | null
  rmfStep: string
  impactLevel: string | null
}

interface CCI {
  cci: string
  definition: string
}

interface Control {
  id: string
  name: string
  family: string
  controlText: string
  discussion: string
  relatedControls?: string[]
  ccis?: CCI[]
}

interface ControlDetailPageProps {
  familyId: string
  familyName: string
  familyIconName?: string
}

const ICON_MAP = {
  Shield,
  FileText,
  Activity,
  CheckCircle,
  Settings,
  AlertTriangle,
  Package
} as const

export default function ControlDetailPage({ familyId, familyName, familyIconName = 'Shield' }: ControlDetailPageProps) {
  const FamilyIcon = ICON_MAP[familyIconName as keyof typeof ICON_MAP] || Shield
  const params = useParams()
  const controlId = params.id as string
  const [packages, setPackages] = useState<ATOPackage[]>([])
  const [selectedPackageId, setSelectedPackageId] = useState<string>("")
  const [control, setControl] = useState<Control | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPackages()
    fetchControl()
  }, [controlId])

  useEffect(() => {
    if (selectedPackageId) {
      localStorage.setItem('selectedATOPackage', selectedPackageId)
    }
  }, [selectedPackageId])

  const fetchPackages = async () => {
    try {
      const response = await fetch('/api/packages')
      if (response.ok) {
        const data = await response.json()
        const packagesData = data.items || data || []
        setPackages(packagesData)

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

  const fetchControl = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/catalog/controls/${controlId}`)
      if (response.ok) {
        const data = await response.json()
        const controlData = data.data

        // Map backend response to frontend Control interface
        if (controlData) {
          setControl({
            id: controlData.controlId || controlId,
            name: controlData.name,
            family: familyId,
            controlText: controlData.controlText,
            discussion: controlData.discussion,
            relatedControls: controlData.relatedControls?.map((rc: any) => rc.relatedControlId) || [],
            ccis: controlData.ccis || []
          })
        }
      }
    } catch (error) {
      console.error('Failed to fetch control:', error)
    } finally {
      setLoading(false)
    }
  }

  const isEnhancement = controlId.includes('(')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href={`/rmf-center/control-catalog/${familyId}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <FamilyIcon className="h-8 w-8 text-primary" />
              {controlId}
            </h1>
            {control && (
              <p className="text-xl text-muted-foreground mt-1">
                {control.name}
              </p>
            )}
          </div>
        </div>

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

      {/* Quick Actions */}
      <div className="flex gap-2 flex-wrap">
        <Badge variant={isEnhancement ? "secondary" : "default"}>
          {isEnhancement ? "Enhancement" : "Baseline"}
        </Badge>
        <Button variant="outline" size="sm" disabled>
          <CheckCircle className="h-4 w-4 mr-2" />
          Control Status
        </Button>
        <Button variant="outline" size="sm" disabled>
          <FileText className="h-4 w-4 mr-2" />
          Compliance Status - STIG Map
        </Button>
        <Button variant="outline" size="sm" disabled>
          <AlertTriangle className="h-4 w-4 mr-2" />
          POA&Ms - Create/Track
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-[200px] w-full" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      ) : control ? (
        <div className="space-y-6">
          {/* Control Text */}
          <Card>
            <CardHeader>
              <CardTitle>Control Text</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose dark:prose-invert max-w-none">
                <p className="whitespace-pre-wrap">{control.controlText}</p>
              </div>
            </CardContent>
          </Card>

          {/* Discussion */}
          <Card>
            <CardHeader>
              <CardTitle>Discussion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose dark:prose-invert max-w-none">
                <p className="whitespace-pre-wrap">{control.discussion}</p>
              </div>
            </CardContent>
          </Card>

          {/* Implementation Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Implementation Status</CardTitle>
                <CardDescription>
                  Track implementation progress for this control
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b">
                    <span className="font-medium">Implementation Status</span>
                    <Badge variant="secondary">Not Implemented</Badge>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b">
                    <span className="font-medium">Compliance Status</span>
                    <Badge className="bg-blue-500">Not Reviewed</Badge>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b">
                    <span className="font-medium">Last Assessment</span>
                    <span className="text-muted-foreground">Never</span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className="font-medium">Open POA&Ms</span>
                    <span className="font-semibold">0</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Related Controls */}
            {control.relatedControls && control.relatedControls.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Related Controls</CardTitle>
                  <CardDescription>
                    Other controls related to this requirement
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {control.relatedControls.map((related) => (
                      <Link key={related} href={`/rmf-center/control-catalog/${related.split('-')[0]}/${related}`}>
                        <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                          {related}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* CCIs Table */}
          <Card>
            <CardHeader>
              <CardTitle>Control Correlation Identifiers (CCIs)</CardTitle>
              <CardDescription>
                Detailed implementation requirements for this control - {control.ccis?.length || 0} CCIs
              </CardDescription>
            </CardHeader>
            <CardContent>
              {control.ccis && control.ccis.length > 0 ? (
                <div className="w-full">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[120px]">CCI ID</TableHead>
                        <TableHead>Definition</TableHead>
                        <TableHead className="w-[140px]">Status</TableHead>
                        <TableHead className="w-[80px] text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {control.ccis.map((cci, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-mono font-semibold align-top">
                            {cci.cci}
                          </TableCell>
                          <TableCell className="text-sm align-top">
                            <p className="whitespace-pre-wrap break-words">
                              {cci.definition}
                            </p>
                          </TableCell>
                          <TableCell className="align-top">
                            <Badge variant="outline">Not Reviewed</Badge>
                          </TableCell>
                          <TableCell className="text-center align-top">
                            <Button size="sm" variant="ghost" disabled>
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No CCIs available for this control
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Control Not Found</h3>
            <p className="text-muted-foreground">
              The control {controlId} could not be found in the catalog
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}