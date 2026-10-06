"use client";

import { useState, useRef, useTransition } from "react";
import { useTranslation } from "react-i18next";
import {
  FileKey,
  Upload,
  Eye,
  EyeOff,
  Loader2,
  FileCheck,
  AlertCircle,
  ShieldCheck,
  QrCode,
  CheckCircle2,
  Layers,
  KeyRound,
  FileText,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useVault } from "@/hooks/use-vault";
import { useToast } from "@/hooks/use-toast";
import { importCredentialFromJpas } from "@/lib/jpas";
import {
  decodeQrCodeFromImageFile,
  extractOtpAccountsFromContent,
  otpAccountToNewCredential,
  type GoogleAuthOtpAccount,
} from "@/lib/google-auth";

type ImportModalProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

export function ImportJpasModal({ isOpen, onOpenChange }: ImportModalProps) {
  const { t } = useTranslation();
  const { addCredential, workspaces, activeWorkspaceId } = useVault();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<"jpas" | "google_auth">("jpas");

  // --- JPAS File State ---
  const jpasFileInputRef = useRef<HTMLInputElement>(null);
  const [jpasFile, setJpasFile] = useState<File | null>(null);
  const [jpasPassword, setJpasPassword] = useState("");
  const [showJpasPassword, setShowJpasPassword] = useState(false);
  const [jpasError, setJpasError] = useState<string | null>(null);

  // --- Google Authenticator State ---
  const gaFileInputRef = useRef<HTMLInputElement>(null);
  const [gaFile, setGaFile] = useState<File | null>(null);
  const [gaPastedText, setGaPastedText] = useState("");
  const [showPasteInput, setShowPasteInput] = useState(false);
  const [gaAccounts, setGaAccounts] = useState<GoogleAuthOtpAccount[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [targetWorkspaceId, setTargetWorkspaceId] = useState<string>(
    activeWorkspaceId !== "all" ? activeWorkspaceId : "default"
  );
  const [gaError, setGaError] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();

  const resetState = () => {
    setJpasFile(null);
    setJpasPassword("");
    setShowJpasPassword(false);
    setJpasError(null);
    if (jpasFileInputRef.current) jpasFileInputRef.current.value = "";

    setGaFile(null);
    setGaPastedText("");
    setShowPasteInput(false);
    setGaAccounts([]);
    setSelectedIndices([]);
    setGaError(null);
    if (gaFileInputRef.current) gaFileInputRef.current.value = "";
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetState();
    }
    onOpenChange(open);
  };

  // --- Handle JPAS Submission ---
  const handleJpasSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jpasFile) {
      setJpasError(t("import_jpas.select_file_required", "Please select a .jpas file."));
      return;
    }
    if (!jpasPassword) {
      setJpasError(t("import_jpas.password_required", "Please enter the file password."));
      return;
    }

    setJpasError(null);

    startTransition(async () => {
      try {
        const fileContent = await jpasFile.text();
        const credential = await importCredentialFromJpas(fileContent, jpasPassword);

        // Ensure workspace is assigned
        if (!credential.workspaceId) {
          credential.workspaceId = activeWorkspaceId !== "all" ? activeWorkspaceId : "default";
        }

        addCredential(credential);

        toast({
          title: t("import_jpas.success_title", "Credential Imported"),
          description: t("import_jpas.success_description", {
            title: credential.title,
            defaultValue: `Successfully decrypted and added "${credential.title}" to your vault.`,
          }),
        });

        handleOpenChange(false);
      } catch (err: any) {
        console.error("Failed to import .jpas file:", err);
        let msg = t("import_jpas.error_generic", "Failed to import file.");
        if (err.message === "INCORRECT_PASSWORD") {
          msg = t("import_jpas.error_wrong_password", "Incorrect password or corrupted file.");
        } else if (err.message === "INVALID_FORMAT" || err.message === "INVALID_JSON") {
          msg = t("import_jpas.error_invalid_file", "The selected file is not a valid .jpas file.");
        }

        setJpasError(msg);
        toast({
          variant: "destructive",
          title: t("import_jpas.error_title", "Import Failed"),
          description: msg,
        });
      }
    });
  };

  // --- Handle Google Authenticator File Selection ---
  const handleGaFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setGaFile(file);
    setGaError(null);
    setGaAccounts([]);

    startTransition(async () => {
      try {
        let contentToParse = "";

        // Check if file is image (QR Code Screenshot / Photo)
        if (file.type.startsWith("image/")) {
          try {
            contentToParse = await decodeQrCodeFromImageFile(file);
          } catch (qrErr: any) {
            console.warn("QR decode error:", qrErr);
            throw new Error("QR_CODE_NOT_FOUND");
          }
        } else {
          // Read text / JSON file
          contentToParse = await file.text();
        }

        const accounts = extractOtpAccountsFromContent(contentToParse);
        if (accounts.length === 0) {
          throw new Error("NO_ACCOUNTS_FOUND");
        }

        setGaAccounts(accounts);
        setSelectedIndices(accounts.map((_, i) => i));
        toast({
          title: t("google_auth.detected_title", "Accounts Detected"),
          description: t("google_auth.detected_description", {
            count: accounts.length,
            defaultValue: `Found ${accounts.length} authenticator account(s).`,
          }),
        });
      } catch (err: any) {
        console.error("Failed to parse Google Authenticator file:", err);
        let msg = t("google_auth.error_generic", "Could not extract accounts from this file.");
        if (err.message === "QR_CODE_NOT_FOUND") {
          msg = t(
            "google_auth.error_qr_not_found",
            "No QR code found in the image. Please make sure the QR code is clear and visible."
          );
        } else if (err.message === "NO_ACCOUNTS_FOUND") {
          msg = t(
            "google_auth.error_no_accounts",
            "No valid Google Authenticator migration or TOTP data found in the file."
          );
        }
        setGaError(msg);
        toast({
          variant: "destructive",
          title: t("google_auth.error_title", "Parse Failed"),
          description: msg,
        });
      }
    });
  };

  // --- Handle Google Authenticator Pasted Text Submission ---
  const handleParsePastedText = () => {
    if (!gaPastedText.trim()) return;
    setGaError(null);

    try {
      const accounts = extractOtpAccountsFromContent(gaPastedText.trim());
      if (accounts.length === 0) {
        throw new Error("NO_ACCOUNTS_FOUND");
      }

      setGaAccounts(accounts);
      setSelectedIndices(accounts.map((_, i) => i));
      toast({
        title: t("google_auth.detected_title", "Accounts Detected"),
        description: t("google_auth.detected_description", {
          count: accounts.length,
          defaultValue: `Found ${accounts.length} authenticator account(s).`,
        }),
      });
    } catch {
      const msg = t(
        "google_auth.error_no_accounts",
        "No valid Google Authenticator migration or TOTP data found."
      );
      setGaError(msg);
      toast({
        variant: "destructive",
        title: t("google_auth.error_title", "Parse Failed"),
        description: msg,
      });
    }
  };

  const handleToggleSelectAll = () => {
    if (selectedIndices.length === gaAccounts.length) {
      setSelectedIndices([]);
    } else {
      setSelectedIndices(gaAccounts.map((_, i) => i));
    }
  };

  const handleToggleAccount = (index: number) => {
    if (selectedIndices.includes(index)) {
      setSelectedIndices(selectedIndices.filter((i) => i !== index));
    } else {
      setSelectedIndices([...selectedIndices, index]);
    }
  };

  // --- Import Selected Google Authenticator Accounts ---
  const handleImportGaAccounts = () => {
    if (selectedIndices.length === 0) return;

    startTransition(() => {
      const selected = gaAccounts.filter((_, idx) => selectedIndices.includes(idx));
      for (const acc of selected) {
        const cred = otpAccountToNewCredential(acc, targetWorkspaceId);
        addCredential(cred);
      }

      toast({
        title: t("google_auth.import_success_title", "Accounts Imported"),
        description: t("google_auth.import_success_description", {
          count: selected.length,
          defaultValue: `Successfully imported ${selected.length} account(s) into your vault.`,
        }),
      });

      handleOpenChange(false);
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto bg-background/95 backdrop-blur-sm">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Upload className="h-6 w-6" />
          </div>
          <DialogTitle className="text-center text-xl font-bold">
            {t("import_modal.main_title", "Import Credentials & Accounts")}
          </DialogTitle>
          <DialogDescription className="text-center text-sm">
            {t(
              "import_modal.main_description",
              "Import encrypted JeyPass (.jpas) files or Google Authenticator export QR codes/links."
            )}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-3">
            <TabsTrigger value="jpas" className="flex items-center gap-2 text-xs sm:text-sm">
              <FileKey className="h-4 w-4" />
              <span>{t("import_modal.tab_jpas", "JeyPass File (.jpas)")}</span>
            </TabsTrigger>
            <TabsTrigger value="google_auth" className="flex items-center gap-2 text-xs sm:text-sm">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>{t("import_modal.tab_google_auth", "Google Authenticator")}</span>
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: JPAS File */}
          <TabsContent value="jpas" className="space-y-4 pt-1">
            <form onSubmit={handleJpasSubmit} className="space-y-4">
              <input
                type="file"
                ref={jpasFileInputRef}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    setJpasFile(f);
                    setJpasError(null);
                  }
                }}
                accept=".jpas,application/octet-stream,text/plain"
                className="hidden"
              />

              <div
                onClick={() => jpasFileInputRef.current?.click()}
                className={`cursor-pointer rounded-lg border-2 border-dashed p-4 text-center transition-colors ${
                  jpasFile
                    ? "border-primary/50 bg-primary/5"
                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                }`}
              >
                {jpasFile ? (
                  <div className="flex items-center justify-center gap-3">
                    <FileCheck className="h-8 w-8 text-primary" />
                    <div className="text-left rtl:text-right">
                      <p className="font-medium text-sm text-foreground truncate max-w-[220px]">
                        {jpasFile.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(jpasFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <FileKey className="mx-auto h-8 w-8 text-muted-foreground" />
                    <p className="text-sm font-medium text-foreground">
                      {t("import_jpas.click_to_select", "Click to select a .jpas file")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t("import_jpas.supported_extension", "Files ending with .jpas")}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="jpas-password">
                  {t("import_jpas.password_label", "File Decryption Password")}
                </Label>
                <div className="relative">
                  <Input
                    id="jpas-password"
                    type={showJpasPassword ? "text" : "password"}
                    placeholder="••••••••••••"
                    value={jpasPassword}
                    onChange={(e) => setJpasPassword(e.target.value)}
                    disabled={isPending}
                    className="pr-10 rtl:pl-10 rtl:pr-3"
                  />
                  <button
                    type="button"
                    onClick={() => setShowJpasPassword(!showJpasPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 rtl:left-0 rtl:right-auto rtl:pl-3 rtl:pr-0 text-muted-foreground hover:text-foreground"
                  >
                    {showJpasPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {jpasError && (
                <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{jpasError}</span>
                </div>
              )}

              <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                  disabled={isPending}
                >
                  {t("common.cancel", "Cancel")}
                </Button>
                <Button
                  type="submit"
                  disabled={!jpasFile || !jpasPassword || isPending}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin rtl:ml-2 rtl:mr-0" />
                      {t("import_jpas.decrypting", "Decrypting...")}
                    </>
                  ) : (
                    <>
                      <FileKey className="mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0" />
                      {t("import_jpas.submit_button", "Import Credential")}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          {/* TAB 2: Google Authenticator */}
          <TabsContent value="google_auth" className="space-y-4 pt-1">
            <input
              type="file"
              ref={gaFileInputRef}
              onChange={handleGaFileChange}
              accept="image/*,.txt,.json"
              className="hidden"
            />

            {/* Instruction banner */}
            <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-muted-foreground space-y-1">
              <p className="font-semibold text-foreground flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span>{t("google_auth.info_title", "How to import from Google Authenticator:")}</span>
              </p>
              <p>
                {t(
                  "google_auth.info_description",
                  "In Google Authenticator, go to Transfer accounts → Export accounts. Select or upload the QR code screenshot/image, or a text file containing the export link."
                )}
              </p>
            </div>

            {/* File Upload Zone */}
            <div
              onClick={() => gaFileInputRef.current?.click()}
              className={`cursor-pointer rounded-lg border-2 border-dashed p-4 text-center transition-colors ${
                gaFile
                  ? "border-emerald-500/50 bg-emerald-500/5"
                  : "border-border hover:border-emerald-500/50 hover:bg-muted/50"
              }`}
            >
              {gaFile ? (
                <div className="flex items-center justify-center gap-3">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                  <div className="text-left rtl:text-right">
                    <p className="font-medium text-sm text-foreground truncate max-w-[220px]">
                      {gaFile.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(gaFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <QrCode className="mx-auto h-8 w-8 text-emerald-500" />
                  <p className="text-sm font-medium text-foreground">
                    {t("google_auth.click_to_upload", "Upload QR Code Image or Text File")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t("google_auth.supported_formats", "Supports QR screenshots (.png, .jpg), .txt, .json")}
                  </p>
                </div>
              )}
            </div>

            {/* Toggle Paste Link / Text */}
            <div>
              <button
                type="button"
                onClick={() => setShowPasteInput(!showPasteInput)}
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                <FileText className="h-3.5 w-3.5" />
                <span>
                  {showPasteInput
                    ? t("google_auth.hide_paste", "Hide text input")
                    : t("google_auth.show_paste", "Or paste otpauth-migration:// link directly")}
                </span>
              </button>

              {showPasteInput && (
                <div className="mt-2 space-y-2">
                  <Textarea
                    placeholder="otpauth-migration://offline?data=... or otpauth://totp/..."
                    value={gaPastedText}
                    onChange={(e) => setGaPastedText(e.target.value)}
                    rows={3}
                    className="text-xs font-mono"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={handleParsePastedText}
                    disabled={!gaPastedText.trim()}
                    className="w-full text-xs"
                  >
                    {t("google_auth.parse_text_button", "Parse Pasted Link")}
                  </Button>
                </div>
              )}
            </div>

            {gaError && (
              <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{gaError}</span>
              </div>
            )}

            {/* Target Workspace Selector */}
            {gaAccounts.length > 0 && (
              <div className="space-y-2 pt-1 border-t">
                <Label className="flex items-center gap-1.5 text-xs">
                  <Layers className="h-3.5 w-3.5 text-primary" />
                  <span>{t("google_auth.target_workspace_label", "Save to Workspace:")}</span>
                </Label>
                <Select value={targetWorkspaceId} onValueChange={setTargetWorkspaceId}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {workspaces.map((ws) => (
                      <SelectItem key={ws.id} value={ws.id}>
                        {ws.name} {ws.isDefault ? `(${t("workspace.default_badge", "Default")})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Detected Accounts Preview List */}
            {gaAccounts.length > 0 && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span>
                    {t("google_auth.detected_count", {
                      count: gaAccounts.length,
                      defaultValue: `Found ${gaAccounts.length} Account(s):`,
                    })}
                  </span>
                  <button
                    type="button"
                    onClick={handleToggleSelectAll}
                    className="text-primary hover:underline"
                  >
                    {selectedIndices.length === gaAccounts.length
                      ? t("google_auth.deselect_all", "Deselect All")
                      : t("google_auth.select_all", "Select All")}
                  </button>
                </div>

                <div className="space-y-1.5 max-h-[180px] overflow-y-auto pr-1">
                  {gaAccounts.map((acc, idx) => {
                    const isSelected = selectedIndices.includes(idx);
                    const title = acc.issuer || acc.name.split(":")[0] || "Authenticator";
                    const subtitle = acc.name.includes(":")
                      ? acc.name.split(":").slice(1).join(":")
                      : acc.name;

                    return (
                      <div
                        key={idx}
                        onClick={() => handleToggleAccount(idx)}
                        className={`flex items-center gap-3 p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                          isSelected ? "bg-primary/5 border-primary/40" : "bg-card/50 hover:bg-muted/40"
                        }`}
                      >
                        <Checkbox checked={isSelected} onCheckedChange={() => handleToggleAccount(idx)} />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground truncate">{title}</p>
                          {subtitle && (
                            <p className="text-[11px] text-muted-foreground truncate">{subtitle}</p>
                          )}
                        </div>
                        <span className="text-[10px] bg-muted px-2 py-0.5 rounded font-mono shrink-0">
                          TOTP (6-digit)
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isPending}
              >
                {t("common.cancel", "Cancel")}
              </Button>

              {gaAccounts.length > 0 && (
                <Button
                  type="button"
                  onClick={handleImportGaAccounts}
                  disabled={selectedIndices.length === 0 || isPending}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin rtl:ml-2 rtl:mr-0" />
                      {t("google_auth.importing", "Importing...")}
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0" />
                      {t("google_auth.import_button", {
                        count: selectedIndices.length,
                        defaultValue: `Import ${selectedIndices.length} Account(s)`,
                      })}
                    </>
                  )}
                </Button>
              )}
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
