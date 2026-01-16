"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useAppStore } from "@/lib/store"
import { useLocale } from "@/lib/locale-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus, AlertCircle } from "lucide-react"

export const dynamic = "force-dynamic"

export default function UsersPage() {
  const { user } = useAuth()
  const { t } = useLocale()
  const [isOpen, setIsOpen] = useState(false)
  const [formError, setFormError] = useState("")

  // Form state
  const [newUserEmail, setNewUserEmail] = useState("")
  const [newUserName, setNewUserName] = useState("")
  const [newUserPassword, setNewUserPassword] = useState("")
  const [newUserRole, setNewUserRole] = useState<"admin" | "supervisor" | "worker">("worker")

  const authUsers = useAppStore((state) => state.authUsers)
  const addAuthUser = useAppStore((state) => state.addAuthUser)
  const deleteAuthUser = useAppStore((state) => state.deleteAuthUser)

  // Allow admins and supervisors to manage users
  if (!user || (user.role !== "admin" && user.role !== "supervisor")) {
    return (
      <div className="container py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{t("accessDenied")}</AlertDescription>
        </Alert>
      </div>
    )
  }

  // Supervisors can only create worker accounts
  const canCreateSupervisorOrAdmin = user.role === "admin"

  // Set default role based on user permissions
  React.useEffect(() => {
    if (!canCreateSupervisorOrAdmin && newUserRole !== "worker") {
      setNewUserRole("worker")
    }
  }, [canCreateSupervisorOrAdmin, newUserRole])

  const handleAddUser = () => {
    setFormError("")

    if (!newUserEmail || !newUserName || !newUserPassword) {
      setFormError(t("allFieldsRequired"))
      return
    }

    // Check for duplicate email
    if (authUsers.some((u) => u.email === newUserEmail)) {
      setFormError(t("emailAlreadyExists"))
      return
    }

    try {
      // Hash password (simple base64 for demo)
      const passwordHash = Buffer.from(newUserPassword).toString("base64")

      addAuthUser({
        id: `user-${Date.now()}`,
        email: newUserEmail,
        name: newUserName,
        passwordHash,
        role: newUserRole,
        createdAt: new Date(),
      })

      // Reset form
      setNewUserEmail("")
      setNewUserName("")
      setNewUserPassword("")
      setNewUserRole("worker")
      setIsOpen(false)
    } catch (err) {
      setFormError(t("failedToAddUser"))
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive"
      case "supervisor":
        return "secondary"
      case "worker":
        return "default"
      default:
        return "outline"
    }
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">{t("userManagement")}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">{t("manageUsersDescription")}</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="lg">
              <Plus className="mr-2 h-4 w-4" />
              {t("addUser")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("addNewUser")}</DialogTitle>
              <DialogDescription>{t("createUserForAccess")}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {formError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">{t("email")}</label>
                <Input
                  type="email"
                  placeholder={t("emailPlaceholder")}
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t("name")}</label>
                <Input
                  placeholder={t("userNamePlaceholder")}
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t("password")}</label>
                <Input
                  type="password"
                  placeholder={t("passwordPlaceholder")}
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t("role")}</label>
                <Select value={newUserRole} onValueChange={(v) => setNewUserRole(v as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {canCreateSupervisorOrAdmin && <SelectItem value="admin">{t("admin")}</SelectItem>}
                    {canCreateSupervisorOrAdmin && <SelectItem value="supervisor">{t("supervisor")}</SelectItem>}
                    <SelectItem value="worker">{t("worker")}</SelectItem>
                  </SelectContent>
                </Select>
                {!canCreateSupervisorOrAdmin && (
                  <p className="text-xs text-muted-foreground">
                    {t("supervisorsCanOnlyCreateWorkers")}
                  </p>
                )}
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  {t("cancel")}
                </Button>
                <Button onClick={handleAddUser}>{t("createUser")}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {authUsers.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-slate-500">{t("noUsersYet")}</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{t("allUsers")}</CardTitle>
            <CardDescription>{t("totalUsers", { count: authUsers.length })}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("name")}</TableHead>
                    <TableHead>{t("email")}</TableHead>
                    <TableHead>{t("role")}</TableHead>
                    <TableHead>{t("createdAt")}</TableHead>
                    <TableHead className="text-right">{t("actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {authUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeColor(user.role) as any}>
                          {t(user.role)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-slate-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteAuthUser(user.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
