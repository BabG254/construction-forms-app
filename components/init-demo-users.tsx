"use client"

import { useEffect, useRef } from "react"
import { useAppStore } from "@/lib/store"

/**
 * Component that initializes demo users on first load
 * Creates 3 demo users: admin, supervisor, worker
 */
export function InitDemoUsers() {
  const authUsers = useAppStore((state) => state.authUsers)
  const addAuthUser = useAppStore((state) => state.addAuthUser)
  const initialized = useRef(false)

  useEffect(() => {
    // Prevent double initialization in development (React StrictMode)
    if (initialized.current) return
    
    // Only initialize if no users exist
    if (authUsers.length === 0) {
      initialized.current = true
      
      // Simple hash function for demo purposes (NOT production-grade)
      const simpleHash = (password: string) => {
        return Buffer.from(password).toString("base64")
      }

      // Create demo users with .app email domain
      const demoUsers = [
        {
          id: "admin-user-1",
          email: "admin@construction.app",
          name: "Admin",
          passwordHash: simpleHash("Admin2026!"),
          role: "admin" as const,
          createdAt: new Date(),
        },
        {
          id: "supervisor-user-1",
          email: "supervisor@construction.app",
          name: "Supervisor",
          passwordHash: simpleHash("Super2026!"),
          role: "supervisor" as const,
          createdAt: new Date(),
        },
        {
          id: "worker-user-1",
          email: "worker@construction.app",
          name: "Worker",
          passwordHash: simpleHash("Work2026!"),
          role: "worker" as const,
          createdAt: new Date(),
        },
      ]

      // Add each demo user
      demoUsers.forEach((user) => {
        addAuthUser(user)
      })
    }
  }, []) // Remove dependencies to only run once

  return null
}
