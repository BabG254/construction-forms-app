"use client"

import { useState } from "react"
import Link from "next/link"
import { useAppStore } from "@/lib/store"
import { ClipboardCheck, Plus, Edit2, Trash2, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export default function InspectionsPage() {
  const { inspections, deleteInspection } = useAppStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string | null>(null)

  const filtered = inspections.filter((insp) => {
    const matchesSearch =
      insp.documentTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      insp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      insp.id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = !filterStatus || insp.status === filterStatus

    return matchesSearch && matchesStatus
  })

  // Calculate completion for each inspection
  const getCompletionPercentage = (inspection: typeof inspections[0]): number => {
    if (inspection.responses.length === 0) return 0
    const answered = inspection.responses.filter((r) => r.response !== null).length
    return Math.round((answered / inspection.responses.length) * 100)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "in-progress":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "closed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Inspections</h1>
          <p className="text-muted-foreground">
            {filtered.length} of {inspections.length} inspection{inspections.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/inspections/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Inspection
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search inspections..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          {["draft", "in-progress", "closed"].map((status) => (
            <Button
              key={status}
              variant={filterStatus === status ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus(filterStatus === status ? null : status)}
              className="capitalize"
            >
              {status}
            </Button>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <ClipboardCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">
              {inspections.length === 0 ? "No inspections yet" : "No matching inspections"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {inspections.length === 0
                ? "Start by creating your first safety inspection"
                : "Try adjusting your search or filters"}
            </p>
            {inspections.length === 0 && (
              <Link href="/inspections/new">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create First Inspection
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}

      {/* Inspections List */}
      {filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((inspection) => {
            const completionPercentage = getCompletionPercentage(inspection)

            return (
              <Card
                key={inspection.id}
                className="hover:shadow-md transition-shadow overflow-hidden"
              >
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg">{inspection.documentTitle}</h3>
                          <Badge className={getStatusColor(inspection.status)} variant="secondary">
                            {inspection.status}
                          </Badge>
                          {inspection.syncStatus === "pending" && (
                            <Badge variant="secondary" className="text-xs">
                              ⏳ Pending
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{inspection.type}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-blue-600">
                          {completionPercentage}%
                        </div>
                        <p className="text-xs text-muted-foreground">Complete</p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <Progress value={completionPercentage} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{inspection.responses.filter((r) => r.response !== null).length} / {inspection.responses.length} items</span>
                        <span>Created {new Date(inspection.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Description */}
                    {inspection.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {inspection.description}
                      </p>
                    )}

                    {/* Response Summary */}
                    <div className="grid grid-cols-3 gap-3 p-3 bg-muted rounded-lg text-xs">
                      <div>
                        <div className="text-muted-foreground">✓ Conforming</div>
                        <div className="font-bold text-green-600">
                          {inspection.responses.filter((r) => r.response === "conforming").length}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">✗ Non-Conforming</div>
                        <div className="font-bold text-red-600">
                          {inspection.responses.filter((r) => r.response === "non-conforming").length}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">N/A Not Applicable</div>
                        <div className="font-bold text-gray-600">
                          {inspection.responses.filter((r) => r.response === "not-applicable").length}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Link href={`/inspections/${inspection.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full gap-2">
                          <Edit2 className="h-4 w-4" />
                          View/Edit
                        </Button>
                      </Link>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          if (confirm("Delete this inspection?")) {
                            deleteInspection(inspection.id)
                          }
                        }}
                        className="gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
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
