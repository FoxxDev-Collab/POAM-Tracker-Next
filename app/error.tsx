"use client"

import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log error to monitoring service (without exposing sensitive info)
    console.error("Application error:", error.digest || "Unknown error")
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <Card className="border-orange-200">
          <CardHeader className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-orange-100 mb-4">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            </div>
            <CardTitle className="text-orange-600">Something went wrong</CardTitle>
            <CardDescription>
              An unexpected error occurred while processing your request
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-gray-600">
              Error ID: {error.digest ? error.digest.substring(0, 8) : "Unknown"}
            </p>
            <p className="text-xs text-gray-500">
              Our team has been notified and is working to resolve this issue.
            </p>
            <div className="flex flex-col space-y-2">
              <Button onClick={reset}>
                Try Again
              </Button>
              <Button variant="outline" asChild>
                <a href="/dashboard">Return to Dashboard</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}