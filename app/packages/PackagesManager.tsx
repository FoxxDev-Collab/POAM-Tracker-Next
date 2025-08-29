"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export type PackageItem = { id: number; name: string; description: string }

const schema = z.object({
  name: z.string().min(1, "Required").max(100),
  description: z.string().max(1000).default(""),
})

type FormInput = z.input<typeof schema>
type FormOutput = z.output<typeof schema>

type Props = { initial: PackageItem[] }

export default function PackagesManager({ initial }: Props) {
  const [items, setItems] = useState<PackageItem[]>(initial)
  const [loading, setLoading] = useState(false)

  // Create form
  const form = useForm<FormInput, unknown, FormOutput>({ resolver: zodResolver(schema), defaultValues: { name: "", description: "" } })

  async function reload() {
    setLoading(true)
    try {
      const res = await fetch("/api/packages", { cache: "no-store" })
      const json = await res.json()
      setItems(json.items ?? [])
    } finally {
      setLoading(false)
    }
  }

  const onCreate = async (values: FormOutput) => {
    const res = await fetch("/api/packages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) })
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      alert(j.error ?? "Failed to create")
      return
    }
    form.reset({ name: "", description: "" })
    reload()
    if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("packages:updated"))
  }

  async function onUpdate(id: number, values: z.infer<typeof schema>) {
    const res = await fetch(`/api/packages/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) })
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      alert(j.error ?? "Failed to update")
      return false
    }
    reload()
    if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("packages:updated"))
    return true
  }

  async function onDelete(id: number) {
    if (!confirm("Delete this package?")) return
    const res = await fetch(`/api/packages/${id}`, { method: "DELETE" })
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      alert(j.error ?? "Failed to delete")
      return
    }
    setItems((xs) => xs.filter((x) => x.id !== id))
    if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("packages:updated"))
  }

  useEffect(() => {
    // In case initial becomes stale due to nav
  }, [])

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Create ATO Package</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="flex flex-col md:flex-row gap-3" onSubmit={form.handleSubmit(onCreate)}>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Nomad" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="flex-[2]">
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="Optional" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="self-end">
                <Button type="submit">Create</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manage ATO Packages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {loading && <div className="text-sm text-muted-foreground">Loading…</div>}
            {items.length === 0 && !loading && (
              <div className="text-sm text-muted-foreground">No packages yet. Create one above.</div>
            )}
            {items.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <div className="font-medium">
                    <Link href={`/packages/${p.id}`} className="hover:underline">{p.name}</Link>
                  </div>
                  <div className="text-xs text-muted-foreground">{p.description}</div>
                </div>
                <div className="flex items-center gap-2">
                  <EditPackageDialog item={p} onSave={onUpdate} />
                  <Button variant="destructive" onClick={() => onDelete(p.id)}>Delete</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function EditPackageDialog({ item, onSave }: { item: PackageItem; onSave: (id: number, v: z.infer<typeof schema>) => Promise<boolean> }) {
  const form = useForm<FormInput, unknown, FormOutput>({ resolver: zodResolver(schema), defaultValues: { name: item.name, description: item.description } })
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary">Edit</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit ATO Package</DialogTitle>
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
