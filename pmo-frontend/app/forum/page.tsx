"use client"

import { MessageSquare } from "lucide-react"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { MainLayout } from "@/components/layout/main-layout"

export default function ForumPage() {
  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <MessageSquare className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Forum</h1>
              <p className="text-muted-foreground">
                Community discussions and knowledge sharing
              </p>
            </div>
          </div>
        </div>

        {/* Coming Soon */}
        <Card className="text-center py-12">
          <CardContent className="space-y-6">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              <MessageSquare className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-xl">Forum Coming Soon</CardTitle>
              <CardDescription className="text-base">
                Community discussions and knowledge sharing features are under development
              </CardDescription>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
