"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, AlertTriangle, Calendar, Users } from "lucide-react"
import type { PackageRow } from "@/lib/db"

const atoSchema = z.object({
  system_type: z.enum(["Major Application", "General Support System", "Minor Application", "Subsystem"]).nullable().optional(),
  confidentiality_impact: z.enum(["Low", "Moderate", "High"]).nullable().optional(),
  integrity_impact: z.enum(["Low", "Moderate", "High"]).nullable().optional(),
  availability_impact: z.enum(["Low", "Moderate", "High"]).nullable().optional(),
  overall_categorization: z.enum(["Low", "Moderate", "High"]).nullable().optional(),
  authorization_status: z.enum(["Not Started", "In Progress", "Authorized", "Reauthorization Required", "Expired", "Denied"]).nullable().optional(),
  authorization_date: z.string().nullable().optional(),
  authorization_expiry: z.string().nullable().optional(),
  risk_assessment_date: z.string().nullable().optional(),
  residual_risk_level: z.enum(["Very Low", "Low", "Moderate", "High", "Very High"]).nullable().optional(),
  mission_criticality: z.enum(["Mission Critical", "Mission Essential", "Mission Support"]).nullable().optional(),
  data_classification: z.enum(["Unclassified", "CUI", "Secret", "Top Secret"]).nullable().optional(),
  system_owner: z.string().nullable().optional(),
  authorizing_official: z.string().nullable().optional(),
  isso_name: z.string().nullable().optional(),
  security_control_baseline: z.enum(["Low", "Moderate", "High", "Tailored"]).nullable().optional(),
  poam_status: z.enum(["Green", "Yellow", "Red"]).nullable().optional(),
  continuous_monitoring_status: z.enum(["Fully Implemented", "Partially Implemented", "Not Implemented"]).nullable().optional(),
})

type ATOFormData = z.infer<typeof atoSchema>

interface ATODetailsProps {
  packageData: PackageRow
  onUpdate?: (data: Partial<PackageRow>) => Promise<void>
}

export function ATODetails({ packageData, onUpdate }: ATODetailsProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<ATOFormData>({
    resolver: zodResolver(atoSchema),
    defaultValues: {
      system_type: packageData.system_type,
      confidentiality_impact: packageData.confidentiality_impact,
      integrity_impact: packageData.integrity_impact,
      availability_impact: packageData.availability_impact,
      overall_categorization: packageData.overall_categorization,
      authorization_status: packageData.authorization_status,
      authorization_date: packageData.authorization_date,
      authorization_expiry: packageData.authorization_expiry,
      risk_assessment_date: packageData.risk_assessment_date,
      residual_risk_level: packageData.residual_risk_level,
      mission_criticality: packageData.mission_criticality,
      data_classification: packageData.data_classification,
      system_owner: packageData.system_owner,
      authorizing_official: packageData.authorizing_official,
      isso_name: packageData.isso_name,
      security_control_baseline: packageData.security_control_baseline,
      poam_status: packageData.poam_status,
      continuous_monitoring_status: packageData.continuous_monitoring_status,
    }
  })

  async function onSubmit(data: ATOFormData) {
    if (!onUpdate) return
    setIsLoading(true)
    try {
      await onUpdate(data)
      setIsEditing(false)
    } catch (error) {
      console.error("Failed to update ATO details:", error)
    } finally {
      setIsLoading(false)
    }
  }

  function getAuthStatusColor(status: string | null | undefined) {
    switch (status) {
      case "Authorized": return "bg-green-500"
      case "In Progress": return "bg-yellow-500"
      case "Expired": return "bg-red-500"
      case "Denied": return "bg-red-600"
      case "Reauthorization Required": return "bg-orange-500"
      default: return "bg-gray-500"
    }
  }

  function getImpactColor(impact: string | null | undefined) {
    switch (impact) {
      case "High": return "bg-red-500"
      case "Moderate": return "bg-yellow-500"
      case "Low": return "bg-green-500"
      default: return "bg-gray-400"
    }
  }

  function getRiskColor(risk: string | null | undefined) {
    switch (risk) {
      case "Very High": return "bg-red-600"
      case "High": return "bg-red-500"
      case "Moderate": return "bg-yellow-500"
      case "Low": return "bg-green-500"
      case "Very Low": return "bg-green-600"
      default: return "bg-gray-400"
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              ATO Security Details
            </CardTitle>
            <CardDescription>
              Security categorization and authorization status for {packageData.name}
            </CardDescription>
          </div>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)} variant="outline">
              Edit Details
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Tabs defaultValue="categorization" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="categorization">Categorization</TabsTrigger>
                  <TabsTrigger value="authorization">Authorization</TabsTrigger>
                  <TabsTrigger value="risk">Risk</TabsTrigger>
                  <TabsTrigger value="personnel">Personnel</TabsTrigger>
                </TabsList>

                <TabsContent value="categorization" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="system_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>System Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select system type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Major Application">Major Application</SelectItem>
                              <SelectItem value="General Support System">General Support System</SelectItem>
                              <SelectItem value="Minor Application">Minor Application</SelectItem>
                              <SelectItem value="Subsystem">Subsystem</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="data_classification"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data Classification</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select classification" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Unclassified">Unclassified</SelectItem>
                              <SelectItem value="CUI">CUI</SelectItem>
                              <SelectItem value="Secret">Secret</SelectItem>
                              <SelectItem value="Top Secret">Top Secret</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="confidentiality_impact"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confidentiality Impact</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select impact level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Low">Low</SelectItem>
                              <SelectItem value="Moderate">Moderate</SelectItem>
                              <SelectItem value="High">High</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>Impact if confidentiality is breached</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="integrity_impact"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Integrity Impact</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select impact level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Low">Low</SelectItem>
                              <SelectItem value="Moderate">Moderate</SelectItem>
                              <SelectItem value="High">High</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>Impact if integrity is compromised</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="availability_impact"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Availability Impact</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select impact level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Low">Low</SelectItem>
                              <SelectItem value="Moderate">Moderate</SelectItem>
                              <SelectItem value="High">High</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>Impact if availability is lost</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="overall_categorization"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Overall Categorization</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select overall level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Low">Low</SelectItem>
                              <SelectItem value="Moderate">Moderate</SelectItem>
                              <SelectItem value="High">High</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>Highest of the three impact levels</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="security_control_baseline"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Security Control Baseline</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select baseline" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Low">Low</SelectItem>
                              <SelectItem value="Moderate">Moderate</SelectItem>
                              <SelectItem value="High">High</SelectItem>
                              <SelectItem value="Tailored">Tailored</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="mission_criticality"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mission Criticality</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select criticality" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Mission Critical">Mission Critical</SelectItem>
                              <SelectItem value="Mission Essential">Mission Essential</SelectItem>
                              <SelectItem value="Mission Support">Mission Support</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="authorization" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="authorization_status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Authorization Status</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Not Started">Not Started</SelectItem>
                              <SelectItem value="In Progress">In Progress</SelectItem>
                              <SelectItem value="Authorized">Authorized</SelectItem>
                              <SelectItem value="Reauthorization Required">Reauthorization Required</SelectItem>
                              <SelectItem value="Expired">Expired</SelectItem>
                              <SelectItem value="Denied">Denied</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="poam_status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>POA&M Status</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select POA&M status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Green">Green - On Track</SelectItem>
                              <SelectItem value="Yellow">Yellow - At Risk</SelectItem>
                              <SelectItem value="Red">Red - Behind Schedule</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="authorization_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Authorization Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} value={field.value ?? ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="authorization_expiry"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Authorization Expiry</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} value={field.value ?? ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="continuous_monitoring_status"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Continuous Monitoring Status</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Fully Implemented">Fully Implemented</SelectItem>
                              <SelectItem value="Partially Implemented">Partially Implemented</SelectItem>
                              <SelectItem value="Not Implemented">Not Implemented</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="risk" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="residual_risk_level"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Residual Risk Level</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select risk level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Very Low">Very Low</SelectItem>
                              <SelectItem value="Low">Low</SelectItem>
                              <SelectItem value="Moderate">Moderate</SelectItem>
                              <SelectItem value="High">High</SelectItem>
                              <SelectItem value="Very High">Very High</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="risk_assessment_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Risk Assessment Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} value={field.value ?? ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="personnel" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="system_owner"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>System Owner</FormLabel>
                          <FormControl>
                            <Input placeholder="Name of system owner" {...field} value={field.value ?? ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="authorizing_official"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Authorizing Official (AO)</FormLabel>
                          <FormControl>
                            <Input placeholder="Name of AO" {...field} value={field.value ?? ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="isso_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ISSO Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Information System Security Officer" {...field} value={field.value ?? ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <div className="space-y-6">
            {/* Status Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Authorization Status</div>
                <Badge className={getAuthStatusColor(packageData.authorization_status)}>
                  {packageData.authorization_status || "Not Started"}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Overall Categorization</div>
                <Badge className={getImpactColor(packageData.overall_categorization)}>
                  {packageData.overall_categorization || "Not Set"}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Residual Risk</div>
                <Badge className={getRiskColor(packageData.residual_risk_level)}>
                  {packageData.residual_risk_level || "Not Assessed"}
                </Badge>
              </div>
            </div>

            {/* Impact Analysis */}
            <div>
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Security Impact Analysis
              </h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="border rounded-lg p-3">
                  <div className="text-xs text-muted-foreground mb-1">Confidentiality</div>
                  <Badge variant="outline" className={getImpactColor(packageData.confidentiality_impact)}>
                    {packageData.confidentiality_impact || "Not Set"}
                  </Badge>
                </div>
                <div className="border rounded-lg p-3">
                  <div className="text-xs text-muted-foreground mb-1">Integrity</div>
                  <Badge variant="outline" className={getImpactColor(packageData.integrity_impact)}>
                    {packageData.integrity_impact || "Not Set"}
                  </Badge>
                </div>
                <div className="border rounded-lg p-3">
                  <div className="text-xs text-muted-foreground mb-1">Availability</div>
                  <Badge variant="outline" className={getImpactColor(packageData.availability_impact)}>
                    {packageData.availability_impact || "Not Set"}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Key Dates */}
            <div>
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Key Dates
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Authorization Date:</span>{" "}
                  {packageData.authorization_date ? new Date(packageData.authorization_date).toLocaleDateString() : "Not Set"}
                </div>
                <div>
                  <span className="text-muted-foreground">Expiry Date:</span>{" "}
                  {packageData.authorization_expiry ? new Date(packageData.authorization_expiry).toLocaleDateString() : "Not Set"}
                </div>
                <div>
                  <span className="text-muted-foreground">Risk Assessment:</span>{" "}
                  {packageData.risk_assessment_date ? new Date(packageData.risk_assessment_date).toLocaleDateString() : "Not Set"}
                </div>
              </div>
            </div>

            {/* Personnel */}
            <div>
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Key Personnel
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">System Owner:</span>{" "}
                  {packageData.system_owner || "Not Assigned"}
                </div>
                <div>
                  <span className="text-muted-foreground">Authorizing Official:</span>{" "}
                  {packageData.authorizing_official || "Not Assigned"}
                </div>
                <div>
                  <span className="text-muted-foreground">ISSO:</span>{" "}
                  {packageData.isso_name || "Not Assigned"}
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">System Type:</span>{" "}
                {packageData.system_type || "Not Specified"}
              </div>
              <div>
                <span className="text-muted-foreground">Data Classification:</span>{" "}
                {packageData.data_classification || "Not Specified"}
              </div>
              <div>
                <span className="text-muted-foreground">Mission Criticality:</span>{" "}
                {packageData.mission_criticality || "Not Specified"}
              </div>
              <div>
                <span className="text-muted-foreground">Security Control Baseline:</span>{" "}
                {packageData.security_control_baseline || "Not Specified"}
              </div>
              <div>
                <span className="text-muted-foreground">POA&M Status:</span>{" "}
                <Badge variant={packageData.poam_status === "Green" ? "default" : packageData.poam_status === "Yellow" ? "secondary" : "destructive"}>
                  {packageData.poam_status || "Not Set"}
                </Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Continuous Monitoring:</span>{" "}
                {packageData.continuous_monitoring_status || "Not Specified"}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}