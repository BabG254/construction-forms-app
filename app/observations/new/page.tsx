"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { FormHeader, FormSection, FormField, AttachmentUpload } from "@/components/forms"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { useAppStore } from "@/lib/store"
import { getObservationTypes } from "@/lib/reference-data-loader"
import { AlertTriangle, CheckCircle2 } from "lucide-react"
import type { Observation, Attachment } from "@/lib/types"

export default function NewObservation() {
  const router = useRouter()
  const { addObservation, projects, currentUser } = useAppStore()
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
  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) newErrors.title = "Title is required"
    if (!formData.type) newErrors.type = "Observation type is required"
    if (!formData.projectId) newErrors.projectId = "Project is required"
    if (!formData.description.trim()) newErrors.description = "Description is required"
    if (!formData.safetyAnalysis.danger.trim()) newErrors.danger = "Danger/Hazard is required"
    if (!formData.safetyAnalysis.contributingCondition.trim()) 
      newErrors.condition = "Contributing condition is required"
    if (!formData.safetyAnalysis.contributingBehavior.trim()) 
      newErrors.behavior = "Contributing behavior is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      
      if (!validateForm()) {
        alert("Please fill in all required fields")
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
        alert("Observation saved successfully!")
        router.push("/observations")
      } catch (error) {
        console.error("Error saving observation:", error)
        alert("Error saving observation. Please try again.")
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
        title="New Observation"
        description="Record a site observation or concern"
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
                <span className="capitalize font-medium">{level}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <FormSection title="Observation Details" defaultOpen>
          <FormField
            label="Title"
            name="title"
            placeholder="Brief observation summary"
            value={formData.title}
            onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
            error={errors.title}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Type"
              name="type"
              as="select"
              value={formData.type}
              onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value }))}
              error={errors.type}
              required
            >
              <option value="">Select type...</option>
              {observationTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.label}
                </option>
              ))}
            </FormField>

            <FormField
              label="Project"
              name="projectId"
              as="select"
              value={formData.projectId}
              onChange={(e) => setFormData((prev) => ({ ...prev, projectId: e.target.value }))}
              error={errors.projectId}
              required
            >
              <option value="">Select project...</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </FormField>
          </div>

          <FormField
            label="Location on Site"
            name="location"
            placeholder="Area or zone where observation was made"
            value={formData.location}
            onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
          />

          <FormField
            label="Concerned Company/Contractor"
            name="concernedCompany"
            placeholder="Company responsible for the area"
            value={formData.concernedCompany}
            onChange={(e) => setFormData((prev) => ({ ...prev, concernedCompany: e.target.value }))}
          />

          <FormField
            label="Reference Article/Standard"
            name="referenceArticle"
            placeholder="Relevant regulation or safety standard"
            value={formData.referenceArticle}
            onChange={(e) => setFormData((prev) => ({ ...prev, referenceArticle: e.target.value }))}
          />

          <FormField
            label="Description"
            name="description"
            as="textarea"
            placeholder="Detailed description of the observation"
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            error={errors.description}
            rows={5}
            required
          />
        </FormSection>

        {/* Safety Analysis */}
        <FormSection title="Safety Analysis" defaultOpen>
          <Alert className="mb-4 bg-blue-50 border-blue-200 dark:bg-blue-950">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Analyze the hazard, conditions, and behaviors that created this observation.
            </AlertDescription>
          </Alert>

          <FormField
            label="Danger/Hazard Identified"
            name="danger"
            as="textarea"
            placeholder="What is the potential danger?"
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
            label="Contributing Condition"
            name="condition"
            as="textarea"
            placeholder="Environmental or physical conditions that contributed"
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
            label="Contributing Behavior"
            name="behavior"
            as="textarea"
            placeholder="Worker actions or behavioral factors"
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
        <FormSection title="Attachments">
          <AttachmentUpload 
            onFilesSelected={setFiles}
            files={files}
          />
          {files.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="font-medium text-sm">Selected Files:</h4>
              {files.map((file, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-sm">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => setFiles((prev) => prev.filter((_, i) => i !== idx))}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Remove
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
            {isSubmitting ? "Saving..." : "Save Observation"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
