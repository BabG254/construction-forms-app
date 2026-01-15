"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { AppShell } from "@/components/app-shell"
import { FormHeader } from "@/components/forms/form-header"
import { FormSection } from "@/components/forms/form-section"
import { FormField } from "@/components/forms/form-field"
import { AttachmentUpload } from "@/components/forms/attachment-upload"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLocale } from "@/lib/locale-context"
import { useAppStore } from "@/lib/store"
import type { Observation, Attachment, Priority, FormStatus } from "@/lib/types"

const observationTypes = [
  "Unsafe Act",
  "Unsafe Condition",
  "Environmental",
  "Quality",
  "Positive Observation",
  "Near Miss",
]

export default function NewObservationPage() {
  const router = useRouter()
  const { t } = useLocale()
  const { projects, users, currentUser, addObservation } = useAppStore()

  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    type: "",
    projectId: "",
    assignedPersonId: "",
    priority: "medium" as Priority,
    distribution: [] as string[],
    dueDate: "",
    completionDate: "",
    concernedCompany: "",
    description: "",
    referenceArticle: "",
    attachments: [] as Attachment[],
    danger: "",
    contributingCondition: "",
    contributingBehavior: "",
  })

  const generateObservationNumber = () => {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")
    return `OBS-${year}${month}-${random}`
  }

  const handleSaveDraft = useCallback(async () => {
    setIsSaving(true)
    try {
      const observation: Observation = {
        id: Math.random().toString(36).substring(7),
        number: generateObservationNumber(),
        title: formData.title,
        type: formData.type,
        projectId: formData.projectId,
        creatorId: currentUser?.id || "",
        assignedPersonId: formData.assignedPersonId,
        priority: formData.priority,
        status: "draft" as FormStatus,
        distribution: formData.distribution,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : null,
        completionDate: formData.completionDate ? new Date(formData.completionDate) : null,
        concernedCompany: formData.concernedCompany,
        description: formData.description,
        referenceArticle: formData.referenceArticle,
        attachments: formData.attachments,
        safetyAnalysis: {
          danger: formData.danger,
          contributingCondition: formData.contributingCondition,
          contributingBehavior: formData.contributingBehavior,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        syncStatus: "pending",
      }
      addObservation(observation)
      toast.success(t("status.savedLocally"))
      router.push("/observations")
    } finally {
      setIsSaving(false)
    }
  }, [formData, currentUser, addObservation, router, t])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setIsSaving(true)
      try {
        const observation: Observation = {
          id: Math.random().toString(36).substring(7),
          number: generateObservationNumber(),
          title: formData.title,
          type: formData.type,
          projectId: formData.projectId,
          creatorId: currentUser?.id || "",
          assignedPersonId: formData.assignedPersonId,
          priority: formData.priority,
          status: "submitted" as FormStatus,
          distribution: formData.distribution,
          dueDate: formData.dueDate ? new Date(formData.dueDate) : null,
          completionDate: formData.completionDate ? new Date(formData.completionDate) : null,
          concernedCompany: formData.concernedCompany,
          description: formData.description,
          referenceArticle: formData.referenceArticle,
          attachments: formData.attachments,
          safetyAnalysis: {
            danger: formData.danger,
            contributingCondition: formData.contributingCondition,
            contributingBehavior: formData.contributingBehavior,
          },
          createdAt: new Date(),
          updatedAt: new Date(),
          syncStatus: "pending",
        }
        addObservation(observation)
        toast.success("Observation submitted successfully")
        router.push("/observations")
      } finally {
        setIsSaving(false)
      }
    },
    [formData, currentUser, addObservation, router],
  )

  return (
    <AppShell>
      <FormHeader
        title={t("observation.title")}
        backHref="/observations"
        onSaveDraft={handleSaveDraft}
        isSaving={isSaving}
      />

      <form onSubmit={handleSubmit} className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
        {/* Basic Information */}
        <FormSection title="Basic Information" collapsible={false}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label={t("form.title")} required className="md:col-span-2">
              <Input
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Enter observation title"
                className="h-12"
              />
            </FormField>

            <FormField label={t("observation.type")} required>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value }))}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {observationTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

            <FormField label={t("observation.assignedPerson")}>
              <Select
                value={formData.assignedPersonId}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, assignedPersonId: value }))}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select person" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label={t("form.priority")} required>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, priority: value as Priority }))}
              >
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">{t("priority.low")}</SelectItem>
                  <SelectItem value="medium">{t("priority.medium")}</SelectItem>
                  <SelectItem value="high">{t("priority.high")}</SelectItem>
                  <SelectItem value="critical">{t("priority.critical")}</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            <FormField label={t("observation.concernedCompany")}>
              <Input
                value={formData.concernedCompany}
                onChange={(e) => setFormData((prev) => ({ ...prev, concernedCompany: e.target.value }))}
                placeholder="Enter company name"
                className="h-12"
              />
            </FormField>

            <FormField label={t("observation.dueDate")}>
              <Input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, dueDate: e.target.value }))}
                className="h-12"
              />
            </FormField>
          </div>
        </FormSection>

        {/* Description */}
        <FormSection title={t("form.description")}>
          <FormField label={t("form.description")} required>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the observation in detail..."
              rows={6}
              className="min-h-[120px]"
            />
          </FormField>

          <FormField label={t("observation.referenceArticle")} className="mt-4">
            <Input
              value={formData.referenceArticle}
              onChange={(e) => setFormData((prev) => ({ ...prev, referenceArticle: e.target.value }))}
              placeholder="Enter reference article (CRTC)"
              className="h-12"
            />
          </FormField>
        </FormSection>

        {/* Safety Analysis */}
        <FormSection title={t("observation.safetyAnalysis")}>
          <div className="space-y-4">
            <FormField label={t("observation.danger")}>
              <Textarea
                value={formData.danger}
                onChange={(e) => setFormData((prev) => ({ ...prev, danger: e.target.value }))}
                placeholder="Describe the danger identified..."
                rows={3}
              />
            </FormField>

            <FormField label={t("observation.contributingCondition")}>
              <Textarea
                value={formData.contributingCondition}
                onChange={(e) => setFormData((prev) => ({ ...prev, contributingCondition: e.target.value }))}
                placeholder="Describe contributing conditions..."
                rows={3}
              />
            </FormField>

            <FormField label={t("observation.contributingBehavior")}>
              <Textarea
                value={formData.contributingBehavior}
                onChange={(e) => setFormData((prev) => ({ ...prev, contributingBehavior: e.target.value }))}
                placeholder="Describe contributing behaviors..."
                rows={3}
              />
            </FormField>
          </div>
        </FormSection>

        {/* Attachments */}
        <FormSection title={t("form.attachments")}>
          <AttachmentUpload
            attachments={formData.attachments}
            onChange={(attachments) => setFormData((prev) => ({ ...prev, attachments }))}
          />
        </FormSection>

        {/* Submit */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button type="button" variant="outline" onClick={() => router.push("/observations")} className="h-12 flex-1">
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
