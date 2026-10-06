"use client";

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Layers, Settings2 } from "lucide-react";
import { useVault } from "@/hooks/use-vault";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { WorkspaceModal, WORKSPACE_COLORS } from "./workspace-modal";

export function WorkspaceTabs() {
  const { t } = useTranslation();
  const { workspaces, activeWorkspaceId, setActiveWorkspaceId, credentials } = useVault();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "manage">("create");

  // Calculate count of items per workspace
  const workspaceCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of credentials) {
      const ws = c.workspaceId || "default";
      counts[ws] = (counts[ws] || 0) + 1;
    }
    return counts;
  }, [credentials]);

  const handleOpenCreate = () => {
    setModalMode("create");
    setIsModalOpen(true);
  };

  const handleOpenManage = () => {
    setModalMode("manage");
    setIsModalOpen(true);
  };

  return (
    <TooltipProvider>
      <div className="w-full border-b bg-card/60 backdrop-blur-md px-4 py-2 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          {/* Scrollable Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none no-scrollbar flex-1">
            {/* All Tab */}
            <button
              type="button"
              onClick={() => setActiveWorkspaceId("all")}
              className={`flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-all shrink-0 ${
                activeWorkspaceId === "all"
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
                  : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>{t("workspace.all_tab", "All")}</span>
              <span
                className={`ml-1 rounded-full px-1.5 py-0.2 text-[10px] font-semibold ${
                  activeWorkspaceId === "all"
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-background text-muted-foreground"
                }`}
              >
                {credentials.length}
              </span>
            </button>

            {/* Individual Workspace Tabs */}
            {workspaces.map((ws) => {
              const isActive = activeWorkspaceId === ws.id;
              const count = workspaceCounts[ws.id] || 0;
              const colorConfig =
                WORKSPACE_COLORS.find((c) => c.name === ws.color) || WORKSPACE_COLORS[0];

              return (
                <button
                  key={ws.id}
                  type="button"
                  onClick={() => setActiveWorkspaceId(ws.id)}
                  className={`group flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-all shrink-0 ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
                      : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full shrink-0 ${
                      isActive ? "bg-white ring-2 ring-white/50" : colorConfig.class
                    }`}
                  />
                  <span className="truncate max-w-[120px] sm:max-w-[160px]">
                    {ws.name}
                  </span>
                  <span
                    className={`ml-0.5 rounded-full px-1.5 py-0.2 text-[10px] font-semibold ${
                      isActive
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-background text-muted-foreground"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}

            {/* Quick Add Workspace button inside scroll view */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={handleOpenCreate}
                  className="flex items-center gap-1 rounded-full border border-dashed border-primary/40 px-2.5 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 transition-colors shrink-0"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{t("workspace.add_button", "Workspace")}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t("workspace.create_tooltip", "Create a new workspace")}</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Manage Button */}
          <div className="shrink-0 flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={handleOpenManage}
                >
                  <Settings2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>{t("workspace.manage_tooltip", "Manage Workspaces")}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Modal */}
        <WorkspaceModal
          isOpen={isModalOpen}
          onOpenChange={setIsModalOpen}
          initialMode={modalMode}
        />
      </div>
    </TooltipProvider>
  );
}
