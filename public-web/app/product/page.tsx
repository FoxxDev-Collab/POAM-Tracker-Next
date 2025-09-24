"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/navigation";
import {
  Target, Shield, Users, Zap, Camera, Cpu, FileText, Search,
  MessageCircle, RefreshCw, BarChart3, Cloud, Lock, Briefcase,
  TrendingUp, Mail, Settings, Clipboard, Award, Building,
  Rocket, Plug
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerChildren = {
  animate: { transition: { staggerChildren: 0.1 } }
};

export default function Product() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />

      {/* Hero Section */}
      <section className="relative py-24 sm:py-32">
        <div className="container">
          <motion.div
            className="mx-auto max-w-4xl text-center"
            initial="initial"
            animate="animate"
            variants={fadeInUp}
          >
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              Product Features
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-2xl mx-auto">
              Discover how Bedrock&apos;s RMF-native platform transforms compliance from a burden
              into a competitive advantage
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button variant="outline" asChild>
                <Link href="#rmf-workflow">RMF Workflow</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="#collaboration">Team Collaboration</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="#automation">NIST RMF Automation</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="#integrations">Integrations</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="#security">Security</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* RMF Workflow Section */}
      <section id="rmf-workflow" className="py-16 bg-muted/50">
        <div className="container">
          <motion.div
            className="mx-auto max-w-6xl"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerChildren}
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Complete RMF Lifecycle Management</h2>
              <p className="text-lg text-muted-foreground">
                The only platform built from the ground up to follow the NIST Risk Management Framework methodology
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Categorize */}
              <motion.div variants={fadeInUp}>
                <Card className="h-full border-primary">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
                        1
                      </div>
                      <Badge className="bg-green-500 text-white">Production Ready</Badge>
                    </div>
                    <CardTitle className="mt-4">Categorize</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• System description management</li>
                      <li>• Impact level determination</li>
                      <li>• Data classification workflows</li>
                      <li>• Authorization boundary definition</li>
                      <li>• FIPS 199 compliance automation</li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Select */}
              <motion.div variants={fadeInUp}>
                <Card className="h-full border-primary">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
                        2
                      </div>
                      <Badge className="bg-green-500 text-white">Production Ready</Badge>
                    </div>
                    <CardTitle className="mt-4">Select</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• NIST 800-53 control catalog</li>
                      <li>• Baseline auto-selection</li>
                      <li>• Control tailoring workflows</li>
                      <li>• Control allocation management</li>
                      <li>• Security/privacy plan generation</li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Implement */}
              <motion.div variants={fadeInUp}>
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold">
                        3
                      </div>
                      <Badge className="bg-yellow-500 text-white">Q1 2025</Badge>
                    </div>
                    <CardTitle className="mt-4">Implement</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• STP workflow automation</li>
                      <li>• Test case generation</li>
                      <li>• Evidence collection</li>
                      <li>• Control implementation tracking</li>
                      <li>• Progress dashboards</li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Assess */}
              <motion.div variants={fadeInUp}>
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center text-muted-foreground font-bold">
                        4
                      </div>
                      <Badge variant="outline">Q2 2025</Badge>
                    </div>
                    <CardTitle className="mt-4">Assess</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Assessment planning</li>
                      <li>• Assessor assignment</li>
                      <li>• Finding management</li>
                      <li>• SAR generation</li>
                      <li>• Remediation tracking</li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Authorize */}
              <motion.div variants={fadeInUp}>
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center text-muted-foreground font-bold">
                        5
                      </div>
                      <Badge variant="outline">Q3 2025</Badge>
                    </div>
                    <CardTitle className="mt-4">Authorize</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Authorization package assembly</li>
                      <li>• Risk determination workflows</li>
                      <li>• ATO decision support</li>
                      <li>• Documentation automation</li>
                      <li>• Approval workflows</li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Monitor */}
              <motion.div variants={fadeInUp}>
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center text-muted-foreground font-bold">
                        6
                      </div>
                      <Badge variant="outline">Q4 2025</Badge>
                    </div>
                    <CardTitle className="mt-4">Monitor</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Continuous monitoring</li>
                      <li>• Change management</li>
                      <li>• Ongoing assessments</li>
                      <li>• Risk reporting</li>
                      <li>• Reauthorization automation</li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <motion.div variants={fadeInUp} className="mt-12">
              <Card className="p-8 bg-primary/5 border-primary/20">
                <div className="flex items-center gap-3 mb-4">
                  <Camera className="h-5 w-5 text-primary" />
                  <h4 className="font-semibold">RMF Workflow Dashboard Screenshot</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Interactive dashboard showing complete RMF progression with real-time status updates
                </p>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Team Collaboration */}
      <section id="collaboration" className="py-16">
        <div className="container">
          <motion.div
            className="mx-auto max-w-6xl"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerChildren}
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Built-in Team Collaboration</h2>
              <p className="text-lg text-muted-foreground">
                Eliminate silos between security, compliance, and engineering teams with integrated collaboration tools
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div variants={fadeInUp}>
                <Card className="h-full">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>Knowledge Center</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Centralized documentation with space-based organization for teams, projects, and compliance frameworks.
                    </p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Personal, team, and global spaces</li>
                      <li>• Version-controlled documentation</li>
                      <li>• Rich text editing with markdown</li>
                      <li>• File attachments and media support</li>
                      <li>• Advanced search and tagging</li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <Card className="h-full">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <MessageCircle className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>Real-Time Chat</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Integrated messaging system for instant collaboration on compliance tasks and assessments.
                    </p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Team and project channels</li>
                      <li>• Direct messaging</li>
                      <li>• File sharing in context</li>
                      <li>• Notification management</li>
                      <li>• Integration with workflows</li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <Card className="h-full">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <RefreshCw className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>Workflow Management</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Assign tasks, track progress, and manage approvals across the entire compliance lifecycle.
                    </p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Role-based access control</li>
                      <li>• Task assignment and tracking</li>
                      <li>• Approval workflows</li>
                      <li>• Progress notifications</li>
                      <li>• Audit trail maintenance</li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <Card className="h-full">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <BarChart3 className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>Shared Dashboards</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Real-time visibility into compliance status with customizable dashboards for different stakeholders.
                    </p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Executive summary views</li>
                      <li>• Technical detail dashboards</li>
                      <li>• Progress tracking widgets</li>
                      <li>• Custom metric displays</li>
                      <li>• Automated reporting</li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* AI Automation */}
      <section id="automation" className="py-16 bg-muted/50">
        <div className="container">
          <motion.div
            className="mx-auto max-w-6xl"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerChildren}
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">AI-Powered Automation</h2>
              <p className="text-lg text-muted-foreground">
                Reduce manual effort with intelligent automation that understands compliance requirements and accelerates workflows
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div variants={fadeInUp}>
                <Card className="h-full">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <Cpu className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>Intelligent Control Mapping</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Automatically map STIG findings to NIST controls with 95% accuracy using advanced AI analysis.
                    </p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• CCI to NIST control automation</li>
                      <li>• STIG finding categorization</li>
                      <li>• Control gap analysis</li>
                      <li>• Regulatory change detection</li>
                      <li>• Compliance scoring</li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <Card className="h-full">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>Document Generation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Generate compliance documents automatically from your implementation data and evidence.
                    </p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Security plan automation</li>
                      <li>• Assessment report generation</li>
                      <li>• POA&M creation</li>
                      <li>• Executive summaries</li>
                      <li>• Audit-ready packages</li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <Card className="h-full">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <Search className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>Risk Assessment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Automated risk scoring and prioritization based on threat intelligence and organizational context.
                    </p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Dynamic risk calculation</li>
                      <li>• Threat correlation</li>
                      <li>• Impact analysis</li>
                      <li>• Remediation prioritization</li>
                      <li>• Continuous monitoring</li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <Card className="h-full">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <Zap className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>Workflow Acceleration</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Smart suggestions and automation reduce compliance timelines from months to weeks.
                    </p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• STP template generation</li>
                      <li>• Test case recommendations</li>
                      <li>• Evidence validation</li>
                      <li>• Progress predictions</li>
                      <li>• Bottleneck identification</li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Integrations */}
      <section id="integrations" className="py-16">
        <div className="container">
          <motion.div
            className="mx-auto max-w-6xl"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerChildren}
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Enterprise Integrations</h2>
              <p className="text-lg text-muted-foreground">
                Connect with your existing security and IT infrastructure for seamless compliance management
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Cloud, title: "Cloud Platforms", desc: "AWS, Azure, Google Cloud" },
                { icon: Shield, title: "Security Tools", desc: "Tenable, Qualys, Rapid7" },
                { icon: BarChart3, title: "SIEM/SOAR", desc: "Splunk, QRadar, Phantom" },
                { icon: Lock, title: "Identity Management", desc: "Active Directory, Okta" },
                { icon: Briefcase, title: "IT Service", desc: "ServiceNow, Jira, Remedy" },
                { icon: TrendingUp, title: "Business Intelligence", desc: "Tableau, Power BI" },
                { icon: RefreshCw, title: "DevOps", desc: "Jenkins, GitLab, GitHub" },
                { icon: Mail, title: "Communication", desc: "Slack, Teams, Email" }
              ].map((integration, index) => (
                <motion.div key={index} variants={fadeInUp}>
                  <Card className="text-center p-4 h-full">
                    <integration.icon className="h-8 w-8 text-primary mx-auto mb-3" />
                    <h4 className="font-semibold text-sm mb-1">{integration.title}</h4>
                    <p className="text-xs text-muted-foreground">{integration.desc}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Security */}
      <section id="security" className="py-16 bg-muted/50">
        <div className="container">
          <motion.div
            className="mx-auto max-w-6xl"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerChildren}
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Security & Compliance Foundation</h2>
              <p className="text-lg text-muted-foreground">
                Built with government-grade security standards and compliance frameworks from day one
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div variants={fadeInUp}>
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Award className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">Government Ready</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      FedRAMP authorization pathway, FIPS 140-2 compliance, Section 508 accessibility,
                      and OSCAL compatibility for OMB M-24-15 requirements.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Lock className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">Zero Trust Architecture</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      End-to-end encryption, multi-factor authentication, role-based access control,
                      and continuous security monitoring.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Building className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">Enterprise Grade</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      SOC 2 Type II compliance, ISO 27001 alignment, 99.9% uptime SLA,
                      and comprehensive audit logging.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Clipboard className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">Compliance Frameworks</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Native support for CMMC, NIST CSF, ISO 27001, HIPAA, SOX,
                      and custom organizational frameworks.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Technical Specifications */}
      <section className="py-16">
        <div className="container">
          <motion.div
            className="mx-auto max-w-6xl"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerChildren}
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Technical Specifications</h2>
              <p className="text-lg text-muted-foreground">
                Modern, scalable architecture built for enterprise performance and reliability
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div variants={fadeInUp}>
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Rocket className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">Frontend</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <p><strong>Framework:</strong> Next.js 15</p>
                    <p><strong>Language:</strong> TypeScript</p>
                    <p><strong>Styling:</strong> Tailwind CSS</p>
                    <p><strong>Components:</strong> shadcn/ui</p>
                    <p><strong>Testing:</strong> Jest + Playwright</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Settings className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">Backend</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <p><strong>Framework:</strong> NestJS</p>
                    <p><strong>Database:</strong> PostgreSQL</p>
                    <p><strong>ORM:</strong> Prisma</p>
                    <p><strong>Cache:</strong> Redis</p>
                    <p><strong>Queue:</strong> BullMQ</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Cloud className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">Infrastructure</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <p><strong>Deploy:</strong> Kubernetes</p>
                    <p><strong>CDN:</strong> CloudFlare</p>
                    <p><strong>Monitor:</strong> DataDog</p>
                    <p><strong>Security:</strong> WAF + DDoS</p>
                    <p><strong>Backup:</strong> Daily snapshots</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Plug className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">API</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <p><strong>REST:</strong> OpenAPI 3.0</p>
                    <p><strong>GraphQL:</strong> Subscriptions</p>
                    <p><strong>Webhooks:</strong> Event-driven</p>
                    <p><strong>SDKs:</strong> Python, JS, Go</p>
                    <p><strong>Standards:</strong> OSCAL, SCAP</p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container">
          <motion.div
            className="mx-auto max-w-2xl text-center"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              See Bedrock in Action
            </h2>
            <p className="mt-6 text-lg leading-8 opacity-90">
              Schedule a personalized demo to see how Bedrock can transform your compliance operations
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/contact">
                  Schedule Demo
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" asChild>
                <Link href="/acquisition">
                  View Acquisition
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted py-12">
        <div className="container">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Target className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">Bedrock</span>
              </div>
              <p className="text-sm text-muted-foreground">
                The world&apos;s first RMF-native compliance platform, transforming cybersecurity governance.
              </p>
            </div>
            <div>
              <h5 className="font-semibold mb-3">Platform</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/product" className="hover:text-foreground">Product Features</Link></li>
                <li><Link href="/product#integrations" className="hover:text-foreground">Integrations</Link></li>
                <li><Link href="/product#security" className="hover:text-foreground">Security</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-3">Company</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-foreground">About Us</Link></li>
                <li><Link href="/founder" className="hover:text-foreground">Meet the Founder</Link></li>
                <li><Link href="/acquisition" className="hover:text-foreground">Acquisition</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-3">Contact</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="mailto:foxxdev.collab@gmail.com" className="hover:text-foreground">foxxdev.collab@gmail.com</a></li>
                <li><a href="tel:+12089011974" className="hover:text-foreground">208-901-1974</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>&copy; 2025 Bedrock Security Platform. All rights reserved. Built for the modern compliance landscape.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}