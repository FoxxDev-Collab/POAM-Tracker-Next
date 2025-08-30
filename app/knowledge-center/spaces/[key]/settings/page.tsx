"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Settings, Users, Globe, Lock, Trash2, Save } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { MainLayout } from "@/components/layout/main-layout"
import Link from "next/link"

type KCSpace = {
  id: number;
  key: string;
  name: string;
  description: string;
  type: 'personal' | 'team' | 'global';
  visibility: 'public' | 'restricted' | 'private';
  created_by: number;
  created_at: string;
  updated_at: string;
}

type KCSpacePermission = {
  id: number;
  space_id: number;
  user_id: number | null;
  team_id: number | null;
  permission: 'read' | 'write' | 'admin';
  created_at: string;
  user_name?: string;
  team_name?: string;
}

export default function SpaceSettingsPage() {
  const params = useParams()
  const router = useRouter()
  const [space, setSpace] = useState<KCSpace | null>(null)
  const [permissions, setPermissions] = useState<KCSpacePermission[]>([])
  const [loading, setLoading] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'team' as 'personal' | 'team' | 'global',
    visibility: 'public' as 'public' | 'restricted' | 'private'
  })

  useEffect(() => {
    if (params.key) {
      fetchData()
    }
  }, [params.key])

  const fetchData = async () => {
    try {
      // Fetch space
      const spaceResponse = await fetch(`/api/knowledge-center/spaces/${params.key}`)
      if (spaceResponse.ok) {
        const spaceData = await spaceResponse.json()
        const spaceInfo = spaceData.space
        setSpace(spaceInfo)
        setFormData({
          name: spaceInfo.name,
          description: spaceInfo.description,
          type: spaceInfo.type,
          visibility: spaceInfo.visibility
        })
      }

      // Fetch permissions
      const permissionsResponse = await fetch(`/api/knowledge-center/spaces/${params.key}/permissions`)
      if (permissionsResponse.ok) {
        const permissionsData = await permissionsResponse.json()
        setPermissions(permissionsData.permissions || [])
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/knowledge-center/spaces/${params.key}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push(`/knowledge-center/spaces/${params.key}`)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update space')
      }
    } catch (error) {
      console.error('Error updating space:', error)
      alert('Failed to update space')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (deleteConfirm !== space?.name) {
      alert('Please type the space name exactly to confirm deletion')
      return
    }

    try {
      const response = await fetch(`/api/knowledge-center/spaces/${params.key}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.push('/knowledge-center')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete space')
      }
    } catch (error) {
      console.error('Error deleting space:', error)
      alert('Failed to delete space')
    }
  }

  const getPermissionColor = (permission: string) => {
    switch (permission) {
      case 'admin': return 'bg-red-100 text-red-800'
      case 'write': return 'bg-blue-100 text-blue-800'
      case 'read': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (!space) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading settings...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <Link 
            href={`/knowledge-center/spaces/${space.key}`} 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to {space.name}
          </Link>
          
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-500/10 rounded-lg">
              <Settings className="h-8 w-8 text-orange-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Space Settings</h1>
              <p className="text-muted-foreground">
                Manage settings and permissions for &ldquo;{space.name}&rdquo;
              </p>
            </div>
          </div>
        </div>

        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>
              Update basic information about your space
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Space Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="key">Space Key</Label>
                  <Input
                    id="key"
                    value={space.key}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Space key cannot be changed after creation
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
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
                      <SelectItem value="personal">Personal</SelectItem>
                      <SelectItem value="team">Team</SelectItem>
                      <SelectItem value="global">Global</SelectItem>
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
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="restricted">Restricted</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Permissions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Permissions ({permissions.length})
            </CardTitle>
            <CardDescription>
              Manage who can access this space and their permission levels
            </CardDescription>
          </CardHeader>
          <CardContent>
            {permissions.length > 0 ? (
              <div className="space-y-3">
                {permissions.map((permission) => (
                  <div key={permission.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-xs text-primary-foreground">
                        {permission.user_name ? permission.user_name.charAt(0).toUpperCase() : 'T'}
                      </div>
                      <div>
                        <div className="font-medium">
                          {permission.user_name || permission.team_name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {permission.user_name ? 'User' : 'Team'}
                        </div>
                      </div>
                    </div>
                    <Badge className={getPermissionColor(permission.permission)}>
                      {permission.permission}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No explicit permissions set. Access is controlled by space visibility.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Danger Zone
            </CardTitle>
            <CardDescription>
              Irreversible and destructive actions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border border-destructive rounded-lg">
              <h4 className="font-medium text-destructive mb-2">Delete Space</h4>
              <p className="text-sm text-muted-foreground mb-4">
                This will permanently delete the space and all its pages, comments, and attachments. 
                This action cannot be undone.
              </p>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="deleteConfirm">
                    Type &ldquo;{space.name}&rdquo; to confirm deletion
                  </Label>
                  <Input
                    id="deleteConfirm"
                    value={deleteConfirm}
                    onChange={(e) => setDeleteConfirm(e.target.value)}
                    placeholder={space.name}
                  />
                </div>
                <Button 
                  variant="destructive" 
                  onClick={handleDelete}
                  disabled={deleteConfirm !== space.name}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Space
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
