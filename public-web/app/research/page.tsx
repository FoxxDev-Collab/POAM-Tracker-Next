"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/navigation";
import {
  Mountain, TrendingUp, BarChart3, DollarSign, Clock, Shield,
  Users, Target, Award, CheckCircle2, AlertTriangle,
  Eye, Mail, BookOpen, Search, Building, Zap
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

export default function Research() {
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
                <BookOpen className="mr-2 h-4 w-4" />
                Comprehensive Market Analysis
              </Badge>
            </motion.div>

            <motion.h1
              className="text-4xl font-bold tracking-tight sm:text-6xl"
              variants={fadeInUp}
            >
              Market Research & Analysis
            </motion.h1>

            <motion.p
              className="mt-6 text-lg leading-8 text-muted-foreground max-w-3xl mx-auto"
              variants={fadeInUp}
            >
              Deep-dive analysis of the $127.7B GRC market opportunity, competitive landscape, 
              and strategic positioning for Bedrock Security Platform
            </motion.p>

            <motion.div
              className="mt-10 flex items-center justify-center gap-x-6"
              variants={fadeInUp}
            >
              <Button size="lg" asChild>
                <Link href="#executive-summary">
                  View Research
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="#sources">
                  Data Sources
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Executive Summary */}
      <section id="executive-summary" className="py-16">
        <div className="container">
          <motion.div
            className="mx-auto max-w-6xl"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerChildren}
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Executive Summary</h2>
              <p className="text-lg text-muted-foreground">
                Key findings from comprehensive market analysis and opportunity assessment
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <motion.div variants={fadeInUp}>
                <Card className="text-center bg-gradient-to-br from-primary/10 to-primary/5">
                  <CardContent className="pt-6">
                    <TrendingUp className="h-8 w-8 text-primary mx-auto mb-3" />
                    <div className="text-2xl font-bold text-primary mb-2">$127.7B</div>
                    <div className="text-sm text-muted-foreground">GRC Market by 2033</div>
                    <div className="text-xs text-muted-foreground mt-1">14% CAGR</div>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div variants={fadeInUp}>
                <Card className="text-center bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/20 dark:to-green-800/10">
                  <CardContent className="pt-6">
                    <Clock className="h-8 w-8 text-green-600 mx-auto mb-3" />
                    <div className="text-2xl font-bold text-green-600 mb-2">Nov 2025</div>
                    <div className="text-sm text-muted-foreground">CMMC Deadline</div>
                    <div className="text-xs text-muted-foreground mt-1">Perfect timing</div>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div variants={fadeInUp}>
                <Card className="text-center bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-900/20 dark:to-orange-800/10">
                  <CardContent className="pt-6">
                    <AlertTriangle className="h-8 w-8 text-orange-600 mx-auto mb-3" />
                    <div className="text-2xl font-bold text-orange-600 mb-2">96%</div>
                    <div className="text-sm text-muted-foreground">Compliance Gap</div>
                    <div className="text-xs text-muted-foreground mt-1">Massive unmet demand</div>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div variants={fadeInUp}>
                <Card className="text-center bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/20 dark:to-purple-800/10">
                  <CardContent className="pt-6">
                    <Target className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                    <div className="text-2xl font-bold text-purple-600 mb-2">$94M-$235M</div>
                    <div className="text-sm text-muted-foreground">Revenue Potential</div>
                    <div className="text-xs text-muted-foreground mt-1">2-5% market capture</div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <motion.div variants={fadeInUp}>
              <Card className="p-8 bg-gradient-to-r from-primary/5 to-cyan/5 dark:from-primary/10 dark:to-cyan/10 border-primary/20 dark:border-primary/30">
                <h3 className="text-xl font-semibold mb-6">Market Validation Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-medium text-green-600">✅ Demand Indicators</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• <strong>Regulatory mandate</strong> with hard deadline</li>
                      <li>• <strong>Massive compliance gap</strong> (96% not ready)</li>
                      <li>• <strong>Budget availability</strong> ($104K+ per assessment)</li>
                      <li>• <strong>Legacy tool dissatisfaction</strong> (documented GAO issues)</li>
                      <li>• <strong>Market timing</strong> (enforcement starts November 2025)</li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-medium text-green-600">✅ Financial Validation</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• <strong>Premium pricing</strong> validated by competitors</li>
                      <li>• <strong>Strong multiples</strong> in recent M&A activity</li>
                      <li>• <strong>Government funding</strong> sources identified</li>
                      <li>• <strong>Customer ROI</strong> proven by existing platforms</li>
                      <li>• <strong>TCO reduction</strong> 30-50% vs multiple tools</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Market Size Analysis */}
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
              <h2 className="text-3xl font-bold mb-4">Market Size Analysis</h2>
              <p className="text-lg text-muted-foreground">
                Total Addressable Market, Serviceable Markets, and Revenue Projections
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
              <motion.div variants={fadeInUp}>
                <Card className="h-full">
                  <CardHeader>
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                      <Building className="h-6 w-6 text-blue-600" />
                    </div>
                    <CardTitle>Total Addressable Market (TAM)</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Global GRC Market (2024)</span>
                      <span className="font-semibold">$50.5B</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Projected Market (2033)</span>
                      <span className="font-semibold">$127.7B</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Federal Cyber Budget</span>
                      <span className="font-semibold">$13B</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">DoD Contract Spending</span>
                      <span className="font-semibold">$440.7B</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <Card className="h-full">
                  <CardHeader>
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
                      <Users className="h-6 w-6 text-green-600" />
                    </div>
                    <CardTitle>Serviceable Addressable Market (SAM)</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Defense Contractors</span>
                      <span className="font-semibold">59,678 companies</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">CMMC-Affected Orgs</span>
                      <span className="font-semibold">221,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Defense Workers</span>
                      <span className="font-semibold">1.1M</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Healthcare Avg Budget</span>
                      <span className="font-semibold">$66M</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <Card className="h-full border-primary">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <Target className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>Serviceable Obtainable Market (SOM)</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Conservative (2%)</span>
                      <span className="font-semibold text-primary">$94M</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Realistic (3-4%)</span>
                      <span className="font-semibold text-primary">$141M-$188M</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Optimistic (5%)</span>
                      <span className="font-semibold text-primary">$235M</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">20% of $480M TAM</span>
                      <span className="font-semibold text-primary">$96M</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Competitive Analysis */}
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
              <h2 className="text-3xl font-bold mb-4">Competitive Landscape</h2>
              <p className="text-lg text-muted-foreground">
                Market leaders, gaps, and Bedrock&apos;s competitive advantages
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <motion.div variants={fadeInUp}>
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-primary" />
                      Market Leaders
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="border-l-4 border-gray-400 pl-4">
                      <h4 className="font-semibold">RSA Archer</h4>
                      <p className="text-sm text-muted-foreground">33.2% mindshare, complex implementation</p>
                    </div>
                    <div className="border-l-4 border-blue-400 pl-4">
                      <h4 className="font-semibold">ServiceNow GRC</h4>
                      <p className="text-sm text-muted-foreground">86% user satisfaction, expensive</p>
                    </div>
                    <div className="border-l-4 border-green-400 pl-4">
                      <h4 className="font-semibold">MetricStream</h4>
                      <p className="text-sm text-muted-foreground">Enterprise focus, integration challenges</p>
                    </div>
                    <div className="border-l-4 border-red-400 pl-4">
                      <h4 className="font-semibold">Legacy Tools (eMASS/Xacta)</h4>
                      <p className="text-sm text-muted-foreground">Government standard, poor UX</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <Card className="h-full border-primary">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <Award className="h-5 w-5 text-primary" />
                      Bedrock&apos;s Advantages
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-sm">First-Mover</strong>
                        <p className="text-xs text-muted-foreground">Only RMF-native platform</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-sm">Domain Expertise</strong>
                        <p className="text-xs text-muted-foreground">Built by CISM/CISSP practitioners</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-sm">Modern Architecture</strong>
                        <p className="text-xs text-muted-foreground">Cloud-native vs legacy on-premise</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-sm">Pricing Transparency</strong>
                        <p className="text-xs text-muted-foreground">vs competitor opacity</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-sm">User Experience</strong>
                        <p className="text-xs text-muted-foreground">Modern UX vs &quot;bulky dashboards&quot;</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <motion.div variants={fadeInUp}>
              <Card className="p-8 bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800/50">
                <h4 className="font-semibold mb-4 text-orange-800 dark:text-orange-400">Documented Market Gaps</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• User experience problems (&quot;bulky dashboards&quot;)</li>
                    <li>• Lack of pricing transparency across vendors</li>
                    <li>• Long implementation cycles (6-18 months)</li>
                  </ul>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Poor eMASS/Xacta satisfaction rates</li>
                    <li>• Manual processes requiring 4-6 weeks per change</li>
                    <li>• 567 unimplemented cybersecurity recommendations</li>
                  </ul>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Financial Projections */}
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
              <h2 className="text-3xl font-bold mb-4">Financial Analysis</h2>
              <p className="text-lg text-muted-foreground">
                Pricing validation, revenue projections, and valuation benchmarks
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <motion.div variants={fadeInUp}>
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-5 w-5 text-primary" />
                      <CardTitle>Market-Validated Pricing</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Starter (SMB)</span>
                        <span className="font-semibold">$7K - $25K</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Professional (Mid-market)</span>
                        <span className="font-semibold">$25K - $100K</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Enterprise (Large org)</span>
                        <span className="font-semibold text-primary">$50K - $500K</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Implementation Services</span>
                        <span className="font-semibold">+20-40%</span>
                      </div>
                    </div>
                    <div className="pt-4 border-t">
                      <h5 className="font-medium mb-2">Pricing Premiums</h5>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Integrated platforms: 15-30% premium</li>
                        <li>• Cloud-native solutions: TCO justified</li>
                        <li>• AI-powered features: Additional premium</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      <CardTitle>Valuation Benchmarks</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Public GRC companies</span>
                        <span className="font-semibold">14.2x revenue</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Private GRC companies</span>
                        <span className="font-semibold">8.5x revenue</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">AuditBoard (Recent M&A)</span>
                        <span className="font-semibold">$3B</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Darktrace (Recent M&A)</span>
                        <span className="font-semibold">$5.3B</span>
                      </div>
                    </div>
                    <div className="pt-4 border-t">
                      <h5 className="font-medium mb-2">ROI Validation</h5>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Riskonnect case: 280% three-year ROI</li>
                        <li>• Customer TCO reduction: 30-50%</li>
                        <li>• Implementation time: 90% reduction</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <motion.div variants={fadeInUp}>
              <Card className="p-8 bg-primary/5 dark:bg-primary/10 border-primary/20 dark:border-primary/30">
                <h4 className="font-semibold mb-6">Budget Validation Evidence</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary mb-2">$104,670</div>
                    <p className="text-sm text-muted-foreground">Average CMMC Level 2 assessment cost</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary mb-2">$66M</div>
                    <p className="text-sm text-muted-foreground">Average healthcare cybersecurity budget</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary mb-2">55%</div>
                    <p className="text-sm text-muted-foreground">Organizations planning budget increases</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Strategic Analysis */}
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
              <h2 className="text-3xl font-bold mb-4">Strategic Options Analysis</h2>
              <p className="text-lg text-muted-foreground">
                Build vs. sell evaluation and investment requirements
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <motion.div variants={fadeInUp}>
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-green-600">
                      <Zap className="h-5 w-5" />
                      Build the Business
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h5 className="font-medium text-green-600 mb-2">Pros</h5>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• First-mover advantage in hot market</li>
                          <li>• Retain 100% equity ownership</li>
                          <li>• Market timing is perfect (CMMC deadline)</li>
                          <li>• High-value enterprise deals possible</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-medium text-red-600 mb-2">Cons</h5>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Requires significant capital ($2-5M+)</li>
                          <li>• Long enterprise sales cycles</li>
                          <li>• Complex federal compliance requirements</li>
                          <li>• Execution risk in competitive market</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-blue-600">
                      <DollarSign className="h-5 w-5" />
                      Sell the IP
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h5 className="font-medium text-green-600 mb-2">Pros</h5>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Immediate liquidity without execution risk</li>
                          <li>• Avoid capital raising process</li>
                          <li>• Let established player scale with resources</li>
                          <li>• Strong M&A market for GRC assets</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-medium text-red-600 mb-2">Cons</h5>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Miss potential for larger returns</li>
                          <li>• Lose control of product direction</li>
                          <li>• May undervalue in current hot market</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <motion.div variants={fadeInUp}>
              <Card className="p-8 bg-gradient-to-r from-primary/5 to-cyan/5 dark:from-primary/10 dark:to-cyan/10 border-primary/20 dark:border-primary/30">
                <h4 className="font-semibold mb-6">Investment Requirements (Build Path)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-medium mb-3">Capital Needs</h5>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <li>• <strong>FedRAMP Authorization:</strong> $500K - $1M (12-24 months)</li>
                      <li>• <strong>Sales team buildup:</strong> Enterprise sales reps ($100K+ each)</li>
                      <li>• <strong>Product development:</strong> CMMC-specific features, integrations</li>
                      <li>• <strong>Working capital:</strong> Government payment cycles</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium mb-3">Funding Options</h5>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <li>• <strong>SBIR grants:</strong> Up to $2.1M for government features</li>
                      <li>• <strong>Seed/Series A:</strong> Traditional VC path</li>
                      <li>• <strong>Revenue-based financing:</strong> Alternative to equity dilution</li>
                      <li>• <strong>Strategic partnerships:</strong> Existing contractor relationships</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Data Sources */}
      <section id="sources" className="py-16 bg-muted/50">
        <div className="container">
          <motion.div
            className="mx-auto max-w-4xl"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerChildren}
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Research Methodology & Sources</h2>
              <p className="text-lg text-muted-foreground">
                Comprehensive analysis based on authoritative industry data and government sources
              </p>
            </div>

            <motion.div variants={fadeInUp}>
              <Card className="p-8">
                <h4 className="font-semibold mb-6">Primary Data Sources</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div>
                    <h5 className="font-medium mb-3">Government & Regulatory</h5>
                    <ul className="text-muted-foreground space-y-1">
                      <li>• NIST Cybersecurity Framework</li>
                      <li>• GAO Cybersecurity Reports</li>
                      <li>• DoD CMMC Program Office</li>
                      <li>• OMB M-24-15 Memorandum</li>
                      <li>• Federal Procurement Data System</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium mb-3">Industry Research</h5>
                    <ul className="text-muted-foreground space-y-1">
                      <li>• Gartner Market Research</li>
                      <li>• Forrester Wave Reports</li>
                      <li>• Grand View Research</li>
                      <li>• MarketsandMarkets Analysis</li>
                      <li>• G2 User Reviews & Ratings</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium mb-3">Financial Data</h5>
                    <ul className="text-muted-foreground space-y-1">
                      <li>• Public company SEC filings</li>
                      <li>• M&A transaction databases</li>
                      <li>• Venture capital funding data</li>
                      <li>• Healthcare cybersecurity surveys</li>
                      <li>• Federal budget allocations</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium mb-3">Competitive Intelligence</h5>
                    <ul className="text-muted-foreground space-y-1">
                      <li>• Vendor pricing analysis</li>
                      <li>• Customer case studies</li>
                      <li>• User satisfaction surveys</li>
                      <li>• Feature comparison matrices</li>
                      <li>• Implementation timeline data</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden py-24 sm:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-cyan/10 dark:from-primary/20 dark:via-primary/10 dark:to-cyan/20" />
        <div className="container relative">
          <motion.div
            className="mx-auto max-w-3xl text-center"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerChildren}
          >
            <motion.div variants={fadeInUp}>
              <Badge className="mb-6" variant="outline">
                <Search className="mr-2 h-4 w-4" />
                Data-Driven Analysis
              </Badge>
            </motion.div>

            <motion.h2
              className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
              variants={fadeInUp}
            >
              Ready to Discuss the Opportunity?
            </motion.h2>

            <motion.p
              className="mt-6 text-lg leading-8 text-muted-foreground max-w-2xl mx-auto"
              variants={fadeInUp}
            >
              Comprehensive market research validates the massive opportunity. Let&apos;s explore how to capitalize on it.
            </motion.p>

            <motion.div
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
              variants={fadeInUp}
            >
              <Button size="lg" className="group" asChild>
                <Link href="/contact">
                  <Mail className="mr-2 h-4 w-4" />
                  Discuss Findings
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/acquisition">
                  <Eye className="mr-2 h-4 w-4" />
                  View Acquisition
                </Link>
              </Button>
            </motion.div>

            <motion.div
              className="mt-12 pt-12 border-t border-border/50"
              variants={fadeInUp}
            >
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 text-center">
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Financial Models</div>
                  <CheckCircle2 className="h-5 w-5 text-primary mx-auto" />
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Competitive Analysis</div>
                  <CheckCircle2 className="h-5 w-5 text-primary mx-auto" />
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Strategic Plans</div>
                  <CheckCircle2 className="h-5 w-5 text-primary mx-auto" />
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">NDA Available</div>
                  <CheckCircle2 className="h-5 w-5 text-primary mx-auto" />
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted py-12">
        <div className="container">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Mountain className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">Bedrock</span>
              </div>
              <p className="text-sm text-muted-foreground">
                The world&apos;s first RMF-native compliance platform, transforming cybersecurity governance.
              </p>
            </div>
            <div>
              <h5 className="font-semibold mb-3">Platform</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/product" className="hover:text-foreground transition-colors">Product Features</Link></li>
                <li><Link href="/product#integrations" className="hover:text-foreground transition-colors">Integrations</Link></li>
                <li><Link href="/product#security" className="hover:text-foreground transition-colors">Security</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-3">Company</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-foreground transition-colors">About Us</Link></li>
                <li><Link href="/founder" className="hover:text-foreground transition-colors">Meet the Founder</Link></li>
                <li><Link href="/research" className="hover:text-foreground transition-colors">Market Research</Link></li>
                <li><Link href="/acquisition" className="hover:text-foreground transition-colors">Acquisition</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-3">Contact</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="mailto:foxxdev.collab@gmail.com" className="hover:text-foreground transition-colors">foxxdev.collab@gmail.com</a></li>
                <li><a href="tel:+12089011974" className="hover:text-foreground transition-colors">208-901-1974</a></li>
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