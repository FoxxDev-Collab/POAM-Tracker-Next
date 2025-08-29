"use client"

import React, { useState } from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Check, X } from "lucide-react"

interface PasswordRequirement {
  label: string
  test: (password: string) => boolean
}

const passwordRequirements: PasswordRequirement[] = [
  { label: "At least 12 characters", test: (p) => p.length >= 12 },
  { label: "One uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { label: "One lowercase letter", test: (p) => /[a-z]/.test(p) },
  { label: "One number", test: (p) => /\d/.test(p) },
  { label: "One special character", test: (p) => /[^A-Za-z0-9]/.test(p) },
]

interface PasswordInputProps extends React.ComponentProps<"input"> {
  showValidation?: boolean
  onValidationChange?: (isValid: boolean) => void
}

export function PasswordInput({ 
  className, 
  showValidation = false, 
  onValidationChange,
  ...props 
}: PasswordInputProps) {
  const [password, setPassword] = useState(props.value?.toString() || "")
  const [showRequirements, setShowRequirements] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value
    setPassword(newPassword)
    
    if (showValidation && onValidationChange) {
      const isValid = passwordRequirements.every(req => req.test(newPassword))
      onValidationChange(isValid)
    }
    
    if (props.onChange) {
      props.onChange(e)
    }
  }

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (showValidation) {
      setShowRequirements(true)
    }
    if (props.onFocus) {
      props.onFocus(e)
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Keep requirements visible if there's content and validation is enabled
    if (!showValidation || !password) {
      setShowRequirements(false)
    }
    if (props.onBlur) {
      props.onBlur(e)
    }
  }

  return (
    <div className="space-y-2">
      <Input
        {...props}
        type="password"
        className={className}
        value={password}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
      
      {showValidation && (showRequirements || password) && (
        <div className="space-y-1 p-3 bg-muted/50 rounded-md border">
          <div className="text-sm font-medium text-muted-foreground mb-2">
            Password Requirements:
          </div>
          {passwordRequirements.map((requirement, index) => {
            const isValid = requirement.test(password)
            return (
              <div
                key={index}
                className={cn(
                  "flex items-center gap-2 text-sm transition-colors",
                  isValid ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
                )}
              >
                {isValid ? (
                  <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                ) : (
                  <X className="h-3 w-3 text-muted-foreground" />
                )}
                <span className={cn(isValid && "line-through")}>
                  {requirement.label}
                </span>
              </div>
            )
          })}
          {passwordRequirements.every(req => req.test(password)) && password && (
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 font-medium mt-2 pt-2 border-t">
              <Check className="h-3 w-3" />
              <span>Password meets all requirements!</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
