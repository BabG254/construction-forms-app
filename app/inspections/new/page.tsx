"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { AppShell } from "@/components/app-shell"
import { FormHeader } from "@/components/forms/form-header"
import { FormSection } from "@/components/forms/form-section"
import { FormField } from "@/components/forms/form-field"
import { InspectionChecklist } from "@/components/forms/inspection-checklist"
import { InspectionSummary } from "@/components/forms/inspection-summary"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLocale } from "@/lib/locale-context"
import { useAppStore, inspectionSections } from "@/lib/store"
import type { Inspection, InspectionItemResponse, InspectionResponse, FormStatus } from "@/lib/types"

const inspectionTypes = ["Health & Safety", "Quality Control", "Environmental", "Equipment", "General"]

export default function NewInspectionPage() {
  const router = useRouter()
  const { t } = useLocale()
  const { projects, currentUser, addInspection } = useAppStore()

  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    documentTitle: "",
    projectId: "",
    type: "Health & Safety",
    description: "",
  })

  // Initialize responses for all items
  const [responses, setResponses] = useState<InspectionItemResponse[]>(() => {
    const allItems: InspectionItemResponse[] = []
    inspectionSections.forEach((section) => {
      section.items.forEach((item) => {
        allItems.push({
          itemId: item.id,
          response: null,
          comment: "",
          attachments: [],
        })
      })
    })
    return allItems
  })

  const handleResponseChange = useCallback((itemId: string, response: InspectionResponse) => {
    setResponses((prev) =>
      prev.map((r) =>
        r.itemId === itemId
          ? { ...r, response: r.response === response ? null : response } // Toggle if same
          : r,
      ),
    )
  }, [])

  const handleCommentChange = useCallback((itemId: string, comment: string) => {
    setResponses((prev) => prev.map((r) => (r.itemId === itemId ? { ...r, comment } : r)))
  }, [])

  const handleSaveDraft = useCallback(async () => {
    setIsSaving(true)
    try {
      const inspection: Inspection = {
        id: Math.random().toString(36).substring(7),
        documentTitle: formData.documentTitle,
        projectId: formData.projectId,
        type: formData.type,
        description: formData.description,
        creatorId: currentUser?.id || "",
        distribution: [],
        closedById: null,
        status: "draft" as FormStatus,
        responses,
        createdAt: new Date(),
        updatedAt: new Date(),
        syncStatus: "pending",
      }
      addInspection(inspection)
      toast.success(t("status.savedLocally"))
      router.push("/inspections")
    } finally {
      setIsSaving(false)
    }
  }, [formData, responses, currentUser, addInspection, router, t])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      // Validate all items have responses
      const unanswered = responses.filter((r) => r.response === null)
      if (unanswered.length > 0) {
        toast.error(`Please complete all ${unanswered.length} unanswered items before submitting`)
        return
      }

      setIsSaving(true)
      try {
        const inspection: Inspection = {
          id: Math.random().toString(36).substring(7),
          documentTitle: formData.documentTitle,
          projectId: formData.projectId,
          type: formData.type,
          description: formData.description,
          creatorId: currentUser?.id || "",
          distribution: [],
          closedById: null,
          status: "submitted" as FormStatus,
          responses,
          createdAt: new Date(),
          updatedAt: new Date(),
          syncStatus: "pending",
        }
        addInspection(inspection)
        toast.success("Inspection submitted successfully")
        router.push("/inspections")
      } finally {
        setIsSaving(false)
      }
    },
    [formData, responses, currentUser, addInspection, router],
  )

  return (
    <AppShell>
      <FormHeader
        title={t("inspection.title")}
        backHref="/inspections"
        onSaveDraft={handleSaveDraft}
        isSaving={isSaving}
      />

      <form onSubmit={handleSubmit} className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
        {/* Inspection Summary - Sticky on desktop */}
        <div className="lg:sticky lg:top-20 lg:z-20">
          <InspectionSummary sections={inspectionSections} responses={responses} />
        </div>

        {/* Header Information */}
        <FormSection title="Inspection Details" collapsible={false}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label={t("inspection.documentTitle")} required className="md:col-span-2">
              <Input
                value={formData.documentTitle}
                onChange={(e) => setFormData((prev) => ({ ...prev, documentTitle: e.target.value }))}
                placeholder="Enter inspection title"
                className="h-12"
              />
            </FormField>

            <FormField label={t("form.project")} required>
              <Select
                value={formData.projectId}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, projectId: value }))}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label={t("inspection.type")} required>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value }))}
              >
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {inspectionTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label={t("form.description")} className="md:col-span-2">
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Optional description of this inspection..."
                rows={3}
              />
            </FormField>
          </div>
        </FormSection>

        {/* Inspection Sections */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">{t("inspection.sections")}</h2>
          {inspectionSections.map((section) => (
            <InspectionChecklist
              key={section.id}
              section={section}
              responses={responses.filter((r) => section.items.some((item) => item.id === r.itemId))}
              onResponseChange={handleResponseChange}
              onCommentChange={handleCommentChange}
            />
          ))}
        </div>

        {/* Submit */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button type="button" variant="outline" onClick={() => router.push("/inspections")} className="h-12 flex-1">
            {t("form.cancel")}
          </Button>
          <Button type="submit" disabled={isSaving} className="h-12 flex-1">
            {t("form.submit")}
          </Button>
        </div>
      </form>
    </AppShell>
  )
}
