"use client";

import { useState, useTransition } from "react";
import { AlertTriangle, QrCode, FileDown, Eye, EyeOff, Loader2, ShieldCheck, Lock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";
import type { Credential, NewCredential } from "@/lib/types";
import { QRCodeCanvas } from "./qrcode";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { exportCredentialToJpas, saveJpasFile } from "@/lib/jpas";
import { useToast } from "@/hooks/use-toast";

type ShareCredentialModalProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  credential: Credential;
};

const QR_CODE_PREFIX = "jeypass:";

export function ShareCredentialModal({ isOpen, onOpenChange, credential }: ShareCredentialModalProps) {
  const { t } = useTranslation();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<"qr" | "export">("qr");
  const [exportPassword, setExportPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Prepare clean data for export/QR, excluding the internal ID
  const dataToShare: NewCredential = {
    title: credential.title,
    username: credential.username,
    password: credential.password,
    category: credential.category,
    totpSecret: credential.totpSecret,
  };

  const qrCodeValue = `${QR_CODE_PREFIX}${JSON.stringify(dataToShare)}`;

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setExportPassword("");
      setConfirmPassword("");
      setShowPassword(false);
      setValidationError(null);
    }
    onOpenChange(open);
  };

  const handleExportToFile = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!exportPassword) {
      setValidationError(t("share.export_password_required", "Please enter a password to encrypt this file."));
      return;
    }

    if (exportPassword.length < 4) {
      setValidationError(t("share.export_password_min_length", "Password must be at least 4 characters."));
      return;
    }

    if (exportPassword !== confirmPassword) {
      setValidationError(t("share.export_password_mismatch", "Passwords do not match."));
      return;
    }

    startTransition(async () => {
      try {
        const encryptedJpasContent = await exportCredentialToJpas(dataToShare, exportPassword);
        
        // Clean filename from title
        const sanitizedTitle = (credential.title || "credential")
          .trim()
          .replace(/[^a-zA-Z0-9_\-\u0600-\u06FF]/g, "_")
          .toLowerCase();
        const filename = `${sanitizedTitle}.jpas`;

        const result = await saveJpasFile(filename, encryptedJpasContent);

        if (result.success) {
          toast({
            title: t("share.export_success_title", "File Exported"),
            description: t("share.export_success_description", {
              filename,
              defaultValue: `Encrypted file "${filename}" was successfully saved.`,
            }),
          });
          handleOpenChange(false);
        } else {
          toast({
            variant: "destructive",
            title: t("share.export_error_title", "Export Failed"),
            description: result.error || t("share.export_error_description", "Could not save the file."),
          });
        }
      } catch (err: any) {
        console.error("Export .jpas error:", err);
        toast({
          variant: "destructive",
          title: t("share.export_error_title", "Export Failed"),
          description: err.message || t("share.export_error_description", "An error occurred while encrypting the file."),
        });
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">{t("share.title")}</DialogTitle>
          <DialogDescription className="text-center">
            {t("share.subtitle", {
              title: credential.title,
              defaultValue: `Share or export "${credential.title}" securely.`,
            })}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as "qr" | "export")} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="qr" className="flex items-center gap-2">
              <QrCode className="h-4 w-4" />
              <span>{t("share.qr_tab", "QR Code")}</span>
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center gap-2">
              <FileDown className="h-4 w-4" />
              <span>{t("share.file_tab", "Export File (.jpas)")}</span>
            </TabsTrigger>
          </TabsList>

          {/* QR Code Tab */}
          <TabsContent value="qr" className="space-y-4">
            <div className="flex justify-center p-4 bg-white rounded-lg shadow-inner">
              <QRCodeCanvas text={qrCodeValue} options={{ width: 240, margin: 2 }} />
            </div>
            <p className="text-xs text-center text-muted-foreground">
              {t("share.description")}
            </p>
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>{t("share.warning_title")}</AlertTitle>
              <AlertDescription>
                {t("share.warning_description")}
              </AlertDescription>
            </Alert>
          </TabsContent>

          {/* Export to .jpas File Tab */}
          <TabsContent value="export">
            <form onSubmit={handleExportToFile} className="space-y-4 pt-1">
              <div className="rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground flex items-start gap-2.5">
                <Lock className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                <span>
                  {t(
                    "share.export_info",
                    "The credential will be strongly encrypted using AES-256-GCM. Set a password below that will be required to decrypt and import this file."
                  )}
                </span>
              </div>

              <div className="space-y-2">
                <Label htmlFor="export-password">
                  {t("share.export_password_label", "File Encryption Password")}
                </Label>
                <div className="relative">
                  <Input
                    id="export-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••••"
                    value={exportPassword}
                    onChange={(e) => setExportPassword(e.target.value)}
                    disabled={isPending}
                    className="pr-10 rtl:pl-10 rtl:pr-3"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 rtl:left-0 rtl:right-auto rtl:pl-3 rtl:pr-0 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="export-confirm-password">
                  {t("share.export_confirm_password_label", "Confirm Password")}
                </Label>
                <Input
                  id="export-confirm-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isPending}
                />
              </div>

              {validationError && (
                <p className="text-xs font-medium text-destructive">{validationError}</p>
              )}

              <Button type="submit" disabled={isPending} className="w-full mt-2">
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin rtl:ml-2 rtl:mr-0" />
                    {t("share.exporting", "Encrypting & Saving...")}
                  </>
                ) : (
                  <>
                    <FileDown className="mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0" />
                    {t("share.export_submit_button", "Save .jpas File")}
                  </>
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
