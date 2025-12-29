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
  const { token: totpToken, progress: totpProgress } = useTotp(credential);

  const handleCopy = (text: string | undefined | null, field: "username" | "password" | "totp") => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <>
      <Card className="w-full overflow-hidden transition-all hover:shadow-lg flex flex-col">
        <CardHeader>
          <CardTitle className="truncate">{credential.title}</CardTitle>
          {credential.username && (
            <CardDescription className="flex items-center gap-2 pt-1 text-base">
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
        <CardFooter className="bg-muted/50 px-6 py-3 mt-auto">
          <div className="flex w-full justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setIsShareModalOpen(true)}>
                <Share2 className="ml-2 h-4 w-4" />
                {t('common.share')}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onEdit(credential)}>
              <Edit className="ml-2 h-4 w-4" />
              {t('common.edit')}
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                  <Trash2 className="ml-2 h-4 w-4" />
                  {t('common.delete')}
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
