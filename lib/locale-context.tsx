"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"

// Translation keys for the entire application
const translations = {
  en: {
    // Navigation
    "nav.dashboard": "Dashboard",
    "nav.inspections": "Inspections",
    "nav.observations": "Observations",
    "nav.incidents": "Incidents",
    "nav.settings": "Settings",

    // Dashboard
    "dashboard.title": "Construction Forms",
    "dashboard.subtitle": "Manage inspections, observations, and incidents",
    "dashboard.newInspection": "New Inspection",
    "dashboard.newObservation": "New Observation",
    "dashboard.newIncident": "New Incident",
    "dashboard.recentDrafts": "Recent Drafts",
    "dashboard.recentSubmissions": "Recent Submissions",
    "dashboard.viewAll": "View All",
    "dashboard.noDrafts": "No drafts yet",
    "dashboard.noSubmissions": "No submissions yet",

    // Status
    "status.online": "Online",
    "status.offline": "Offline",
    "status.syncing": "Syncing...",
    "status.savedLocally": "Saved locally",
    "status.syncedSuccessfully": "Synced successfully",
    "status.draft": "Draft",
    "status.submitted": "Submitted",
    "status.open": "Open",
    "status.closed": "Closed",
    "status.inProgress": "In Progress",
    "status.archived": "Archived",

    // Form common
    "form.save": "Save",
    "form.saveDraft": "Save Draft",
    "form.submit": "Submit",
    "form.cancel": "Cancel",
    "form.delete": "Delete",
    "form.required": "Required",
    "form.attachments": "Attachments",
    "form.addAttachment": "Add Attachment",
    "form.comments": "Comments",
    "form.description": "Description",
    "form.title": "Title",
    "form.project": "Project",
    "form.createdBy": "Created By",
    "form.distribution": "Distribution",
    "form.status": "Status",
    "form.priority": "Priority",
    "form.exportPdf": "Export PDF",

    // Priority levels
    "priority.low": "Low",
    "priority.medium": "Medium",
    "priority.high": "High",
    "priority.critical": "Critical",

    // Observation form
    "observation.title": "Observation Form",
    "observation.number": "Observation Number",
    "observation.type": "Type of Observation",
    "observation.assignedPerson": "Assigned Person",
    "observation.dueDate": "Corrective Action Due Date",
    "observation.completionDate": "Correction Completion Date",
    "observation.concernedCompany": "Concerned Company",
    "observation.referenceArticle": "Reference Article (CRTC)",
    "observation.safetyAnalysis": "Safety Analysis",
    "observation.danger": "Danger",
    "observation.contributingCondition": "Contributing Condition",
    "observation.contributingBehavior": "Contributing Behavior",

    // Incident form
    "incident.title": "Incident Form",
    "incident.number": "Incident Number",
    "incident.location": "Location",
    "incident.eventDate": "Event Date",
    "incident.eventTime": "Event Time",
    "incident.accidentType": "Type of Accident",
    "incident.investigation": "Investigation",
    "incident.medicalTreatment": "Medical Treatment",
    "incident.injuryType": "Injury Type",
    "incident.bodyPart": "Body Part Affected",
    "incident.emergencyTreatment": "Emergency Treatment",
    "incident.hospitalized": "Hospitalized Overnight",
    "incident.daysAbsent": "Days Absent",
    "incident.restrictedDays": "Restricted Work Days",
    "incident.returnDate": "Return to Work Date",
    "incident.dateOfDeath": "Date of Death",

    // Inspection form
    "inspection.title": "Inspection Form",
    "inspection.documentTitle": "Document Title",
    "inspection.type": "Type",
    "inspection.closedBy": "Closed By",
    "inspection.summary": "Inspection Summary",
    "inspection.articlesInspected": "Articles Inspected",
    "inspection.conforming": "Conforming",
    "inspection.nonConforming": "Non-Conforming",
    "inspection.notApplicable": "N/A",
    "inspection.sections": "Inspection Sections",
    "inspection.instruction": "If not applicable, select N/A for each item",

    // Inspection sections
    "inspection.section.ast": "Job Safety Analysis (AST)",
    "inspection.section.ppe": "PPE (Personal Protective Equipment)",
    "inspection.section.housekeeping": "Site Housekeeping",
    "inspection.section.fire": "Fire Protection",
    "inspection.section.scaffolding": "Scaffolding, Ladders, Step Ladders",
    "inspection.section.heights": "Working at Heights",
    "inspection.section.water": "Work on or Near Water",
    "inspection.section.lifting": "Lifting Equipment",
    "inspection.section.excavation": "Excavation and Trenches",
    "inspection.section.environment": "Environment",
    "inspection.section.misc": "Miscellaneous (Varia)",

    // Common actions
    "action.yes": "Yes",
    "action.no": "No",
    "action.back": "Back",
    "action.next": "Next",
    "action.close": "Close",
    "action.edit": "Edit",
    "action.view": "View",
    "action.search": "Search",
    "action.filter": "Filter",
    "action.new": "New",

    // Fields
    "field.type": "Type",
    "field.location": "Location",

    // Empty states
    "empty.noObservations": "No observations yet",
    "empty.createFirst": "Create the first observation to get started",

    // Time
    "time.today": "Today",
    "time.yesterday": "Yesterday",
    "time.daysAgo": "{days} days ago",
  },
  fr: {
    // Navigation
    "nav.dashboard": "Tableau de bord",
    "nav.inspections": "Inspections",
    "nav.observations": "Observations",
    "nav.incidents": "Incidents",
    "nav.settings": "Paramètres",

    // Dashboard
    "dashboard.title": "Formulaires de chantier",
    "dashboard.subtitle": "Gérer les inspections, observations et incidents",
    "dashboard.newInspection": "Nouvelle inspection",
    "dashboard.newObservation": "Nouvelle observation",
    "dashboard.newIncident": "Nouvel incident",
    "dashboard.recentDrafts": "Brouillons récents",
    "dashboard.recentSubmissions": "Soumissions récentes",
    "dashboard.viewAll": "Voir tout",
    "dashboard.noDrafts": "Aucun brouillon",
    "dashboard.noSubmissions": "Aucune soumission",

    // Status
    "status.online": "En ligne",
    "status.offline": "Hors ligne",
    "status.syncing": "Synchronisation...",
    "status.savedLocally": "Sauvegardé localement",
    "status.syncedSuccessfully": "Synchronisé avec succès",
    "status.draft": "Brouillon",
    "status.submitted": "Soumis",
    "status.open": "Ouvert",
    "status.closed": "Fermé",
    "status.inProgress": "En cours",
    "status.archived": "Archivé",

    // Form common
    "form.save": "Enregistrer",
    "form.saveDraft": "Enregistrer le brouillon",
    "form.submit": "Soumettre",
    "form.cancel": "Annuler",
    "form.delete": "Supprimer",
    "form.required": "Obligatoire",
    "form.attachments": "Pièces jointes",
    "form.addAttachment": "Ajouter une pièce jointe",
    "form.comments": "Commentaires",
    "form.description": "Description",
    "form.title": "Titre",
    "form.project": "Projet",
    "form.createdBy": "Créé par",
    "form.distribution": "Distribution",
    "form.status": "Statut",
    "form.priority": "Priorité",
    "form.exportPdf": "Exporter PDF",

    // Priority levels
    "priority.low": "Faible",
    "priority.medium": "Moyen",
    "priority.high": "Élevé",
    "priority.critical": "Critique",

    // Observation form
    "observation.title": "Formulaire d'observation",
    "observation.number": "Numéro d'observation",
    "observation.type": "Type d'observation",
    "observation.assignedPerson": "Personne assignée",
    "observation.dueDate": "Date d'échéance de l'action corrective",
    "observation.completionDate": "Date de complétion de la correction",
    "observation.concernedCompany": "Entreprise concernée",
    "observation.referenceArticle": "Article de référence (CRTC)",
    "observation.safetyAnalysis": "Analyse de sécurité",
    "observation.danger": "Danger",
    "observation.contributingCondition": "Condition contributive",
    "observation.contributingBehavior": "Comportement contributif",

    // Incident form
    "incident.title": "Formulaire d'incident",
    "incident.number": "Numéro d'incident",
    "incident.location": "Emplacement",
    "incident.eventDate": "Date de l'événement",
    "incident.eventTime": "Heure de l'événement",
    "incident.accidentType": "Type d'accident",
    "incident.investigation": "Enquête",
    "incident.medicalTreatment": "Traitement médical",
    "incident.injuryType": "Type de blessure",
    "incident.bodyPart": "Partie du corps affectée",
    "incident.emergencyTreatment": "Traitement d'urgence",
    "incident.hospitalized": "Hospitalisé pendant la nuit",
    "incident.daysAbsent": "Jours d'absence",
    "incident.restrictedDays": "Jours de travail restreint",
    "incident.returnDate": "Date de retour au travail",
    "incident.dateOfDeath": "Date de décès",

    // Inspection form
    "inspection.title": "Formulaire d'inspection",
    "inspection.documentTitle": "Titre du document",
    "inspection.type": "Type",
    "inspection.closedBy": "Fermé par",
    "inspection.summary": "Résumé de l'inspection",
    "inspection.articlesInspected": "Articles inspectés",
    "inspection.conforming": "Conforme",
    "inspection.nonConforming": "Non-conforme",
    "inspection.notApplicable": "S.O.",
    "inspection.sections": "Sections d'inspection",
    "inspection.instruction": "Si non applicable, sélectionnez S.O. pour chaque élément",

    // Inspection sections
    "inspection.section.ast": "Analyse de sécurité des tâches (AST)",
    "inspection.section.ppe": "ÉPI (Équipement de Protection Individuelle)",
    "inspection.section.housekeeping": "Entretien du site",
    "inspection.section.fire": "Protection incendie",
    "inspection.section.scaffolding": "Échafaudages, Échelles, Escabeaux",
    "inspection.section.heights": "Travail en hauteur",
    "inspection.section.water": "Travail sur ou près de l'eau",
    "inspection.section.lifting": "Équipement de levage",
    "inspection.section.excavation": "Excavation et tranchées",
    "inspection.section.environment": "Environnement",
    "inspection.section.misc": "Divers (Varia)",

    // Common actions
    "action.yes": "Oui",
    "action.no": "Non",
    "action.back": "Retour",
    "action.next": "Suivant",
    "action.close": "Fermer",
    "action.edit": "Modifier",
    "action.view": "Voir",
    "action.search": "Rechercher",
    "action.filter": "Filtrer",
    "action.new": "Nouveau",

    // Fields
    "field.type": "Type",
    "field.location": "Emplacement",

    // Empty states
    "empty.noObservations": "Aucune observation",
    "empty.createFirst": "Créez la première observation pour commencer",

    // Time
    "time.today": "Aujourd'hui",
    "time.yesterday": "Hier",
    "time.daysAgo": "Il y a {days} jours",
  },
} as const

type Locale = "en" | "fr"
type TranslationKey = keyof typeof translations.en

interface LocaleContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: TranslationKey, params?: Record<string, string | number>) => string
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined)

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("fr")

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>) => {
      let text = translations[locale][key] || translations.en[key] || key

      if (params) {
        Object.entries(params).forEach(([paramKey, value]) => {
          text = text.replace(`{${paramKey}}`, String(value))
        })
      }

      return text
    },
    [locale],
  )

  return <LocaleContext.Provider value={{ locale, setLocale, t }}>{children}</LocaleContext.Provider>
}

export function useLocale() {
  const context = useContext(LocaleContext)
  if (!context) {
    throw new Error("useLocale must be used within a LocaleProvider")
  }
  return context
}
