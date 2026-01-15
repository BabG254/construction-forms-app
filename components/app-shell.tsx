"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ClipboardCheck, Eye, AlertTriangle, LayoutDashboard, Menu, Globe, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useLocale } from "@/lib/locale-context"
import { OfflineIndicator } from "@/components/offline-indicator"

const navigation = [
  { key: "nav.dashboard", href: "/", icon: LayoutDashboard },
  { key: "nav.inspections", href: "/inspections", icon: ClipboardCheck },
  { key: "nav.observations", href: "/observations", icon: Eye },
  { key: "nav.incidents", href: "/incidents", icon: AlertTriangle },
  { key: "nav.settings", href: "/settings", icon: Settings },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { locale, setLocale, t } = useLocale()

  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <nav className="flex flex-col gap-1">
      {navigation.map((item) => {
        const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClick}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
              "min-h-[48px]",
              isActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
            )}
          >
            <item.icon className="h-5 w-5 shrink-0" />
            <span>{t(item.key as any)}</span>
          </Link>
        )
      })}
    </nav>
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-64 lg:flex-col bg-sidebar border-r border-sidebar-border">
        <div className="flex h-16 items-center gap-2 px-6 border-b border-sidebar-border">
          <img src="/logo.png" alt="Logo" className="h-7 w-7" />
          <span className="text-lg font-semibold text-sidebar-foreground">{t("dashboard.title")}</span>
        </div>
        <div className="flex-1 overflow-y-auto py-4 px-3">
          <NavLinks />
        </div>
        <div className="border-t border-sidebar-border p-4 space-y-3">
          <OfflineIndicator variant="full" className="bg-sidebar-accent/30" />
          <div className="flex items-center justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 px-2 text-sidebar-foreground">
                  <Globe className="h-4 w-4 mr-1" />
                  {locale.toUpperCase()}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setLocale("en")}>English</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocale("fr")}>Français</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="lg:hidden sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-card px-4">
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-12 w-12">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 bg-sidebar p-0">
            <div className="flex h-16 items-center gap-2 px-6 border-b border-sidebar-border">
              <ClipboardCheck className="h-7 w-7 text-sidebar-primary" />
              <span className="text-lg font-semibold text-sidebar-foreground">{t("dashboard.title")}</span>
            </div>
            <div className="py-4 px-3">
              <NavLinks onClick={() => setSidebarOpen(false)} />
            </div>
            <div className="absolute bottom-0 left-0 right-0 border-t border-sidebar-border p-4 space-y-3">
              <OfflineIndicator variant="full" className="bg-sidebar-accent/30" />
              <div className="flex items-center justify-end">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-sidebar-foreground">
                      <Globe className="h-4 w-4 mr-1" />
                      {locale.toUpperCase()}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setLocale("en")}>English</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLocale("fr")}>Français</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </SheetContent>
        </Sheet>
        <div className="flex-1 flex items-center gap-2">
          <ClipboardCheck className="h-6 w-6 text-primary" />
          <span className="font-semibold">{t("dashboard.title")}</span>
        </div>
        <OfflineIndicator variant="minimal" />
      </header>

      {/* Main content */}
      <main className="lg:pl-64">
        <div className="min-h-[calc(100vh-4rem)] lg:min-h-screen">{children}</div>
      </main>
    </div>
  )
}
