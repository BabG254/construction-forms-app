"use client"

import { useEffect, useState } from "react"
import { CloudOff, RefreshCw, X } from "lucide-react"
import { useOffline } from "@/lib/offline-provider"
import { useLocale } from "@/lib/locale-context"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function SyncStatusBanner() {
  const { isOnline, isSyncing, pendingChanges, syncNow } = useOffline()
  const { t } = useLocale()
  const [dismissed, setDismissed] = useState(false)

  // Reset dismissed state when going offline
  useEffect(() => {
    if (!isOnline) {
      setDismissed(false)
    }
  }, [isOnline])

  // Don't show if online with no pending changes, or if dismissed
  if ((isOnline && pendingChanges === 0) || dismissed) {
    return null
  }

  return (
    <div
      className={cn(
        "fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50",
        "flex items-center gap-3 p-4 rounded-xl border shadow-lg",
        isOnline ? "bg-card border-border" : "bg-destructive/5 border-destructive/20",
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center w-10 h-10 rounded-lg shrink-0",
          isOnline ? "bg-warning/10" : "bg-destructive/10",
        )}
      >
        {isSyncing ? (
          <RefreshCw className="h-5 w-5 text-primary animate-spin" />
        ) : (
          <CloudOff className={cn("h-5 w-5", isOnline ? "text-warning" : "text-destructive")} />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">{isOnline ? `${pendingChanges} changes pending` : t("status.offline")}</p>
        <p className="text-xs text-muted-foreground">
          {isOnline
            ? "Tap to sync your changes now"
            : "Your changes are saved locally and will sync when you reconnect"}
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {isOnline && (
          <Button size="sm" onClick={syncNow} disabled={isSyncing}>
            Sync
          </Button>
        )}
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDismissed(true)}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
