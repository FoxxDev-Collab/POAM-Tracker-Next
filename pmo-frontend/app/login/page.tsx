"use client"

import { useState } from "react"
import { Shield, Lock, AlertTriangle, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        // Check for redirect parameter
        const urlParams = new URLSearchParams(window.location.search)
        const redirect = urlParams.get('redirect') || '/dashboard'
        // Redirect to specified or default location

        // Use window.location for more reliable redirect
        window.location.href = redirect
      } else {
        console.error('Login failed:', result)
        setError(result.error || 'Authentication failed')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-primary p-3 rounded-full">
              <Shield className="h-10 w-10 text-primary-foreground" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Bedrock Security Platform
            </h1>
            <p className="text-muted-foreground text-lg">
              Comprehensive Vulnerability & Risk Management
            </p>
          </div>
        </div>

        {/* Security Notice */}
        <Alert className="border-destructive/50 bg-destructive/10">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>SECURITY NOTICE</AlertTitle>
          <AlertDescription>
            This system contains U.S. Government information. Unauthorized access or use is prohibited
            and may result in criminal, civil, or administrative penalties. System usage may be monitored,
            recorded, and audited. By accessing this system, you consent to these terms.
          </AlertDescription>
        </Alert>

        {/* Login Card */}
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-center">
              Secure Access Portal
            </CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access the Bedrock Security Platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="username@organization.gov"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
                    <span>Authenticating...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Lock className="h-4 w-4" />
                    <span>Sign In</span>
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <div className="text-center">
              <Button variant="link" className="p-0 h-auto">
                Forgot Password?
              </Button>
            </div>
            <div className="text-center">
              <Button variant="link" className="p-0 h-auto">
                Need Help?
              </Button>
            </div>
          </CardFooter>
        </Card>

        {/* Footer */}
        <div className="text-center space-y-2">
          <p className="text-muted-foreground text-sm">
            For technical support, contact your system administrator
          </p>
          <p className="text-muted-foreground text-xs">
            © 2024 Bedrock Security Platform. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}
