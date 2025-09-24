"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Navigation } from "@/components/navigation";
import { Mail, Phone, Clock, Briefcase, Settings, Users, Handshake, Mountain, Send, Loader2, CheckCircle2, Target } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerChildren = {
  animate: { transition: { staggerChildren: 0.1 } }
};

type FormData = {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
};

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      setSubmitSuccess(true);
      toast.success('Message sent successfully!', {
        description: 'We\'ll get back to you within 1-2 business days.',
      });
      reset();

      // Reset success state after 5 seconds
      setTimeout(() => setSubmitSuccess(false), 5000);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error('Failed to send message', {
        description: 'Please try again or contact us directly via email.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />

      {/* Hero Section */}
      <section className="relative py-24 sm:py-32">
        <div className="container">
          <motion.div
            className="mx-auto max-w-2xl text-center"
            initial="initial"
            animate="animate"
            variants={fadeInUp}
          >
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              Get In Touch
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Ready to discuss the future of cybersecurity compliance? Let&apos;s connect and explore how Bedrock can transform your organization&apos;s approach to RMF.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16">
        <div className="container">
          <div className="mx-auto max-w-6xl">
            <motion.div
              className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start"
              initial="initial"
              animate="animate"
              variants={staggerChildren}
            >
              {/* Contact Card */}
              <motion.div variants={fadeInUp}>
                <Card className="p-8 shadow-lg">
                  <CardHeader className="pb-6 px-0">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                        <Users className="h-8 w-8 text-primary-foreground" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl mb-2">Jeremiah Price</CardTitle>
                        <p className="text-muted-foreground">Founder & CEO, Bedrock Security Platform</p>
                        <p className="text-sm text-muted-foreground">CISM • CISSP • Cybersecurity Practitioner</p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="px-0">
                    <div className="space-y-6 mb-8">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Mail className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold mb-1">Email</h4>
                          <a
                            href="mailto:foxxdev.collab@gmail.com"
                            className="text-primary hover:underline"
                          >
                            foxxdev.collab@gmail.com
                          </a>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Phone className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold mb-1">Phone</h4>
                          <a
                            href="tel:+12089011974"
                            className="text-primary hover:underline"
                          >
                            208-901-1974
                          </a>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Clock className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold mb-1">Availability</h4>
                          <p className="text-muted-foreground">Mountain Time (MT)</p>
                          <p className="text-sm text-muted-foreground">Monday - Friday, 9 AM - 6 PM</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button asChild className="flex-1">
                        <a href="mailto:foxxdev.collab@gmail.com">
                          <Mail className="mr-2 h-4 w-4" />
                          Send Email
                        </a>
                      </Button>
                      <Button variant="outline" asChild className="flex-1">
                        <a href="tel:+12089011974">
                          <Phone className="mr-2 h-4 w-4" />
                          Call Now
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Why Contact Us */}
              <motion.div variants={fadeInUp} className="space-y-6">
                <h3 className="text-2xl font-semibold">Let&apos;s Discuss</h3>

                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Briefcase className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Strategic Partnerships</h4>
                      <p className="text-sm text-muted-foreground">
                        Explore acquisition opportunities, joint ventures, and strategic collaborations in the cybersecurity compliance space.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Settings className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Technical Discussions</h4>
                      <p className="text-sm text-muted-foreground">
                        Deep dive into RMF implementation, platform architecture, and cybersecurity compliance challenges.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Platform Demonstrations</h4>
                      <p className="text-sm text-muted-foreground">
                        Schedule a personalized walkthrough of Bedrock&apos;s capabilities and see how it can transform your compliance workflow.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Handshake className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Investment Opportunities</h4>
                      <p className="text-sm text-muted-foreground">
                        Discuss funding, acquisition terms, and the business opportunity in the $127.7B GRC compliance market.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-16 bg-muted/50">
        <div className="container">
          <motion.div
            className="mx-auto max-w-2xl"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Send Us a Message</h2>
              <p className="text-lg text-muted-foreground">
                Have a specific question or need more information? Fill out the form below and we&apos;ll get back to you promptly.
              </p>
            </div>

            <Card className="p-8">
              {submitSuccess ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Message Sent Successfully!</h3>
                  <p className="text-muted-foreground">
                    Thank you for contacting us. We&apos;ll get back to you within 1-2 business days.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-6"
                    onClick={() => setSubmitSuccess(false)}
                  >
                    Send Another Message
                  </Button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">
                        Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="name"
                        {...register("name", { required: "Name is required" })}
                        placeholder="John Doe"
                        disabled={isSubmitting}
                      />
                      {errors.name && (
                        <p className="text-sm text-destructive">{errors.name.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">
                        Email <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        {...register("email", {
                          required: "Email is required",
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: "Invalid email address",
                          },
                        })}
                        placeholder="john.doe@company.com"
                        disabled={isSubmitting}
                      />
                      {errors.email && (
                        <p className="text-sm text-destructive">{errors.email.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone (Optional)</Label>
                      <Input
                        id="phone"
                        type="tel"
                        {...register("phone")}
                        placeholder="(555) 123-4567"
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject (Optional)</Label>
                      <Input
                        id="subject"
                        {...register("subject")}
                        placeholder="Platform Demo Request"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">
                      Message <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="message"
                      {...register("message", {
                        required: "Message is required",
                        minLength: {
                          value: 10,
                          message: "Message must be at least 10 characters",
                        },
                      })}
                      placeholder="Tell us about your compliance challenges and how we can help..."
                      rows={6}
                      disabled={isSubmitting}
                    />
                    {errors.message && (
                      <p className="text-sm text-destructive">{errors.message.message}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      <span className="text-destructive">*</span> Required fields
                    </p>
                    <Button type="submit" size="lg" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </Card>

            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground">
                Prefer to email directly? Reach us at{" "}
                <a
                  href="mailto:foxxdev.collab@gmail.com"
                  className="text-primary hover:underline"
                >
                  foxxdev.collab@gmail.com
                </a>
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Professional Context */}
      <section className="py-16">
        <div className="container">
          <motion.div
            className="mx-auto max-w-4xl text-center"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl font-bold mb-6">About Your Contact</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Certified Professional</h3>
                <p className="text-sm text-muted-foreground">
                  CISM and CISSP certified with 5+ years of hands-on ISSO/ISSE experience in government and contractor environments.
                </p>
              </Card>

              <Card className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Practitioner-Built</h3>
                <p className="text-sm text-muted-foreground">
                  Bedrock was born from real-world frustration with legacy compliance tools. Built by someone who&apos;s lived the pain firsthand.
                </p>
              </Card>

              <Card className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Ready to Scale</h3>
                <p className="text-sm text-muted-foreground">
                  With CMMC 2.0 enforcement beginning, the timing is perfect for partnerships and strategic discussions.
                </p>
              </Card>
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
                The world&apos;s first NIST RMF-native compliance platform, transforming cybersecurity governance.
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