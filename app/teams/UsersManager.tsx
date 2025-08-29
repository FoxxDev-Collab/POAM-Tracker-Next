"use client"

import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { Badge } from "@/components/ui/badge"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

type Role = "Admin" | "ISSM" | "ISSO" | "SysAdmin" | "ISSE" | "Auditor"

type User = {
  id: number
  name: string
  email: string
  role: Role
  active: 0 | 1
  created_at: string
  updated_at: string
}

type Me = {
  id: number
  name: string
  email: string
  role: Role
  active: 0 | 1
}

const passwordSchema = z
  .string()
  .min(12, "At least 12 characters")
  .refine((v) => /[A-Z]/.test(v), "Add an uppercase letter")
  .refine((v) => /[a-z]/.test(v), "Add a lowercase letter")
  .refine((v) => /\d/.test(v), "Add a number")
  .refine((v) => /[^A-Za-z0-9]/.test(v), "Add a special character")

const createSchema = z.object({
  name: z.string().min(1, "Required").max(200),
  email: z.string().email().max(320),
  role: z.enum(["Admin", "ISSM", "ISSO", "SysAdmin", "ISSE", "Auditor"]).default("ISSM"),
  active: z.boolean().default(true),
  password: passwordSchema,
  confirm: z.string(),
}).refine((v) => v.password === v.confirm, {
  path: ["confirm"],
  message: "Passwords do not match",
})

const updateSchema = z.object({
  name: z.string().min(1, "Required").max(200),
  email: z.string().email().max(320),
  role: z.enum(["Admin", "ISSM", "ISSO", "SysAdmin", "ISSE", "Auditor"]).default("ISSM"),
  active: z.boolean().default(true),
  password: z.string().optional().refine((v) => !v || passwordSchema.safeParse(v).success, {
    message: "Password does not meet complexity",
  }),
  confirm: z.string().optional(),
}).refine((v) => !v.password || v.password === v.confirm, {
  path: ["confirm"],
  message: "Passwords do not match",
})

type CreateInput = z.input<typeof createSchema>
type CreateOutput = z.output<typeof createSchema>
type UpdateInput = z.input<typeof updateSchema>
type UpdateOutput = z.output<typeof updateSchema>

function useUsers() {
  const [items, setItems] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")

  const refresh = React.useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/users", { cache: "no-store" })
      if (!res.ok) throw new Error("Failed to load users")
      const data: { items: User[] } = await res.json()
      setItems(data.items)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error loading users")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { items, loading, error, refresh, setItems }
}

function useMe() {
  const [me, setMe] = useState<Me | null>(null)
  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch("/api/users/me", { cache: "no-store" })
        if (res.ok) {
          const data: Me = await res.json()
          setMe(data)
        } else {
          setMe(null)
        }
      } catch {
        setMe(null)
      }
    }
    void run()
  }, [])
  return me
}

export default function UsersManager() {
  const { items, loading, error, refresh, setItems } = useUsers()
  const me = useMe()
  const readonly = me?.role === "Auditor"

  const form = useForm<CreateInput, unknown, CreateOutput>({
    resolver: zodResolver(createSchema),
    defaultValues: { name: "", email: "", role: "ISSM", active: true, password: "", confirm: "" },
  })

  async function onCreate(values: CreateOutput) {
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: values.name,
        email: values.email,
        role: values.role,
        active: values.active,
        password: values.password,
      }),
    })
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      alert(j.error ?? "Failed to create user")
      return
    }
    form.reset({ name: "", email: "", role: "ISSM", active: true, password: "", confirm: "" })
    refresh()
  }

  async function onUpdate(id: number, values: UpdateOutput) {
    const res = await fetch(`/api/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: values.name,
        email: values.email,
        role: values.role,
        active: values.active,
        password: values.password || undefined,
      }),
    })
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      alert(j.error ?? "Failed to update user")
      return false
    }
    refresh()
    return true
  }

  async function onDelete(id: number) {
    if (!confirm("Delete this user?")) return
    const res = await fetch(`/api/users/${id}`, { method: "DELETE" })
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      alert(j.error ?? "Failed to delete user")
      return
    }
    setItems((xs) => xs.filter((x) => x.id !== id))
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Team Directory</CardTitle>
          {!readonly && (
            <Form {...form}>
              <form className="flex flex-wrap items-start gap-2" onSubmit={form.handleSubmit(onCreate)}>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="sr-only">Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="sr-only">Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="email@domain" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="sr-only">Password</FormLabel>
                      <FormControl>
                        <PasswordInput showValidation placeholder="Password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="sr-only">Confirm</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Confirm" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="sr-only">Role</FormLabel>
                      <FormControl>
                        <select
                          className="h-9 border rounded-md px-2 bg-background"
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value as Role)}
                        >
                          {(["Admin","ISSM","ISSO","SysAdmin","ISSE","Auditor"] as const).map((r) => (
                            <option key={r} value={r}>{r}</option>
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
                    <FormItem className="flex items-center gap-2 h-9">
                      <FormControl>
                        <input
                          id="active"
                          type="checkbox"
                          className="h-4 w-4"
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                        />
                      </FormControl>
                      <FormLabel htmlFor="active" className="m-0">Active</FormLabel>
                    </FormItem>
                  )}
                />
                <Button type="submit">Add</Button>
              </form>
            </Form>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading && <div className="text-sm text-muted-foreground">Loading…</div>}
        {!loading && error && <div className="text-sm text-destructive">{error}</div>}
        {!loading && !error && items.length === 0 && (
          <div className="text-sm text-muted-foreground">No users yet. Use the form above to add one.</div>
        )}
        {!loading && !error && items.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 pr-3 w-[26%]">Name</th>
                  <th className="py-2 pr-3 w-[26%]">Email</th>
                  <th className="py-2 pr-3 w-[16%]">Role</th>
                  <th className="py-2 pr-3 w-[10%]">Active</th>
                  <th className="py-2 pr-2 w-[180px]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((u) => (
                  <tr key={u.id} className="border-b align-top">
                    <td className="py-2 pr-3">
                      <div className="font-medium">{u.name}</div>
                      <div className="text-xs text-muted-foreground">ID {u.id}</div>
                    </td>
                    <td className="py-2 pr-3 whitespace-nowrap">{u.email}</td>
                    <td className="py-2 pr-3 whitespace-nowrap"><Badge variant="gray">{u.role}</Badge></td>
                    <td className="py-2 pr-3 whitespace-nowrap">{u.active === 1 ? <Badge variant="green">Yes</Badge> : <Badge variant="red">No</Badge>}</td>
                    <td className="py-2 pr-2">
                      {readonly ? (
                        <span className="text-muted-foreground">—</span>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          <EditUserDialog
                            user={u}
                            onSave={(v) => onUpdate(u.id, v)}
                          />
                          <Button variant="destructive" size="sm" onClick={() => onDelete(u.id)}>Delete</Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function EditUserDialog({ user, onSave }: { user: User; onSave: (v: UpdateOutput) => Promise<boolean> }) {
  const form = useForm<UpdateInput, unknown, UpdateOutput>({
    resolver: zodResolver(updateSchema),
    defaultValues: { name: user.name, email: user.email, role: user.role, active: user.active === 1, password: "", confirm: "" },
  })
  const [showPassword, setShowPassword] = useState(false)

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">Edit</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            className="grid gap-3"
            onSubmit={form.handleSubmit(async (v) => {
              const ok = await onSave(v)
              if (ok) (document.activeElement as HTMLElement | null)?.blur()
            })}
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <FormControl>
                    <select
                      className="h-9 border rounded-md px-2 bg-background"
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value as Role)}
                    >
                      {(["Admin","ISSM","ISSO","SysAdmin","ISSE","Auditor"] as const).map((r) => (
                        <option key={r} value={r}>{r}</option>
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
            <div className="flex items-center gap-2">
              <input id="toggle-pass" type="checkbox" className="h-4 w-4" checked={showPassword} onChange={(e) => setShowPassword(e.target.checked)} />
              <label htmlFor="toggle-pass" className="text-sm">Set new password</label>
            </div>
            {showPassword && (
              <>
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <PasswordInput showValidation {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            <DialogFooter>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
