"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/navigation";
import {
  Target, DollarSign, Rocket, Award, Settings, Clipboard,
  Handshake, Clock,
  CheckCircle2, AlertCircle, Mail, Eye
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

export default function Acquisition() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />

      {/* Hero Section */}
      <section className="relative py-24 sm:py-32 bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container">
          <motion.div
            className="mx-auto max-w-4xl text-center"
            initial="initial"
            animate="animate"
            variants={staggerChildren}
          >
            <motion.div variants={fadeInUp}>
              <Badge className="mb-6" variant="outline">
                <Rocket className="mr-2 h-4 w-4" />
                Strategic IP Acquisition Opportunity
              </Badge>
            </motion.div>

            <motion.h1
              className="text-4xl font-bold tracking-tight sm:text-6xl"
              variants={fadeInUp}
            >
              The RMF-Native Compliance Platform
            </motion.h1>

            <motion.p
              className="mt-6 text-lg leading-8 text-muted-foreground max-w-3xl mx-auto"
              variants={fadeInUp}
            >
              First-mover advantage in a $127.7B market with 221,000 DoD contractors requiring
              CMMC compliance by November 2025. Complete IP package ready for acquisition.
            </motion.p>

            <motion.div
              className="mt-10 flex items-center justify-center gap-x-6"
              variants={fadeInUp}
            >
              <Button size="lg" asChild>
                <Link href="#pricing">
                  View Acquisition Terms
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="#opportunity">
                  Market Analysis
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Market Opportunity */}
      <section id="opportunity" className="py-16">
        <div className="container">
          <motion.div
            className="mx-auto max-w-6xl"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerChildren}
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Massive Market Opportunity</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <motion.div variants={fadeInUp}>
                <Card className="text-center">
                  <CardContent className="pt-6">
                    <div className="text-3xl font-bold text-primary mb-2">$127.7B</div>
                    <div className="text-sm text-muted-foreground">GRC Market by 2033</div>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div variants={fadeInUp}>
                <Card className="text-center">
                  <CardContent className="pt-6">
                    <div className="text-3xl font-bold text-primary mb-2">221,000</div>
                    <div className="text-sm text-muted-foreground">DoD Contractors Need CMMC</div>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div variants={fadeInUp}>
                <Card className="text-center">
                  <CardContent className="pt-6">
                    <div className="text-3xl font-bold text-primary mb-2">4%</div>
                    <div className="text-sm text-muted-foreground">Currently CMMC Ready</div>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div variants={fadeInUp}>
                <Card className="text-center">
                  <CardContent className="pt-6">
                    <div className="text-3xl font-bold text-primary mb-2">14%</div>
                    <div className="text-sm text-muted-foreground">Annual Market Growth</div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <motion.div variants={fadeInUp} className="max-w-4xl mx-auto space-y-6">
              <Card className="p-8">
                <h3 className="text-xl font-semibold mb-4">Perfect Storm of Market Conditions</h3>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    <strong>Regulatory Mandate:</strong> CMMC 2.0 enforcement begins November 2025, affecting
                    $440.7B in DoD contracts. Current tools (eMASS/Xacta) require 4-6 weeks manual effort for
                    regulatory changes.
                  </p>
                  <p>
                    <strong>Government Dissatisfaction:</strong> $13B federal cybersecurity budget seeking modern
                    alternatives. GAO identifies 567 unimplemented cybersecurity recommendations using legacy platforms.
                  </p>
                  <p>
                    <strong>Enterprise Demand:</strong> 62.3% of GRC market moving to cloud-native solutions.
                    Integrated platforms command 15-30% pricing premiums over point solutions.
                  </p>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Strategic Value */}
      <section className="py-16 bg-muted/50">
        <div className="container">
          <motion.div
            className="mx-auto max-w-6xl"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerChildren}
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Strategic Acquisition Value</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div variants={fadeInUp}>
                <Card className="h-full">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <Target className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">First-Mover Advantage</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <p>• Only RMF-native platform in market</p>
                    <p>• 2+ years ahead of competitors</p>
                    <p>• Authentic practitioner-built architecture</p>
                    <p>• Complete IP ownership with no licensing dependencies</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <Card className="h-full">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <DollarSign className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">Revenue Potential</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <p>• Enterprise pricing: $50K-$500K annually</p>
                    <p>• 14.2x revenue multiples for GRC platforms</p>
                    <p>• 30-50% lower TCO drives adoption</p>
                    <p>• 280% three-year ROI validated by Forrester</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <Card className="h-full">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <Rocket className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">Ready for Scale</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <p>• Cloud-native, enterprise-ready architecture</p>
                    <p>• Next.js 15 + NestJS modern tech stack</p>
                    <p>• Integrated collaboration features</p>
                    <p>• AI-powered automation capabilities</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <Card className="h-full">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <Award className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">Government Ready</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <p>• NIST SP 800-53 compliance foundation</p>
                    <p>• FedRAMP preparation underway</p>
                    <p>• OSCAL compatibility for OMB M-24-15</p>
                    <p>• Section 508 accessibility standards</p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Technology Package */}
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
              <h2 className="text-3xl font-bold mb-4">Complete Technology Package</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
              <motion.div variants={fadeInUp}>
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Settings className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">Modern Architecture</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <p><strong>Frontend:</strong> Next.js 15, TypeScript, Tailwind CSS, shadcn/ui</p>
                    <p><strong>Backend:</strong> NestJS, PostgreSQL, Prisma ORM</p>
                    <p><strong>Infrastructure:</strong> Redis, BullMQ, Cloud-native deployment</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Clipboard className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">RMF Implementation</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <p><strong>Completed:</strong> Categorize, Select steps with full workflows</p>
                    <p><strong>In Development:</strong> Implement step with STP integration</p>
                    <p><strong>Planned:</strong> Assess, Authorize, Monitor steps (Q2-Q4 2025)</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Handshake className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">Collaboration Features</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <p><strong>Knowledge Center:</strong> Space-based organization, page management</p>
                    <p><strong>Team Management:</strong> Role-based access, workflow assignments</p>
                    <p><strong>Planned:</strong> Real-time chat, document collaboration</p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* RMF Progress */}
            <motion.div variants={fadeInUp}>
              <Card className="p-8">
                <h3 className="text-xl font-semibold mb-6">RMF Development Roadmap</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-2">
                      <CheckCircle2 className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <strong className="text-sm">Categorize</strong>
                    <p className="text-xs text-muted-foreground">Complete</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-2">
                      <CheckCircle2 className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <strong className="text-sm">Select</strong>
                    <p className="text-xs text-muted-foreground">Complete</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <AlertCircle className="h-6 w-6 text-white" />
                    </div>
                    <strong className="text-sm">Implement</strong>
                    <p className="text-xs text-muted-foreground">Q1 2025</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-2">
                      <Clock className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <strong className="text-sm">Assess</strong>
                    <p className="text-xs text-muted-foreground">Q2 2025</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-2">
                      <Clock className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <strong className="text-sm">Authorize</strong>
                    <p className="text-xs text-muted-foreground">Q3 2025</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-2">
                      <Clock className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <strong className="text-sm">Monitor</strong>
                    <p className="text-xs text-muted-foreground">Q4 2025</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 bg-muted/50">
        <div className="container">
          <motion.div
            className="mx-auto max-w-6xl"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerChildren}
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Acquisition Options</h2>
              <p className="text-lg text-muted-foreground">
                Complete IP transfer with ongoing development rights
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <motion.div variants={fadeInUp}>
                <Card className="relative h-full">
                  <CardHeader className="text-center pb-4">
                    <CardTitle className="text-2xl">Platform License</CardTitle>
                    <div className="text-3xl font-bold text-primary mt-4">$2.5M</div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-3 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>Complete source code access</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>Perpetual development license</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>Current RMF implementation</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>6-month transition support</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>Documentation & architecture</span>
                      </li>
                    </ul>
                    <Button className="w-full" asChild>
                      <Link href="/contact">Discuss Licensing</Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <Card className="relative h-full border-primary">
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="px-3 py-1">Recommended</Badge>
                  </div>
                  <CardHeader className="text-center pb-4">
                    <CardTitle className="text-2xl">Full IP Acquisition</CardTitle>
                    <div className="text-3xl font-bold text-primary mt-4">$5M</div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-3 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>Complete IP ownership transfer</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>All intellectual property rights</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>Founder consultation (12 months)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>Technical team transition</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>Brand & domain assets</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>Customer relationships</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>Future roadmap & strategy</span>
                      </li>
                    </ul>
                    <Button className="w-full" asChild>
                      <Link href="/contact">Acquire Platform</Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <Card className="relative h-full">
                  <CardHeader className="text-center pb-4">
                    <CardTitle className="text-2xl">Partnership Model</CardTitle>
                    <div className="text-3xl font-bold text-primary mt-4">Equity</div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-3 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>Joint venture development</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>Shared IP ownership</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>Co-development agreement</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>Market expansion partnership</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>Revenue sharing model</span>
                      </li>
                    </ul>
                    <Button className="w-full" asChild>
                      <Link href="/contact">Explore Partnership</Link>
                    </Button>
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
              Ready to Discuss Acquisition?
            </h2>
            <p className="mt-6 text-lg leading-8 opacity-90">
              Strategic opportunity for immediate market entry in the $127.7B GRC compliance market
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/contact">
                  <Mail className="mr-2 h-4 w-4" />
                  Contact Us
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" asChild>
                <Link href="/product">
                  <Eye className="mr-2 h-4 w-4" />
                  View Platform
                </Link>
              </Button>
            </div>
            <p className="mt-8 text-sm opacity-75 max-w-2xl mx-auto">
              NDA available • Technical demonstrations • Complete financial projections
            </p>
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