"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"
import { Plus, Edit, Trash2, Users, Eye, EyeOff, CheckCircle, XCircle } from "lucide-react"

interface User {
  id: number
  firstName: string
  lastName: string
  email: string
  role: string
  isActive: boolean
  lastLogin: string | null
  createdAt: string
  updatedAt: string
}

interface PasswordValidation {
  length: boolean
  uppercase: boolean
  lowercase: boolean
  number: boolean
  special: boolean
}

const ROLES = ['Admin', 'ISSM', 'ISSO', 'SysAdmin', 'ISSE', 'Auditor']

export function UserManagementTab() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Auditor',
    isActive: true
  })

  const [passwordValidation, setPasswordValidation] = useState<PasswordValidation>({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  })

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.items || data || [])
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error("Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const validatePassword = (password: string): PasswordValidation => {
    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    }
  }

  const handlePasswordChange = (password: string) => {
    setFormData(prev => ({ ...prev, password }))
    setPasswordValidation(validatePassword(password))
  }

  const isPasswordValid = () => {
    return Object.values(passwordValidation).every(Boolean)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast.error("Please fill in all required fields")
      return
    }

    if (!editingUser && !isPasswordValid()) {
      toast.error("Password does not meet complexity requirements")
      return
    }

    if (!editingUser && formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    try {
      const url = editingUser 
        ? `/api/admin/users/${editingUser.id}`
        : `/api/admin/users`
      
      const method = editingUser ? 'PATCH' : 'POST'
      
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        role: formData.role,
        isActive: formData.isActive,
        ...((!editingUser || formData.password) && { password: formData.password })
      }
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to save user')
      }

      toast.success(editingUser ? "User updated successfully" : "User created successfully")
      fetchUsers()
      handleCloseDialog()
    } catch (error: unknown) {
      console.error('Error saving user:', error)
      toast.error(error instanceof Error ? error.message : "Failed to save user")
    }
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: '',
      confirmPassword: '',
      role: user.role,
      isActive: user.isActive
    })
    setPasswordValidation({
      length: false,
      uppercase: false,
      lowercase: false,
      number: false,
      special: false
    })
    setIsCreateDialogOpen(true)
  }

  const handleDelete = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete user')
      }

      toast.success("User deleted successfully")
      fetchUsers()
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error("Failed to delete user")
    }
  }

  const handleToggleActive = async (userId: number, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive })
      })

      if (!response.ok) {
        throw new Error('Failed to update user status')
      }

      toast.success(`User ${!isActive ? 'activated' : 'deactivated'} successfully`)
      fetchUsers()
    } catch (error) {
      console.error('Error updating user status:', error)
      toast.error("Failed to update user status")
    }
  }

  const handleCloseDialog = () => {
    setIsCreateDialogOpen(false)
    setEditingUser(null)
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'User',
      isActive: true
    })
    setPasswordValidation({
      length: false,
      uppercase: false,
      lowercase: false,
      number: false,
      special: false
    })
    setShowPassword(false)
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'User':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'Viewer':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'Auditor':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const ValidationIcon = ({ isValid }: { isValid: boolean }) => {
    return isValid ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    )
  }

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>User Management</CardTitle>
            <CardDescription>
              Create, edit, and manage user accounts and permissions
            </CardDescription>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingUser(null)}>
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingUser ? 'Edit User' : 'Create User'}
                </DialogTitle>
                <DialogDescription>
                  {editingUser ? 'Update user account details.' : 'Add a new user account to the system.'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                        placeholder="John"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                        placeholder="Doe"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="john.doe@example.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">
                      Password {editingUser ? '(leave blank to keep current)' : '*'}
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => handlePasswordChange(e.target.value)}
                        placeholder="Enter password"
                        required={!editingUser}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {(!editingUser || formData.password) && (
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <ValidationIcon isValid={passwordValidation.length} />
                          <span>At least 8 characters</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ValidationIcon isValid={passwordValidation.uppercase} />
                          <span>One uppercase letter</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ValidationIcon isValid={passwordValidation.lowercase} />
                          <span>One lowercase letter</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ValidationIcon isValid={passwordValidation.number} />
                          <span>One number</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ValidationIcon isValid={passwordValidation.special} />
                          <span>One special character</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {(!editingUser || formData.password) && (
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password *</Label>
                      <Input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        placeholder="Confirm password"
                        required={!editingUser || !!formData.password}
                      />
                      {formData.password && formData.confirmPassword && (
                        <div className="flex items-center gap-2 text-sm">
                          {formData.password === formData.confirmPassword ? (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span className="text-green-600">Passwords match</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4 text-red-500" />
                              <span className="text-red-600">Passwords do not match</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ROLES.map(role => (
                            <SelectItem key={role} value={role}>{role}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="isActive">Status</Label>
                      <Select value={formData.isActive.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, isActive: value === 'true' }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Active</SelectItem>
                          <SelectItem value="false">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <DialogFooter className="mt-6">
                  <Button type="button" variant="outline" onClick={handleCloseDialog}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingUser ? 'Update' : 'Create'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {users.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Users</h3>
            <p className="text-muted-foreground mb-4">
              Create your first user account to get started
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.firstName} {user.lastName}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getRoleColor(user.role)}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => handleToggleActive(user.id, user.isActive)}
                      className="focus:outline-none"
                    >
                      <Badge variant="outline" className={user.isActive ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200' : 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200'}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </button>
                  </TableCell>
                  <TableCell>
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                  </TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(user)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(user.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}