"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Briefcase, Trash2, Edit2, Check, X, ShieldAlert, Palette } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useVault } from "@/hooks/use-vault";
import { useToast } from "@/hooks/use-toast";
import type { Workspace } from "@/lib/types";

export const WORKSPACE_COLORS = [
  { name: "blue", class: "bg-blue-500", text: "text-blue-500", border: "border-blue-500" },
  { name: "emerald", class: "bg-emerald-500", text: "text-emerald-500", border: "border-emerald-500" },
  { name: "purple", class: "bg-purple-500", text: "text-purple-500", border: "border-purple-500" },
  { name: "amber", class: "bg-amber-500", text: "text-amber-500", border: "border-amber-500" },
  { name: "rose", class: "bg-rose-500", text: "text-rose-500", border: "border-rose-500" },
  { name: "cyan", class: "bg-cyan-500", text: "text-cyan-500", border: "border-cyan-500" },
  { name: "indigo", class: "bg-indigo-500", text: "text-indigo-500", border: "border-indigo-500" },
];

type WorkspaceModalProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialMode?: "create" | "manage";
  editingWorkspace?: Workspace | null;
};

export function WorkspaceModal({
  isOpen,
  onOpenChange,
  initialMode = "create",
  editingWorkspace: initialEditingWs = null,
}: WorkspaceModalProps) {
  const { t } = useTranslation();
  const { workspaces, credentials, addWorkspace, updateWorkspace, deleteWorkspace, setActiveWorkspaceId } =
    useVault();
  const { toast } = useToast();

  const [mode, setMode] = useState<"create" | "manage">(initialMode);
  const [workspaceName, setWorkspaceName] = useState("");
  const [selectedColor, setSelectedColor] = useState("blue");
  const [editingWsId, setEditingWsId] = useState<string | null>(null);
  const [editNameValue, setEditNameValue] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setWorkspaceName("");
      setSelectedColor("blue");
      setEditingWsId(null);
      setDeleteConfirmId(null);
      setMode(initialMode);
    }
    onOpenChange(open);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceName.trim()) return;

    const newWs = addWorkspace(workspaceName.trim(), selectedColor);
    setActiveWorkspaceId(newWs.id);

    toast({
      title: t("workspace.created_title", "Workspace Created"),
      description: t("workspace.created_description", {
        name: newWs.name,
        defaultValue: `Workspace "${newWs.name}" was created.`,
      }),
    });

    handleOpenChange(false);
  };

  const handleStartEdit = (ws: Workspace) => {
    setEditingWsId(ws.id);
    setEditNameValue(ws.name);
  };

  const handleSaveEdit = (id: string) => {
    if (!editNameValue.trim()) return;
    updateWorkspace(id, editNameValue.trim());
    setEditingWsId(null);
    toast({
      title: t("workspace.updated_title", "Workspace Updated"),
      description: t("workspace.updated_description", "The workspace was successfully renamed."),
    });
  };

  const handleDelete = (id: string) => {
    const wsToDelete = workspaces.find((w) => w.id === id);
    if (!wsToDelete || wsToDelete.isDefault) return;

    deleteWorkspace(id);
    setDeleteConfirmId(null);

    toast({
      title: t("workspace.deleted_title", "Workspace Deleted"),
      description: t(
        "workspace.deleted_description",
        "The workspace was deleted. Any credentials in it were moved to Default."
      ),
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-sm">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Briefcase className="h-6 w-6" />
          </div>
          <DialogTitle className="text-center text-xl font-bold">
            {mode === "create"
              ? t("workspace.modal_create_title", "Create New Workspace")
              : t("workspace.modal_manage_title", "Manage Workspaces")}
          </DialogTitle>
          <DialogDescription className="text-center text-sm">
            {mode === "create"
              ? t(
                  "workspace.modal_create_description",
                  "Organize your credentials into separated workspaces (e.g. Work, Personal, Finance)."
                )
              : t(
                  "workspace.modal_manage_description",
                  "Edit, rename, or delete existing workspaces."
                )}
          </DialogDescription>
        </DialogHeader>

        {/* View toggle */}
        <div className="flex rounded-lg bg-muted p-1 text-sm font-medium">
          <button
            type="button"
            onClick={() => setMode("create")}
            className={`flex-1 rounded-md py-1.5 transition-colors ${
              mode === "create" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t("workspace.tab_create", "Add Workspace")}
          </button>
          <button
            type="button"
            onClick={() => setMode("manage")}
            className={`flex-1 rounded-md py-1.5 transition-colors ${
              mode === "manage" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t("workspace.tab_manage", "Manage All ({count})", { count: workspaces.length })}
          </button>
        </div>

        {mode === "create" ? (
          <form onSubmit={handleCreate} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="ws-name">{t("workspace.name_label", "Workspace Name")}</Label>
              <Input
                id="ws-name"
                placeholder={t("workspace.name_placeholder", "e.g., Work, Personal, Trading")}
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                <span>{t("workspace.color_label", "Theme Color")}</span>
              </Label>
              <div className="flex flex-wrap gap-2 pt-1">
                {WORKSPACE_COLORS.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setSelectedColor(c.name)}
                    className={`h-8 w-8 rounded-full ${c.class} flex items-center justify-center transition-all ${
                      selectedColor === c.name ? "ring-2 ring-primary ring-offset-2 scale-110" : "opacity-80 hover:opacity-100"
                    }`}
                  >
                    {selectedColor === c.name && <Check className="h-4 w-4 text-white" />}
                  </button>
                ))}
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                {t("common.cancel", "Cancel")}
              </Button>
              <Button type="submit" disabled={!workspaceName.trim()}>
                <Plus className="mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0" />
                {t("workspace.create_button", "Create Workspace")}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="space-y-3 pt-2 max-h-[300px] overflow-y-auto pr-1">
            {workspaces.map((ws) => {
              const count = credentials.filter(
                (c) => (c.workspaceId || "default") === ws.id
              ).length;
              const colorInfo =
                WORKSPACE_COLORS.find((c) => c.name === ws.color) || WORKSPACE_COLORS[0];
              const isEditing = editingWsId === ws.id;

              return (
                <div
                  key={ws.id}
                  className="flex items-center justify-between gap-2 rounded-lg border p-3 hover:bg-muted/40 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span className={`h-3 w-3 rounded-full shrink-0 ${colorInfo.class}`} />

                    {isEditing ? (
                      <div className="flex items-center gap-1.5 flex-1">
                        <Input
                          size={1}
                          value={editNameValue}
                          onChange={(e) => setEditNameValue(e.target.value)}
                          className="h-8 text-sm"
                          autoFocus
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-emerald-600"
                          onClick={() => handleSaveEdit(ws.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-muted-foreground"
                          onClick={() => setEditingWsId(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate flex items-center gap-2">
                          <span>{ws.name}</span>
                          {ws.isDefault && (
                            <span className="text-[10px] rounded bg-muted px-1.5 py-0.5 text-muted-foreground font-normal">
                              {t("workspace.default_badge", "Default")}
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t("workspace.item_count", {
                            count,
                            defaultValue: `${count} credentials`,
                          })}
                        </p>
                      </div>
                    )}
                  </div>

                  {!isEditing && (
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => handleStartEdit(ws)}
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      {!ws.isDefault && (
                        <>
                          {deleteConfirmId === ws.id ? (
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="destructive"
                                className="h-7 text-xs px-2"
                                onClick={() => handleDelete(ws.id)}
                              >
                                {t("common.delete", "Delete")}
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7"
                                onClick={() => setDeleteConfirmId(null)}
                              >
                                <X className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-destructive hover:bg-destructive/10"
                              onClick={() => setDeleteConfirmId(ws.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
