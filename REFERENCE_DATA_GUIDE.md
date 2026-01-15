# Reference Data Quick Reference Guide

## Overview
Reference data is now centralized in JSON files with a type-safe loader utility. This guide shows how to use it in components.

## Location
```
lib/reference-data/
├── accidents.json
├── injuries.json
├── body-parts.json
├── observation-types.json
└── inspection-sections.json

lib/reference-data-loader.ts  (API for accessing data)
```

## Usage Examples

### Basic Import
```typescript
import { 
  getAccidentTypes,
  getInjuryTypes,
  getBodyParts,
  getObservationTypes,
  getInspectionSections
} from "@/lib/reference-data-loader"

// At module level (outside component)
const accidentTypes = getAccidentTypes()
const injuryTypes = getInjuryTypes()
const bodyParts = getBodyParts()
```

### Example 1: Accident Type Dropdown
```typescript
// In your component
import { getAccidentTypes } from "@/lib/reference-data-loader"

const accidentTypes = getAccidentTypes()

// In JSX
<Select value={selectedType} onValueChange={setSelectedType}>
  <SelectTrigger>
    <SelectValue placeholder="Select accident type" />
  </SelectTrigger>
  <SelectContent>
    {accidentTypes.map((type) => (
      <SelectItem key={type.id} value={type.id}>
        <div className="flex items-center gap-2">
          <span>{type.label}</span>
          {type.riskLevel === "critical" && (
            <span className="text-xs bg-destructive/20 px-2 py-1 rounded">
              Critical
            </span>
          )}
        </div>
      </SelectItem>
    ))}
  </SelectContent>
</Select>

// Show description
{selectedType && (
  <p className="text-sm text-muted-foreground">
    {accidentTypes.find(t => t.id === selectedType)?.description}
  </p>
)}
```

### Example 2: Injury Type with Severity
```typescript
import { getInjuryTypes } from "@/lib/reference-data-loader"

const injuryTypes = getInjuryTypes()

// Render with severity badge
{injuryTypes.map((type) => (
  <SelectItem key={type.id} value={type.id}>
    <div className="flex items-center gap-2">
      <span>{type.label}</span>
      {type.severity === "critical" && (
        <span className="text-xs bg-red-100 text-red-700 px-1 rounded">
          {type.severity}
        </span>
      )}
    </div>
  </SelectItem>
))}
```

### Example 3: Grouped Body Parts (by category)
```typescript
import { getBodyParts } from "@/lib/reference-data-loader"

const bodyParts = getBodyParts()

// Group by category
const grouped = {
  upper: bodyParts.filter(p => p.category === "upper"),
  torso: bodyParts.filter(p => p.category === "torso"),
  lower: bodyParts.filter(p => p.category === "lower"),
  other: bodyParts.filter(p => p.category === "other"),
}

// Render with group headers
<SelectContent>
  {Object.entries(grouped).map(([category, parts]) => (
    <div key={category}>
      <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
        {category.charAt(0).toUpperCase() + category.slice(1)}
      </div>
      {parts.map((part) => (
        <SelectItem key={part.id} value={part.id}>
          {part.label}
        </SelectItem>
      ))}
    </div>
  ))}
</SelectContent>
```

### Example 4: Look Up Single Item
```typescript
import { getAccidentTypeById, getInjuryTypeById } from "@/lib/reference-data-loader"

// Get a specific item
const accidentType = getAccidentTypeById("slip-trip-fall")
console.log(accidentType?.description) // "Slips, trips, or falls from height..."

const injuryType = getInjuryTypeById("fracture")
console.log(injuryType?.severity) // "high"
```

### Example 5: Display Reference Item Details
```typescript
import { getAccidentTypeById } from "@/lib/reference-data-loader"

function IncidentSummary({ accidentTypeId }: { accidentTypeId: string }) {
  const accident = getAccidentTypeById(accidentTypeId)
  
  if (!accident) return null
  
  return (
    <Alert className={accident.riskLevel === "critical" ? "border-red-500" : ""}>
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        <div className="font-semibold">{accident.label}</div>
        <div className="text-sm">{accident.description}</div>
        <div className="text-xs mt-1">
          Risk Level: <span className="font-semibold">{accident.riskLevel}</span>
        </div>
      </AlertDescription>
    </Alert>
  )
}
```

### Example 6: Observation Types
```typescript
import { getObservationTypes } from "@/lib/reference-data-loader"

const observationTypes = getObservationTypes()

// Group by category
const byCategory = observationTypes.reduce((acc, type) => {
  if (!acc[type.category]) acc[type.category] = []
  acc[type.category].push(type)
  return acc
}, {} as Record<string, typeof observationTypes>)

// Render with tabs or accordion
Object.entries(byCategory).map(([category, types]) => (
  <div key={category}>
    <h3>{category}</h3>
    {types.map(type => (
      <button key={type.id}>
        {type.label}: {type.description}
      </button>
    ))}
  </div>
))
```

### Example 7: Inspection Sections and Items
```typescript
import { 
  getInspectionSections,
  getInspectionItemsBySection,
  getInspectionSectionById
} from "@/lib/reference-data-loader"

// Get all sections with items
const sections = getInspectionSections()

// Render inspection form
{sections.map(section => (
  <div key={section.id}>
    <h3>{section.title}</h3>
    <p>{section.instruction}</p>
    <div className="space-y-2">
      {section.items.map(item => (
        <InspectionCheckItem 
          key={item.id} 
          item={item}
          number={item.number}
          label={item.label}
        />
      ))}
    </div>
  </div>
))}

// Get items for specific section
const ppeItems = getInspectionItemsBySection("ppe")
ppeItems.forEach(item => {
  console.log(`${item.number}: ${item.label}`)
})
// Output:
// 2.1: Hard hats worn in designated areas
// 2.2: Safety glasses/goggles worn when required
// etc.
```

## Data Structure Reference

### Accident Type
```typescript
interface AccidentType {
  id: string              // e.g., "slip-trip-fall"
  label: string          // e.g., "Slip/Trip/Fall"
  description: string    // e.g., "Slips, trips, or falls from height or on level surface"
  riskLevel: "low" | "medium" | "high" | "critical"
}
```

### Injury Type
```typescript
interface InjuryType {
  id: string                          // e.g., "fracture"
  label: string                       // e.g., "Fracture"
  description: string                 // e.g., "Broken bone"
  severity: "low" | "medium" | "high" | "critical"
}
```

### Body Part
```typescript
interface BodyPart {
  id: string                              // e.g., "head"
  label: string                           // e.g., "Head"
  category: "upper" | "lower" | "torso" | "other"
}
```

### Observation Type
```typescript
interface ObservationType {
  id: string      // e.g., "unsafe-condition"
  label: string   // e.g., "Unsafe Condition"
  description: string
  category: string  // e.g., "condition", "behavior", "incident", etc.
}
```

### Inspection Section
```typescript
interface InspectionSection {
  id: string           // e.g., "ppe"
  key: string          // e.g., "ppe"
  titleKey: string     // e.g., "inspection.section.ppe" (for i18n)
  title?: string       // e.g., "Personal Protective Equipment"
  instruction?: string // Guidance for inspectors
  items: InspectionItem[]
}

interface InspectionItem {
  id: string        // e.g., "ppe-1"
  number: string    // e.g., "2.1"
  label: string     // e.g., "Hard hats worn in designated areas"
  sectionId: string
  reference?: string // e.g., "Section 2.1"
}
```

## Best Practices

### 1. Load at Module Level
```typescript
// ✅ GOOD - Loaded once
const accidentTypes = getAccidentTypes()

export default function MyForm() {
  // Use accidentTypes here
}
```

```typescript
// ❌ AVOID - Loaded on every render
export default function MyForm() {
  const accidentTypes = getAccidentTypes()  // Don't do this
}
```

### 2. Use Lookups for Display
```typescript
// ✅ GOOD - Look up when needed
const accident = getAccidentTypeById(formData.accidentType)
return <p>{accident?.description}</p>
```

### 3. Memoize Grouped Data
```typescript
// ✅ GOOD - Use useMemo for derived data
const bodyPartsByCategory = useMemo(() => {
  return {
    upper: bodyParts.filter(p => p.category === "upper"),
    torso: bodyParts.filter(p => p.category === "torso"),
    lower: bodyParts.filter(p => p.category === "lower"),
  }
}, [bodyParts])
```

### 4. Filter Before Rendering
```typescript
// ✅ GOOD - Filter reference data to what's needed
const criticalAccidents = accidentTypes.filter(t => t.riskLevel === "critical")
return <div>{criticalAccidents.map(...)}</div>
```

## Adding New Reference Data

### Step 1: Create JSON file
```json
// lib/reference-data/new-items.json
{
  "items": [
    { "id": "item-1", "label": "Item 1", ... }
  ]
}
```

### Step 2: Add loader function
```typescript
// lib/reference-data-loader.ts
import newItemsData from "./reference-data/new-items.json"

export function getNewItems() {
  return newItemsData.items
}
```

### Step 3: Use in components
```typescript
import { getNewItems } from "@/lib/reference-data-loader"

const items = getNewItems()
```

## File Sizes
- `accidents.json`: ~2KB
- `injuries.json`: ~3KB
- `body-parts.json`: ~5KB
- `observation-types.json`: ~2KB
- `inspection-sections.json`: ~8KB
- **Total**: ~20KB (gzipped: ~5KB)

## Performance Notes
- All data is bundled with the app (no network requests)
- JSON is parsed once at module load time
- Subsequent calls are instant (O(1) lookup)
- No runtime overhead beyond initial parse
- Suitable for 100+ items per file

## Migration from Old Approach
Previously, data was hardcoded in components:
```typescript
// Old approach
const accidentTypes = [
  "Slip/Trip/Fall",
  "Struck By",
  // ...
]
```

Now, use reference data:
```typescript
// New approach
import { getAccidentTypes } from "@/lib/reference-data-loader"
const accidentTypes = getAccidentTypes()
```

Benefits:
- Centralized data management
- Single source of truth
- Type safety
- Easier to maintain
- Supports rich metadata (descriptions, severity, etc.)
- Ready for localization
- Version controlled in git

---

**Version**: 1.0  
**Last Updated**: January 15, 2026
