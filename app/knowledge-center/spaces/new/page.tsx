"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, BookOpen } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MainLayout } from "@/components/layout/main-layout"
import Link from "next/link"

export default function NewSpacePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    key: '',
    name: '',
    description: '',
    type: 'team' as 'personal' | 'team' | 'global',
    visibility: 'public' as 'public' | 'restricted' | 'private'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/knowledge-center/spaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const { space } = await response.json()
        router.push(`/knowledge-center/spaces/${space.key}`)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create space')
      }
    } catch (error) {
      console.error('Error creating space:', error)
      alert('Failed to create space')
    } finally {
      setLoading(false)
    }
  }

  const generateKey = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50)
  }

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      key: prev.key || generateKey(name)
    }))
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <Link href="/knowledge-center" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Knowledge Center
          </Link>
          
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <BookOpen className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Create New Space</h1>
              <p className="text-muted-foreground">
                Set up a new knowledge space for your team
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Space Details</CardTitle>
            <CardDescription>
              Configure your new knowledge space with the information below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Space Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g., Security Documentation"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="key">Space Key *</Label>
                  <Input
                    id="key"
                    value={formData.key}
                    onChange={(e) => setFormData(prev => ({ ...prev, key: e.target.value }))}
                    placeholder="e.g., security-docs"
                    required
                    pattern="[a-z0-9-]+"
                    title="Only lowercase letters, numbers, and hyphens allowed"
                  />
                  <p className="text-xs text-muted-foreground">
                    Used in URLs. Only lowercase letters, numbers, and hyphens.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this space will contain..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Space Type</Label>
                  <Select value={formData.type} onValueChange={(value: string) => setFormData(prev => ({ ...prev, type: value as 'personal' | 'team' | 'global' }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="personal">Personal - Individual workspace</SelectItem>
                      <SelectItem value="team">Team - Collaborative workspace</SelectItem>
                      <SelectItem value="global">Global - Organization-wide</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="visibility">Visibility</Label>
                  <Select value={formData.visibility} onValueChange={(value: string) => setFormData(prev => ({ ...prev, visibility: value as 'public' | 'restricted' | 'private' }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public - Anyone can view</SelectItem>
                      <SelectItem value="restricted">Restricted - Team members only</SelectItem>
                      <SelectItem value="private">Private - Invited users only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <Link href="/knowledge-center">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Space'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
