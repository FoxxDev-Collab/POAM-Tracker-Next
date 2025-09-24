"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Navigation } from "@/components/navigation";
import {
  Mountain, Rocket, Handshake, BarChart3, RefreshCw,
  Search, Zap, Settings, TrendingUp, Microscope, Globe,
  Award, Clock, Users, Mail, Briefcase, Target
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

export default function About() {
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
              Built by Practitioners, for Practitioners
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-2xl mx-auto">
              Our platform emerged from real-world frustration with legacy compliance tools.
              We built Bedrock to solve the problems we faced every day as cybersecurity professionals.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
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
              <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
              <p className="text-lg text-muted-foreground">
                To transform cybersecurity compliance from a burden into a competitive advantage
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              <motion.div variants={fadeInUp}>
                <h3 className="text-2xl font-semibold mb-6">Why We Exist</h3>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    After years of wrestling with legacy compliance tools like eMASS and Xacta, we knew there had to be
                    a better way. These platforms were built in an era when compliance was purely about documentation,
                    not about actually improving security posture.
                  </p>
                  <p>
                    The cybersecurity landscape has evolved dramatically, but compliance tools haven&apos;t kept pace.
                    Organizations are stuck with systems that:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Require weeks of manual effort for simple changes</li>
                    <li>Don&apos;t understand modern cloud architectures</li>
                    <li>Create silos between security and engineering teams</li>
                    <li>Focus on paperwork instead of actual risk reduction</li>
                  </ul>
                  <p>
                    Bedrock represents a fundamental shift: compliance as code, risk-driven security, and true
                    collaboration between teams. We&apos;re not just digitizing old processes – we&apos;re reimagining what
                    modern cybersecurity governance should look like.
                  </p>
                </div>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <Card className="p-8">
                  <CardHeader className="px-0 pb-4">
                    <CardTitle className="text-xl">Our Core Beliefs</CardTitle>
                  </CardHeader>
                  <CardContent className="px-0 space-y-4">
                    <div className="flex items-start gap-3">
                      <Target className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-sm">Authentic Architecture:</strong>
                        <p className="text-sm text-muted-foreground">Built by people who actually use RMF daily</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Rocket className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-sm">Speed Matters:</strong>
                        <p className="text-sm text-muted-foreground">Compliance shouldn&apos;t slow down innovation</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Handshake className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-sm">Collaboration First:</strong>
                        <p className="text-sm text-muted-foreground">Break down silos between teams</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <BarChart3 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-sm">Risk-Driven:</strong>
                        <p className="text-sm text-muted-foreground">Focus on reducing actual risk, not just paperwork</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <RefreshCw className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-sm">Continuous Evolution:</strong>
                        <p className="text-sm text-muted-foreground">Adapt to changing threats and regulations</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Company Story */}
      <section className="py-16 bg-muted/50">
        <div className="container">
          <motion.div
            className="mx-auto max-w-5xl"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerChildren}
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Our Story</h2>
              <p className="text-lg text-muted-foreground">
                From frustration with legacy tools to building the future of compliance
              </p>
            </div>

            <div className="space-y-6">
              <motion.div variants={fadeInUp}>
                <Card className="p-8">
                  <CardHeader className="px-0 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Search className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle>The Problem We Lived</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="px-0">
                    <p className="text-muted-foreground">
                      Our founding experience involved years navigating the labyrinth of traditional GRC tools.
                      We watched talented engineers spend weeks updating control implementations that should take hours.
                      We saw security teams drowning in spreadsheets when they should be analyzing threats.
                      We experienced the frustration of systems that couldn&apos;t adapt to modern cloud architectures
                      or collaborative workflows.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <Card className="p-8">
                  <CardHeader className="px-0 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Zap className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle>The Breakthrough Moment</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="px-0">
                    <p className="text-muted-foreground">
                      The turning point came during a particularly painful CMMC preparation. A simple control update
                      required coordination across five different systems, dozens of stakeholders, and weeks of manual
                      documentation updates. That night, we started sketching what a purpose-built RMF platform could
                      look like – one that understood modern software development, embraced automation, and put
                      collaboration at its core.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <Card className="p-8">
                  <CardHeader className="px-0 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Settings className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle>Building the Solution</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="px-0">
                    <p className="text-muted-foreground">
                      We didn&apos;t just want to digitize existing processes – we wanted to reimagine them entirely.
                      Using modern technologies like Next.js, NestJS, and cloud-native architectures, we built a
                      platform that treats compliance as code, enables real-time collaboration, and provides the
                      transparency and speed that modern organizations demand.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <Card className="p-8">
                  <CardHeader className="px-0 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle>Looking Forward</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="px-0">
                    <p className="text-muted-foreground">
                      Today, Bedrock represents more than just a software platform – it&apos;s a new approach to
                      cybersecurity governance. We&apos;re working with forward-thinking organizations to prove that
                      compliance can be fast, collaborative, and actually improve security posture. With CMMC 2.0
                      on the horizon and increasing regulatory pressure, we believe the timing has never been better
                      for a fundamental shift in how organizations approach compliance.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
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
              <h2 className="text-3xl font-bold mb-4">Our Values</h2>
              <p className="text-lg text-muted-foreground">
                The principles that guide everything we do
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div variants={fadeInUp}>
                <Card className="p-6 text-center h-full">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Microscope className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Practitioner-First</h3>
                  <p className="text-sm text-muted-foreground">
                    Every feature is built by people who use compliance tools daily in real environments.
                  </p>
                </Card>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <Card className="p-6 text-center h-full">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Rocket className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Speed & Quality</h3>
                  <p className="text-sm text-muted-foreground">
                    We believe you shouldn&apos;t have to choose between doing things quickly and doing them right.
                  </p>
                </Card>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <Card className="p-6 text-center h-full">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Globe className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Transparency</h3>
                  <p className="text-sm text-muted-foreground">
                    Open about our roadmap, honest about our limitations, clear about our pricing.
                  </p>
                </Card>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <Card className="p-6 text-center h-full">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Handshake className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Partnership</h3>
                  <p className="text-sm text-muted-foreground">
                    We succeed when our customers succeed. Your feedback shapes our product.
                  </p>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Investment & Partnership */}
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
              <h2 className="text-3xl font-bold mb-4">Strategic Opportunity</h2>
              <p className="text-lg text-muted-foreground">
                Join us in revolutionizing cybersecurity compliance
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              <motion.div variants={fadeInUp}>
                <h3 className="text-2xl font-semibold mb-6">Investment & Partnership</h3>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    We&apos;re at an inflection point in the cybersecurity compliance market. With CMMC 2.0 enforcement
                    beginning in November 2025, over 200,000 defense contractors need modern compliance solutions.
                  </p>
                  <p>Bedrock offers a unique strategic opportunity:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>First-mover advantage</strong> in the RMF-native platform space</li>
                    <li><strong>Proven expertise</strong> with deep domain knowledge</li>
                    <li><strong>Modern architecture</strong> built for scale and integration</li>
                    <li><strong>Clear market demand</strong> driven by regulatory requirements</li>
                  </ul>
                  <p>
                    We&apos;re open to discussions about acquisition, strategic partnerships, and joint ventures with
                    organizations that share our vision for the future of compliance.
                  </p>
                </div>

                <div className="mt-8 flex gap-4 flex-wrap">
                  <Button size="lg" asChild>
                    <Link href="/acquisition">
                      <Briefcase className="mr-2 h-4 w-4" />
                      View Acquisition Details
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="/contact">
                      <Mail className="mr-2 h-4 w-4" />
                      Schedule Discussion
                    </Link>
                  </Button>
                </div>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <Card className="p-8">
                  <CardHeader className="px-0 pb-4">
                    <CardTitle className="text-xl">Why Partner with Bedrock?</CardTitle>
                  </CardHeader>
                  <CardContent className="px-0 space-y-4">
                    <div className="flex items-start gap-3">
                      <Award className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-sm">Unique IP:</strong>
                        <p className="text-sm text-muted-foreground">Only RMF-native platform in market</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-sm">Perfect Timing:</strong>
                        <p className="text-sm text-muted-foreground">CMMC deadline creates urgency</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Target className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-sm">Proven Market:</strong>
                        <p className="text-sm text-muted-foreground">$127.7B GRC market opportunity</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Settings className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-sm">Production Ready:</strong>
                        <p className="text-sm text-muted-foreground">Core platform operational</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-sm">Expert Leadership:</strong>
                        <p className="text-sm text-muted-foreground">Ready to scale and execute</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
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