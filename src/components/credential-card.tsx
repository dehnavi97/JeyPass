"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Copy,
  Check,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  KeyRound,
  User,
  ShieldCheck,
  Share2,
  FolderInput,
} from "lucide-react";
import * as OTPAuth from "otpauth";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Credential } from "@/lib/types";
import { useTranslation } from "react-i18next";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { ShareCredentialModal } from "./share-credential-modal";
import { useVault } from "@/hooks/use-vault";
import { useToast } from "@/hooks/use-toast";
import { WORKSPACE_COLORS } from "./workspace-modal";

type CredentialCardProps = {
  credential: Credential;
  onEdit: (credential: Credential) => void;
  onDelete: (id: string) => void;
};

function useTotp(credential: Credential) {
  const [token, setToken] = useState<string | null>(null);
  const [progress, setProgress] = useState(100);

  const totp = useMemo(() => {
    if (!credential.totpSecret) return null;
    try {
      const secret = credential.totpSecret.replace(/\s/g, '');
      return OTPAuth.URI.parse(`otpauth://totp/JeyPass:${credential.title}?secret=${secret}`);
    } catch (e) {
      console.error("Invalid TOTP URI/Secret:", e);
      return null;
    }
  }, [credential.totpSecret, credential.title]);

  useEffect(() => {
    if (!totp) {
      setToken(null);
      setProgress(100);
      return;
    }

    const updateTokenAndProgress = () => {
      try {
        const newToken = totp.generate();
        setToken(newToken);
      
        const now = Date.now() / 1000;
        const remaining = totp.period - (now % totp.period);
        setProgress((remaining / totp.period) * 100);
      } catch(e) {
        console.error("Error generating TOTP: ", e);
        setToken("Invalid");
        setProgress(0);
      }
    };

    updateTokenAndProgress();
    const intervalId = setInterval(updateTokenAndProgress, 1000);

    return () => clearInterval(intervalId);
  }, [totp]);

  return { token, progress };
}

export function CredentialCard({
  credential,
  onEdit,
  onDelete,
}: CredentialCardProps) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<"username" | "password" | "totp" | null>(null);
  const { t } = useTranslation();
  const { toast } = useToast();
  const { workspaces, moveCredentialWorkspace } = useVault();
  const { token: totpToken, progress: totpProgress } = useTotp(credential);

  const currentWorkspace = useMemo(() => {
    const wsId = credential.workspaceId || "default";
    return workspaces.find((w) => w.id === wsId) || workspaces.find((w) => w.id === "default");
  }, [credential.workspaceId, workspaces]);

  const colorConfig = useMemo(() => {
    if (!currentWorkspace) return WORKSPACE_COLORS[0];
    return WORKSPACE_COLORS.find((c) => c.name === currentWorkspace.color) || WORKSPACE_COLORS[0];
  }, [currentWorkspace]);

  const handleCopy = (text: string | undefined | null, field: "username" | "password" | "totp") => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleMoveWorkspace = (targetWsId: string, targetWsName: string) => {
    moveCredentialWorkspace(credential.id, targetWsId);
    toast({
      title: t("workspace.moved_success_title", "Workspace Changed"),
      description: t("workspace.moved_success_description", {
        title: credential.title,
        workspace: targetWsName,
        defaultValue: `Moved "${credential.title}" to workspace "${targetWsName}".`,
      }),
    });
  };

  return (
    <>
      <Card className="w-full overflow-hidden transition-all hover:shadow-lg flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="truncate text-lg">{credential.title}</CardTitle>
            {currentWorkspace && (
              <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-muted/80 text-muted-foreground flex items-center gap-1.5 shrink-0 border border-border/50">
                <span className={`h-1.5 w-1.5 rounded-full ${colorConfig.class}`} />
                <span className="truncate max-w-[80px] sm:max-w-[100px]">{currentWorkspace.name}</span>
              </span>
            )}
          </div>
          {credential.username && (
            <CardDescription className="flex items-center gap-2 pt-1 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="truncate">{credential.username}</span>
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="flex-grow space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-muted-foreground" />
              <span className="font-mono text-sm">
                {passwordVisible ? credential.password : "••••••••••••"}
              </span>
            </div>
            <TooltipProvider>
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopy(credential.username, "username")}
                      disabled={!credential.username}
                    >
                      {copiedField === "username" ? (
                        <Check className="text-green-500" />
                      ) : (
                        <Copy />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t('credential.copy_username')}</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopy(credential.password, "password")}
                    >
                      {copiedField === "password" ? (
                        <Check className="text-green-500" />
                      ) : (
                        <Copy />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t('credential.copy_password')}</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setPasswordVisible(!passwordVisible)}
                    >
                      {passwordVisible ? <EyeOff /> : <Eye />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {passwordVisible ? t('credential.hide_password') : t('credential.show_password')}
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </div>
          {totpToken && (
            <div className="space-y-3 pt-3 border-t border-dashed">
               <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ShieldCheck className="h-4 w-4 text-green-500" />
                    <span>{t('credential.totp_code')}</span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleCopy(totpToken, "totp")}>
                    {copiedField === "totp" ? (
                        <Check className="text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4"/>
                      )}
                  </Button>
               </div>
               <div className="text-center">
                  <p className="font-mono text-3xl font-bold tracking-widest text-primary">
                    {totpToken}
                  </p>
               </div>
               <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Progress value={totpProgress} className="h-1.5" indicatorClassName={cn(
                      totpProgress > 50 && "bg-green-500",
                      totpProgress <= 50 && totpProgress > 20 && "bg-yellow-500",
                      totpProgress <= 20 && "bg-red-500"
                    )} />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t('credential.totp_reset_time')}</p>
                  </TooltipContent>
                </Tooltip>
               </TooltipProvider>
            </div>
          )}
        </CardContent>
        <CardFooter className="bg-muted/50 px-4 py-2 mt-auto">
          <div className="flex w-full items-center justify-between gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground hover:text-foreground">
                  <FolderInput className="h-3.5 w-3.5 mr-1.5 rtl:ml-1.5 rtl:mr-0 text-primary/80" />
                  <span className="text-xs">{t('workspace.move_button', 'Move')}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuLabel className="text-xs">
                  {t('workspace.move_menu_title', 'Move to Workspace')}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {workspaces.map((ws) => {
                  const isCurrent = (credential.workspaceId || "default") === ws.id;
                  const color = WORKSPACE_COLORS.find((c) => c.name === ws.color) || WORKSPACE_COLORS[0];
                  return (
                    <DropdownMenuItem
                      key={ws.id}
                      disabled={isCurrent}
                      onClick={() => handleMoveWorkspace(ws.id, ws.name)}
                      className="flex items-center justify-between text-xs cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${color.class}`} />
                        <span>{ws.name}</span>
                      </div>
                      {isCurrent && <Check className="h-3.5 w-3.5 text-primary" />}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => setIsShareModalOpen(true)}>
                <Share2 className="h-3.5 w-3.5 mr-1 rtl:ml-1 rtl:mr-0" />
                <span className="text-xs">{t('common.share')}</span>
              </Button>
              <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => onEdit(credential)}>
                <Edit className="h-3.5 w-3.5 mr-1 rtl:ml-1 rtl:mr-0" />
                <span className="text-xs">{t('common.edit')}</span>
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 px-2 text-destructive hover:text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t('credential.delete_confirm_title')}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t('credential.delete_confirm_description', { title: credential.title })}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={() => onDelete(credential.id)}
                    >
                      {t('common.delete')}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardFooter>
      </Card>
      <ShareCredentialModal 
        isOpen={isShareModalOpen} 
        onOpenChange={setIsShareModalOpen} 
        credential={credential} 
      />
    </>
  );
}
