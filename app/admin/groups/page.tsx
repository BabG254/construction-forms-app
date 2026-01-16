"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useAppStore } from "@/lib/store"
import { useLocale } from "@/lib/locale-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus, AlertCircle, Users } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

export const dynamic = "force-dynamic"

export default function GroupsPage() {
  const { user } = useAuth()
  const { t } = useLocale()
  const [isOpen, setIsOpen] = useState(false)
  const [formError, setFormError] = useState("")

  // Form state
  const [newGroupName, setNewGroupName] = useState("")
  const [newGroupDescription, setNewGroupDescription] = useState("")
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])

  const authUsers = useAppStore((state) => state.authUsers)
  const userGroups = useAppStore((state) => state.userGroups)
  const addUserGroup = useAppStore((state) => state.addUserGroup)
  const deleteUserGroup = useAppStore((state) => state.deleteUserGroup)

  // Only allow admins
  if (!user || user.role !== "admin") {
    return (
      <div className="container py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{t("accessDenied")}</AlertDescription>
        </Alert>
      </div>
    )
  }

  const handleAddGroup = () => {
    setFormError("")

    if (!newGroupName) {
      setFormError(t("groupNameRequired"))
      return
    }

    try {
      addUserGroup({
        id: `group-${Date.now()}`,
        name: newGroupName,
        description: newGroupDescription,
        memberIds: selectedMembers,
        createdAt: new Date(),
      })

      // Reset form
      setNewGroupName("")
      setNewGroupDescription("")
      setSelectedMembers([])
      setIsOpen(false)
    } catch (err) {
      setFormError(t("failedToAddGroup"))
    }
  }

  const toggleMember = (userId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    )
  }

  const getGroupMembers = (groupId: string) => {
    const group = userGroups.find((g) => g.id === groupId)
    if (!group) return []
    return authUsers.filter((u) => group.memberIds.includes(u.id))
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">{t("groupManagement")}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">{t("manageGroupsDescription")}</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="lg">
              <Plus className="mr-2 h-4 w-4" />
              {t("addGroup")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t("createNewGroup")}</DialogTitle>
              <DialogDescription>{t("addMembersToGroup")}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {formError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">{t("groupName")}</label>
                <Input
                  placeholder={t("groupNamePlaceholder")}
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t("description")}</label>
                <Input
                  placeholder={t("groupDescriptionPlaceholder")}
                  value={newGroupDescription}
                  onChange={(e) => setNewGroupDescription(e.target.value)}
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium">{t("members")}</label>
                <div className="border rounded-lg p-3 space-y-2 max-h-64 overflow-y-auto">
                  {authUsers.length === 0 ? (
                    <p className="text-sm text-slate-500">{t("noUsersAvailable")}</p>
                  ) : (
                    authUsers.map((u) => (
                      <div key={u.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={u.id}
                          checked={selectedMembers.includes(u.id)}
                          onCheckedChange={() => toggleMember(u.id)}
                        />
                        <label
                          htmlFor={u.id}
                          className="flex-1 cursor-pointer text-sm"
                        >
                          <div className="font-medium">{u.name}</div>
                          <div className="text-xs text-slate-500">{u.email}</div>
                        </label>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  {t("cancel")}
                </Button>
                <Button onClick={handleAddGroup}>{t("createGroup")}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {userGroups.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-slate-500">{t("noGroupsYet")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {userGroups.map((group) => {
            const members = getGroupMembers(group.id)
            return (
              <Card key={group.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-slate-500" />
                        <CardTitle>{group.name}</CardTitle>
                      </div>
                      {group.description && (
                        <CardDescription className="mt-2">{group.description}</CardDescription>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteUserGroup(group.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm">
                      <p className="text-slate-500 mb-2">
                        {t("members")}: <Badge variant="secondary">{members.length}</Badge>
                      </p>
                      {members.length === 0 ? (
                        <p className="text-slate-400 text-xs">{t("noMembers")}</p>
                      ) : (
                        <div className="space-y-1">
                          {members.map((member) => (
                            <div key={member.id} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-900 rounded">
                              <div>
                                <p className="font-medium text-sm">{member.name}</p>
                                <p className="text-xs text-slate-500">{member.email}</p>
                              </div>
                              <Badge variant="outline">{t(member.role)}</Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
