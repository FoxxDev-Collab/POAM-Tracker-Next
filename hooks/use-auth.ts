"use client"

import { useState, useEffect } from 'react'

interface User {
  id: number
  email: string
  name: string
  role: string
  isLoggedIn: boolean
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const userData = await response.json()
          setUser(userData)
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('Failed to fetch user:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  const isAdmin = user?.role === 'Admin'
  const isAuthenticated = user?.isLoggedIn === true

  return {
    user,
    loading,
    isAdmin,
    isAuthenticated,
    refreshUser: () => {
      setLoading(true)
      const fetchUser = async () => {
        try {
          const response = await fetch('/api/auth/me')
          if (response.ok) {
            const userData = await response.json()
            setUser(userData)
          } else {
            setUser(null)
          }
        } catch (error) {
          console.error('Failed to fetch user:', error)
          setUser(null)
        } finally {
          setLoading(false)
        }
      }
      fetchUser()
    }
  }
}