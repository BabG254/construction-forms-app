"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"

export const dynamic = 'force-dynamic'
import { FormHeader, FormSection, FormField, AttachmentUpload } from "@/components/forms"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { useAppStore } from "@/lib/store"
import { getObservationTypes } from "@/lib/reference-data-loader"
import { AlertTriangle, CheckCircle2 } from "lucide-react"
import type { Observation, Attachment } from "@/lib/types"
import { useLocale } from "@/lib/locale-context"

export default function NewObservation() {
  const router = useRouter()
  const { addObservation, projects, currentUser } = useAppStore()
  const { t } = useLocale()
  const [files, setFiles] = useState<File[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    type: "",
    projectId: projects[0]?.id || "",
    location: "",
    description: "",
    priority: "medium" as const,
    concernedCompany: "",
    referenceArticle: "",
    safetyAnalysis: {
      danger: "",
      contributingCondition: "",
      contributingBehavior: "",
    },
  })

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) newErrors.title = t("error.titleRequired")
    if (!formData.type) newErrors.type = t("observation.type")
    if (!formData.projectId) newErrors.projectId = t("error.projectRequired")
    if (!formData.description.trim()) newErrors.description = t("form.description")
    if (!formData.safetyAnalysis.danger.trim()) newErrors.danger = t("observation.danger")
    if (!formData.safetyAnalysis.contributingCondition.trim())
      newErrors.condition = t("observation.contributingCondition")
    if (!formData.safetyAnalysis.contributingBehavior.trim())
      newErrors.behavior = t("observation.contributingBehavior")

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      
      if (!validateForm()) {
        alert(t("alert.requiredFields"))
        return
      }

      setIsSubmitting(true)

      try {
        const observation: Observation = {
          id: crypto.randomUUID(),
          number: `OBS-${Date.now().toString().slice(-6)}`,
          title: formData.title,
          type: formData.type,
          projectId: formData.projectId,
          creatorId: currentUser?.id || "unknown",
          assignedPersonId: currentUser?.id || "unknown",
          priority: formData.priority,
          status: "open",
          distribution: [],
          dueDate: null,
          completionDate: null,
          concernedCompany: formData.concernedCompany,
          description: formData.description,
          referenceArticle: formData.referenceArticle,
          attachments: files.map((file) => ({
            id: crypto.randomUUID(),
            name: file.name,
            type: file.type,
            size: file.size,
            url: URL.createObjectURL(file),
            uploadedAt: new Date(),
          })) as Attachment[],
          safetyAnalysis: formData.safetyAnalysis,
          createdAt: new Date(),
          updatedAt: new Date(),
          syncStatus: "pending",
        }

        addObservation(observation)
        
        // Show success message
        alert(t("alert.saveSuccess.observation"))
        router.push("/observations")
      } catch (error) {
        console.error("Error saving observation:", error)
        alert(t("alert.saveError.observation"))
      } finally {
        setIsSubmitting(false)
      }
    },
    [formData, files, validateForm, addObservation, currentUser, router],
  )

  const selectedType = observationTypes.find((t) => t.id === formData.type)
  const selectedProject = projects.find((p) => p.id === formData.projectId)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <FormHeader
        title={t("dashboard.newObservation")}
        description={t("observation.title")}
      />

      {/* Priority indicators */}
      <div className="grid grid-cols-3 gap-4">
        {(["low", "medium", "high"] as const).map((level) => (
          <Card
            key={level}
            className={`cursor-pointer transition-all ${
              formData.priority === level
                ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950"
                : "hover:border-blue-300"
            }`}
            onClick={() => setFormData((prev) => ({ ...prev, priority: level }))}
          >
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                {level === "low" && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                {level === "medium" && <AlertTriangle className="h-4 w-4 text-yellow-600" />}
                {level === "high" && <AlertTriangle className="h-4 w-4 text-red-600" />}
                <span className="capitalize font-medium">{t(`priority.${level}` as any)}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <FormSection title={t("observation.title")} defaultOpen>
          <FormField
            label={t("form.title")}
            name="title"
            placeholder={t("form.description")}
            value={formData.title}
            onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
            error={errors.title}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label={t("field.type")}
              name="type"
              as="select"
              value={formData.type}
              onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value }))}
              error={errors.type}
              required
            >
              <option value="">{t("inspection.selectType")}</option>
              {observationTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.label}
                </option>
              ))}
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
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </FormField>
          </div>

          <FormField
            label={t("field.location")}
            name="location"
            placeholder={t("form.description")}
            value={formData.location}
            onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
          />

          <FormField
            label={t("observation.concernedCompanyLabel")}
            name="concernedCompany"
            placeholder={t("observation.concernedCompanyPlaceholder")}
            value={formData.concernedCompany}
            onChange={(e) => setFormData((prev) => ({ ...prev, concernedCompany: e.target.value }))}
          />

          <FormField
            label={t("observation.referenceArticleLabel")}
            name="referenceArticle"
            placeholder={t("observation.referenceArticlePlaceholder")}
            value={formData.referenceArticle}
            onChange={(e) => setFormData((prev) => ({ ...prev, referenceArticle: e.target.value }))}
          />

          <FormField
            label={t("form.description")}
            name="description"
            as="textarea"
            placeholder={t("observation.descriptionPlaceholder")}
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            error={errors.description}
            rows={5}
            required
          />
        </FormSection>

        {/* Safety Analysis */}
          <FormSection title={t("observation.safetyAnalysis")} defaultOpen>
          <Alert className="mb-4 bg-blue-50 border-blue-200 dark:bg-blue-950">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {t("observation.safetyAnalysis")}
            </AlertDescription>
          </Alert>

          <FormField
            label={t("observation.danger")}
            name="danger"
            as="textarea"
            placeholder={t("form.description")}
            value={formData.safetyAnalysis.danger}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                safetyAnalysis: { ...prev.safetyAnalysis, danger: e.target.value },
              }))
            }
            error={errors.danger}
            rows={3}
            required
          />

          <FormField
            label={t("observation.contributingCondition")}
            name="condition"
            as="textarea"
            placeholder={t("form.description")}
            value={formData.safetyAnalysis.contributingCondition}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                safetyAnalysis: {
                  ...prev.safetyAnalysis,
                  contributingCondition: e.target.value,
                },
              }))
            }
            error={errors.condition}
            rows={3}
            required
          />

          <FormField
            label={t("observation.contributingBehavior")}
            name="behavior"
            as="textarea"
            placeholder={t("form.description")}
            value={formData.safetyAnalysis.contributingBehavior}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                safetyAnalysis: {
                  ...prev.safetyAnalysis,
                  contributingBehavior: e.target.value,
                },
              }))
            }
            error={errors.behavior}
            rows={3}
            required
          />
        </FormSection>

        {/* Attachments */}
        <FormSection title={t("form.attachments")}>
          <AttachmentUpload 
            onFilesSelected={setFiles}
            files={files}
          />
          {files.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="font-medium text-sm">{t("form.attachments")}</h4>
              {files.map((file, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-sm">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => setFiles((prev) => prev.filter((_, i) => i !== idx))}
                    className="text-xs text-red-600 hover:underline"
                  >
                    {t("form.delete")}
                  </button>
                </div>
              ))}
            </div>
          )}
        </FormSection>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-6">
          <Button
            type="submit"
            className="flex-1"
            disabled={isSubmitting}
          >
            {isSubmitting ? t("action.saving") : t("form.save")}
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
