import { NextRequest, NextResponse } from "next/server"
import { Systems } from "@/lib/db"

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: pid } = await params
    const id = Number(pid)
    const item = Systems.get(id)
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ item })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to get system"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: pid } = await params
    const id = Number(pid)
    const body = await req.json()
    const name = body?.name as string | undefined
    const description = body?.description as string | undefined
    const updated = Systems.update(id, { name, description })
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ item: updated })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to update system"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: pid } = await params
    const id = Number(pid)
    const ok = Systems.remove(id)
    if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to delete system"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
