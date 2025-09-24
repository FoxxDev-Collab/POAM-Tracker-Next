"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"

interface DialogContextValue {
  open: boolean
  setOpen: (v: boolean) => void
}
const DialogContext = React.createContext<DialogContextValue | null>(null)

export interface DialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

export function Dialog({ open: openProp, onOpenChange, children }: DialogProps) {
  const [open, setOpen] = React.useState<boolean>(!!openProp)

  // Sync controlled state
  React.useEffect(() => {
    if (typeof openProp === "boolean") setOpen(openProp)
  }, [openProp])

  const setOpenWrapper = React.useCallback((v: boolean) => {
    if (onOpenChange) onOpenChange(v)
    if (openProp === undefined) setOpen(v)
  }, [onOpenChange, openProp])

  const value = React.useMemo(() => ({ open: !!open, setOpen: setOpenWrapper }), [open, setOpenWrapper])
  return <DialogContext.Provider value={value}>{children}</DialogContext.Provider>
}

export interface DialogTriggerProps extends React.HTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  children: React.ReactElement
}
export function DialogTrigger({ asChild, children, ...props }: DialogTriggerProps) {
  const ctx = React.useContext(DialogContext)
  if (!ctx) return children
  const handleClick = (e: React.MouseEvent) => {
    const maybeHandler = (children.props as { onClick?: (e: React.MouseEvent) => void } | undefined)?.onClick
    if (typeof maybeHandler === "function") maybeHandler(e)
    ctx.setOpen(true)
  }
  if (asChild) {
    type ChildWithOnClick = React.ReactElement<{ onClick?: (e: React.MouseEvent) => void }>
    return React.cloneElement(children as ChildWithOnClick, { onClick: handleClick })
  }
  return (
    <button {...props} onClick={handleClick}>
      {children}
    </button>
  )
}

export interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}
export function DialogContent({ className, children, ...props }: DialogContentProps) {
  const ctx = React.useContext(DialogContext)
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])
  if (!ctx || !ctx.open) return null
  const body = (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={() => ctx.setOpen(false)} />
      <div
        className={cn(
          "relative z-10 w-full max-w-lg rounded-lg border bg-background p-6 shadow-lg",
          className
        )}
        role="dialog"
        {...props}
      >
        {children}
      </div>
    </div>
  )
  return mounted ? createPortal(body, document.body) : null
}

export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mb-4", className)} {...props} />
}
export function DialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-lg font-semibold", className)} {...props} />
}
export function DialogDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-muted-foreground", className)} {...props} />
}
export function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mt-6 flex items-center justify-end gap-2", className)} {...props} />
}
