"use client"

import { useState, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { FormHeader, FormSection, FormField } from "@/components/forms"

export const dynamic = 'force-dynamic'
export const dynamicParams = true

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { useAppStore, inspectionSections } from "@/lib/store"
import { Check, X, AlertCircle } from "lucide-react"
import type { Inspection, InspectionItemResponse } from "@/lib/types"
import { useLocale } from "@/lib/locale-context"

export default function NewInspection() {
  const router = useRouter()
  const store = useAppStore()
  const { addInspection, projects = [], currentUser } = store || {}
  const { t } = useLocale()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState({
    documentTitle: "",
    type: "",
    projectId: projects[0]?.id || "",
    description: "",
    responses: {} as Record<string, InspectionItemResponse>,
  })

  // Calculate completion percentage
  const completionPercentage = useMemo(() => {
    const allItems = (inspectionSections || []).flatMap((s) => s?.items || [])
    const answered = Object.values(formData.responses).filter((r) => r.response !== null).length
    return allItems.length > 0 ? Math.round((answered / allItems.length) * 100) : 0
  }, [formData.responses])
  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {}

    if (!formData.documentTitle.trim()) newErrors.documentTitle = t("error.titleRequired")
    if (!formData.type) newErrors.type = t("error.inspectionTypeRequired")
    if (!formData.projectId) newErrors.projectId = t("error.projectRequired")
    if (completionPercentage < 50)
      newErrors.completion = t("error.minimumCompletion")

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData, completionPercentage])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      if (!validateForm()) {
        alert(t("alert.completeBeforeSubmit"))
        return
      }

      setIsSubmitting(true)

      try {
        // Convert responses object to array
        const responsesArray: InspectionItemResponse[] = Object.entries(formData.responses).map(
          ([itemId, response]) => ({
            itemId,
            response: response.response,
            comment: response.comment || "",
            attachments: response.attachments || [],
          }),
        )

        const inspection: Inspection = {
          id: crypto.randomUUID(),
          documentTitle: formData.documentTitle,
          type: formData.type,
          projectId: formData.projectId,
          description: formData.description,
          creatorId: currentUser?.id || "unknown",
          distribution: [],
          closedById: null,
          status: "in-progress",
          responses: responsesArray,
          createdAt: new Date(),
          updatedAt: new Date(),
          syncStatus: "pending",
        }

        addInspection(inspection)
        alert(t("alert.saveSuccess.inspection"))
        router.push("/inspections")
      } catch (error) {
        console.error("Error saving inspection:", error)
        alert(t("alert.saveError.inspection"))
      } finally {
        setIsSubmitting(false)
      }
    },
    [formData, validateForm, addInspection, currentUser, router],
  )

  const handleItemResponse = (
    itemId: string,
    response: "conforming" | "non-conforming" | "not-applicable" | null,
  ) => {
    setFormData((prev) => ({
      ...prev,
      responses: {
        ...prev.responses,
        [itemId]: {
          ...prev.responses[itemId],
          itemId,
          response,
          comment: prev.responses[itemId]?.comment || "",
          attachments: prev.responses[itemId]?.attachments || [],
        },
      },
    }))
  }

  const handleItemComment = (itemId: string, comment: string) => {
    setFormData((prev) => ({
      ...prev,
      responses: {
        ...prev.responses,
        [itemId]: {
          ...prev.responses[itemId],
          itemId,
          response: prev.responses[itemId]?.response || null,
          comment,
          attachments: prev.responses[itemId]?.attachments || [],
        },
      },
    }))
  }

  const getResponseStats = () => {
    const allResponses = Object.values(formData.responses)
    return {
      conforming: allResponses.filter((r) => r.response === "conforming").length,
      nonConforming: allResponses.filter((r) => r.response === "non-conforming").length,
      notApplicable: allResponses.filter((r) => r.response === "not-applicable").length,
      unanswered:
        ((inspectionSections || []).flatMap((s) => s?.items || []).length) -
        allResponses.filter((r) => r.response !== null).length,
    }
  }

  const stats = getResponseStats()

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <FormHeader
        title={t("inspection.title")}
        description={t("inspection.instruction")}
      />

      {/* Progress Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">{t("inspection.progress")}</h3>
              <div className="text-3xl font-bold text-blue-600">{completionPercentage}%</div>
            </div>
            <Progress value={completionPercentage} className="h-3" />

            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              <div className="bg-white dark:bg-slate-900 rounded p-3">
                <div className="text-xs text-muted-foreground">{t("inspection.conforming")}</div>
                <div className="text-2xl font-bold text-green-600">{stats.conforming}</div>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded p-3">
                <div className="text-xs text-muted-foreground">{t("inspection.nonConforming")}</div>
                <div className="text-2xl font-bold text-red-600">{stats.nonConforming}</div>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded p-3">
                <div className="text-xs text-muted-foreground">{t("inspection.notApplicable")}</div>
                <div className="text-2xl font-bold text-gray-600">{stats.notApplicable}</div>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded p-3">
                <div className="text-xs text-muted-foreground">{t("inspection.unanswered")}</div>
                <div className="text-2xl font-bold text-yellow-600">{stats.unanswered}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <FormSection title={t("inspection.info")} defaultOpen>
          <FormField
            label={t("inspection.titleLabel")}
            name="documentTitle"
            placeholder={t("inspection.titlePlaceholder")}
            value={formData.documentTitle}
            onChange={(e) => setFormData((prev) => ({ ...prev, documentTitle: e.target.value }))}
            error={errors.documentTitle}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label={t("inspection.typeLabel")}
              name="type"
              as="select"
              value={formData.type}
              onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value }))}
              error={errors.type}
              required
            >
              <option value="">{t("inspection.selectType")}</option>
              <option value="safety">{t("inspection.type.safety")}</option>
              <option value="compliance">{t("inspection.type.compliance")}</option>
              <option value="incident-follow-up">{t("inspection.type.incidentFollowUp")}</option>
              <option value="routine">{t("inspection.type.routine")}</option>
            </FormField>

            <FormField
              label={t("form.project")}
              name="projectId"
              as="select"
              value={formData.projectId}
              onChange={(e) => setFormData((prev) => ({ ...prev, projectId: e.target.value }))}
              error={errors.projectId}
              required
            >
              <option value="">{t("inspection.projectSelect")}</option>
              {projects?.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </FormField>
          </div>

          <FormField
            label={t("inspection.descriptionNotes")}
            name="description"
            as="textarea"
            placeholder={t("form.description")}
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            rows={3}
          />

          {errors.completion && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.completion}</AlertDescription>
            </Alert>
          )}
        </FormSection>

        {/* Inspection Sections */}
        {(inspectionSections || []).map((section) => {
          const sectionItems = section?.items || []
          const sectionResponses = sectionItems.map((item) => formData.responses[item.id])
          const sectionComplete = sectionResponses.filter((r) => r?.response !== null && r?.response !== undefined).length

          return (
            <FormSection
              key={section.id}
              title={section.title}
              description={t("inspection.itemsChecked", { checked: sectionComplete, total: sectionItems.length })}
              defaultOpen={false}
            >
              {section.instruction && (
                <Alert className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{section.instruction}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-3">
                {sectionItems.map((item) => (
                  <Card key={item.id} className="border-l-4 border-l-gray-300 hover:border-l-blue-300 transition-colors">
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <p className="font-medium">
                              <span className="text-muted-foreground text-sm">{item.number}</span> {item.label}
                            </p>
                          </div>

                          {/* Response buttons */}
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleItemResponse(item.id, "conforming")}
                              className={`p-2 rounded transition-all ${
                                formData.responses[item.id]?.response === "conforming"
                                  ? "bg-green-500 text-white"
                                  : "bg-gray-200 text-gray-600 hover:bg-green-200"
                              }`}
                              title={t("inspection.conforming")}
                            >
                              <Check className="h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleItemResponse(item.id, "non-conforming")}
                              className={`p-2 rounded transition-all ${
                                formData.responses[item.id]?.response === "non-conforming"
                                  ? "bg-red-500 text-white"
                                  : "bg-gray-200 text-gray-600 hover:bg-red-200"
                              }`}
                              title={t("inspection.nonConforming")}
                            >
                              <X className="h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleItemResponse(item.id, "not-applicable")}
                              className={`p-2 rounded transition-all ${
                                formData.responses[item.id]?.response === "not-applicable"
                                  ? "bg-gray-500 text-white"
                                  : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                              }`}
                              title={t("inspection.notApplicable")}
                            >
                              <AlertCircle className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {/* Comment field for non-conforming items */}
                        {formData.responses[item.id]?.response === "non-conforming" && (
                          <textarea
                            placeholder={t("inspection.commentPlaceholder")}
                            value={formData.responses[item.id]?.comment || ""}
                            onChange={(e) => handleItemComment(item.id, e.target.value)}
                            className="w-full text-sm p-2 border rounded bg-red-50 dark:bg-red-950 border-red-200"
                            rows={2}
                          />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </FormSection>
          )
        })}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-6 sticky bottom-0 bg-white dark:bg-slate-950 p-4 rounded-lg border">
          <Button
            type="submit"
            className="flex-1"
            disabled={isSubmitting || completionPercentage < 50}
          >
            {isSubmitting ? t("action.saving") : t("action.saveInspection", { percent: completionPercentage })}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            {t("form.cancel")}
          </Button>
        </div>
      </form>
    </div>
  )
}
