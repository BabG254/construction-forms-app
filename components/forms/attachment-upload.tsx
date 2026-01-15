"use client"

import type React from "react"

import { useRef } from "react"
import { Paperclip, X, FileText, ImageIcon, File } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLocale } from "@/lib/locale-context"
import type { Attachment } from "@/lib/types"

interface AttachmentUploadProps {
  attachments: Attachment[]
  onChange: (attachments: Attachment[]) => void
  maxFiles?: number
}

export function AttachmentUpload({ attachments, onChange, maxFiles = 10 }: AttachmentUploadProps) {
  const { t } = useLocale()
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const newAttachments: Attachment[] = files.map((file) => ({
      id: Math.random().toString(36).substring(7),
      name: file.name,
      type: file.type,
      size: file.size,
      url: URL.createObjectURL(file),
      uploadedAt: new Date(),
    }))

    onChange([...attachments, ...newAttachments].slice(0, maxFiles))
    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }

  const removeAttachment = (id: string) => {
    onChange(attachments.filter((a) => a.id !== id))
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return ImageIcon
    if (type.includes("pdf")) return FileText
    return File
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*,.pdf,.doc,.docx"
        onChange={handleFileSelect}
        className="hidden"
      />

      {attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map((attachment) => {
            const Icon = getFileIcon(attachment.type)
            return (
              <div
                key={attachment.id}
                className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-border"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <button
                    type="button"
                    className="text-sm font-medium truncate hover:underline text-left"
                    onClick={() => window.open(attachment.url, "_blank")}
                    title={t("action.view")}
                  >
                    {attachment.name}
                  </button>
                  <p className="text-xs text-muted-foreground">{formatFileSize(attachment.size)}</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={() => removeAttachment(attachment.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )
          })}
        </div>
      )}

      {attachments.length < maxFiles && (
        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
          className="w-full h-12 border-dashed"
        >
          <Paperclip className="h-4 w-4 mr-2" />
          {t("form.addAttachment")}
        </Button>
      )}
    </div>
  )
}
