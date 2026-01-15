# Phase 2: Enhanced Offline-First Implementation

## Overview

Phase 2 focuses on enhancing the offline-first architecture using IndexedDB for persistent, local-only data storage. All forms operate completely offline with optional cloud sync capabilities in Phase 3.

## Architecture

```
┌─ Offline-First ──────────────────┐
│ Frontend (React)                 │
│  ├─ State: Zustand               │
│  ├─ Storage: IndexedDB (Local)   │
│  ├─ Forms: Incident, Inspection, │
│  │         Observation           │
│  └─ Sync: Local persistence only │
└──────────────────────────────────┘
         ↓ (Optional Phase 3)
┌─ Cloud Sync (Future)             ┐
│ - Multi-device sync              │
│ - Cloud backup                   │
│ - Team collaboration             │
└──────────────────────────────────┘
```

## Why IndexedDB Only for Phase 2?

- **Zero Backend Complexity**: All data stays on device
- **Complete Offline Operation**: Works without internet
- **Full Privacy**: No data sent to servers
- **Fast Performance**: Local read/write operations
- **Easy Deployment**: Just frontend on Vercel
- **User Control**: Users own their data completely

## Implementation Plan

### Step 1: Enhanced IndexedDB Schema (Week 1)
Upgrade the IndexedDB structure for better data management:

```typescript
// Database Schema
construction-forms/
├── incidents (object store)
│   ├── key: id
│   ├── index: projectId
│   ├── index: createdAt
│   └── index: status
│
├── observations (object store)
│   ├── key: id
│   ├── index: projectId
│   └── index: createdAt
│
├── inspections (object store)
│   ├── key: id
│   ├── index: projectId
│   └── index: status
│
├── projects (object store)
│   ├── key: id
│   └── index: name
│
├── attachments (object store)
│   ├── key: id
│   ├── index: incidentId
│   └── blob storage for images/files
│
└── metadata (object store)
    ├── lastSync
    ├── databaseVersion
    └── exportDate
```

### Step 2: Advanced Persistence Layer (Week 1)
Build robust data persistence utilities:

```typescript
// lib/db/db.ts - Main IndexedDB wrapper
export class FormDatabase {
  private db: IDBDatabase
  
  async init() {
    this.db = await openDB('construction-forms', 1, {
      upgrade(db) {
        // Create object stores
        db.createObjectStore('incidents', { keyPath: 'id' })
        db.createObjectStore('observations', { keyPath: 'id' })
        db.createObjectStore('inspections', { keyPath: 'id' })
        db.createObjectStore('projects', { keyPath: 'id' })
        db.createObjectStore('attachments', { keyPath: 'id' })
        
        // Create indexes for faster queries
        db.objectStore('incidents').createIndex('projectId', 'projectId')
        db.objectStore('incidents').createIndex('createdAt', 'createdAt')
        db.objectStore('incidents').createIndex('status', 'status')
      }
    })
  }
  
  async saveIncident(incident: Incident): Promise<string> {
    return this.db.add('incidents', incident)
  }
  
  async getIncidents(projectId?: string): Promise<Incident[]> {
    if (projectId) {
      return this.db.getAllFromIndex('incidents', 'projectId', projectId)
    }
    return this.db.getAll('incidents')
  }
  
  async deleteIncident(id: string): Promise<void> {
    return this.db.delete('incidents', id)
  }
  
  async saveAttachment(file: File, incidentId: string): Promise<string> {
    const blob = new Blob([await file.arrayBuffer()], { type: file.type })
    return this.db.add('attachments', {
      id: crypto.randomUUID(),
      incidentId,
      fileName: file.name,
      mimeType: file.type,
      size: file.size,
      blob,
      createdAt: new Date()
    })
  }
  
  async getAttachments(incidentId: string): Promise<Attachment[]> {
    return this.db.getAllFromIndex('attachments', 'incidentId', incidentId)
  }
  
  async exportDatabase(): Promise<Blob> {
    const data = {
      incidents: await this.getIncidents(),
      observations: await this.db.getAll('observations'),
      inspections: await this.db.getAll('inspections'),
      projects: await this.db.getAll('projects'),
      exportDate: new Date().toISOString(),
      version: '1.0'
    }
    return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  }
  
  async importDatabase(file: File): Promise<boolean> {
    const text = await file.text()
    const data = JSON.parse(text)
    
    // Validate structure
    if (!data.incidents || !data.observations) return false
    
    // Import with duplicate handling
    for (const incident of data.incidents) {
      try {
        await this.db.put('incidents', incident)
      } catch (e) {
        console.warn('Duplicate incident, skipping:', incident.id)
      }
    }
    
    return true
  }
}
```

### Step 3: Observation Form Implementation (Week 1-2)
Create Observation form using same pattern as Incident:

```typescript
// app/observations/new/page.tsx
'use client'

import { useState, useCallback } from 'react'
import { FormHeader, FormSection, FormField, AttachmentUpload } from '@/components/forms'
import { useAppStore } from '@/lib/store'
import { getObservationTypes } from '@/lib/reference-data-loader'

export default function NewObservation() {
  const addObservation = useAppStore(state => state.addObservation)
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    location: '',
    description: '',
    severity: 'low',
    attachments: [] as File[]
  })

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    const observation: Observation = {
      id: crypto.randomUUID(),
      ...formData,
      projectId: 'default', // Get from context
      createdAt: new Date(),
      syncStatus: 'pending'
    }
    
    await addObservation(observation)
    // Redirect to observations list
  }, [formData, addObservation])

  return (
    <div className="max-w-4xl mx-auto">
      <FormHeader 
        title="New Observation" 
        description="Record a site observation"
      />
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormSection title="Observation Details">
          <FormField
            label="Title"
            name="title"
            placeholder="Brief observation title"
            required
          />
          
          <FormField
            label="Type"
            name="type"
            as="select"
            options={getObservationTypes().map(t => ({ value: t.id, label: t.label }))}
            required
          />
          
          <FormField
            label="Severity"
            name="severity"
            as="select"
            options={[
              { value: 'low', label: 'Low' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High' }
            ]}
          />
          
          <FormField
            label="Location"
            name="location"
            placeholder="Area on site"
          />
          
          <FormField
            label="Description"
            name="description"
            as="textarea"
            placeholder="Detailed observation notes"
            rows={4}
          />
        </FormSection>
        
        <FormSection title="Attachments">
          <AttachmentUpload 
            onFilesSelected={(files) => 
              setFormData(prev => ({ ...prev, attachments: files }))
            }
          />
        </FormSection>
        
        <button type="submit" className="btn btn-primary">
          Save Observation
        </button>
      </form>
    </div>
  )
}
```

### Step 4: Inspection Form Implementation (Week 2)
Create complex checklist-based Inspection form:

```typescript
// app/inspections/new/page.tsx
'use client'

import { useState, useCallback } from 'react'
import { FormHeader, FormSection, FormField } from '@/components/forms'
import { useAppStore } from '@/lib/store'
import { getInspectionSections } from '@/lib/reference-data-loader'
import { Checkbox } from '@/components/ui/checkbox'

export default function NewInspection() {
  const addInspection = useAppStore(state => state.addInspection)
  const [formData, setFormData] = useState({
    type: '',
    location: '',
    inspector: '',
    date: new Date().toISOString().split('T')[0],
    items: {} as Record<string, 'conforming' | 'non-conforming' | 'not-applicable'>
  })

  const sections = getInspectionSections()
  
  const completionPercentage = useCallback(() => {
    const items = Object.values(formData.items).filter(v => v !== '')
    return Math.round((items.length / sections.flatMap(s => s.items).length) * 100)
  }, [formData.items, sections])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    const inspection: Inspection = {
      id: crypto.randomUUID(),
      ...formData,
      projectId: 'default',
      completionPercentage: completionPercentage(),
      createdAt: new Date(),
      syncStatus: 'pending'
    }
    
    await addInspection(inspection)
  }, [formData, addInspection, completionPercentage])

  return (
    <div className="max-w-4xl mx-auto">
      <FormHeader 
        title="New Inspection" 
        description="Safety and compliance inspection checklist"
      />
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="sticky top-0 bg-white dark:bg-slate-950 p-4 rounded-lg border">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Completion Progress</h3>
            <div className="text-sm font-bold text-blue-600">{completionPercentage()}%</div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all" 
              style={{ width: `${completionPercentage()}%` }}
            />
          </div>
        </div>
        
        <FormSection title="Inspection Info">
          <FormField label="Inspector Name" name="inspector" required />
          <FormField label="Inspection Date" name="date" type="date" required />
          <FormField label="Location" name="location" placeholder="Area being inspected" />
        </FormSection>
        
        {sections.map((section) => (
          <FormSection key={section.id} title={section.title}>
            <p className="text-sm text-muted-foreground mb-4">{section.instruction}</p>
            <div className="space-y-3">
              {section.items.map((item) => (
                <div key={item.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="flex gap-2 flex-1">
                    <label className="flex items-center gap-2 flex-1 cursor-pointer">
                      <Checkbox
                        checked={formData.items[item.id] === 'conforming'}
                        onChange={(checked) => {
                          setFormData(prev => ({
                            ...prev,
                            items: {
                              ...prev.items,
                              [item.id]: checked ? 'conforming' : ''
                            }
                          }))
                        }}
                      />
                      <span className="text-sm">{item.label} ✓</span>
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          items: {
                            ...prev.items,
                            [item.id]: formData.items[item.id] === 'non-conforming' ? '' : 'non-conforming'
                          }
                        }))
                      }}
                      className={`px-2 py-1 text-xs rounded ${
                        formData.items[item.id] === 'non-conforming' 
                          ? 'bg-red-500 text-white' 
                          : 'bg-gray-200'
                      }`}
                    >
                      ✗
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          items: {
                            ...prev.items,
                            [item.id]: formData.items[item.id] === 'not-applicable' ? '' : 'not-applicable'
                          }
                        }))
                      }}
                      className={`px-2 py-1 text-xs rounded ${
                        formData.items[item.id] === 'not-applicable' 
                          ? 'bg-gray-500 text-white' 
                          : 'bg-gray-200'
                      }`}
                    >
                      N/A
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </FormSection>
        ))}
        
        <button type="submit" className="btn btn-primary w-full">
          Save Inspection ({completionPercentage()}% Complete)
        </button>
      </form>
    </div>
  )
}
```

### Step 5: Data Management UI (Week 2)
Create UI for data export/import and management:

```typescript
// components/data-management.tsx
'use client'

import { useState } from 'react'
import { Download, Upload, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'

export function DataManagement() {
  const [isExporting, setIsExporting] = useState(false)
  const clearAllData = useAppStore(state => state.clearAllData)

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const data = {
        incidents: useAppStore.getState().incidents,
        observations: useAppStore.getState().observations,
        inspections: useAppStore.getState().inspections,
        exportDate: new Date().toISOString(),
        version: '1.0'
      }
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `construction-forms-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setIsExporting(false)
    }
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      
      // Import data into store
      if (data.incidents) {
        data.incidents.forEach((i: Incident) => useAppStore.getState().addIncident(i))
      }
      if (data.observations) {
        data.observations.forEach((o: Observation) => useAppStore.getState().addObservation(o))
      }
      if (data.inspections) {
        data.inspections.forEach((insp: Inspection) => useAppStore.getState().addInspection(insp))
      }
      
      alert('Data imported successfully!')
    } catch (error) {
      alert('Error importing data: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="font-semibold">Data Management</h3>
      
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          disabled={isExporting}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          {isExporting ? 'Exporting...' : 'Export Data'}
        </Button>
        
        <label>
          <Button variant="outline" size="sm" asChild className="gap-2">
            <span>
              <Upload className="h-4 w-4" />
              Import Data
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </span>
          </Button>
        </label>
        
        <Button
          variant="destructive"
          size="sm"
          onClick={() => {
            if (window.confirm('Are you sure? This will delete all local data.')) {
              clearAllData()
            }
          }}
          className="gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Clear All Data
        </Button>
      </div>
      
      <p className="text-xs text-muted-foreground">
        All data is stored locally in your browser. Export regularly to backup your data.
      </p>
    </div>
  )
}
```

### Step 6: Enhanced Store with Persistence (Week 2-3)
Update Zustand store with better persistence:

```typescript
// lib/store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AppState {
  incidents: Incident[]
  observations: Observation[]
  inspections: Inspection[]
  
  addIncident: (incident: Incident) => Promise<void>
  updateIncident: (id: string, incident: Partial<Incident>) => Promise<void>
  deleteIncident: (id: string) => Promise<void>
  getIncidents: (projectId?: string) => Incident[]
  
  addObservation: (observation: Observation) => Promise<void>
  updateObservation: (id: string, observation: Partial<Observation>) => Promise<void>
  deleteObservation: (id: string) => Promise<void>
  getObservations: (projectId?: string) => Observation[]
  
  addInspection: (inspection: Inspection) => Promise<void>
  updateInspection: (id: string, inspection: Partial<Inspection>) => Promise<void>
  deleteInspection: (id: string) => Promise<void>
  getInspections: (projectId?: string) => Inspection[]
  
  clearAllData: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      incidents: [],
      observations: [],
      inspections: [],
      
      addIncident: async (incident) => {
        set(state => ({
          incidents: [...state.incidents, incident]
        }))
      },
      
      updateIncident: async (id, updates) => {
        set(state => ({
          incidents: state.incidents.map(i => 
            i.id === id ? { ...i, ...updates } : i
          )
        }))
      },
      
      deleteIncident: async (id) => {
        set(state => ({
          incidents: state.incidents.filter(i => i.id !== id)
        }))
      },
      
      getIncidents: (projectId) => {
        const all = get().incidents
        return projectId ? all.filter(i => i.projectId === projectId) : all
      },
      
      // Similar methods for observations and inspections...
      
      addObservation: async (observation) => {
        set(state => ({
          observations: [...state.observations, observation]
        }))
      },
      
      updateObservation: async (id, updates) => {
        set(state => ({
          observations: state.observations.map(o =>
            o.id === id ? { ...o, ...updates } : o
          )
        }))
      },
      
      deleteObservation: async (id) => {
        set(state => ({
          observations: state.observations.filter(o => o.id !== id)
        }))
      },
      
      getObservations: (projectId) => {
        const all = get().observations
        return projectId ? all.filter(o => o.projectId === projectId) : all
      },
      
      addInspection: async (inspection) => {
        set(state => ({
          inspections: [...state.inspections, inspection]
        }))
      },
      
      updateInspection: async (id, updates) => {
        set(state => ({
          inspections: state.inspections.map(i =>
            i.id === id ? { ...i, ...updates } : i
          )
        }))
      },
      
      deleteInspection: async (id) => {
        set(state => ({
          inspections: state.inspections.filter(i => i.id !== id)
        }))
      },
      
      getInspections: (projectId) => {
        const all = get().inspections
        return projectId ? all.filter(i => i.projectId === projectId) : all
      },
      
      clearAllData: () => {
        set({
          incidents: [],
          observations: [],
          inspections: []
        })
      }
    }),
    {
      name: 'construction-forms-storage',
      storage: createJSONStorage(() => localStorage)
    }
  )
)
```

### Step 7: List Views & Data Display (Week 3)
Create list pages showing saved forms:

```typescript
// app/incidents/page.tsx
'use client'

import { useAppStore } from '@/lib/store'
import { AlertTriangle, Plus, Edit2, Trash2 } from 'lucide-react'
import Link from 'next/link'

export default function IncidentsPage() {
  const incidents = useAppStore(state => state.getIncidents())
  const deleteIncident = useAppStore(state => state.deleteIncident)

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Incidents</h1>
        <Link href="/incidents/new" className="btn btn-primary gap-2">
          <Plus className="h-4 w-4" />
          New Incident
        </Link>
      </div>
      
      {incidents.length === 0 ? (
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No incidents recorded yet</p>
          <Link href="/incidents/new" className="btn btn-primary mt-4">
            Create First Incident
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {incidents.map((incident) => (
            <div key={incident.id} className="p-4 border rounded-lg hover:bg-muted/50">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold">{incident.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(incident.createdAt).toLocaleDateString()}
                  </p>
                  <div className="mt-2 space-y-1">
                    <p><span className="text-sm font-medium">Location:</span> {incident.location}</p>
                    <p><span className="text-sm font-medium">Type:</span> {incident.accidentType}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/incidents/${incident.id}`}>
                    <button className="p-2 hover:bg-muted rounded">
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </Link>
                  <button
                    onClick={() => {
                      if (confirm('Delete this incident?')) {
                        deleteIncident(incident.id)
                      }
                    }}
                    className="p-2 hover:bg-red-100 text-red-600 rounded"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

## Features Completed by End of Phase 2

✅ **Incident Form** - Full form with validation, medical treatment, attachments
✅ **Observation Form** - Simplified form for quick observations
✅ **Inspection Form** - Complex checklist with progress tracking
✅ **Data Persistence** - IndexedDB + Zustand store with auto-save
✅ **Data Management** - Export/import JSON backup functionality
✅ **List Views** - View all incidents, observations, inspections
✅ **Edit/Delete** - Modify and delete saved forms
✅ **Offline Indicator** - Shows sync status and offline badge
✅ **Responsive Design** - Mobile, tablet, and desktop support
✅ **Attachment Support** - Upload and store files locally
✅ **Progress Tracking** - Inspection completion percentage

## Timeline

```
Week 1:
  Day 1-2: Enhanced IndexedDB schema & persistence layer
  Day 3-4: Observation form implementation
  Day 5: Testing & refinement

Week 2:
  Day 1-2: Inspection form with progress tracking
  Day 3-4: Data management UI (export/import)
  Day 5: Enhanced store with better persistence

Week 3:
  Day 1-2: List views for all forms
  Day 3-4: Edit/delete functionality
  Day 5: Testing, polish, documentation
```

## Success Criteria

- ✅ All forms (Incident, Observation, Inspection) working offline
- ✅ Data persists across browser sessions
- ✅ Users can export data as JSON backup
- ✅ Users can import previously exported data
- ✅ List views show all saved forms
- ✅ Edit and delete functionality working
- ✅ Responsive design on all devices
- ✅ Full offline operation without API calls
- ✅ Zero backend infrastructure needed
- ✅ Complete data ownership by user

## Future Phase 3: Optional Cloud Sync

When ready, Phase 3 could add optional cloud features without breaking offline functionality:

- **Firebase Sync** - Optional cloud backup to Firebase Realtime Database
- **Multi-Device Sync** - Sync across devices when online
- **Collaborative Forms** - Multiple users on same project
- **Cloud Backup** - Automated daily backups
- **Real-time Updates** - See team updates when online

All Phase 3 features would be **optional** - app remains 100% functional offline.

## Why This Approach?

1. **Simplicity** - No backend complexity, no API management
2. **Privacy** - All data stays on user's device
3. **Speed** - Instant local read/write operations
4. **Reliability** - Works perfectly offline
5. **Control** - Users own their data completely
6. **Cost** - Free to operate (just frontend on Vercel)
7. **Flexibility** - Easy to add cloud features later if needed

## Next Steps

Ready to start Phase 2? Let's begin with:

1. ✅ Logo & favicon implemented
2. Start with IndexedDB persistence layer
3. Build Observation form
4. Build Inspection form
5. Add data export/import UI

All completely offline, zero backend needed! 🚀


## Implementation Plan

### Step 1: API Endpoints (Week 1)
Create serverless functions in `app/api/`:

```
app/api/
├── incidents/
│   ├── route.ts           (POST - create, GET - list)
│   └── [id]/
│       ├── route.ts       (GET, PUT, DELETE)
│       └── sync/route.ts  (POST - sync multiple)
│
├── observations/
│   ├── route.ts
│   └── [id]/route.ts
│
├── inspections/
│   ├── route.ts
│   └── [id]/route.ts
│
└── sync/
    └── route.ts           (Batch sync endpoint)
```

### Step 2: Database Setup (Week 1)
Choose and configure database:

**Option A: PostgreSQL** (Recommended)
- Better for relational data
- Free tier: Railway, Render, Supabase
- TypeScript ORM: Prisma

**Option B: MongoDB**
- More flexible schema
- Free tier: MongoDB Atlas
- TypeScript ORM: Mongoose, Prisma

### Step 3: Authentication (Week 2)
Implement user authentication:

```typescript
// NextAuth.js integration
- Google OAuth
- GitHub OAuth
- Email/password (optional)

// Middleware for protected routes
middleware.ts → Check JWT token
```

### Step 4: Sync Logic (Week 2)
Implement data synchronization:

```typescript
// Sync Flow:
1. Client sends: pending forms + last sync time
2. Backend validates & stores
3. Backend returns: conflicts (if any)
4. Client resolves conflicts
5. Client updates syncStatus → "synced"
```

### Step 5: Testing & Deployment (Week 3)
- Unit tests for API endpoints
- Integration tests with database
- Deploy to Vercel
- Monitor with Vercel Analytics

## Key Files to Create

### Database Schema (Prisma)
```prisma
model Incident {
  id                String    @id @default(cuid())
  number            String    @unique
  title             String
  projectId         String
  creatorId         String
  location          String
  eventDate         DateTime
  eventTime         String
  accidentType      String
  status            String
  description       String
  investigation     Json      // danger, conditions, behaviors
  medicalTreatment  Json?
  attachments       Json[]
  syncStatus        String    @default("synced")
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  creator           User      @relation(fields: [creatorId], references: [id])
  project           Project   @relation(fields: [projectId], references: [id])
}

model User {
  id        String    @id @default(cuid())
  email     String    @unique
  name      String
  role      String
  incidents Incident[]
  createdAt DateTime  @default(now())
}

model Project {
  id        String    @id @default(cuid())
  name      String
  code      String
  location  String
  incidents Incident[]
  createdAt DateTime  @default(now())
}
```

### API Endpoint Example
```typescript
// app/api/incidents/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const data = await request.json()
  
  const incident = await prisma.incident.create({
    data: {
      ...data,
      creatorId: session.user.id,
      syncStatus: 'synced'
    }
  })

  return NextResponse.json(incident, { status: 201 })
}

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const incidents = await prisma.incident.findMany({
    where: { creatorId: session.user.id },
    include: { creator: true, project: true }
  })

  return NextResponse.json(incidents)
}
```

### Sync Endpoint
```typescript
// app/api/sync/route.ts
export async function POST(request: NextRequest) {
  const { incidents, observations, inspections, lastSyncTime } = await request.json()
  
  // Store all pending forms
  await Promise.all([
    ...incidents.map(i => saveIncident(i)),
    ...observations.map(o => saveObservation(o)),
    ...inspections.map(insp => saveInspection(insp))
  ])

  // Return server state for client to reconcile
  const serverState = {
    incidents: await getIncidentsSince(lastSyncTime),
    observations: await getObservationsSince(lastSyncTime),
    inspections: await getInspectionsSince(lastSyncTime)
  }

  return NextResponse.json(serverState)
}
```

## Frontend Changes Needed

### 1. Update Zustand Store
```typescript
// Add API methods to store
const useAppStore = create((set) => ({
  // ... existing state ...
  
  // New sync methods
  syncIncidents: async () => {
    const pendingIncidents = get().incidents.filter(i => i.syncStatus === 'pending')
    const response = await fetch('/api/sync', {
      method: 'POST',
      body: JSON.stringify({ incidents: pendingIncidents })
    })
    const serverData = await response.json()
    // Update local state with server response
  },
  
  addIncidentAsync: async (incident) => {
    const response = await fetch('/api/incidents', {
      method: 'POST',
      body: JSON.stringify(incident)
    })
    const savedIncident = await response.json()
    set(state => ({ incidents: [...state.incidents, savedIncident] }))
  }
}))
```

### 2. Update Offline Provider
```typescript
// lib/offline-provider.tsx
// Add auto-sync when online
useEffect(() => {
  if (isOnline && pendingChanges > 0) {
    syncNow() // Call API sync
  }
}, [isOnline, pendingChanges])
```

### 3. Add Authentication
```typescript
// Create auth wrapper
'use client'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'

export function ProtectedLayout({ children }) {
  const { data: session } = useSession()
  
  if (!session) {
    redirect('/auth/signin')
  }
  
  return children
}
```

## Database Choices

### PostgreSQL (Recommended)
**Pros:**
- Better for structured data
- Strong ACID guarantees
- Excellent Prisma support
- Free tiers: Railway, Render, Supabase

**Cons:**
- More setup required
- Schema migrations needed

**Cost**: Free tier sufficient for MVP (~500MB storage)

### MongoDB
**Pros:**
- Flexible schema
- Great for rapid iteration
- Native JSON support

**Cons:**
- Eventually consistent
- Higher costs at scale

**Cost**: Free tier 512MB sufficient for MVP

## Dependencies to Add

```bash
npm install @prisma/client next-auth
npm install -D prisma ts-node
```

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@host/dbname

# Authentication
NEXTAUTH_SECRET=your_secret_key
NEXTAUTH_URL=https://yourdomain.com
GITHUB_ID=your_github_id
GITHUB_SECRET=your_github_secret
```

## Security Checklist

- [ ] Authenticate all API endpoints
- [ ] Validate input on server-side
- [ ] Use HTTPS only (Vercel default)
- [ ] Sanitize data before database
- [ ] Implement rate limiting
- [ ] Add CORS properly
- [ ] Encrypt sensitive data
- [ ] Log all API requests
- [ ] Implement audit trail

## Testing Strategy

### Unit Tests
```typescript
// __tests__/api/incidents.test.ts
describe('POST /api/incidents', () => {
  it('should create incident with valid data', async () => {
    const response = await fetch('/api/incidents', {
      method: 'POST',
      body: JSON.stringify(validIncident)
    })
    expect(response.status).toBe(201)
  })
})
```

### Integration Tests
- Test full sync flow
- Test conflict resolution
- Test offline → online transition

## Timeline

```
Week 1:
  Day 1-2: Set up database & Prisma
  Day 3-4: Create API endpoints
  Day 5: Error handling & validation

Week 2:
  Day 1-2: Authentication (NextAuth)
  Day 3-4: Sync logic implementation
  Day 5: Frontend integration

Week 3:
  Day 1-2: Testing & bug fixes
  Day 3-4: Deployment & monitoring
  Day 5: Documentation & handoff
```

## Success Criteria

- [ ] All API endpoints working
- [ ] Database persisting data correctly
- [ ] Authentication secure and functional
- [ ] Sync logic handling offline/online transitions
- [ ] No data loss during sync
- [ ] Tests covering happy paths + edge cases
- [ ] API documentation complete
- [ ] Deployed to Vercel with auto-scaling

## Migration Path

```
Phase 1 (Current)         Phase 2 (Upcoming)      Phase 3+
┌────────────┐            ┌────────────┐          ┌────────────┐
│ Offline    │            │ Backend    │          │ Advanced   │
│ Client     │ ←────────► │ API Layer  │ ←────────│ Features   │
│ IndexedDB  │            │ Database   │          │ Real-time  │
└────────────┘            └────────────┘          └────────────┘
```

## Next Steps

1. Choose database (PostgreSQL recommended)
2. Set up Prisma schema
3. Create first API endpoint
4. Test with frontend
5. Add authentication
6. Implement sync logic

Ready to start? Let me know which database you prefer!
