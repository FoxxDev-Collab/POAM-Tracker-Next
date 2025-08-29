"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

export type PkgSystemItem = {
  id: number
  package_id: number
  group_id: number | null
  group_name?: string
  name: string
  description: string
  total?: number
  high?: number
  medium?: number
  low?: number
}

const schema = z.object({
  name: z.string().min(1, "Required").max(100),
  description: z.string().max(1000).default("")
})

type FormInput = z.input<typeof schema>
type FormOutput = z.output<typeof schema>

export default function PackageSystemsTable({ pkgId }: { pkgId: number }) {
  const [items, setItems] = useState<PkgSystemItem[]>([])
  const [loading, setLoading] = useState(false)
  const form = useForm<FormInput, unknown, FormOutput>({ resolver: zodResolver(schema), defaultValues: { name: "", description: "" } })

  async function reload() {
    setLoading(true)
    try {
      const res = await fetch(`/api/packages/${pkgId}/systems`, { cache: "no-store" })
      const json = await res.json()
      setItems(json.items ?? [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    reload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pkgId])

  const onCreate = async (values: FormOutput) => {
    const res = await fetch(`/api/packages/${pkgId}/systems`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) })
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      alert(j.error ?? "Failed to create system")
      return
    }
    form.reset({ name: "", description: "" })
    reload()
  }

  async function onUpdate(id: number, values: z.infer<typeof schema>) {
    const res = await fetch(`/api/systems/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) })
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      alert(j.error ?? "Failed to update system")
      return false
    }
    reload()
    return true
  }

  async function onDelete(id: number) {
    if (!confirm("Delete this system?")) return
    const res = await fetch(`/api/systems/${id}`, { method: "DELETE" })
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      alert(j.error ?? "Failed to delete system")
      return
    }
    setItems((xs) => xs.filter((x) => x.id !== id))
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Systems in this Package</CardTitle>
          <Form {...form}>
            <form className="flex gap-2" onSubmit={form.handleSubmit(onCreate)}>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="sr-only">Name</FormLabel>
                    <FormControl>
                      <Input placeholder="New system name" {...field} />
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
              <Button type="submit">Add</Button>
            </form>
          </Form>
        </div>
      </CardHeader>
      <CardContent>
        {loading && <div className="text-sm text-muted-foreground">Loading…</div>}
        {!loading && items.length === 0 && (
          <div className="text-sm text-muted-foreground">No systems yet. Use the form above to add one.</div>
        )}
        {!loading && items.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 pr-3 w-[30%]">System</th>
                  <th className="py-2 pr-3 w-[18%]">Group</th>
                  <th className="py-2 pr-3 w-[90px]">Total</th>
                  <th className="py-2 pr-3 w-[90px]">High</th>
                  <th className="py-2 pr-3 w-[90px]">Medium</th>
                  <th className="py-2 pr-3 w-[90px]">Low</th>
                  <th className="py-2 pr-2 w-[240px]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((s) => (
                  <tr key={s.id} className="border-b align-top">
                    <td className="py-2 pr-3">
                      <div className="font-medium">{s.name}</div>
                      <div className="text-xs text-muted-foreground">{s.description}</div>
                    </td>
                    <td className="py-2 pr-3 whitespace-nowrap">{s.group_name || "—"}</td>
                    <td className="py-2 pr-3 whitespace-nowrap"><Badge variant="blue">{s.total ?? 0}</Badge></td>
                    <td className="py-2 pr-3 whitespace-nowrap"><Badge variant="red">{s.high ?? 0}</Badge></td>
                    <td className="py-2 pr-3 whitespace-nowrap"><Badge variant="orange">{s.medium ?? 0}</Badge></td>
                    <td className="py-2 pr-3 whitespace-nowrap"><Badge variant="yellow">{s.low ?? 0}</Badge></td>
                    <td className="py-2 pr-2">
                      <div className="flex flex-wrap gap-2">
                        <Link href={`/systems/${s.id}`} className="inline-flex">
                          <Button variant="outline" size="sm">Open</Button>
                        </Link>
                        <EditSystemDialog item={s} onSave={onUpdate} />
                        <Button variant="destructive" size="sm" onClick={() => onDelete(s.id)}>Delete</Button>
                      </div>
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

function EditSystemDialog({ item, onSave }: { item: PkgSystemItem; onSave: (id: number, v: z.infer<typeof schema>) => Promise<boolean> }) {
  const form = useForm<FormInput, unknown, FormOutput>({ resolver: zodResolver(schema), defaultValues: { name: item.name, description: item.description } })
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">Edit</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit System</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            className="grid gap-3"
            onSubmit={form.handleSubmit(async (v) => {
              const ok = await onSave(item.id, v)
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
            <DialogFooter>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
