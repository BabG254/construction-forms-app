"use client"

import { useState } from "react"
import Link from "next/link"
import { useAppStore } from "@/lib/store"
import { Eye, Plus, Edit2, Trash2, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function ObservationsPage() {
  const { observations, deleteObservation } = useAppStore()
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Observations</h1>
          <p className="text-muted-foreground">
            {filtered.length} of {observations.length} observation{observations.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/observations/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Observation
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search observations..."
            className="pl-10"
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
              {priority}
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
              {observations.length === 0 ? "No observations yet" : "No matching observations"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {observations.length === 0
                ? "Start by creating your first observation"
                : "Try adjusting your search or filters"}
            </p>
            {observations.length === 0 && (
              <Link href="/observations/new">
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
          {filtered.map((observation) => (
            <Card key={observation.id} className="hover:shadow-lg transition-shadow overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <CardTitle className="text-base line-clamp-2">{observation.title}</CardTitle>
                    <CardDescription className="text-xs mt-1">{observation.number}</CardDescription>
                  </div>
                  <Badge className={getPriorityColor(observation.priority)} variant="secondary">
                    {observation.priority}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {/* Details */}
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Location:</span>
                    <p className="font-medium">{observation.location || "-"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Type:</span>
                    <p className="font-medium capitalize">{observation.type}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Created:</span>
                    <p className="font-medium">
                      {new Date(observation.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Description Preview */}
                <p className="text-sm text-muted-foreground line-clamp-2">{observation.description}</p>

                {/* Attachments */}
                {observation.attachments && observation.attachments.length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    📎 {observation.attachments.length} attachment{observation.attachments.length !== 1 ? "s" : ""}
                  </div>
                )}

                {/* Status Badge */}
                <div className="flex items-center gap-2 pt-2">
                  <Badge variant="outline" className="capitalize">
                    {observation.status}
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
                      View
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
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
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
