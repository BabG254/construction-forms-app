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
        "flex items-center gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-sm",
        isOnline 
          ? "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800" 
          : "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800",
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center w-10 h-10 rounded-lg shrink-0",
          isOnline ? "bg-green-100 dark:bg-green-900" : "bg-red-100 dark:bg-red-900",
        )}
      >
        {isSyncing ? (
          <RefreshCw className="h-5 w-5 text-green-600 dark:text-green-400 animate-spin" />
        ) : (
          <CloudOff className={cn("h-5 w-5", isOnline ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400")} />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className={cn("font-semibold text-sm", isOnline ? "text-green-900 dark:text-green-100" : "text-red-900 dark:text-red-100")}>
          {isOnline ? t("status.pendingChanges", { count: pendingChanges }) : t("status.offline")}
        </p>
        <p className={cn("text-xs", isOnline ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300")}>
          {isOnline ? t("status.syncNow") : t("status.localSaveInfo")}
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {isOnline && (
          <Button size="sm" onClick={syncNow} disabled={isSyncing}>
            {t("action.sync")}
          </Button>
        )}
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDismissed(true)}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
