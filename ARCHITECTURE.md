# Construction Forms App - Architecture Document

## Overview
This document outlines the locked architecture for the Construction Site Forms application - an enterprise-grade offline-first web application for managing construction site inspections, observations, and incident reports.

## Technology Stack

### Frontend Framework
- **Next.js 16** - React 19 with App Router
- **TypeScript 5** - Full type safety
- **Zustand** - State management with persistence middleware
- **React Hook Form + Zod** - Form management and validation

### UI & Styling
- **Tailwind CSS 4** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Shadcn/ui** - Pre-built component library
- **Lucide React** - Icon library
- **Sonner** - Toast notifications

### Data & Storage
- **IndexedDB** - Client-side persistent storage
- **Zustand Persist Middleware** - Automatic state serialization to IndexedDB
- **Vercel Analytics** - Production analytics

### Hosting & Deployment
- **Vercel** - Serverless hosting with automatic deployments
- **Next.js Edge Runtime** - Edge functions for API routes (future)

## Core Architecture Patterns

### 1. Offline-First Architecture

#### Data Synchronization Model
```
┌─────────────────────────────────────────────┐
│         Client Application (Browser)         │
│  ┌──────────────────────────────────────┐   │
│  │  React Components + React Hook Form  │   │
│  └──────────────────────────────────────┘   │
│  ┌──────────────────────────────────────┐   │
│  │  Zustand Store (State Management)    │   │
│  └──────────────────────────────────────┘   │
│  ┌──────────────────────────────────────┐   │
│  │  IndexedDB (Local Persistence)       │   │
│  │  - Full form data cached             │   │
│  │  - Sync status tracking              │   │
│  │  - Reference data (lookups)          │   │
│  └──────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
         ↕ (When Online)
┌─────────────────────────────────────────────┐
│   Vercel Backend (Future API Endpoints)     │
│   - Form submission endpoints               │
│   - Data synchronization                    │
│   - Reference data updates                  │
└─────────────────────────────────────────────┘
```

#### Key Principles
1. **100% Offline Capable** - All forms work without network
2. **Automatic Sync** - When connection restored, pending changes sync
3. **Conflict-Free** - Timestamps and creatorId prevent conflicts
4. **SyncStatus Tracking** - Every form tracks: `synced | pending | error`
5. **No Real-Time Sync** - Manual sync triggers prevent conflicts

### 2. State Management (Zustand)

#### Store Structure
- **Persisted State**: All forms (Observations, Incidents, Inspections), Projects, Users
- **Runtime State**: Online status, syncing state, UI preferences
- **Persistence Layer**: Zustand middleware → IndexedDB
- **Rehydration**: Automatic on app startup

#### Data Flow
```
User Input → Form Component
        ↓
      State Update (Zustand)
        ↓
      Local Storage Persisted
        ↓
      SyncStatus = "pending"
        ↓
      (When Online) → Sync to Backend
        ↓
      SyncStatus = "synced" | "error"
```

### 3. Form Architecture

#### Form Structure Pattern
All forms follow the same pattern:

```
┌─ FormHeader ──────────────────────┐
│  Title, Back, Save Draft button   │
├───────────────────────────────────┤
│ FormSection (Collapsible)         │
│  ├─ FormField                     │
│  │  └─ Input/Select/Textarea      │
│  └─ FormField                     │
├───────────────────────────────────┤
│ FormSection (Collapsible)         │
│  └─ FormField                     │
├───────────────────────────────────┤
│ AttachmentUpload                  │
├───────────────────────────────────┤
│ Action Buttons (Cancel, Submit)   │
└───────────────────────────────────┘
```

#### Form Submission States
1. **Draft** - Auto-saves to IndexedDB, syncStatus = "pending"
2. **Submit** - Marks as "submitted", syncStatus = "pending"
3. **Sync** - Attempted when online, updates syncStatus
4. **Error Handling** - User can retry, form data preserved

### 4. Reference Data Architecture

#### Reference Data Types
Reference data includes:
- **Lookup Lists** - Stored as JSON files for bundle inclusion
- **Selection Options** - Hardcoded arrays for accident types, injury types, etc.
- **Dynamic Data** - Projects, Users loaded from store

#### Reference Data Files (lib/reference-data/)
- `accidents.json` - Accident type definitions
- `injuries.json` - Injury type definitions
- `body-parts.json` - Body part definitions
- `inspection-sections.json` - Inspection checklist structure

#### Benefits
- Static typing with generated types
- Bundled with app (no external requests)
- Localizable labels via keys
- Searchable/filterable at runtime
- Versioned with app for compatibility

### 5. Database Schema (IndexedDB)

#### Object Stores
```
Database: construction-forms-app

├─ observations (keyPath: id)
│  ├─ Index: projectId
│  ├─ Index: status
│  └─ Index: syncStatus
│
├─ incidents (keyPath: id)
│  ├─ Index: projectId
│  ├─ Index: status
│  └─ Index: syncStatus
│
├─ inspections (keyPath: id)
│  ├─ Index: projectId
│  ├─ Index: status
│  └─ Index: syncStatus
│
├─ projects (keyPath: id)
│
├─ users (keyPath: id)
│
└─ reference-data (keyPath: key)
   └─ Stores: accidents, injuries, body-parts, etc.
```

### 6. Attachment Handling

#### Current Implementation
- Attachments stored in memory with form data
- Metadata only (name, type, size, url)
- URL points to placeholder or upload endpoint (future)

#### Future Enhancement
- File upload to cloud storage (AWS S3 / Azure Blob)
- Blob storage in IndexedDB for offline access
- Sync attachment metadata when online

## Type System

### Core Entity Types
- `Incident` - Workplace incident/accident report
- `Observation` - Safety observation/near-miss
- `Inspection` - Checklist-based safety inspection
- `Project` - Construction project container
- `User` - Person (creator, assignee, reviewer)
- `Attachment` - File reference

### Status Types
```typescript
type FormStatus = "draft" | "submitted" | "open" | "closed" | "in-progress"
type Priority = "low" | "medium" | "high" | "critical"
type SyncStatus = "synced" | "pending" | "error"
type InspectionResponse = "conforming" | "non-conforming" | "not-applicable" | null
```

## API Design (Future)

### Endpoints Structure
```
POST /api/incidents - Submit incident
POST /api/observations - Submit observation
POST /api/inspections - Submit inspection
GET /api/sync/incidents - Fetch updates
GET /api/sync/observations - Fetch updates
GET /api/sync/inspections - Fetch updates
POST /api/sync - Batch sync endpoint
GET /api/reference-data - Get latest reference data
```

### Sync Strategy
- **Optimistic Updates** - UI updates immediately
- **Eventual Consistency** - Backend syncs asynchronously
- **Conflict Resolution** - Last-write-wins with timestamp fallback
- **Retry Logic** - Exponential backoff for failed syncs

## Deployment & Hosting

### Vercel Configuration
- **Framework**: Next.js 16
- **Node.js Runtime**: 18+ (default)
- **Build Output**: Static + API Routes
- **Environment**: Production URL, Analytics enabled

### Performance Targets
- Lighthouse Score: 90+
- First Contentful Paint: < 2s
- Offline Functionality: 100% (all features work offline)
- Sync Latency: < 5s when online

## Security Considerations

### Data Protection
- **Client-Side Only**: No backend authentication (MVP)
- **Future**: OAuth/JWT for multi-user scenarios
- **IndexedDB**: Scoped to origin (browser security)
- **HTTPS Only**: Vercel automatic

### Form Validation
- **Client-Side**: Zod schema validation
- **Server-Side**: Required for production APIs
- **Field-Level**: Real-time feedback
- **Submission-Level**: Final validation before sync

## Localization Architecture

### Locale System
- **LocaleContext**: Provides `t()` function for translations
- **Keys**: Hierarchical (e.g., "incident.title", "form.submit")
- **Default**: English with placeholder values
- **Extensible**: Easy to add new languages

## Component Hierarchy

### Layout Structure
```
RootLayout
├─ LocaleProvider
├─ OfflineProvider
├─ Theme Provider
├─ SyncStatusBanner
└─ Page Content
   └─ AppShell
      ├─ Sidebar
      ├─ Header
      └─ Main Content
         └─ Form/Page Component
```

### Form Components
- `FormHeader` - Title, navigation, save draft
- `FormSection` - Collapsible container, legend
- `FormField` - Label, input, validation feedback
- `AttachmentUpload` - File upload UI
- UI primitives from Radix/shadcn

## File Organization

```
app/                          # Next.js app directory
├─ layout.tsx               # Root layout with providers
├─ page.tsx                 # Dashboard/home page
├─ incidents/new/page.tsx  # NEW Incident form (fully implemented)
├─ observations/new/page.tsx
├─ inspections/new/page.tsx
└─ [id]/page.tsx           # View/edit forms

components/
├─ app-shell.tsx           # Main layout container
├─ forms/                  # Form-specific components
│  ├─ form-header.tsx
│  ├─ form-section.tsx
│  ├─ form-field.tsx
│  └─ attachment-upload.tsx
└─ ui/                     # Shadcn UI components

lib/
├─ store.ts               # Zustand state management
├─ types.ts               # TypeScript type definitions
├─ offline-provider.tsx   # Offline detection & sync
├─ locale-context.tsx     # Localization provider
├─ utils.ts               # Utility functions
└─ reference-data/        # JSON reference files
   ├─ accidents.json
   ├─ injuries.json
   └─ body-parts.json
```

## Development Workflow

### Making Changes
1. **Form Fields**: Update Zustand store type → Add to form UI → Test offline
2. **Reference Data**: Update JSON → Run type generation → Use in forms
3. **Components**: Create in components/ → Import into forms → Test accessibility
4. **State**: All updates go through Zustand → Automatic persistence → Verify IndexedDB

### Testing Strategy
- Form validation offline
- Data persistence across page reload
- Sync behavior when online status changes
- Reference data loading and display

## Future Enhancements

### Phase 2
- Backend API endpoints (Node.js or Serverless)
- Database (PostgreSQL or MongoDB)
- User authentication
- Real sync implementation
- Batch submissions

### Phase 3
- Offline map view
- Real-time collaboration
- Advanced analytics
- Mobile app (React Native)
- Voice/photo integration

### Phase 4
- AI-powered analysis
- Predictive safety alerts
- Integration with project management tools
- SAAS multi-tenant system

## Constraints & Assumptions

### Constraints
- Client-side only (MVP)
- No backend persistence
- Single user per browser instance
- IndexedDB available (no IE11 support)
- Same-origin policy for IndexedDB
- Limited to browser storage limits (50MB+)

### Assumptions
- Users have modern browsers
- Network latency < 10s
- Forms submitted < 100MB each
- Projects < 1000 items
- Forms < 10,000 items per store

## Monitoring & Debugging

### Available Tools
- **Browser DevTools**: IndexedDB inspection, Network monitoring
- **Vercel Analytics**: Performance metrics
- **Console Logging**: Debug sync, form submissions
- **React DevTools**: State inspection

### Key Metrics to Monitor
- Page load time
- Form submission success rate
- Sync failure rate
- IndexedDB usage
- Offline usage percentage

---

**Last Updated**: January 15, 2026
**Version**: 1.0 - Architecture Locked
**Status**: Production-Ready (Client-Side MVP)
