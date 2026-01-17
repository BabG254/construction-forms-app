"use client"

import jsPDF from "jspdf"

// Professional PDF generator for all forms with logo and header matching the template
export async function generateProfessionalPDF(data: {
  title: string
  type: "observation" | "inspection" | "incident"
  number: string
  projectInfo?: string
  details: Record<string, string | undefined>
  statistics?: Record<string, number>
  sections: Array<{
    title: string
    content: string
  }>
  images?: Array<{
    url: string
    name: string
  }>
  filename: string
}) {
  if (typeof window === "undefined") return

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 15
  const contentWidth = pageWidth - 2 * margin

  let yPosition = margin + 5

  // Helper to check page break
  const checkPageBreak = (spaceNeeded: number) => {
    if (yPosition + spaceNeeded > pageHeight - margin) {
      doc.addPage()
      yPosition = margin + 5
    }
  }

  // Try to load logo as image - non-blocking
  try {
    if (typeof window !== "undefined" && window.location) {
      const logoUrl = "/logo.png"
      doc.addImage(logoUrl, "PNG", margin, yPosition - 3, 20, 20)
    }
  } catch (error) {
    console.log("Logo not available")
  }

  // Company information (top left, right of logo space)
  doc.setFontSize(9)
  doc.setFont(undefined, "bold")
  doc.text("Construction Interlag", margin + 25, yPosition)
  
  doc.setFontSize(7)
  doc.setFont(undefined, "normal")
  doc.text("926 av Simard, #201", margin + 25, yPosition + 4)
  doc.text("Chambly, Quebec J3L 4X2", margin + 25, yPosition + 7)
  doc.text("Téléphone : 514-323-6710", margin + 25, yPosition + 10)
  doc.text("Télécopieur : 514-323-3682", margin + 25, yPosition + 13)

  // Project info on the right side
  if (data.projectInfo) {
    doc.setFontSize(7)
    doc.setFont(undefined, "normal")
    const projectLines = doc.splitTextToSize(data.projectInfo, 70)
    let rightY = yPosition
    projectLines.forEach((line: string) => {
      doc.text(line, pageWidth - margin - 70, rightY, { align: "left" })
      rightY += 3.5
    })
  }

  yPosition += 25

  // Divider line
  doc.setDrawColor(150, 150, 150)
  doc.line(margin, yPosition, pageWidth - margin, yPosition)
  yPosition += 5

  // Title section - centered
  doc.setFontSize(13)
  doc.setFont(undefined, "bold")
  const titleText = `${data.type.charAt(0).toUpperCase() + data.type.slice(1)} : ${data.title}`
  const titleLines = doc.splitTextToSize(titleText, contentWidth)
  titleLines.forEach((line: string, index: number) => {
    doc.text(line, pageWidth / 2, yPosition + (index * 5), { align: "center" })
  })
  yPosition += titleLines.length * 5 + 3

  // Statistics boxes (if provided) - for inspections
  if (data.statistics && Object.keys(data.statistics).length > 0) {
    const statsEntries = Object.entries(data.statistics)
    const boxWidth = (contentWidth - 2) / statsEntries.length
    const boxHeight = 14
    let boxX = margin + 1

    doc.setFontSize(7)
    statsEntries.forEach(([label, value]) => {
      // Draw box with border
      doc.setFillColor(240, 240, 240)
      doc.setDrawColor(200, 200, 200)
      doc.rect(boxX, yPosition, boxWidth, boxHeight, "FD")

      // Add value (large)
      doc.setFontSize(11)
      doc.setFont(undefined, "bold")
      doc.text(String(value), boxX + boxWidth / 2, yPosition + 7.5, { align: "center" })

      // Add label (small)
      doc.setFontSize(6)
      doc.setFont(undefined, "normal")
      const labelLines = doc.splitTextToSize(label, boxWidth - 2)
      labelLines.slice(0, 2).forEach((labelLine: string, idx: number) => {
        doc.text(labelLine, boxX + boxWidth / 2, yPosition + 9.5 + (idx * 2.5), { align: "center" })
      })

      boxX += boxWidth
    })
    yPosition += boxHeight + 5
  }

  // Details section - two columns
  doc.setFontSize(10)
  doc.setFont(undefined, "bold")
  doc.text("Détails", margin, yPosition)
  yPosition += 6

  doc.setFontSize(8)
  doc.setFont(undefined, "normal")
  
  const detailKeys = Object.keys(data.details).filter(k => data.details[k])
  const midPoint = Math.ceil(detailKeys.length / 2)
  const leftColX = margin
  const rightColX = pageWidth / 2 + 5

  let leftY = yPosition
  let rightY = yPosition
  
  detailKeys.forEach((key, index) => {
    const value = data.details[key]
    if (value) {
      if (index < midPoint) {
        doc.setFont(undefined, "bold")
        doc.text(`${key}`, leftColX, leftY)
        doc.setFont(undefined, "normal")
        const valueLines = doc.splitTextToSize(String(value), 40)
        doc.text(valueLines, leftColX + 45, leftY)
        leftY += 4.5
      } else {
        doc.setFont(undefined, "bold")
        doc.text(`${key}`, rightColX, rightY)
        doc.setFont(undefined, "normal")
        const valueLines = doc.splitTextToSize(String(value), 40)
        doc.text(valueLines, rightColX + 45, rightY)
        rightY += 4.5
      }
    }
  })

  yPosition = Math.max(leftY, rightY) + 3

  // Content sections
  data.sections.forEach((section) => {
    if (section.content && section.content.trim()) {
      checkPageBreak(12)
      doc.setFont(undefined, "bold")
      doc.setFontSize(9)
      doc.text(section.title, margin, yPosition)
      yPosition += 5

      doc.setFont(undefined, "normal")
      doc.setFontSize(7.5)
      const lines = doc.splitTextToSize(section.content, contentWidth)
      lines.forEach((line: string) => {
        checkPageBreak(3)
        doc.text(line, margin, yPosition)
        yPosition += 3
      })
      yPosition += 2
    }
  })

  // Images section (Pièces jointes)
  if (data.images && data.images.length > 0) {
    checkPageBreak(15)
    doc.setFont(undefined, "bold")
    doc.setFontSize(9)
    doc.text("Pièces jointes", margin, yPosition)
    yPosition += 5

    doc.setFontSize(7.5)
    doc.setFont(undefined, "normal")
    doc.text("Photos", margin, yPosition)
    yPosition += 4

    for (const image of data.images) {
      try {
        checkPageBreak(70)
        const imgWidth = contentWidth * 0.5
        const imgHeight = imgWidth * 0.75
        doc.addImage(image.url, "JPEG", margin, yPosition, imgWidth, imgHeight)
        yPosition += imgHeight + 2

        doc.setFontSize(6)
        doc.text(image.name, margin, yPosition)
        yPosition += 4
      } catch (error) {
        console.error("Failed to add image:", error)
        doc.setFontSize(7)
        doc.text(`[Image: ${image.name}]`, margin, yPosition)
        yPosition += 3
      }
    }
  }

  // Footer with generation date
  doc.setFontSize(6)
  doc.setTextColor(120, 120, 120)
  const pageCount = (doc as any).internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.text(
      `Généré le ${new Date().toLocaleDateString("fr-FR")} à ${new Date().toLocaleTimeString("fr-FR")}`,
      margin,
      pageHeight - 5
    )
    doc.text(`Page ${i} sur ${pageCount}`, pageWidth - margin - 20, pageHeight - 5)
  }

  doc.save(data.filename)
}

// Lightweight client-side PDF export utility with dynamic imports.
// Designed for Next.js on Vercel: runs only on the client.
export async function exportElementAsPdf(options?: {
  elementId?: string
  filename?: string
  quality?: number // 0..1
  scale?: number // canvas scale
}) {
  const {
    elementId,
    filename = `form-${new Date().toISOString().slice(0, 10)}.pdf`,
    quality = 0.98,
    scale = 2,
  } = options || {}

  if (typeof window === "undefined") return

  const target = elementId ? document.getElementById(elementId) : document.body
  if (!target) return

  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ])

  const canvas = await html2canvas(target, {
    scale,
    useCORS: true,
    allowTaint: true,
    backgroundColor: "#ffffff",
    windowWidth: document.documentElement.clientWidth,
  })
  const imgData = canvas.toDataURL("image/png", quality)

  // A4 dimensions in mm: 210 x 297
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })

  const pageWidth = 210
  const pageHeight = 297

  const imgWidth = pageWidth
  const imgHeight = (canvas.height * imgWidth) / canvas.width

  let position = 0
  let heightLeft = imgHeight

  // Add first page
  pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
  heightLeft -= pageHeight

  // Add extra pages if needed
  while (heightLeft > 0) {
    position = position - pageHeight
    pdf.addPage()
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight
  }

  pdf.save(filename)
}

// Export observation with proper formatting and embedded images
export async function exportObservationAsPdf(observation: any, filename: string) {
  if (typeof window === "undefined") return

  const details: Record<string, string | undefined> = {
    "Number": observation.number,
    "Status": observation.status,
    "Priority": observation.priority,
    "Type": observation.type,
    "Location": observation.location,
    "Created By": observation.createdBy || "N/A",
    "Created Date": new Date(observation.createdAt).toLocaleDateString(),
  }

  const sections = []
  
  if (observation.description) {
    sections.push({
      title: "Description",
      content: observation.description,
    })
  }

  if (observation.referenceArticle) {
    sections.push({
      title: "Reference Article (CRTC)",
      content: observation.referenceArticle,
    })
  }

  if (observation.safetyAnalysis) {
    if (observation.safetyAnalysis.danger) {
      sections.push({
        title: "Danger",
        content: observation.safetyAnalysis.danger,
      })
    }
    if (observation.safetyAnalysis.contributingCondition) {
      sections.push({
        title: "Contributing Condition",
        content: observation.safetyAnalysis.contributingCondition,
      })
    }
    if (observation.safetyAnalysis.contributingBehavior) {
      sections.push({
        title: "Contributing Behavior",
        content: observation.safetyAnalysis.contributingBehavior,
      })
    }
  }

  const images = observation.attachments?.filter((a: any) => a.type?.startsWith("image/")) || []

  const projectInfo = observation.projectNumber ? `Projet : ${observation.projectNumber}` : undefined

  await generateProfessionalPDF({
    title: observation.title || observation.number,
    type: "observation",
    number: observation.number,
    projectInfo,
    details,
    sections,
    images,
    filename,
  })
}

// Export inspection with proper formatting and embedded images
export async function exportInspectionAsPdf(inspection: any, filename: string) {
  if (typeof window === "undefined") return

  const totalItems = inspection.responses?.length || 0
  const conforming = inspection.responses?.filter((r: any) => r.response === "conforming").length || 0
  const nonConforming = inspection.responses?.filter((r: any) => r.response === "non-conforming").length || 0
  const notApplicable = inspection.responses?.filter((r: any) => r.response === "not-applicable" || r.response === "na").length || 0
  const unanswered = totalItems - conforming - nonConforming - notApplicable

  const details: Record<string, string | undefined> = {
    "Type": inspection.type,
    "Status": inspection.status,
    "Created By": inspection.createdBy || "N/A",
    "Created Date": new Date(inspection.createdAt).toLocaleDateString(),
  }

  const sections = []
  
  if (inspection.description) {
    sections.push({
      title: "Description",
      content: inspection.description,
    })
  }

  const images = inspection.attachments?.filter((a: any) => a.type?.startsWith("image/")) || []

  const statistics = {
    "Articles inspectés": totalItems,
    "Conforme": conforming,
    "Déficient": nonConforming,
    "S.O.": notApplicable,
    "Neutre": unanswered,
  }

  await generateProfessionalPDF({
    title: inspection.documentTitle || `Inspection N°${inspection.id.slice(-6)}`,
    type: "inspection",
    number: inspection.id.slice(-6).toUpperCase(),
    details,
    statistics,
    sections,
    images,
    filename,
  })
}

// Export incident with proper formatting and embedded images
export async function exportIncidentAsPdf(incident: any, filename: string) {
  if (typeof window === "undefined") return

  const details: Record<string, string | undefined> = {
    "Number": incident.number,
    "Status": incident.status,
    "Severity": incident.severity,
    "Category": incident.category,
    "Accident Type": incident.accidentType,
    "Event Date": new Date(incident.eventDate).toLocaleDateString(),
    "Injuries Count": String(incident.injuriesCount || 0),
    "Created Date": new Date(incident.createdAt).toLocaleDateString(),
  }

  const sections = []
  
  if (incident.description) {
    sections.push({
      title: "Description",
      content: incident.description,
    })
  }

  if (incident.investigation) {
    if (incident.investigation.danger) {
      sections.push({
        title: "Danger",
        content: incident.investigation.danger,
      })
    }
    if (incident.investigation.contributingCondition) {
      sections.push({
        title: "Contributing Condition",
        content: incident.investigation.contributingCondition,
      })
    }
    if (incident.investigation.contributingBehavior) {
      sections.push({
        title: "Contributing Behavior",
        content: incident.investigation.contributingBehavior,
      })
    }
  }

  const images = incident.attachments?.filter((a: any) => a.type?.startsWith("image/")) || []

  await generateProfessionalPDF({
    title: incident.title || incident.number,
    type: "incident",
    number: incident.number,
    details,
    sections,
    images,
    filename,
  })
}
