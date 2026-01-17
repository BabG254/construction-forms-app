"use client"

import jsPDF from "jspdf"

// Professional PDF generator for all forms with logo and header
export async function generateProfessionalPDF(data: {
  title: string
  type: "observation" | "inspection" | "incident"
  number: string
  details: Record<string, string | undefined>
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

  let yPosition = margin

  // Helper to check page break
  const checkPageBreak = (spaceNeeded: number) => {
    if (yPosition + spaceNeeded > pageHeight - margin) {
      doc.addPage()
      yPosition = margin
      addHeaderFooter()
    }
  }

  // Add header and footer to page
  const addHeaderFooter = () => {
    // Header background
    doc.setFillColor(25, 25, 30)
    doc.rect(0, 0, pageWidth, 25, "F")

    // Header text
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(14)
    doc.setFont(undefined, "bold")
    doc.text("Interlag - Soft", margin, 10)
    doc.setFontSize(10)
    doc.setFont(undefined, "normal")
    doc.text("Construction Forms", margin, 16)

    // Reset text color
    doc.setTextColor(0, 0, 0)
  }

  // Add initial header
  addHeaderFooter()
  yPosition = 35

  // Title
  doc.setFontSize(16)
  doc.setFont(undefined, "bold")
  doc.text(data.title, margin, yPosition)
  yPosition += 8

  doc.setFontSize(10)
  doc.setFont(undefined, "normal")
  doc.text(`${data.type.toUpperCase()} #${data.number}`, margin, yPosition)
  yPosition += 10

  // Divider line
  doc.setDrawColor(100, 100, 100)
  doc.line(margin, yPosition, pageWidth - margin, yPosition)
  yPosition += 8

  // Details section
  doc.setFont(undefined, "bold")
  doc.setFontSize(11)
  doc.text("Details", margin, yPosition)
  yPosition += 6

  doc.setFont(undefined, "normal")
  doc.setFontSize(9)
  Object.entries(data.details).forEach(([key, value]) => {
    if (value) {
      checkPageBreak(5)
      doc.setFont(undefined, "bold")
      doc.text(`${key}:`, margin, yPosition)
      doc.setFont(undefined, "normal")
      doc.text(String(value), margin + 50, yPosition)
      yPosition += 5
    }
  })

  yPosition += 5

  // Content sections
  data.sections.forEach((section) => {
    if (section.content) {
      checkPageBreak(12)
      doc.setFont(undefined, "bold")
      doc.setFontSize(11)
      doc.text(section.title, margin, yPosition)
      yPosition += 6

      doc.setFont(undefined, "normal")
      doc.setFontSize(9)
      const lines = doc.splitTextToSize(section.content, contentWidth)
      lines.forEach((line: string) => {
        checkPageBreak(4)
        doc.text(line, margin, yPosition)
        yPosition += 4
      })
      yPosition += 4
    }
  })

  // Images section
  if (data.images && data.images.length > 0) {
    checkPageBreak(15)
    doc.setFont(undefined, "bold")
    doc.setFontSize(11)
    doc.text("Attached Images", margin, yPosition)
    yPosition += 8

    for (const image of data.images) {
      try {
        checkPageBreak(60)
        const imgWidth = contentWidth * 0.6
        doc.addImage(image.url, "JPEG", margin, yPosition, imgWidth, imgWidth * 0.75)
        yPosition += imgWidth * 0.75 + 5

        doc.setFontSize(8)
        doc.text(image.name, margin, yPosition)
        yPosition += 5
      } catch (error) {
        console.error("Failed to add image:", error)
        doc.setFontSize(8)
        doc.text(`[Image: ${image.name}]`, margin, yPosition)
        yPosition += 5
      }
    }
  }

  // Footer with date
  doc.setFontSize(8)
  doc.setTextColor(100, 100, 100)
  doc.text(
    `Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
    margin,
    pageHeight - 10
  )

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
    Number: observation.number,
    Status: observation.status,
    Priority: observation.priority,
    Type: observation.type,
    Location: observation.location,
    "Created Date": new Date(observation.createdAt).toLocaleDateString(),
  }

  const sections = [
    {
      title: "Description",
      content: observation.description || "",
    },
  ]

  if (observation.safetyAnalysis) {
    if (observation.safetyAnalysis.danger) {
      sections.push({
        title: "Danger",
        content: observation.safetyAnalysis.danger,
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

  await generateProfessionalPDF({
    title: observation.title || observation.number,
    type: "observation",
    number: observation.number,
    details,
    sections,
    images,
    filename,
  })
}

// Export inspection with proper formatting and embedded images
export async function exportInspectionAsPdf(inspection: any, filename: string) {
  if (typeof window === "undefined") return

  const details: Record<string, string | undefined> = {
    Number: inspection.id.slice(-6).toUpperCase(),
    Status: inspection.status,
    Type: inspection.type,
    "Project": inspection.projectId,
    "Created Date": new Date(inspection.createdAt).toLocaleDateString(),
  }

  const sections = [
    {
      title: "Description",
      content: inspection.description || "",
    },
  ]

  const images = inspection.attachments?.filter((a: any) => a.type?.startsWith("image/")) || []

  await generateProfessionalPDF({
    title: inspection.documentTitle || `Inspection ${inspection.id.slice(-6)}`,
    type: "inspection",
    number: inspection.id.slice(-6).toUpperCase(),
    details,
    sections,
    images,
    filename,
  })
}

// Export incident with proper formatting and embedded images
export async function exportIncidentAsPdf(incident: any, filename: string) {
  if (typeof window === "undefined") return

  const details: Record<string, string | undefined> = {
    Number: incident.number,
    Status: incident.status,
    Severity: incident.severity,
    Category: incident.category,
    "Created Date": new Date(incident.createdAt).toLocaleDateString(),
  }

  const sections = [
    {
      title: "Description",
      content: incident.description || "",
    },
  ]

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
