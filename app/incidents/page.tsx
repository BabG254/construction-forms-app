"use client"

import { Suspense } from "react"
import { Plus, AlertTriangle, Search, Filter } from "lucide-react"

export const dynamic = 'force-dynamic'

import Link from "next/link"
import { AppShell } from "@/components/app-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useLocale } from "@/lib/locale-context"
import { useAppStore } from "@/lib/store"
import { formatDistanceToNow, format } from "date-fns"
import { cn } from "@/lib/utils"

const statusVariants = {
  draft: "bg-muted text-muted-foreground",
  submitted: "bg-primary/10 text-primary",
  open: "bg-warning/10 text-warning-foreground",
  closed: "bg-accent/10 text-accent",
  "in-progress": "bg-info/10 text-info",
}

function IncidentsContent() {
  const { t } = useLocale()
  const { incidents, projects } = useAppStore()

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">{t("nav.incidents")}</h1>
          <p className="text-muted-foreground mt-1">
            {incidents.length} {incidents.length === 1 ? "incident" : "incidents"}
          </p>
        </div>
        <Button asChild size="lg" className="h-12">
          <Link href="/incidents/new">
            <Plus className="h-5 w-5 mr-2" />
            {t("dashboard.newIncident")}
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
      {incidents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <AlertTriangle className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{t("empty.noIncidents")}</h3>
            <p className="text-muted-foreground text-center mb-4">
              {t("empty.reportIncidents")}
            </p>
            <Button asChild>
              <Link href="/incidents/new">
                <Plus className="h-4 w-4 mr-2" />
                {t("dashboard.newIncident")}
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {incidents.map((incident) => {
            const project = projects.find((p) => p.id === incident.projectId)
            return (
              <Link key={incident.id} href={`/incidents/${incident.id}`}>
                <Card className="hover:bg-muted/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-destructive/10 shrink-0">
                        <AlertTriangle className="h-6 w-6 text-destructive" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{incident.title || incident.number}</span>
                          <Badge variant="secondary" className={cn("text-xs", statusVariants[incident.status])}>
                            {t(`status.${incident.status}` as any)}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                          <span>{project?.name}</span>
                          <span>•</span>
                          <span>{format(new Date(incident.eventDate), "MMM d, yyyy")}</span>
                          <span>•</span>
                          <span>{incident.accidentType}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(incident.updatedAt), { addSuffix: true })}
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

export default function IncidentsPage() {
  return (
    <AppShell>
      <Suspense fallback={null}>
        <IncidentsContent />
      </Suspense>
    </AppShell>
  )
}
