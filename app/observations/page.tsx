"use client"

import { useState } from "react"
import Link from "next/link"
import { useAppStore } from "@/lib/store"
import { useLocale } from "@/lib/locale-context"
import { Eye, Plus, Edit2, Trash2, Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { AppShell } from "@/components/app-shell"
import { cn } from "@/lib/utils"

const priorityVariants: Record<string, string> = {
  low: "bg-green-100 text-green-800 dark:bg-green-900",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900",
  high: "bg-red-100 text-red-800 dark:bg-red-900",
}

const statusVariants: Record<string, string> = {
  draft: "bg-blue-100 text-blue-800 dark:bg-blue-900",
  submitted: "bg-green-100 text-green-800 dark:bg-green-900",
  archived: "bg-gray-100 text-gray-800 dark:bg-gray-900",
}

export default function ObservationsPage() {
  const { observations, deleteObservation, projects } = useAppStore()
  const { t } = useLocale()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterPriority, setFilterPriority] = useState<string | null>(null)

  const filtered = observations.filter((obs) => {
    const matchesSearch =
      obs.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      obs.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      obs.number.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesPriority = !filterPriority || obs.priority === filterPriority

    return matchesSearch && matchesPriority
  })

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{t("nav.observations")}</h1>
            <p className="text-muted-foreground">
              {filtered.length} of {observations.length} observation{observations.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Link href="/observations/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              {t("action.new")}
            </Button>
          </Link>
        </div>

        {/* Search and filters */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("action.search")}
              className="pl-10 h-12"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {["low", "medium", "high"].map((priority) => (
              <Button
                key={priority}
                variant={filterPriority === priority ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterPriority(filterPriority === priority ? null : priority)}
                className="capitalize"
              >
                {t(`priority.${priority}` as any)}
              </Button>
            ))}
          </div>
        </div>

        {/* Empty State */}
        {filtered.length === 0 && (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <Eye className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">
                {observations.length === 0 ? t("empty.noObservations") : "No matching observations"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {observations.length === 0
                  ? t("empty.createFirst")
                  : "Try adjusting your search or filters"}
              </p>
              {observations.length === 0 && (
                <Link href="/observations/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    {t("action.new")}
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}

        {/* List */}
        {filtered.length > 0 && (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((observation) => {
              const project = projects.find((p) => p.id === observation.projectId)
              return (
                <Card key={observation.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900 shrink-0">
                        <Eye className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base truncate">{observation.title}</h3>
                        <p className="text-xs text-muted-foreground">{observation.number}</p>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{observation.description}</p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{t("field.type")}</span>
                        <span className="font-medium">{observation.type}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{t("field.location")}</span>
                        <span className="font-medium">{observation.location}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="secondary" className={cn("text-xs", statusVariants[observation.status])}>
                        {t(`status.${observation.status}` as any)}
                      </Badge>
                      <Badge
                        variant="secondary"
                        className={cn("text-xs", priorityVariants[observation.priority])}
                      >
                        {t(`priority.${observation.priority}` as any)}
                      </Badge>
                      {observation.syncStatus === "pending" && (
                        <Badge variant="secondary" className="text-xs">
                          ⏳ Pending
                        </Badge>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-3">
                      <Link href={`/observations/${observation.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full gap-2">
                          <Edit2 className="h-4 w-4" />
                          {t("action.view")}
                        </Button>
                      </Link>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          if (confirm("Delete this observation?")) {
                            deleteObservation(observation.id)
                          }
                        }}
                        className="gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </AppShell>
  )
}
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create First Observation
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}

      {/* Observations Grid */}
      {filtered.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

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
