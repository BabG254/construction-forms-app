"use client"

import { Suspense } from "react"
import { Plus, ClipboardCheck, Search, Filter, Check, X } from "lucide-react"
import Link from "next/link"
import { AppShell } from "@/components/app-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useLocale } from "@/lib/locale-context"
import { useAppStore, inspectionSections } from "@/lib/store"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"

const statusVariants = {
  draft: "bg-muted text-muted-foreground",
  submitted: "bg-primary/10 text-primary",
  open: "bg-warning/10 text-warning-foreground",
  closed: "bg-accent/10 text-accent",
  "in-progress": "bg-info/10 text-info",
}

function InspectionsContent() {
  const { t } = useLocale()
  const { inspections, projects } = useAppStore()

  const totalItems = inspectionSections.reduce((acc, section) => acc + section.items.length, 0)

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">{t("nav.inspections")}</h1>
          <p className="text-muted-foreground mt-1">
            {inspections.length} {inspections.length === 1 ? "inspection" : "inspections"}
          </p>
        </div>
        <Button asChild size="lg" className="h-12">
          <Link href="/inspections/new">
            <Plus className="h-5 w-5 mr-2" />
            {t("dashboard.newInspection")}
          </Link>
        </Button>
      </div>

      {/* Search and filters */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={t("action.search")} className="pl-10 h-12" />
        </div>
        <Button variant="outline" size="icon" className="h-12 w-12 bg-transparent">
          <Filter className="h-5 w-5" />
        </Button>
      </div>

      {/* List */}
      {inspections.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <ClipboardCheck className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No inspections yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Start your first inspection to track site safety compliance.
            </p>
            <Button asChild>
              <Link href="/inspections/new">
                <Plus className="h-4 w-4 mr-2" />
                {t("dashboard.newInspection")}
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {inspections.map((inspection) => {
            const project = projects.find((p) => p.id === inspection.projectId)
            const conforming = inspection.responses.filter((r) => r.response === "conforming").length
            const nonConforming = inspection.responses.filter((r) => r.response === "non-conforming").length
            const answered = inspection.responses.filter((r) => r.response !== null).length

            return (
              <Link key={inspection.id} href={`/inspections/${inspection.id}`}>
                <Card className="hover:bg-muted/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 shrink-0">
                        <ClipboardCheck className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{inspection.documentTitle || "Untitled Inspection"}</span>
                          <Badge variant="secondary" className={cn("text-xs", statusVariants[inspection.status])}>
                            {t(`status.${inspection.status}` as any)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{project?.name}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="text-muted-foreground">
                            {answered}/{totalItems} inspected
                          </span>
                          <span className="flex items-center gap-1 text-accent">
                            <Check className="h-3 w-3" />
                            {conforming}
                          </span>
                          <span className="flex items-center gap-1 text-destructive">
                            <X className="h-3 w-3" />
                            {nonConforming}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(inspection.updatedAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function InspectionsPage() {
  return (
    <AppShell>
      <Suspense fallback={null}>
        <InspectionsContent />
      </Suspense>
    </AppShell>
  )
}
