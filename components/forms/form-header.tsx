"use client"

import { ArrowLeft, FileDown, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLocale } from "@/lib/locale-context"
import Link from "next/link"

interface FormHeaderProps {
  title: string
  backHref?: string
  onSaveDraft?: () => void
  onExportPdf?: () => void
  isSaving?: boolean
}

export function FormHeader({ title, backHref, onSaveDraft, onExportPdf, isSaving }: FormHeaderProps) {
  const { t } = useLocale()
  const resolvedBackHref = backHref ?? "/"

  return (
    <div className="sticky top-0 z-30 bg-background border-b">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-10 w-10" asChild>
            <Link href={resolvedBackHref}>
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">{t("action.back")}</span>
            </Link>
          </Button>
          <h1 className="text-lg font-semibold truncate">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          {onExportPdf && (
            <Button variant="outline" size="sm" onClick={onExportPdf} className="hidden sm:flex bg-transparent">
              <FileDown className="h-4 w-4 mr-2" />
              {t("form.exportPdf")}
            </Button>
          )}
          {onSaveDraft && (
            <Button variant="outline" size="sm" onClick={onSaveDraft} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {t("form.saveDraft")}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
