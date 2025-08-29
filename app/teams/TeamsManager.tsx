"use client"

import React, { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

type Role = "Admin" | "ISSM" | "ISSO" | "SysAdmin" | "ISSE" | "Auditor"

type Team = {
  id: number
  name: string
  description: string | null
  lead_user_id: number
  active: 0 | 1
  created_at: string
  updated_at: string
  members?: Array<{
    user_id: number
    team_id: number
    role: 'Lead' | 'Member'
    user_name: string
    user_email: string
  }>
}

type User = {
  id: number
  name: string
  email: string
  role: Role
  active: 0 | 1
}

type Me = {
  id: number
  name: string
  email: string
  role: Role
  active: 0 | 1
}

const createSchema = z.object({
  name: z.string().min(1, "Required").max(100),
  description: z.string().max(500).optional(),
  lead_user_id: z.number().int().positive(),
})

const updateSchema = z.object({
  name: z.string().min(1, "Required").max(100),
  description: z.string().max(500).optional(),
  lead_user_id: z.number().int().positive(),
  active: z.boolean().default(true),
})

type CreateInput = z.input<typeof createSchema>
type CreateOutput = z.output<typeof createSchema>
type UpdateInput = z.input<typeof updateSchema>
type UpdateOutput = z.output<typeof updateSchema>

function useTeams() {
  const [items, setItems] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")

  const refresh = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/teams", { cache: "no-store" })
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      setItems(data.items || [])
      setError("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    void refresh()
  }, [refresh])

  return { items, loading, error, refresh, setItems }
}

function useUsers() {
  const [items, setItems] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/users", { cache: "no-store" })
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      setItems(data.items || [])
    } catch (err) {
      console.error("Failed to fetch users:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    void refresh()
  }, [refresh])

  return { items, loading, refresh }
}

function useMe() {
  const [me, setMe] = useState<Me | null>(null)

  React.useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch("/api/users/me", { cache: "no-store" })
        if (res.ok) {
          const data = await res.json()
          setMe(data)
        }
      } catch (err) {
        console.error("Failed to fetch me:", err)
      }
    }
    void run()
  }, [])
  return me
}

export default function TeamsManager() {
  const { items, loading, error, refresh } = useTeams()
  const { items: users } = useUsers()
  const me = useMe()
  const readonly = me?.role === "Auditor" || me?.role === "ISSE"

  const form = useForm<CreateInput, unknown, CreateOutput>({
    resolver: zodResolver(createSchema),
    defaultValues: { name: "", description: "", lead_user_id: 0 },
  })

  async function onCreate(values: CreateOutput) {
    const res = await fetch("/api/teams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    })
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      alert(j.error ?? "Failed to create team")
      return
    }
    form.reset({ name: "", description: "", lead_user_id: 0 })
    refresh()
  }

  async function onUpdate(id: number, values: UpdateOutput) {
    const res = await fetch(`/api/teams/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    })
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      alert(j.error ?? "Failed to update team")
      return false
    }
    refresh()
    return true
  }

  async function onDelete(id: number) {
    if (!confirm("Delete this team?")) return
    const res = await fetch(`/api/teams/${id}`, { method: "DELETE" })
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      alert(j.error ?? "Failed to delete team")
      return
    }
    refresh()
  }

  const managementRoles = ["Admin", "ISSM", "ISSO", "SysAdmin"]
  const eligibleLeads = users.filter(u => managementRoles.includes(u.role) && u.active === 1)

  if (loading) return <Card><CardContent className="p-6">Loading teams...</CardContent></Card>
  if (error) return <Card><CardContent className="p-6 text-red-600">Error: {error}</CardContent></Card>

  return (
    <Card>
      <CardHeader>
        <CardTitle>Teams</CardTitle>
        {!readonly && (
          <Form {...form}>
            <form className="flex flex-wrap items-start gap-2" onSubmit={form.handleSubmit(onCreate)}>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="sr-only">Team Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Team name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="sr-only">Description</FormLabel>
                    <FormControl>
                      <Input placeholder="Description (optional)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lead_user_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="sr-only">Team Lead</FormLabel>
                    <FormControl>
                      <select
                        className="h-9 border rounded-md px-2 bg-background"
                        value={field.value}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      >
                        <option value={0}>Select lead...</option>
                        {eligibleLeads.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.name} ({user.role})
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={!form.formState.isValid}>
                Add Team
              </Button>
            </form>
          </Form>
        )}
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No teams found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-2 font-medium">Team</th>
                  <th className="pb-2 font-medium">Lead</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Created</th>
                  {!readonly && <th className="pb-2 font-medium">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {items.map((team) => {
                  const lead = users.find(u => u.id === team.lead_user_id)
                  return (
                    <tr key={team.id} className="border-b">
                      <td className="py-2">
                        <div>
                          <div className="font-medium">{team.name}</div>
                          {team.description && (
                            <div className="text-sm text-muted-foreground">{team.description}</div>
                          )}
                        </div>
                      </td>
                      <td className="py-2">
                        {lead ? (
                          <div>
                            <div className="font-medium">{lead.name}</div>
                            <div className="text-sm text-muted-foreground">{lead.role}</div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Unknown</span>
                        )}
                      </td>
                      <td className="py-2">
                        <Badge variant={team.active ? "green" : "red"}>
                          {team.active ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="py-2 text-sm text-muted-foreground">
                        {new Date(team.created_at).toLocaleDateString()}
                      </td>
                      {!readonly && (
                        <td className="py-2">
                          <div className="flex gap-1">
                            <ManageTeamMembersDialog team={team} users={users} onRefresh={refresh} />
                            <EditTeamDialog team={team} users={eligibleLeads} onSave={(v) => onUpdate(team.id, v)} />
                            <Button variant="destructive" size="sm" onClick={() => onDelete(team.id)}>
                              Delete
                            </Button>
                          </div>
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function ManageTeamMembersDialog({ 
  team, 
  users, 
  onRefresh 
}: { 
  team: Team
  users: User[]
  onRefresh: () => void
}) {
  const [members, setMembers] = useState<Array<{
    user_id: number
    team_id: number
    role: 'Lead' | 'Member'
    user_name: string
    user_email: string
  }>>([])
  const [loading, setLoading] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<number>(0)

  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/teams/${team.id}`)
      if (res.ok) {
        const data = await res.json()
        setMembers(data.members || [])
      }
    } catch (err) {
      console.error("Failed to fetch members:", err)
    } finally {
      setLoading(false)
    }
  }, [team.id])

  const addMember = async () => {
    if (!selectedUserId) return
    
    const res = await fetch(`/api/teams/${team.id}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: selectedUserId, role: "Member" }),
    })
    
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      alert(j.error ?? "Failed to add member")
      return
    }
    
    setSelectedUserId(0)
    fetchMembers()
    onRefresh()
  }

  const removeMember = async (userId: number) => {
    if (!confirm("Remove this member from the team?")) return
    
    const res = await fetch(`/api/teams/${team.id}/members?user_id=${userId}`, {
      method: "DELETE",
    })
    
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      alert(j.error ?? "Failed to remove member")
      return
    }
    
    fetchMembers()
    onRefresh()
  }

  const availableUsers = users.filter(u => 
    u.active === 1 && 
    !members.some(m => m.user_id === u.id)
  )

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" onClick={fetchMembers}>
          Members ({members.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Team Members - {team.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Add Member Section */}
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium">Add Member</label>
              <select
                className="w-full h-9 border rounded-md px-2 bg-background"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(Number(e.target.value))}
              >
                <option value={0}>Select user...</option>
                {availableUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.role})
                  </option>
                ))}
              </select>
            </div>
            <Button onClick={addMember} disabled={!selectedUserId}>
              Add
            </Button>
          </div>

          {/* Members List */}
          <div>
            <h4 className="font-medium mb-2">Current Members</h4>
            {loading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : members.length === 0 ? (
              <p className="text-muted-foreground">No members</p>
            ) : (
              <div className="space-y-2">
                {members.map((member) => (
                  <div key={member.user_id} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <div className="font-medium">{member.user_name}</div>
                      <div className="text-sm text-muted-foreground">{member.user_email}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={member.role === 'Lead' ? 'blue' : 'gray'}>
                        {member.role}
                      </Badge>
                      {member.role !== 'Lead' && (
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => removeMember(member.user_id)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function EditTeamDialog({ 
  team, 
  users, 
  onSave 
}: { 
  team: Team
  users: User[]
  onSave: (v: UpdateOutput) => Promise<boolean> 
}) {
  const form = useForm<UpdateInput, unknown, UpdateOutput>({
    resolver: zodResolver(updateSchema),
    defaultValues: { 
      name: team.name, 
      description: team.description || "", 
      lead_user_id: team.lead_user_id,
      active: team.active === 1 
    },
  })

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">Edit</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Team</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(async (values) => {
            const success = await onSave(values)
            if (success) {
              // Close dialog logic would go here
            }
          })}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lead_user_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team Lead</FormLabel>
                  <FormControl>
                    <select
                      className="w-full h-9 border rounded-md px-2 bg-background"
                      value={field.value}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    >
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name} ({user.role})
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2">
                  <FormControl>
                    <input
                      id="edit-active"
                      type="checkbox"
                      className="h-4 w-4"
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  </FormControl>
                  <FormLabel htmlFor="edit-active" className="m-0">Active</FormLabel>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
