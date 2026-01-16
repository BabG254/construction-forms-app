"use client"

import { useState } from "react"
import Link from "next/link"
import { useAppStore } from "@/lib/store"

export const dynamic = 'force-dynamic'
import { useLocale } from "@/lib/locale-context"
import { ClipboardCheck, Plus, Edit2, Trash2, Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { AppShell } from "@/components/app-shell"
import { cn } from "@/lib/utils"

const statusVariants: Record<string, string> = {
  draft: "bg-blue-100 text-blue-800 dark:bg-blue-900",
  "in-progress": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900",
  closed: "bg-green-100 text-green-800 dark:bg-green-900",
}

export default function InspectionsPage() {
  const { inspections, deleteInspection, projects } = useAppStore()
  const { t } = useLocale()
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

  const getCompletionPercentage = (inspection: (typeof inspections)[0]): number => {
    if (inspection.responses.length === 0) return 0
    const answered = inspection.responses.filter((r) => r.response !== null).length
    return Math.round((answered / inspection.responses.length) * 100)
  }

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{t("nav.inspections")}</h1>
            <p className="text-muted-foreground">
              {t("list.countOf", { 
                filtered: filtered.length, 
                total: inspections.length,
                type: inspections.length !== 1 ? t("list.inspections") : t("list.inspection")
              })}
            </p>
          </div>
          <Link href="/inspections/new">
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
            {["draft", "in-progress", "closed"].map((status) => (
              <Button
                key={status}
                variant={filterStatus === status ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus(filterStatus === status ? null : status)}
                className="capitalize text-xs"
              >
                {t(`status.${status}` as any)}
              </Button>
            ))}
          </div>
        </div>

        {/* Empty State */}
        {filtered.length === 0 && (
          <div className="w-full max-w-2xl mx-auto">
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-20 px-6">
                <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-8">
                  <ClipboardCheck className="h-10 w-10 text-muted-foreground/70" />
                </div>
                <h3 className="text-2xl font-semibold mb-3 text-center text-foreground">
                  {inspections.length === 0 ? "Aucune inspection" : t("empty.noMatchingInspections")}
                </h3>
                <p className="text-muted-foreground text-center mb-10 max-w-sm leading-relaxed">
                  {inspections.length === 0 ? "Planifiez et effectuez des inspections pour assurer la conformité et la sécurité du site" : t("empty.adjustFilters")}
                </p>
                {inspections.length === 0 && (
                  <Link href="/inspections/new">
                    <Button size="lg" className="gap-2">
                      <Plus className="h-5 w-5" />
                      Nouvelle inspection
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* List */}
        {filtered.length > 0 && (
          <div className="space-y-4">
            {filtered.map((inspection) => {
              const project = projects.find((p) => p.id === inspection.projectId)
              const completionPercentage = getCompletionPercentage(inspection)
              const conforming = inspection.responses.filter((r) => r.response === "conforming").length
              const nonConforming = inspection.responses.filter((r) => r.response === "non-conforming").length
              const notApplicable = inspection.responses.filter((r) => r.response === "na").length

              return (
                <Card key={inspection.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900 shrink-0">
                        <ClipboardCheck className="h-6 w-6 text-purple-600 dark:text-purple-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-base truncate">{inspection.documentTitle}</h3>
                          <Badge
                            variant="secondary"
                            className={cn("text-xs", statusVariants[inspection.status])}
                          >
                            {t(`status.${inspection.status}` as any)}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{inspection.id}</p>
                        {project && <p className="text-xs text-muted-foreground mt-1">{project.name}</p>}
                      </div>
                    </div>

                    {/* Completion Progress */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium">{t("field.completion")}</span>
                        <span className="text-xs font-bold">{completionPercentage}%</span>
                      </div>
                      <Progress value={completionPercentage} className="h-2" />
                    </div>

                    {/* Response Summary */}
                    <div className="grid grid-cols-3 gap-2 mb-4 text-xs">
                      <div className="text-center">
                        <div className="font-bold text-green-600">{conforming}</div>
                        <div className="text-muted-foreground">Conforming</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-red-600">{nonConforming}</div>
                        <div className="text-muted-foreground">Non-Conf.</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-gray-600">{notApplicable}</div>
                        <div className="text-muted-foreground">N/A</div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-3">
                      <Link href={`/inspections/${inspection.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full gap-2">
                          <Edit2 className="h-4 w-4" />
                          {t("action.view")}
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
