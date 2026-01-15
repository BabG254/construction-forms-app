"use client"

import { Plus, Eye, Search, Filter } from "lucide-react"
import Link from "next/link"
import { AppShell } from "@/components/app-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useLocale } from "@/lib/locale-context"
import { useAppStore } from "@/lib/store"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"

const statusVariants = {
  draft: "bg-muted text-muted-foreground",
  submitted: "bg-primary/10 text-primary",
  open: "bg-warning/10 text-warning-foreground",
  closed: "bg-accent/10 text-accent",
  "in-progress": "bg-info/10 text-info",
}

const priorityVariants = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-warning/10 text-warning-foreground",
  high: "bg-destructive/10 text-destructive",
  critical: "bg-destructive text-destructive-foreground",
}

export default function ObservationsPage() {
  const { t } = useLocale()
  const { observations, projects } = useAppStore()

  return (
    <AppShell>
      <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">{t("nav.observations")}</h1>
            <p className="text-muted-foreground mt-1">
              {observations.length} {observations.length === 1 ? "observation" : "observations"}
            </p>
          </div>
          <Button asChild size="lg" className="h-12">
            <Link href="/observations/new">
              <Plus className="h-5 w-5 mr-2" />
              {t("dashboard.newObservation")}
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
        {observations.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Eye className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No observations yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Create your first observation to start tracking site safety.
              </p>
              <Button asChild>
                <Link href="/observations/new">
                  <Plus className="h-4 w-4 mr-2" />
                  {t("dashboard.newObservation")}
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {observations.map((observation) => {
              const project = projects.find((p) => p.id === observation.projectId)
              return (
                <Link key={observation.id} href={`/observations/${observation.id}`}>
                  <Card className="hover:bg-muted/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-info/10 shrink-0">
                          <Eye className="h-6 w-6 text-info" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">{observation.title || observation.number}</span>
                            <Badge variant="secondary" className={cn("text-xs", statusVariants[observation.status])}>
                              {t(`status.${observation.status}` as any)}
                            </Badge>
                            <Badge
                              variant="secondary"
                              className={cn("text-xs", priorityVariants[observation.priority])}
                            >
                              {t(`priority.${observation.priority}` as any)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{project?.name}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(observation.updatedAt), { addSuffix: true })}
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
    </AppShell>
  )
}
