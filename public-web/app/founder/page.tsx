"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/navigation";
import { Shield, Lock, Target, AlertCircle, Mail, Briefcase, Eye, Award, Zap, Microscope, Users, CheckCircle } from "lucide-react";
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

export default function Founder() {
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
            variants={staggerChildren}
          >
            <motion.div variants={fadeInUp}>
              <Badge className="mb-6" variant="outline">
                <Award className="mr-2 h-4 w-4" />
                CISM • CISSP Certified
              </Badge>
            </motion.div>

            <motion.h1
              className="text-4xl font-bold tracking-tight sm:text-6xl"
              variants={fadeInUp}
            >
              Meet the Founder
            </motion.h1>

            <motion.p
              className="mt-6 text-lg leading-8 text-muted-foreground max-w-2xl mx-auto"
              variants={fadeInUp}
            >
              Jeremiah Price - Cybersecurity practitioner turned entrepreneur, solving the RMF compliance challenges I&apos;ve lived through firsthand.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Certification and Experience */}
      <section className="py-16 bg-muted/50">
        <div className="container">
          <motion.div
            className="mx-auto max-w-6xl"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerChildren}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div variants={fadeInUp}>
                <h2 className="text-3xl font-bold mb-6">Professional Background</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    As a certified CISM and CISSP professional with over 5 years of hands-on experience as an ISSO/ISSE
                    in both government and contractor environments, I&apos;ve experienced firsthand the pain points of legacy
                    compliance tools.
                  </p>
                  <p>
                    I&apos;ve spent countless hours wrestling with platforms like eMASS and Xacta, watching talented engineers
                    waste weeks on manual documentation updates that should take minutes. This frustration drove me to build
                    something better.
                  </p>
                  <p>
                    Bedrock isn&apos;t just another compliance tool - it&apos;s the platform I wished existed during my years in the
                    field. Every feature is designed to solve real problems that practitioners face daily.
                  </p>
                </div>
              </motion.div>

              <motion.div variants={fadeInUp} className="grid grid-cols-2 gap-4">
                <Card className="text-center p-6">
                  <div className="flex justify-center mb-3">
                    <Shield className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold">CISM</h3>
                  <p className="text-sm text-muted-foreground mt-2">Certified Information Security Manager</p>
                </Card>

                <Card className="text-center p-6">
                  <div className="flex justify-center mb-3">
                    <Lock className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold">CISSP</h3>
                  <p className="text-sm text-muted-foreground mt-2">Certified Information Systems Security Professional</p>
                </Card>

                <Card className="text-center p-6">
                  <div className="flex justify-center mb-3">
                    <Target className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold">5+ Years</h3>
                  <p className="text-sm text-muted-foreground mt-2">ISSO/ISSE Experience</p>
                </Card>

                <Card className="text-center p-6">
                  <div className="flex justify-center mb-3">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold">Gov & Contractor</h3>
                  <p className="text-sm text-muted-foreground mt-2">Cross-sector expertise</p>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* The Journey */}
      <section className="py-16">
        <div className="container">
          <motion.div
            className="mx-auto max-w-4xl"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl font-bold text-center mb-12">The Journey to Bedrock</h2>

            <div className="space-y-8">
              <Card className="p-8">
                <CardHeader className="px-0 pb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                      <AlertCircle className="h-8 w-8 text-destructive" />
                    </div>
                    <CardTitle>The Breaking Point</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="px-0">
                  <p className="text-muted-foreground">
                    The moment that changed everything came during a CMMC Level 2 preparation. We had a team of brilliant
                    engineers stuck doing manual control mappings in eMASS for weeks. Watching them copy-paste the same
                    information across dozens of screens while our actual security posture took a backseat to documentation
                    was the final straw. I knew there had to be a better way.
                  </p>
                </CardContent>
              </Card>

              <Card className="p-8">
                <CardHeader className="px-0 pb-4">
                  <CardTitle>From Frustration to Innovation</CardTitle>
                </CardHeader>
                <CardContent className="px-0">
                  <p className="text-muted-foreground mb-6">
                    I started building Bedrock nights and weekends, driven by a simple vision: what if compliance tools
                    actually understood how modern software development works? What if they could integrate with CI/CD
                    pipelines, understand cloud-native architectures, and treat compliance as code?
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <strong className="text-sm">2022:</strong>
                        <p className="text-sm text-muted-foreground">Initial prototype built</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <strong className="text-sm">2023:</strong>
                        <p className="text-sm text-muted-foreground">First beta deployments</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <strong className="text-sm">2024:</strong>
                        <p className="text-sm text-muted-foreground">Platform maturation</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <strong className="text-sm">2025:</strong>
                        <p className="text-sm text-muted-foreground">Ready for scale</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-16 bg-muted/50">
        <div className="container">
          <motion.div
            className="mx-auto max-w-4xl text-center"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl font-bold mb-12">My Philosophy</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Practitioner-First</h3>
                <p className="text-sm text-muted-foreground">
                  Every feature must solve a real problem that practitioners face daily
                </p>
              </Card>

              <Card className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Speed Matters</h3>
                <p className="text-sm text-muted-foreground">
                  Compliance shouldn&apos;t slow down innovation - it should enable it
                </p>
              </Card>

              <Card className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Microscope className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Evidence-Based</h3>
                <p className="text-sm text-muted-foreground">
                  Decisions should be driven by data, not bureaucracy
                </p>
              </Card>

              <Card className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Bridge Builder</h3>
                <p className="text-sm text-muted-foreground">
                  Breaking down silos between security, engineering, and compliance teams
                </p>
              </Card>
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
              Connect with the Founder
            </h2>
            <p className="mt-6 text-lg leading-8 opacity-90">
              Interested in the story behind Bedrock or discussing the future of compliance? Let&apos;s talk.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/contact">
                  <Mail className="mr-2 h-4 w-4" />
                  Contact Me
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" asChild>
                <Link href="/acquisition">
                  <Briefcase className="mr-2 h-4 w-4" />
                  Strategic Discussion
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" asChild>
                <Link href="/product">
                  <Eye className="mr-2 h-4 w-4" />
                  See the Platform
                </Link>
              </Button>
            </div>
            <p className="mt-8 text-sm opacity-75 max-w-2xl mx-auto">
              As a cybersecurity practitioner who&apos;s been in the trenches, I built Bedrock to solve the problems
              I&apos;ve lived through. Let&apos;s discuss how we can transform your compliance operations.
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