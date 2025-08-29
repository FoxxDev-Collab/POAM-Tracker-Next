"use client"

import { useEffect, useState } from "react"
import { Plus, FileText, Calendar, Users, AlertCircle, X, Clock, Target, Package } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AppShell } from "@/components/layout/app-shell"

type STP = {
  id: number;
  title: string;
  description: string;
  system_id: number;
  package_id: number;
  status: 'Draft' | 'In_Progress' | 'Under_Review' | 'Approved' | 'Rejected';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  assigned_team_id: number | null;
  created_by: number;
  created_at: string;
  updated_at: string;
  due_date: string | null;
};

type Package = {
  id: number;
  name: string;
  description: string;
};

type Group = {
  id: number;
  package_id: number;
  name: string;
  description: string;
};

type System = {
  id: number;
  package_id: number;
  name: string;
  description: string;
};

type Vulnerability = {
  id: number;
  system_id: number;
  rule_id: string;
  rule_title: string;
  severity: string;
  status: string;
  group_id: string;
};

export default function StpsPage() {
  const [stps, setStps] = useState<STP[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateWizard, setShowCreateWizard] = useState(false);
  const [creating, setCreating] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  // Wizard data
  const [packages, setPackages] = useState<Package[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [systems, setSystems] = useState<System[]>([]);
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [packagesLoading, setPackagesLoading] = useState(false);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [systemsLoading, setSystemsLoading] = useState(false);
  const [vulnerabilitiesLoading, setVulnerabilitiesLoading] = useState(false);
  
  // Form state
  const [wizardData, setWizardData] = useState({
    // Step 1: Basic Info
    title: '',
    description: '',
    priority: 'High' as 'Low' | 'Medium' | 'High' | 'Critical',
    due_date: '',
    
    // Step 2: Package Selection
    selectedPackage: null as Package | null,
    
    // Step 3: Group Selection
    selectedGroup: null as Group | null,
    
    // Step 4: System Selection
    selectedSystems: [] as System[],
    
    // Step 5: Auto-gathered vulnerabilities
    selectedVulnerabilities: [] as Vulnerability[]
  });

  useEffect(() => {
    const fetchStps = async () => {
      try {
        const response = await fetch('/api/stps');
        const data = await response.json();
        if (data.items) {
          setStps(data.items);
        }
      } catch (error) {
        console.error('Failed to fetch STPs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStps();
  }, []);

  // Fetch packages when wizard opens
  useEffect(() => {
    if (showCreateWizard && packages.length === 0) {
      fetchPackages();
    }
  }, [showCreateWizard]);

  // Fetch groups when package is selected
  useEffect(() => {
    if (wizardData.selectedPackage) {
      fetchGroups(wizardData.selectedPackage.id);
    }
  }, [wizardData.selectedPackage]);

  // Fetch systems when group is selected
  useEffect(() => {
    if (wizardData.selectedGroup) {
      fetchSystems(wizardData.selectedGroup.package_id);
    }
  }, [wizardData.selectedGroup]);

  // Fetch vulnerabilities when systems are selected
  useEffect(() => {
    if (wizardData.selectedSystems.length > 0) {
      fetchVulnerabilities(wizardData.selectedSystems.map(s => s.id));
    }
  }, [wizardData.selectedSystems]);

  const fetchPackages = async () => {
    setPackagesLoading(true);
    try {
      const response = await fetch('/api/packages');
      if (response.ok) {
        const data = await response.json();
        setPackages(data.items || []);
      }
    } catch (error) {
      console.error('Error fetching packages:', error);
    } finally {
      setPackagesLoading(false);
    }
  };

  const fetchGroups = async (packageId: number) => {
    setGroupsLoading(true);
    try {
      const response = await fetch(`/api/packages/${packageId}/groups`);
      if (response.ok) {
        const data = await response.json();
        setGroups(data.items || []);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setGroupsLoading(false);
    }
  };

  const fetchSystems = async (packageId: number) => {
    setSystemsLoading(true);
    try {
      const response = await fetch(`/api/packages/${packageId}/systems`);
      if (response.ok) {
        const data = await response.json();
        setSystems(data.items || []);
      }
    } catch (error) {
      console.error('Error fetching systems:', error);
    } finally {
      setSystemsLoading(false);
    }
  };

  const fetchVulnerabilities = async (systemIds: number[]) => {
    setVulnerabilitiesLoading(true);
    try {
      const promises = systemIds.map(id => 
        fetch(`/api/systems/${id}/stig/findings?severity=high&status=open`)
      );
      const responses = await Promise.all(promises);
      const allVulns = [];
      
      for (const response of responses) {
        if (response.ok) {
          const data = await response.json();
          allVulns.push(...(data.items || []));
        }
      }
      
      setVulnerabilities(allVulns);
    } catch (error) {
      console.error('Error fetching vulnerabilities:', error);
    } finally {
      setVulnerabilitiesLoading(false);
    }
  };

  const handleCreateStp = async () => {
    setCreating(true);
    
    try {
      const response = await fetch('/api/stps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: wizardData.title,
          description: wizardData.description,
          system_id: wizardData.selectedSystems[0]?.id || 1,
          package_id: wizardData.selectedPackage?.id || 1,
          priority: wizardData.priority,
          due_date: wizardData.due_date || null,
          status: 'Draft',
          created_by: 1, // TODO: Get from auth context
          vulnerabilities: wizardData.selectedVulnerabilities.map(v => v.id)
        }),
      });
      
      if (response.ok) {
        const newStp = await response.json();
        setStps(prev => [newStp, ...prev]);
        resetWizard();
      }
    } catch (error) {
      console.error('Failed to create STP:', error);
    } finally {
      setCreating(false);
    }
  };

  const resetWizard = () => {
    setShowCreateWizard(false);
    setCurrentStep(1);
    setWizardData({
      title: '',
      description: '',
      priority: 'High',
      due_date: '',
      selectedPackage: null,
      selectedGroup: null,
      selectedSystems: [],
      selectedVulnerabilities: []
    });
    setPackages([]);
    setGroups([]);
    setSystems([]);
    setVulnerabilities([]);
  };

  const nextStep = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return wizardData.title.trim() !== '';
      case 2: return wizardData.selectedPackage !== null;
      case 3: return wizardData.selectedGroup !== null;
      case 4: return wizardData.selectedSystems.length > 0;
      case 5: return true; // Can always proceed from vulnerability review
      default: return false;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Draft': return 'secondary';
      case 'In_Progress': return 'default';
      case 'Under_Review': return 'outline';
      case 'Approved': return 'default';
      case 'Rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'Low': return 'secondary';
      case 'Medium': return 'outline';
      case 'High': return 'default';
      case 'Critical': return 'destructive';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="container mx-auto space-y-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded-md w-1/3"></div>
            <div className="h-4 bg-muted rounded-md w-1/2"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <div className="h-6 bg-muted rounded-md w-3/4"></div>
                    <div className="h-4 bg-muted rounded-md w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded-md"></div>
                      <div className="h-4 bg-muted rounded-md w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  function setShowCreateForm(arg0: boolean): void {
    throw new Error("Function not implemented.")
  }

  return (
    <AppShell>
      <div className="container mx-auto space-y-8">
        {/* Page Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Security Test Plans</h1>
                <p className="text-muted-foreground">
                  Create and manage test plans for vulnerability remediation and control validation
                </p>
              </div>
            </div>
          </div>
          <Button onClick={() => setShowCreateWizard(true)} size="lg">
            <Plus className="h-4 w-4 mr-2" />
            Create STP
          </Button>
        </div>

        {/* Create STP Wizard */}
        {showCreateWizard && (
          <Card className="border-2 border-primary/20">
            <CardHeader className="bg-muted/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  <CardTitle>Create New Security Test Plan</CardTitle>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowCreateWizard(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>
                Define test procedures and validation criteria for security controls
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {/* Step Progress Indicator */}
              <div className="flex items-center justify-between mb-8">
                {[1, 2, 3, 4, 5].map((step) => (
                  <div key={step} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step === currentStep 
                        ? 'bg-primary text-primary-foreground' 
                        : step < currentStep 
                          ? 'bg-primary/20 text-primary' 
                          : 'bg-muted text-muted-foreground'
                    }`}>
                      {step}
                    </div>
                    {step < 5 && (
                      <div className={`w-12 h-0.5 mx-2 ${
                        step < currentStep ? 'bg-primary' : 'bg-muted'
                      }`} />
                    )}
                  </div>
                ))}
              </div>

              {/* Step 1: Basic Info */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold">Basic Information</h3>
                    <p className="text-sm text-muted-foreground">Define the STP title, description, and priority</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Title *</label>
                      <Input
                        value={wizardData.title}
                        onChange={(e) => setWizardData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g., AC-2 Account Management Testing"
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Priority</label>
                      <Select 
                        value={wizardData.priority} 
                        onValueChange={(value: 'Low' | 'Medium' | 'High' | 'Critical') => setWizardData(prev => ({ ...prev, priority: value }))}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Low">Low</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="High">High</SelectItem>
                          <SelectItem value="Critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      value={wizardData.description}
                      onChange={(e) => setWizardData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe the security test plan objectives, scope, and testing approach"
                      className="min-h-[80px] resize-none"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Due Date</label>
                    <Input
                      type="date"
                      value={wizardData.due_date}
                      onChange={(e) => setWizardData(prev => ({ ...prev, due_date: e.target.value }))}
                      className="h-10"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Package Selection */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold">Select ATO Package</h3>
                    <p className="text-sm text-muted-foreground">Choose the Authorization to Operate package</p>
                  </div>
                  
                  {packagesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      {packages.map((pkg) => (
                        <div
                          key={pkg.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                            wizardData.selectedPackage?.id === pkg.id
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                          onClick={() => {
                            setWizardData(prev => ({ ...prev, selectedPackage: pkg }));
                            fetchGroups(pkg.id);
                          }}
                        >
                          <div className="font-medium">{pkg.name}</div>
                          <div className="text-sm text-muted-foreground">{pkg.description}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Group Selection */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold">Select Group</h3>
                    <p className="text-sm text-muted-foreground">Choose the group within {wizardData.selectedPackage?.name}</p>
                  </div>
                  
                  {groupsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      {groups.map((group) => (
                        <div
                          key={group.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                            wizardData.selectedGroup?.id === group.id
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                          onClick={() => {
                            setWizardData(prev => ({ ...prev, selectedGroup: group }));
                            fetchSystems(wizardData.selectedPackage!.id);
                          }}
                        >
                          <div className="font-medium">{group.name}</div>
                          <div className="text-sm text-muted-foreground">{group.description}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: System Selection */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold">Select Systems</h3>
                    <p className="text-sm text-muted-foreground">Choose one or more systems to include in this STP</p>
                  </div>
                  
                  {systemsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      {systems.map((system) => (
                        <div
                          key={system.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                            wizardData.selectedSystems.some(s => s.id === system.id)
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                          onClick={() => {
                            setWizardData(prev => ({
                              ...prev,
                              selectedSystems: prev.selectedSystems.some(s => s.id === system.id)
                                ? prev.selectedSystems.filter(s => s.id !== system.id)
                                : [...prev.selectedSystems, system]
                            }));
                          }}
                        >
                          <div className="font-medium">{system.name}</div>
                          <div className="text-sm text-muted-foreground">{system.description}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Step 5: Vulnerability Review */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold">Review CAT I Vulnerabilities</h3>
                    <p className="text-sm text-muted-foreground">High-severity vulnerabilities that will be included in this STP</p>
                  </div>
                  
                  {vulnerabilitiesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : vulnerabilities.length > 0 ? (
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {vulnerabilities.map((vuln) => (
                        <div key={vuln.id} className="p-3 border rounded-lg">
                          <div className="font-medium">{vuln.rule_id}</div>
                          <div className="text-sm text-muted-foreground">{vuln.rule_title}</div>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="destructive">CAT I</Badge>
                            <span className="text-xs text-muted-foreground">Status: {vuln.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No CAT I vulnerabilities found for selected systems
                    </div>
                  )}
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={() => currentStep > 1 ? setCurrentStep(prev => prev - 1) : setShowCreateWizard(false)}
                >
                  {currentStep === 1 ? 'Cancel' : 'Previous'}
                </Button>
                
                <Button
                  onClick={() => {
                    if (currentStep === 5) {
                      handleCreateStp();
                    } else if (currentStep === 1 && wizardData.title && wizardData.description) {
                      setCurrentStep(2);
                      fetchPackages();
                    } else if (currentStep === 2 && wizardData.selectedPackage) {
                      setCurrentStep(3);
                    } else if (currentStep === 3 && wizardData.selectedGroup) {
                      setCurrentStep(4);
                    } else if (currentStep === 4 && wizardData.selectedSystems.length > 0) {
                      setCurrentStep(5);
                      fetchVulnerabilities(wizardData.selectedSystems.map(s => s.id));
                    }
                  }}
                  disabled={
                    (currentStep === 1 && (!wizardData.title || !wizardData.description)) ||
                    (currentStep === 2 && !wizardData.selectedPackage) ||
                    (currentStep === 3 && !wizardData.selectedGroup) ||
                    (currentStep === 4 && wizardData.selectedSystems.length === 0) ||
                    creating
                  }
                >
                  {creating ? 'Creating...' : currentStep === 5 ? 'Create STP' : 'Next'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* STPs Grid */}
        {stps.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent className="space-y-6">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <CardTitle className="text-xl">No Security Test Plans Found</CardTitle>
                <CardDescription className="text-base">
                  Get started by creating your first Security Test Plan to track vulnerability remediation testing
                </CardDescription>
              </div>
              <Button onClick={() => setShowCreateWizard(true)} size="lg">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First STP
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stps.map((stp) => (
              <Card key={stp.id} className="group hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer border-border/50 hover:border-primary/50">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                      {stp.title}
                    </CardTitle>
                    <Badge variant={getPriorityVariant(stp.priority)} className="shrink-0">
                      {stp.priority}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusVariant(stp.status)} className="text-xs">
                      {stp.status.replace('_', ' ')}
                    </Badge>
                    <div className="text-xs text-muted-foreground">#{stp.id}</div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {stp.description || 'No description provided'}
                  </p>
                  
                  <div className="space-y-2">
                    {stp.due_date && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>Due {new Date(stp.due_date).toLocaleDateString()}</span>
                      </div>
                    )}
                    {stp.assigned_team_id && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Users className="h-3 w-3" />
                        <span>Team Assigned</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <AlertCircle className="h-3 w-3" />
                      <span>System {stp.system_id} • Package {stp.package_id}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>Created {new Date(stp.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  )
}
