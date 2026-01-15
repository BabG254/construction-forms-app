"use client"

import type React from "react"

import { useState, useCallback, useMemo } from "react"
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
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, CheckCircle2, Clock } from "lucide-react"
import { useLocale } from "@/lib/locale-context"
import { useAppStore } from "@/lib/store"
import { getAccidentTypes, getInjuryTypes, getBodyParts } from "@/lib/reference-data-loader"
import type { Incident, Attachment, FormStatus } from "@/lib/types"

// Load reference data
const accidentTypes = getAccidentTypes()
const injuryTypes = getInjuryTypes()
const bodyParts = getBodyParts()

export default function NewIncidentPage() {
  const router = useRouter()
  const { t } = useLocale()
  const { projects, currentUser, addIncident } = useAppStore()

  // Form state
  const [isSaving, setIsSaving] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasMedicalTreatment, setHasMedicalTreatment] = useState(false)
  const [isFatal, setIsFatal] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["incident-info"]))

  // Form data with proper typing
  const [formData, setFormData] = useState({
    // Basic Info
    title: "",
    projectId: "",
    location: "",
    eventDate: "",
    eventTime: "",
    accidentType: "",
    concernedCompany: "",
    
    // Description
    description: "",
    
    // Investigation
    danger: "",
    contributingCondition: "",
    contributingBehavior: "",
    
    // Medical Treatment (optional)
    injuryType: "",
    bodyPart: "",
    emergencyTreatment: false,
    hospitalizedOvernight: false,
    daysAbsent: 0,
    restrictedWorkDays: 0,
    returnToWorkDate: "",
    dateOfDeath: "",
    
    // Attachments
    attachments: [] as Attachment[],
  })

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Memoized body parts grouped by category
  const bodyPartsByCategory = useMemo(() => {
    const grouped = {
      upper: bodyParts.filter((p) => p.category === "upper"),
      torso: bodyParts.filter((p) => p.category === "torso"),
      lower: bodyParts.filter((p) => p.category === "lower"),
      other: bodyParts.filter((p) => p.category === "other"),
    }
    return grouped
  }, [])

  // Validation logic
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {}

    // Required fields validation
    if (!formData.title?.trim()) {
      newErrors.title = t("error.incidentTitleRequired")
    }
    if (!formData.projectId) {
      newErrors.projectId = t("error.projectRequired")
    }
    if (!formData.location?.trim()) {
      newErrors.location = t("error.locationRequired")
    }
    if (!formData.eventDate) {
      newErrors.eventDate = t("error.eventDateRequired")
    }
    if (!formData.eventTime) {
      newErrors.eventTime = t("error.eventTimeRequired")
    }
    if (!formData.accidentType) {
      newErrors.accidentType = t("error.accidentTypeRequired")
    }
    if (!formData.description?.trim()) {
      newErrors.description = t("error.descriptionRequired")
    }

    // Medical treatment validation
    if (hasMedicalTreatment) {
      if (!formData.injuryType) {
        newErrors.injuryType = t("error.injuryTypeRequired")
      }
      if (!formData.bodyPart) {
        newErrors.bodyPart = t("error.bodyPartRequired")
      }
      if (isFatal && !formData.dateOfDeath) {
        newErrors.dateOfDeath = t("error.dateOfDeathRequired")
      }
      if (!isFatal && !formData.returnToWorkDate && formData.daysAbsent > 0) {
        newErrors.returnToWorkDate = t("error.returnToWorkDateRequired")
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData, hasMedicalTreatment, isFatal])

  const generateIncidentNumber = useCallback((): string => {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")
    return `INC-${year}${month}-${random}`
  }, [])

  const createIncidentObject = useCallback(
    (status: FormStatus): Incident => {
      return {
        id: Math.random().toString(36).substring(7),
        number: generateIncidentNumber(),
        title: formData.title,
        projectId: formData.projectId,
        creatorId: currentUser?.id || "",
        location: formData.location,
        eventDate: new Date(formData.eventDate),
        eventTime: formData.eventTime,
        accidentType: formData.accidentType,
        status,
        distribution: [],
        concernedCompany: formData.concernedCompany,
        description: formData.description,
        attachments: formData.attachments,
        investigation: {
          danger: formData.danger,
          contributingCondition: formData.contributingCondition,
          contributingBehavior: formData.contributingBehavior,
        },
        medicalTreatment: hasMedicalTreatment
          ? {
              injuryType: formData.injuryType,
              bodyPart: formData.bodyPart,
              emergencyTreatment: formData.emergencyTreatment,
              hospitalizedOvernight: formData.hospitalizedOvernight,
              daysAbsent: formData.daysAbsent,
              restrictedWorkDays: formData.restrictedWorkDays,
              returnToWorkDate: formData.returnToWorkDate ? new Date(formData.returnToWorkDate) : null,
              dateOfDeath: isFatal && formData.dateOfDeath ? new Date(formData.dateOfDeath) : null,
            }
          : null,
        createdAt: new Date(),
        updatedAt: new Date(),
        syncStatus: "pending",
      }
    },
    [formData, currentUser, hasMedicalTreatment, isFatal, generateIncidentNumber]
  )

  const handleSaveDraft = useCallback(async () => {
    setIsSaving(true)
    try {
      const incident = createIncidentObject("draft")
      addIncident(incident)
      toast.success(t("status.savedLocally"))
      router.push("/incidents")
    } catch (error) {
      toast.error(t("alert.saveDraft.error"))
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }, [createIncidentObject, addIncident, router, t])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      if (!validateForm()) {
        toast.error(t("alert.fixErrors"))
        return
      }

      setIsSubmitting(true)
      try {
        const incident = createIncidentObject("submitted")
        addIncident(incident)
        toast.success(t("alert.saveSuccess.incident"))
        router.push("/incidents")
      } catch (error) {
        toast.error(t("alert.saveError.incident"))
        console.error(error)
      } finally {
        setIsSubmitting(false)
      }
    },
    [validateForm, createIncidentObject, addIncident, router]
  )

  const handleFieldChange = useCallback(
    (field: string, value: any) => {
      setFormData((prev) => ({ ...prev, [field]: value }))
      // Clear error for this field when user starts typing
      if (errors[field]) {
        setErrors((prev) => {
          const updated = { ...prev }
          delete updated[field]
          return updated
        })
      }
    },
    [errors]
  )

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const updated = new Set(prev)
      if (updated.has(sectionId)) {
        updated.delete(sectionId)
      } else {
        updated.add(sectionId)
      }
      return updated
    })
  }

  const getAccidentTypeDescription = (typeId: string) => {
    return accidentTypes.find((t) => t.id === typeId)?.description || ""
  }

  const getInjuryTypeSeverity = (typeId: string) => {
    const injury = injuryTypes.find((i) => i.id === typeId)
    return injury?.severity
  }

  return (
    <AppShell>
      <FormHeader title={t("incident.title")} backHref="/incidents" onSaveDraft={handleSaveDraft} isSaving={isSaving} />

      <form onSubmit={handleSubmit} className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
        {/* Critical Incident Alert */}
        {formData.accidentType &&
          accidentTypes.find((t) => t.id === formData.accidentType)?.riskLevel === "critical" && (
            <Alert className="border-destructive/50 bg-destructive/10">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <AlertDescription className="text-destructive ml-2">
                This is a CRITICAL incident type. Ensure all required fields are completed accurately. Management will
                be notified immediately.
              </AlertDescription>
            </Alert>
          )}

        {/* Basic Information Section */}
        <FormSection
          title="Incident Information"
          collapsible={true}
          defaultOpen={expandedSections.has("incident-info")}
          onToggle={() => toggleSection("incident-info")}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <FormField
              label={t("form.title")}
              required
              className="md:col-span-2"
              error={errors.title}
            >
              <Input
                value={formData.title}
                onChange={(e) => handleFieldChange("title", e.target.value)}
                placeholder={t("incident.titlePlaceholder")}
                className={`h-12 ${errors.title ? "border-destructive" : ""}`}
              />
            </FormField>

            {/* Project */}
            <FormField label={t("form.project")} required error={errors.projectId}>
              <Select value={formData.projectId} onValueChange={(value) => handleFieldChange("projectId", value)}>
                <SelectTrigger className={`h-12 ${errors.projectId ? "border-destructive" : ""}`}>
                  <SelectValue placeholder={t("incident.selectProject")} />
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

            {/* Location */}
            <FormField label={t("incident.location")} required error={errors.location}>
              <Input
                value={formData.location}
                onChange={(e) => handleFieldChange("location", e.target.value)}
                placeholder={t("incident.locationPlaceholder")}
                className={`h-12 ${errors.location ? "border-destructive" : ""}`}
              />
            </FormField>

            {/* Event Date */}
            <FormField label={t("incident.eventDate")} required error={errors.eventDate}>
              <Input
                type="date"
                value={formData.eventDate}
                onChange={(e) => handleFieldChange("eventDate", e.target.value)}
                className={`h-12 ${errors.eventDate ? "border-destructive" : ""}`}
              />
            </FormField>

            {/* Event Time */}
            <FormField label={t("incident.eventTime")} required error={errors.eventTime}>
              <Input
                type="time"
                value={formData.eventTime}
                onChange={(e) => handleFieldChange("eventTime", e.target.value)}
                className={`h-12 ${errors.eventTime ? "border-destructive" : ""}`}
              />
            </FormField>

            {/* Accident Type */}
            <FormField label={t("incident.accidentType")} required error={errors.accidentType}>
              <Select value={formData.accidentType} onValueChange={(value) => handleFieldChange("accidentType", value)}>
                <SelectTrigger className={`h-12 ${errors.accidentType ? "border-destructive" : ""}`}>
                  <SelectValue placeholder={t("incident.selectAccidentType")} />
                </SelectTrigger>
                <SelectContent>
                  {accidentTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      <div className="flex items-center gap-2">
                        <span>{type.label}</span>
                        {type.riskLevel === "critical" && (
                          <span className="text-xs bg-destructive/20 text-destructive px-2 py-1 rounded">{t("incident.critical")}</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formData.accidentType && (
                <p className="text-sm text-muted-foreground mt-1">{getAccidentTypeDescription(formData.accidentType)}</p>
              )}
            </FormField>

            {/* Concerned Company */}
            <FormField label={t("observation.concernedCompany")}>
              <Input
                value={formData.concernedCompany}
                onChange={(e) => handleFieldChange("concernedCompany", e.target.value)}
                placeholder={t("incident.concernedCompanyPlaceholder")}
                className="h-12"
              />
            </FormField>
          </div>
        </FormSection>

        {/* Description Section */}
        <FormSection
          title={t("form.description")}
          collapsible={true}
          defaultOpen={expandedSections.has("description")}
          onToggle={() => toggleSection("description")}
        >
          <FormField
            label={t("incident.whatHappened")}
            required
            error={errors.description}
            description={t("incident.whatHappenedDesc")}
          >
            <Textarea
              value={formData.description}
              onChange={(e) => handleFieldChange("description", e.target.value)}
              placeholder={t("incident.descriptionPlaceholder")}
              rows={8}
              className={`min-h-[200px] ${errors.description ? "border-destructive" : ""}`}
            />
          </FormField>
        </FormSection>

        {/* Investigation Section */}
        <FormSection
          title={t("incident.investigation")}
          collapsible={true}
          defaultOpen={expandedSections.has("investigation")}
          onToggle={() => toggleSection("investigation")}
          description={t("incident.investigationDesc")}
        >
          <div className="space-y-4">
            <FormField
              label={t("observation.danger")}
              description={t("incident.dangerDesc")}
            >
              <Textarea
                value={formData.danger}
                onChange={(e) => handleFieldChange("danger", e.target.value)}
                placeholder={t("incident.dangerPlaceholder")}
                rows={3}
              />
            </FormField>

            <FormField
              label={t("observation.contributingCondition")}
              description={t("incident.contributingConditionDesc")}
            >
              <Textarea
                value={formData.contributingCondition}
                onChange={(e) => handleFieldChange("contributingCondition", e.target.value)}
                placeholder={t("incident.contributingConditionPlaceholder")}
                rows={3}
              />
            </FormField>

            <FormField
              label={t("observation.contributingBehavior")}
              description={t("incident.contributingBehaviorDesc")}
            >
              <Textarea
                value={formData.contributingBehavior}
                onChange={(e) => handleFieldChange("contributingBehavior", e.target.value)}
                placeholder={t("incident.contributingBehaviorPlaceholder")}
                rows={3}
              />
            </FormField>
          </div>
        </FormSection>

        {/* Medical Treatment Section */}
        <FormSection
          title={t("incident.medicalTreatment")}
          collapsible={true}
          defaultOpen={expandedSections.has("medical") || hasMedicalTreatment}
          onToggle={() => toggleSection("medical")}
          description={t("incident.medicalTreatmentDesc")}
        >
          <div className="space-y-6">
            {/* Medical Treatment Toggle */}
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border">
              <div>
                <Label htmlFor="hasMedical" className="font-semibold cursor-pointer">
                  {t("incident.medicalTreatmentLabel")}
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("incident.medicalTreatmentInfo")}
                </p>
              </div>
              <Switch
                id="hasMedical"
                checked={hasMedicalTreatment}
                onCheckedChange={setHasMedicalTreatment}
              />
            </div>

            {hasMedicalTreatment && (
              <div className="space-y-6 animate-in fade-in-50 duration-300">
                {/* Injury Type and Body Part */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label={t("incident.injuryType")}
                    required
                    error={errors.injuryType}
                    description={t("incident.selectInjuryTypeDesc")}
                  >
                    <Select
                      value={formData.injuryType}
                      onValueChange={(value) => {
                        handleFieldChange("injuryType", value)
                        setIsFatal(value === "fatal")
                      }}
                    >
                      <SelectTrigger className={`h-12 ${errors.injuryType ? "border-destructive" : ""}`}>
                        <SelectValue placeholder={t("incident.selectInjuryType")} />
                      </SelectTrigger>
                      <SelectContent>
                        {injuryTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            <div className="flex items-center gap-2">
                              <span>{type.label}</span>
                              {type.severity === "critical" && (
                                <span className="text-xs bg-destructive/20 text-destructive px-1 rounded">
                                  {t("incident.critical")}
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formData.injuryType && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {t("incident.severity")}: {getInjuryTypeSeverity(formData.injuryType) || t("incident.unknown")}
                      </p>
                    )}
                  </FormField>

                  <FormField
                    label={t("incident.bodyPart")}
                    required
                    error={errors.bodyPart}
                    description={t("incident.selectBodyPartDesc")}
                  >
                    <Select value={formData.bodyPart} onValueChange={(value) => handleFieldChange("bodyPart", value)}>
                      <SelectTrigger className={`h-12 ${errors.bodyPart ? "border-destructive" : ""}`}>
                        <SelectValue placeholder={t("incident.selectBodyPart")} />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(bodyPartsByCategory).map(([category, parts]) => (
                          <div key={category}>
                            <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                              {category.charAt(0).toUpperCase() + category.slice(1)}
                            </div>
                            {parts.map((part) => (
                              <SelectItem key={part.id} value={part.id}>
                                {part.label}
                              </SelectItem>
                            ))}
                          </div>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>
                </div>

                {/* Treatment Details - Toggles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border">
                    <div>
                      <Label htmlFor="emergency" className="font-semibold cursor-pointer">
                        {t("incident.emergencyTreatment")}
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">First aid or emergency services provided</p>
                    </div>
                    <Switch
                      id="emergency"
                      checked={formData.emergencyTreatment}
                      onCheckedChange={(checked) => handleFieldChange("emergencyTreatment", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border">
                    <div>
                      <Label htmlFor="hospitalized" className="font-semibold cursor-pointer">
                        {t("incident.hospitalized")}
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">Admitted to hospital overnight or longer</p>
                    </div>
                    <Switch
                      id="hospitalized"
                      checked={formData.hospitalizedOvernight}
                      onCheckedChange={(checked) => handleFieldChange("hospitalizedOvernight", checked)}
                    />
                  </div>
                </div>

                {/* Work Impact */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label={t("incident.daysAbsent")}
                    description={t("incident.daysAbsentDesc")}
                  >
                    <Input
                      type="number"
                      min="0"
                      max="365"
                      value={formData.daysAbsent}
                      onChange={(e) => handleFieldChange("daysAbsent", Math.max(0, Number.parseInt(e.target.value) || 0))}
                      className="h-12"
                    />
                  </FormField>

                  <FormField
                    label={t("incident.restrictedDays")}
                    description={t("incident.restrictedDaysDesc")}
                  >
                    <Input
                      type="number"
                      min="0"
                      max="365"
                      value={formData.restrictedWorkDays}
                      onChange={(e) =>
                        handleFieldChange("restrictedWorkDays", Math.max(0, Number.parseInt(e.target.value) || 0))
                      }
                      className="h-12"
                    />
                  </FormField>
                </div>

                {/* Return to Work or Fatal Outcome */}
                {!isFatal && (
                  <FormField
                    label={t("incident.returnDate")}
                    description={t("incident.returnDateDesc")}
                    error={errors.returnToWorkDate}
                  >
                    <Input
                      type="date"
                      value={formData.returnToWorkDate}
                      onChange={(e) => handleFieldChange("returnToWorkDate", e.target.value)}
                      className={`h-12 ${errors.returnToWorkDate ? "border-destructive" : ""}`}
                    />
                  </FormField>
                )}

                {isFatal && (
                  <Alert className="border-destructive/50 bg-destructive/10">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    <AlertDescription className="text-destructive ml-2">
                      This is a fatal incident. Management and regulatory authorities must be notified immediately.
                      Please provide accurate information.
                    </AlertDescription>
                  </Alert>
                )}

                {isFatal && (
                  <FormField
                    label={t("incident.dateOfDeath")}
                    required
                    error={errors.dateOfDeath}
                    description={t("incident.dateOfDeathDesc")}
                  >
                    <Input
                      type="date"
                      value={formData.dateOfDeath}
                      onChange={(e) => handleFieldChange("dateOfDeath", e.target.value)}
                      className={`h-12 ${errors.dateOfDeath ? "border-destructive" : ""}`}
                    />
                  </FormField>
                )}
              </div>
            )}
          </div>
        </FormSection>

        {/* Attachments Section */}
        <FormSection
          title={t("form.attachments")}
          collapsible={true}
          defaultOpen={expandedSections.has("attachments")}
          onToggle={() => toggleSection("attachments")}
          description={t("incident.attachmentsDesc")}
        >
          <AttachmentUpload
            attachments={formData.attachments}
            onChange={(attachments) => handleFieldChange("attachments", attachments)}
          />
        </FormSection>

        {/* Form Summary & Status */}
        <div className="bg-muted/50 rounded-lg p-4 border border-border">
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">Form Status</p>
              <p className="text-sm text-muted-foreground mt-1">
                This form will be saved locally to IndexedDB. When you submit, it will be marked as pending sync.
                Once online connectivity is restored, it will automatically sync to the server.
              </p>
            </div>
          </div>
        </div>

        {/* Submit Button Group */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/incidents")}
            className="h-12 flex-1"
            disabled={isSaving || isSubmitting}
          >
            {t("form.cancel")}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={handleSaveDraft}
            className="h-12 flex-1"
            disabled={isSaving || isSubmitting}
          >
            {isSaving ? "Saving..." : "Save as Draft"}
          </Button>
          <Button
            type="submit"
            className="h-12 flex-1"
            disabled={isSaving || isSubmitting}
          >
            {isSubmitting ? "Submitting..." : t("form.submit")}
          </Button>
        </div>
      </form>
    </AppShell>
  )
}
