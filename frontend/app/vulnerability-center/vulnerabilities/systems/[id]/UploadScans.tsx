"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function UploadScans({ systemId }: { systemId: number }) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function onUpload() {
    if (!file) return
    setLoading(true)
    setMessage(null)
    setError(null)
    try {
      const text = await file.text()
      let json: unknown
      try {
        json = JSON.parse(text)
      } catch {
        setError("Selected file is not valid JSON")
        return
      }
      const res = await fetch(`/api/systems/${systemId}/cklb`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(json),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error ?? `Upload failed (${res.status})`)
      }
      const j = await res.json()
      setMessage(`Imported scan ${j?.scan?.id ?? ""}. Processed ${j?.processed ?? 0} findings.`)
      // Notify other components on the page to refresh their data
      window.dispatchEvent(new CustomEvent("scan-uploaded", { detail: { systemId } }))
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to upload"
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import CKLB (STIG JSON)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-3 items-start">
          <Input
            type="file"
            accept="application/json,.json"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            disabled={loading}
          />
          <Button onClick={onUpload} disabled={!file || loading}>
            {loading ? "Uploading..." : "Upload"}
          </Button>
        </div>
        {file && (
          <div className="mt-2 text-xs text-muted-foreground">Selected: {file.name}</div>
        )}
        {message && (
          <div className="mt-3 text-sm text-green-600">{message}</div>
        )}
        {error && (
          <div className="mt-3 text-sm text-red-600">{error}</div>
        )}
      </CardContent>
    </Card>
  )
}

