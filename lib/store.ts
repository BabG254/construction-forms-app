"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { 
  Observation, 
  Incident, 
  Inspection, 
  FormListItem, 
  Project, 
  User, 
  InspectionSection,
  AuthUser,
  UserGroup,
  FormAssignment
} from "./types"

// Create a custom storage that checks for window availability
const customStorage = {
  getItem: (name: string) => {
    if (typeof window === 'undefined') return null
    const value = localStorage.getItem(name)
    return value
  },
  setItem: (name: string, value: string) => {
    if (typeof window === 'undefined') return
    localStorage.setItem(name, value)
  },
  removeItem: (name: string) => {
    if (typeof window === 'undefined') return
    localStorage.removeItem(name)
  },
}

// Mock data for demonstration
const mockProjects: Project[] = [
  { id: "1", name: "Downtown Tower Construction", code: "DTC-2024", location: "123 Main St" },
  { id: "2", name: "Highway Bridge Renovation", code: "HBR-2024", location: "Highway 401" },
  { id: "3", name: "Industrial Complex Phase 2", code: "ICP2-2024", location: "500 Industrial Blvd" },
]

const mockUsers: User[] = [
  { id: "1", name: "John Smith", email: "john@example.com", role: "Site Manager" },
  { id: "2", name: "Marie Dupont", email: "marie@example.com", role: "Safety Inspector" },
  { id: "3", name: "Carlos Rodriguez", email: "carlos@example.com", role: "Foreman" },
]

// Inspection sections with items (data-driven)
export const inspectionSections: InspectionSection[] = [
  {
    id: "ast",
    key: "ast",
    titleKey: "inspection.section.ast",
    items: [
      { id: "ast-1", number: "1.1", label: "AST completed before work begins", sectionId: "ast" },
      { id: "ast-2", number: "1.2", label: "Workers briefed on hazards identified", sectionId: "ast" },
      { id: "ast-3", number: "1.3", label: "Control measures implemented", sectionId: "ast" },
      { id: "ast-4", number: "1.4", label: "AST reviewed when conditions change", sectionId: "ast" },
    ],
  },
  {
    id: "ppe",
    key: "ppe",
    titleKey: "inspection.section.ppe",
    items: [
      { id: "ppe-1", number: "2.1", label: "Hard hats worn in designated areas", sectionId: "ppe" },
      { id: "ppe-2", number: "2.2", label: "Safety glasses/goggles worn when required", sectionId: "ppe" },
      { id: "ppe-3", number: "2.3", label: "High visibility vests worn", sectionId: "ppe" },
      { id: "ppe-4", number: "2.4", label: "Safety footwear worn", sectionId: "ppe" },
      { id: "ppe-5", number: "2.5", label: "Hearing protection used when required", sectionId: "ppe" },
      { id: "ppe-6", number: "2.6", label: "Gloves appropriate for task worn", sectionId: "ppe" },
    ],
  },
  {
    id: "housekeeping",
    key: "housekeeping",
    titleKey: "inspection.section.housekeeping",
    items: [
      { id: "hk-1", number: "3.1", label: "Work areas clean and organized", sectionId: "housekeeping" },
      { id: "hk-2", number: "3.2", label: "Walkways and exits clear", sectionId: "housekeeping" },
      { id: "hk-3", number: "3.3", label: "Materials properly stored", sectionId: "housekeeping" },
      { id: "hk-4", number: "3.4", label: "Waste disposed of properly", sectionId: "housekeeping" },
      { id: "hk-5", number: "3.5", label: "Spills cleaned up immediately", sectionId: "housekeeping" },
    ],
  },
  {
    id: "fire",
    key: "fire",
    titleKey: "inspection.section.fire",
    items: [
      { id: "fire-1", number: "4.1", label: "Fire extinguishers accessible and inspected", sectionId: "fire" },
      { id: "fire-2", number: "4.2", label: "Hot work permits in place", sectionId: "fire" },
      { id: "fire-3", number: "4.3", label: "Flammable materials stored properly", sectionId: "fire" },
      { id: "fire-4", number: "4.4", label: "Fire watch posted when required", sectionId: "fire" },
    ],
  },
  {
    id: "scaffolding",
    key: "scaffolding",
    titleKey: "inspection.section.scaffolding",
    items: [
      { id: "sc-1", number: "5.1", label: "Scaffolding inspected before use", sectionId: "scaffolding" },
      { id: "sc-2", number: "5.2", label: "Guard rails in place", sectionId: "scaffolding" },
      { id: "sc-3", number: "5.3", label: "Ladders secured and in good condition", sectionId: "scaffolding" },
      { id: "sc-4", number: "5.4", label: "Proper access provided", sectionId: "scaffolding" },
      { id: "sc-5", number: "5.5", label: "Tag system in use", sectionId: "scaffolding" },
    ],
  },
  {
    id: "heights",
    key: "heights",
    titleKey: "inspection.section.heights",
    items: [
      { id: "ht-1", number: "6.1", label: "Fall protection used above 1.8m/6ft", sectionId: "heights" },
      { id: "ht-2", number: "6.2", label: "Anchor points adequate", sectionId: "heights" },
      { id: "ht-3", number: "6.3", label: "Harnesses inspected", sectionId: "heights" },
      { id: "ht-4", number: "6.4", label: "Openings protected", sectionId: "heights" },
    ],
  },
  {
    id: "water",
    key: "water",
    titleKey: "inspection.section.water",
    items: [
      { id: "wt-1", number: "7.1", label: "Life jackets available when required", sectionId: "water" },
      { id: "wt-2", number: "7.2", label: "Rescue equipment in place", sectionId: "water" },
      { id: "wt-3", number: "7.3", label: "Barriers in place near water", sectionId: "water" },
    ],
  },
  {
    id: "lifting",
    key: "lifting",
    titleKey: "inspection.section.lifting",
    items: [
      { id: "lf-1", number: "8.1", label: "Cranes inspected and certified", sectionId: "lifting" },
      { id: "lf-2", number: "8.2", label: "Rigging equipment in good condition", sectionId: "lifting" },
      { id: "lf-3", number: "8.3", label: "Load limits posted and followed", sectionId: "lifting" },
      { id: "lf-4", number: "8.4", label: "Signal person designated", sectionId: "lifting" },
      { id: "lf-5", number: "8.5", label: "Exclusion zones established", sectionId: "lifting" },
    ],
  },
  {
    id: "excavation",
    key: "excavation",
    titleKey: "inspection.section.excavation",
    items: [
      { id: "ex-1", number: "9.1", label: "Excavation permit obtained", sectionId: "excavation" },
      { id: "ex-2", number: "9.2", label: "Underground utilities located", sectionId: "excavation" },
      { id: "ex-3", number: "9.3", label: "Shoring/sloping adequate", sectionId: "excavation" },
      { id: "ex-4", number: "9.4", label: "Safe access/egress provided", sectionId: "excavation" },
      { id: "ex-5", number: "9.5", label: "Spoil piles at safe distance", sectionId: "excavation" },
    ],
  },
  {
    id: "environment",
    key: "environment",
    titleKey: "inspection.section.environment",
    items: [
      { id: "env-1", number: "10.1", label: "Spill kits available", sectionId: "environment" },
      { id: "env-2", number: "10.2", label: "Hazardous waste properly contained", sectionId: "environment" },
      { id: "env-3", number: "10.3", label: "Erosion controls in place", sectionId: "environment" },
      { id: "env-4", number: "10.4", label: "Dust control measures implemented", sectionId: "environment" },
    ],
  },
  {
    id: "misc",
    key: "misc",
    titleKey: "inspection.section.misc",
    items: [
      { id: "misc-1", number: "11.1", label: "First aid kit stocked and accessible", sectionId: "misc" },
      { id: "misc-2", number: "11.2", label: "Emergency contact info posted", sectionId: "misc" },
      { id: "misc-3", number: "11.3", label: "MSDS/SDS sheets available", sectionId: "misc" },
      { id: "misc-4", number: "11.4", label: "Toolbox talks conducted", sectionId: "misc" },
    ],
  },
]

interface AppState {
  // Auth data
  authUsers: AuthUser[]
  currentAuthUserId: string | null
  userGroups: UserGroup[]
  formAssignments: FormAssignment[]

  // Legacy form data
  observations: Observation[]
  incidents: Incident[]
  inspections: Inspection[]
  projects: Project[]
  users: User[]
  currentUser: User | null

  // UI state
  isOnline: boolean
  isSyncing: boolean

  // Auth actions
  addAuthUser: (user: AuthUser) => void
  updateAuthUser: (id: string, updates: Partial<AuthUser>) => void
  deleteAuthUser: (id: string) => void
  setCurrentAuthUserId: (id: string | null) => void
  getCurrentAuthUser: () => AuthUser | null

  // Group actions
  addUserGroup: (group: UserGroup) => void
  updateUserGroup: (id: string, updates: Partial<UserGroup>) => void
  deleteUserGroup: (id: string) => void
  addUserToGroup: (groupId: string, userId: string) => void
  removeUserFromGroup: (groupId: string, userId: string) => void

  // Assignment actions
  assignForm: (assignment: FormAssignment) => void
  updateAssignment: (formId: string, updates: Partial<FormAssignment>) => void
  deleteAssignment: (formId: string) => void
  getFormAssignment: (formId: string) => FormAssignment | null
  getMyAssignments: () => FormAssignment[]

  // Actions
  setOnlineStatus: (status: boolean) => void
  setSyncing: (syncing: boolean) => void

  // CRUD operations
  addObservation: (observation: Observation) => void
  updateObservation: (id: string, updates: Partial<Observation>) => void
  deleteObservation: (id: string) => void

  addIncident: (incident: Incident) => void
  updateIncident: (id: string, updates: Partial<Incident>) => void
  deleteIncident: (id: string) => void

  addInspection: (inspection: Inspection) => void
  updateInspection: (id: string, updates: Partial<Inspection>) => void
  deleteInspection: (id: string) => void

  // Computed
  getRecentDrafts: () => FormListItem[]
  getRecentSubmissions: () => FormListItem[]
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Auth data
      authUsers: [],
      currentAuthUserId: null,
      userGroups: [],
      formAssignments: [],

      // Legacy form data
      observations: [],
      incidents: [],
      inspections: [],
      projects: mockProjects,
      users: mockUsers,
      currentUser: mockUsers[0],

      // UI state
      isOnline: typeof window !== 'undefined',
      isSyncing: false,

      // Auth actions
      addAuthUser: (user) => set((state) => {
        // Prevent duplicate emails
        const emailExists = state.authUsers.some((u) => u.email.toLowerCase() === user.email.toLowerCase())
        if (emailExists) {
          console.warn(`User with email ${user.email} already exists`)
          return state
        }
        return { authUsers: [...state.authUsers, user] }
      }),
      updateAuthUser: (id, updates) =>
        set((state) => ({
          authUsers: state.authUsers.map((u) => (u.id === id ? { ...u, ...updates } : u)),
        })),
      deleteAuthUser: (id) => set((state) => ({ authUsers: state.authUsers.filter((u) => u.id !== id) })),
      setCurrentAuthUserId: (id) => set({ currentAuthUserId: id }),
      getCurrentAuthUser: () => {
        const state = get()
        return state.authUsers.find((u) => u.id === state.currentAuthUserId) || null
      },

      // Group actions
      addUserGroup: (group) => set((state) => ({ userGroups: [...state.userGroups, group] })),
      updateUserGroup: (id, updates) =>
        set((state) => ({
          userGroups: state.userGroups.map((g) => (g.id === id ? { ...g, ...updates } : g)),
        })),
      deleteUserGroup: (id) => set((state) => ({ userGroups: state.userGroups.filter((g) => g.id !== id) })),
      addUserToGroup: (groupId, userId) =>
        set((state) => ({
          userGroups: state.userGroups.map((g) =>
            g.id === groupId && !g.memberIds.includes(userId)
              ? { ...g, memberIds: [...g.memberIds, userId] }
              : g,
          ),
        })),
      removeUserFromGroup: (groupId, userId) =>
        set((state) => ({
          userGroups: state.userGroups.map((g) =>
            g.id === groupId ? { ...g, memberIds: g.memberIds.filter((id) => id !== userId) } : g,
          ),
        })),

      // Assignment actions
      assignForm: (assignment) =>
        set((state) => {
          const existing = state.formAssignments.findIndex((a) => a.formId === assignment.formId)
          if (existing >= 0) {
            const updated = [...state.formAssignments]
            updated[existing] = assignment
            return { formAssignments: updated }
          }
          return { formAssignments: [...state.formAssignments, assignment] }
        }),
      updateAssignment: (formId, updates) =>
        set((state) => ({
          formAssignments: state.formAssignments.map((a) =>
            a.formId === formId ? { ...a, ...updates } : a,
          ),
        })),
      deleteAssignment: (formId) =>
        set((state) => ({
          formAssignments: state.formAssignments.filter((a) => a.formId !== formId),
        })),
      getFormAssignment: (formId) => {
        const state = get()
        return state.formAssignments.find((a) => a.formId === formId) || null
      },
      getMyAssignments: () => {
        const state = get()
        const userId = state.currentAuthUserId
        if (!userId) return []
        return state.formAssignments.filter(
          (a) => a.assignedToUserIds.includes(userId) || a.assignedToGroupIds.some((gid) =>
            state.userGroups.find((g) => g.id === gid && g.memberIds.includes(userId))
          ),
        )
      },

      // Actions
      setOnlineStatus: (status) => set({ isOnline: status }),
      setSyncing: (syncing) => set({ isSyncing: syncing }),

      // Observations
      addObservation: (observation) => set((state) => ({ observations: [...state.observations, observation] })),
      updateObservation: (id, updates) =>
        set((state) => ({
          observations: state.observations.map((o) => (o.id === id ? { ...o, ...updates, updatedAt: new Date() } : o)),
        })),
      deleteObservation: (id) => set((state) => ({ observations: state.observations.filter((o) => o.id !== id) })),

      // Incidents
      addIncident: (incident) => set((state) => ({ incidents: [...state.incidents, incident] })),
      updateIncident: (id, updates) =>
        set((state) => ({
          incidents: state.incidents.map((i) => (i.id === id ? { ...i, ...updates, updatedAt: new Date() } : i)),
        })),
      deleteIncident: (id) => set((state) => ({ incidents: state.incidents.filter((i) => i.id !== id) })),

      // Inspections
      addInspection: (inspection) => set((state) => ({ inspections: [...state.inspections, inspection] })),
      updateInspection: (id, updates) =>
        set((state) => ({
          inspections: state.inspections.map((i) => (i.id === id ? { ...i, ...updates, updatedAt: new Date() } : i)),
        })),
      deleteInspection: (id) => set((state) => ({ inspections: state.inspections.filter((i) => i.id !== id) })),

      // Computed
      getRecentDrafts: () => {
        const state = get()
        const drafts: FormListItem[] = [
          ...state.observations
            .filter((o) => o.status === "draft" || o.status === "in-progress")
            .map((o) => ({
              id: o.id,
              type: "observation" as const,
              number: o.number,
              title: o.title,
              projectName: state.projects.find((p) => p.id === o.projectId)?.name || "",
              status: o.status,
              updatedAt: new Date(o.updatedAt),
              syncStatus: o.syncStatus,
            })),
          ...state.incidents
            .filter((i) => i.status === "draft" || i.status === "in-progress")
            .map((i) => ({
              id: i.id,
              type: "incident" as const,
              number: i.number,
              title: i.title,
              projectName: state.projects.find((p) => p.id === i.projectId)?.name || "",
              status: i.status,
              updatedAt: new Date(i.updatedAt),
              syncStatus: i.syncStatus,
            })),
          ...state.inspections
            .filter((i) => i.status === "draft" || i.status === "in-progress")
            .map((i) => ({
              id: i.id,
              type: "inspection" as const,
              number: i.id.slice(-6).toUpperCase(),
              title: i.documentTitle,
              projectName: state.projects.find((p) => p.id === i.projectId)?.name || "",
              status: i.status,
              updatedAt: new Date(i.updatedAt),
              syncStatus: i.syncStatus,
            })),
        ]
        return drafts.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()).slice(0, 5)
      },
      getRecentSubmissions: () => {
        const state = get()
        const submissions: FormListItem[] = [
          ...state.observations
            .filter((o) => o.status === "submitted")
            .map((o) => ({
              id: o.id,
              type: "observation" as const,
              number: o.number,
              title: o.title,
              projectName: state.projects.find((p) => p.id === o.projectId)?.name || "",
              status: o.status,
              updatedAt: new Date(o.updatedAt),
              syncStatus: o.syncStatus,
            })),
          ...state.incidents
            .filter((i) => i.status === "submitted")
            .map((i) => ({
              id: i.id,
              type: "incident" as const,
              number: i.number,
              title: i.title,
              projectName: state.projects.find((p) => p.id === i.projectId)?.name || "",
              status: i.status,
              updatedAt: new Date(i.updatedAt),
              syncStatus: i.syncStatus,
            })),
          ...state.inspections
            .filter((i) => i.status === "submitted")
            .map((i) => ({
              id: i.id,
              type: "inspection" as const,
              number: i.id.slice(-6).toUpperCase(),
              title: i.documentTitle,
              projectName: state.projects.find((p) => p.id === i.projectId)?.name || "",
              status: i.status,
              updatedAt: new Date(i.updatedAt),
              syncStatus: i.syncStatus,
            })),
        ]
        return submissions.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()).slice(0, 5)
      },
    }),
    {
      name: "construction-forms-storage",
      storage: createJSONStorage(() => customStorage),
      skipHydration: true,
      partialize: (state) => ({
        // Form data
        observations: state.observations,
        incidents: state.incidents,
        inspections: state.inspections,
        // Auth data - persist for offline use
        authUsers: state.authUsers,
        userGroups: state.userGroups,
        currentAuthUserId: state.currentAuthUserId,
        formAssignments: state.formAssignments,
      }),
    },
  ),
)
