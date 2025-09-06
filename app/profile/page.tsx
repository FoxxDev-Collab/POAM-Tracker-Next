"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MainLayout } from "@/components/layout/main-layout"
import { User, Mail, Shield, Key, Camera, Save, Edit, X } from "lucide-react"

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  
  // Mock user data - in real app, this would come from authentication context
  const [userData, setUserData] = useState({
    fullName: "John Doe",
    email: "john.doe@example.com",
    role: "Security Analyst",
    avatar: ""
  })

  const [editData, setEditData] = useState(userData)
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })

  const handleSaveProfile = () => {
    setUserData(editData)
    setIsEditing(false)
    // TODO: Implement API call to save profile changes
  }

  const handleCancelEdit = () => {
    setEditData(userData)
    setIsEditing(false)
  }

  const handleChangePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords don't match")
      return
    }
    // TODO: Implement password change API call
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
    setIsChangingPassword(false)
  }

  const handleAvatarUpload = () => {
    // TODO: Implement avatar upload functionality
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-6 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">User Profile</h1>
            <p className="text-muted-foreground">Manage your account settings and preferences</p>
          </div>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)} className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Edit Profile
            </Button>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Avatar Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Picture
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <Avatar className="h-32 w-32">
                <AvatarImage src={userData.avatar} alt={userData.fullName} />
                <AvatarFallback className="text-2xl">
                  {userData.fullName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleAvatarUpload}
                className="flex items-center gap-2"
              >
                <Camera className="h-4 w-4" />
                Upload Photo
              </Button>
            </CardContent>
          </Card>

          {/* Profile Information */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Your personal information and account details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  {isEditing ? (
                    <Input
                      id="fullName"
                      value={editData.fullName}
                      onChange={(e) => setEditData({...editData, fullName: e.target.value})}
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{userData.fullName}</span>
                    </div>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  {isEditing ? (
                    <Input
                      id="email"
                      type="email"
                      value={editData.email}
                      onChange={(e) => setEditData({...editData, email: e.target.value})}
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{userData.email}</span>
                    </div>
                  )}
                </div>

                {/* Role */}
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  {isEditing ? (
                    <Input
                      id="role"
                      value={editData.role}
                      onChange={(e) => setEditData({...editData, role: e.target.value})}
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <Badge variant="secondary">{userData.role}</Badge>
                    </div>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleSaveProfile} className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={handleCancelEdit} className="flex items-center gap-2">
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Password Change Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Security
            </CardTitle>
            <CardDescription>
              Change your password to keep your account secure
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isChangingPassword ? (
              <Button 
                onClick={() => setIsChangingPassword(true)}
                className="flex items-center gap-2"
              >
                <Key className="h-4 w-4" />
                Change Password
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-1 max-w-md">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleChangePassword} className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Update Password
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsChangingPassword(false)
                      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
                    }}
                    className="flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      </div>
    </MainLayout>
  )
}

