"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"

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
    "section.details": "Details",

    // Generic
    "common.updated": "Updated {distance}",
    "units.days": "{count} days",

    // Not found
    "empty.notFound.observation": "Observation not found",
    "empty.notFound.inspection": "Inspection not found",
    "empty.notFound.incident": "Incident not found",

    // Settings
    "settings.syncStatus": "Sync Status",
    "settings.syncStatus.desc": "Monitor your data synchronization status",
    "settings.totalForms": "Total Forms",
    "settings.pendingSync": "Pending Sync",
    "settings.language": "Language",
    "settings.language.desc": "Choose your preferred language for the application",
    "settings.applicationLanguage": "Application Language",
    "settings.notifications": "Notifications",
    "settings.notifications.desc": "Configure how you receive updates",
    "settings.pushNotifications": "Push Notifications",
    "settings.pushNotifications.desc": "Receive alerts for new assignments",
    "settings.syncAlerts": "Sync Alerts",
    "settings.syncAlerts.desc": "Get notified when sync completes",
    "settings.appearance": "Appearance",
    "settings.appearance.desc": "Customize the visual appearance",
    "settings.theme": "Theme",
    "settings.theme.desc": "Choose light or dark mode",
    "settings.theme.light": "Light",
    "settings.theme.dark": "Dark",
    "settings.theme.system": "System",

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
    "incident.eventDetails": "Event Details",
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
    "inspection.createdLabel": "Created",
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
    "action.sync": "Sync",
    "action.saving": "Saving...",
    "action.search": "Search",
    "action.filter": "Filter",
    "action.new": "New",

    // Fields
    "field.type": "Type",
    "field.location": "Location",

    // Empty states
    "empty.noObservations": "No observations yet",
    "empty.noInspections": "No inspections yet",
    "empty.createFirst": "Create the first observation to get started",
    "empty.adjustFilters": "Try adjusting your search or filters",
    "empty.noMatchingInspections": "No matching inspections",

    // List views
    "list.countOf": "{filtered} of {total} {type}",
    "list.observation": "observation",
    "list.observations": "observations",
    "list.inspection": "inspection",
    "list.inspections": "inspections",

    // Confirm dialogs
    "confirm.deleteObservation": "Delete this observation?",
    "confirm.deleteInspection": "Delete this inspection?",

    // Observation form labels
    "observation.concernedCompanyLabel": "Concerned Company/Contractor",
    "observation.concernedCompanyPlaceholder": "Company responsible for the area",
    "observation.referenceArticleLabel": "Reference Article/Standard",
    "observation.referenceArticlePlaceholder": "Relevant regulation or safety standard",
    "observation.descriptionPlaceholder": "Detailed description of the observation",

    // Time
    "time.today": "Today",
    "time.yesterday": "Yesterday",
    "time.daysAgo": "{days} days ago",

    // Sync banner
    "status.pendingChanges": "{count} changes pending",
    "status.syncNow": "Tap to sync your changes now",
    "status.localSaveInfo": "Your changes are saved locally and will sync when you reconnect",

    // Inspection (new form)
    "inspection.progress": "Inspection Progress",
    "inspection.unanswered": "Unanswered",
    "inspection.info": "Inspection Information",
    "inspection.titleLabel": "Inspection Title",
    "inspection.titlePlaceholder": "e.g., Weekly Safety Inspection - Building A",
    "inspection.typeLabel": "Inspection Type",
    "inspection.selectType": "Select type...",
    "inspection.type.safety": "Safety Inspection",
    "inspection.type.compliance": "Compliance Check",
    "inspection.type.incidentFollowUp": "Incident Follow-up",
    "inspection.type.routine": "Routine Check",
    "inspection.projectSelect": "Select project...",
    "inspection.descriptionNotes": "Description/Notes",
    "inspection.itemsChecked": "{checked}/{total} items checked",
    "inspection.commentPlaceholder": "Add corrective action or notes...",

    // Errors & alerts
    "error.titleRequired": "Title is required",
    "error.inspectionTypeRequired": "Inspection type is required",
    "error.projectRequired": "Project is required",
    "error.minimumCompletion": "At least 50% of items must be checked",
    // Generic alerts
    "alert.completeBeforeSubmit": "Please complete the form before submitting",
    "alert.saveSuccess.inspection": "Inspection saved successfully!",
    "alert.saveError.inspection": "Error saving inspection. Please try again.",
    "alert.saveSuccess.observation": "Observation saved successfully!",
    "alert.saveError.observation": "Error saving observation. Please try again.",
    "alert.requiredFields": "Please fill in all required fields",

    // Buttons
    "action.saveInspection": "Save Inspection ({percent}% Complete)",
    "inspection.issuesCount": "{count} issues",
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
    "section.details": "Détails",

    // Generic
    "common.updated": "Mis à jour {distance}",
    "units.days": "{count} jours",

    // Not found
    "empty.notFound.observation": "Observation introuvable",
    "empty.notFound.inspection": "Inspection introuvable",
    "empty.notFound.incident": "Incident introuvable",

    // Settings
    "settings.syncStatus": "Statut de synchronisation",
    "settings.syncStatus.desc": "Surveillez l'état de synchronisation des données",
    "settings.totalForms": "Formulaires au total",
    "settings.pendingSync": "Synchronisation en attente",
    "settings.language": "Langue",
    "settings.language.desc": "Choisissez votre langue préférée pour l'application",
    "settings.applicationLanguage": "Langue de l'application",
    "settings.notifications": "Notifications",
    "settings.notifications.desc": "Configurer la réception des mises à jour",
    "settings.pushNotifications": "Notifications push",
    "settings.pushNotifications.desc": "Recevoir des alertes pour les nouvelles tâches",
    "settings.syncAlerts": "Alertes de synchronisation",
    "settings.syncAlerts.desc": "Être notifié lorsque la synchronisation est terminée",
    "settings.appearance": "Apparence",
    "settings.appearance.desc": "Personnaliser l'apparence visuelle",
    "settings.theme": "Thème",
    "settings.theme.desc": "Choisir le mode clair ou sombre",
    "settings.theme.light": "Clair",
    "settings.theme.dark": "Sombre",
    "settings.theme.system": "Système",

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
    "incident.eventDetails": "Détails de l'événement",
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
    "inspection.createdLabel": "Créé le",
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
    "action.sync": "Synchroniser",
    "action.saving": "Enregistrement...",
    "action.search": "Rechercher",
    "action.filter": "Filtrer",
    "action.new": "Nouveau",

    // Fields
    "field.type": "Type",
    "field.location": "Emplacement",

    // Empty states
    "empty.noObservations": "Aucune observation",
    "empty.noInspections": "Aucune inspection",
    "empty.createFirst": "Créez la première observation pour commencer",
    "empty.adjustFilters": "Essayez d'ajuster votre recherche ou vos filtres",
    "empty.noMatchingInspections": "Aucune inspection correspondante",

    // List views
    "list.countOf": "{filtered} sur {total} {type}",
    "list.observation": "observation",
    "list.observations": "observations",
    "list.inspection": "inspection",
    "list.inspections": "inspections",

    // Confirm dialogs
    "confirm.deleteObservation": "Supprimer cette observation ?",
    "confirm.deleteInspection": "Supprimer cette inspection ?",

    // Observation form labels
    "observation.concernedCompanyLabel": "Entreprise/Entrepreneur concerné",
    "observation.concernedCompanyPlaceholder": "Entreprise responsable de la zone",
    "observation.referenceArticleLabel": "Article de référence/Norme",
    "observation.referenceArticlePlaceholder": "Règlement ou norme de sécurité pertinent",
    "observation.descriptionPlaceholder": "Description détaillée de l'observation",

    // Time
    "time.today": "Aujourd'hui",
    "time.yesterday": "Hier",
    "time.daysAgo": "Il y a {days} jours",

    // Sync banner
    "status.pendingChanges": "{count} modifications en attente",
    "status.syncNow": "Appuyez pour synchroniser vos changements maintenant",
    "status.localSaveInfo": "Vos changements sont enregistrés localement et seront synchronisés lors de la reconnexion",

    // Inspection (new form)
    "inspection.progress": "Progression de l'inspection",
    "inspection.unanswered": "Non répondu",
    "inspection.info": "Informations d'inspection",
    "inspection.titleLabel": "Titre de l'inspection",
    "inspection.titlePlaceholder": "p. ex., Inspection hebdomadaire - Bâtiment A",
    "inspection.typeLabel": "Type d'inspection",
    "inspection.selectType": "Sélectionner un type...",
    "inspection.type.safety": "Inspection de sécurité",
    "inspection.type.compliance": "Vérification de conformité",
    "inspection.type.incidentFollowUp": "Suivi d'incident",
    "inspection.type.routine": "Contrôle routinier",
    "inspection.projectSelect": "Sélectionner un projet...",
    "inspection.descriptionNotes": "Description/Notes",
    "inspection.itemsChecked": "{checked}/{total} éléments cochés",
    "inspection.commentPlaceholder": "Ajouter une action corrective ou des notes...",

    // Errors & alerts
    "error.titleRequired": "Le titre est obligatoire",
    "error.inspectionTypeRequired": "Le type d'inspection est obligatoire",
    "error.projectRequired": "Le projet est obligatoire",
    "error.minimumCompletion": "Au moins 50% des éléments doivent être cochés",
    // Generic alerts
    "alert.completeBeforeSubmit": "Veuillez compléter le formulaire avant de soumettre",
    "alert.saveSuccess.inspection": "Inspection enregistrée avec succès !",
    "alert.saveError.inspection": "Erreur lors de l'enregistrement de l'inspection. Veuillez réessayer.",
    "alert.saveSuccess.observation": "Observation enregistrée avec succès !",
    "alert.saveError.observation": "Erreur lors de l'enregistrement de l'observation. Veuillez réessayer.",
    "alert.requiredFields": "Veuillez remplir tous les champs obligatoires",

    // Buttons
    "action.saveInspection": "Enregistrer l'inspection ({percent}% complété)",
    "inspection.issuesCount": "{count} problèmes",
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
  const [locale, setLocale] = useState<Locale>(() => {
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem("locale")
      if (stored === "en" || stored === "fr") return stored
    }
    return "fr"
  })

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

  // Persist locale and set document language
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem("locale", locale)
        document.documentElement.lang = locale
      }
    } catch (e) {
      // ignore storage errors
    }
  }, [locale])

  return <LocaleContext.Provider value={{ locale, setLocale, t }}>{children}</LocaleContext.Provider>
}

export function useLocale() {
  const context = useContext(LocaleContext)
  if (!context) {
    throw new Error("useLocale must be used within a LocaleProvider")
  }
  return context
}
