"use client"

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"

type ThemePaletteId =
  | "default"
  | "kodama"
  | "starry-night"
  | "bubblegum"
  | "doom"
  | "soft-pop"
  | "notebook"
  | "cyberpunk"

export type { ThemePaletteId }

interface ThemePaletteContextValue {
  palette: ThemePaletteId
  setPalette: (id: ThemePaletteId) => void
  dark: boolean
  setDark: (v: boolean) => void
  toggleDark: () => void
}

const ThemePaletteContext = createContext<ThemePaletteContextValue | undefined>(undefined)

const STORAGE_KEY = "app.theme.palette"
const STORAGE_DARK_KEY = "app.theme.dark"

export function ThemePaletteProvider({ children }: { children: React.ReactNode }) {
  const [palette, setPaletteState] = useState<ThemePaletteId>("default")
  const [dark, setDarkState] = useState<boolean>(false)

  // Load from localStorage on mount
  useEffect(() => {
    const stored = typeof window !== "undefined" ? (localStorage.getItem(STORAGE_KEY) as ThemePaletteId | null) : null
    if (stored) {
      setPaletteState(stored)
      applyPaletteClass(stored)
    } else {
      applyPaletteClass("default")
    }
    const storedDark = typeof window !== "undefined" ? localStorage.getItem(STORAGE_DARK_KEY) : null
    const initialDark = storedDark ? storedDark === "true" : false
    setDarkState(initialDark)
    applyDarkClass(initialDark)
  }, [])

  const setPalette = useCallback((id: ThemePaletteId) => {
    setPaletteState(id)
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, id)
    }
    applyPaletteClass(id)
  }, [])

  const setDark = useCallback((v: boolean) => {
    setDarkState(v)
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_DARK_KEY, String(v))
    }
    applyDarkClass(v)
  }, [])

  const toggleDark = useCallback(() => setDark(!dark), [dark, setDark])

  const value = useMemo(() => ({ palette, setPalette, dark, setDark, toggleDark }), [palette, dark, setPalette, setDark, toggleDark])

  return <ThemePaletteContext.Provider value={value}>{children}</ThemePaletteContext.Provider>
}

function applyPaletteClass(id: ThemePaletteId) {
  if (typeof document === "undefined") return
  const root = document.documentElement // <html>

  // Remove any previous theme-* classes
  const toRemove: string[] = []
  root.classList.forEach((c) => {
    if (c.startsWith("theme-")) toRemove.push(c)
  })
  toRemove.forEach((c) => root.classList.remove(c))

  // Add selected theme class
  root.classList.add(`theme-${id}`)
}

export function useThemePalette() {
  const ctx = useContext(ThemePaletteContext)
  if (!ctx) throw new Error("useThemePalette must be used within ThemePaletteProvider")
  return ctx
}

function applyDarkClass(enabled: boolean) {
  if (typeof document === "undefined") return
  const root = document.documentElement
  if (enabled) root.classList.add("dark")
  else root.classList.remove("dark")
}
