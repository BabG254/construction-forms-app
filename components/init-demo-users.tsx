"use client"

import { useEffect } from "react"
import { useAppStore } from "@/lib/store"

/**
 * Component that initializes demo users on first load
 * Creates 3 demo users: admin, supervisor, worker
 */
export function InitDemoUsers() {
  const authUsers = useAppStore((state) => state.authUsers)
  const addAuthUser = useAppStore((state) => state.addAuthUser)

  useEffect(() => {
    // Only initialize if no users exist
    if (authUsers.length === 0) {
      // Simple hash function for demo purposes (NOT production-grade)
      const simpleHash = (password: string) => {
        return Buffer.from(password).toString("base64")
      }

      // Create demo users
      const demoUsers = [
        {
          id: "admin-user-1",
          email: "admin@construction.local",
          name: "Admin User",
          passwordHash: simpleHash("admin123"),
          role: "admin" as const,
          createdAt: new Date(),
        },
        {
          id: "supervisor-user-1",
          email: "supervisor@construction.local",
          name: "Supervisor User",
          passwordHash: simpleHash("supervisor123"),
          role: "supervisor" as const,
          createdAt: new Date(),
        },
        {
          id: "worker-user-1",
          email: "worker@construction.local",
          name: "Worker User",
          passwordHash: simpleHash("worker123"),
          role: "worker" as const,
          createdAt: new Date(),
        },
      ]

      // Add each demo user
      demoUsers.forEach((user) => {
        addAuthUser(user)
      })
    }
  }, [authUsers.length, addAuthUser])

  return null
}
