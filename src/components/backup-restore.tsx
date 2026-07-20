"use client";

import { useRef, useState, useMemo } from "react";
import { Download, Upload, Info, Settings, Eye, EyeOff, Check, Folder, Search, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { useVault } from "@/hooks/use-vault";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AboutModal } from "./about-modal";
import { cn } from "@/lib/utils";

export function BackupRestore() {
  const { credentials, backupSelected, restoreCustom } = useVault();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();

  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);

  // Backup dialog states
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [backupPassword, setBackupPassword] = useState("");
  const [showBackupPass, setShowBackupPass] = useState(false);
  const [selectedCredIds, setSelectedCredIds] = useState<string[]>([]);
  const [backupSearch, setBackupSearch] = useState("");

  // Restore dialog states
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [restorePassword, setRestorePassword] = useState("");
  const [showRestorePass, setShowRestorePass] = useState(false);
  const [deleteExisting, setDeleteExisting] = useState(false);
  const [replaceDuplicates, setReplaceDuplicates] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  // Categorize & filter credentials for Backup List
  const filteredCreds = useMemo(() => {
    return credentials.filter(c =>
      c.title.toLowerCase().includes(backupSearch.toLowerCase())
    );
  }, [credentials, backupSearch]);

  const groupedBackupCreds = useMemo(() => {
    const defaultCategory = t('form.default_category');
    return filteredCreds.reduce((acc, c) => {
      const category = c.category || defaultCategory;
      if (!acc[category]) acc[category] = [];
      acc[category].push(c);
      return acc;
    }, {} as Record<string, typeof credentials>);
  }, [filteredCreds, t]);

  const backupCategories = useMemo(() => {
    return Object.keys(groupedBackupCreds).sort();
  }, [groupedBackupCreds]);

  // Actions
  const handleOpenBackup = () => {
    // Reset state & select all by default
    setBackupPassword("");
    setSelectedCredIds(credentials.map(c => c.id));
    setBackupSearch("");
    setShowBackupModal(true);
  };

  const handleSelectAll = () => {
    setSelectedCredIds(credentials.map(c => c.id));
  };

  const handleDeselectAll = () => {
    setSelectedCredIds([]);
  };

  const toggleSelectCred = (id: string) => {
    setSelectedCredIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const triggerDownloadBackup = async () => {
    if (!backupPassword) {
      toast({
        variant: "destructive",
        title: t('generator.error_title'),
        description: t('backup.password_empty_err'),
      });
      return;
    }

    if (selectedCredIds.length === 0) {
      toast({
        variant: "destructive",
        title: t('generator.error_title'),
        description: t('backup.no_selection_err'),
      });
      return;
    }

    const success = await backupSelected(selectedCredIds, backupPassword);
    if (success) {
      toast({
        title: t('backup.backup_success_title'),
        description: t('backup.backup_success_description'),
      });
      setShowBackupModal(false);
    } else {
      toast({
        variant: "destructive",
        title: t('backup.restore_fail_title'),
        description: t('backup.restore_fail_description'),
      });
    }
  };

  // Restore logic
  const handleRestoreFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setRestoreFile(file);
      setRestorePassword("");
      setDeleteExisting(false);
      setReplaceDuplicates(false);
      setShowRestoreModal(true);
    }
    if (event.target) event.target.value = "";
  };

  const triggerRestore = async () => {
    if (!restoreFile) return;
    if (!restorePassword) {
      toast({
        variant: "destructive",
        title: t('generator.error_title'),
        description: t('backup.password_empty_err'),
      });
      return;
    }

    setIsRestoring(true);
    const success = await restoreCustom(
      restoreFile,
      restorePassword,
      deleteExisting,
      // If deleteExisting is true, replaceDuplicates is ignored or falsy
      deleteExisting ? false : replaceDuplicates
    );

    setIsRestoring(false);
    if (success) {
      toast({
        title: t('backup.restore_success_title'),
        description: t('backup.restore_success_description'),
      });
      setShowRestoreModal(false);
      setTimeout(() => window.location.reload(), 2000);
    } else {
      toast({
        variant: "destructive",
        title: t('backup.restore_fail_title'),
        description: t('backup.restore_fail_description'),
      });
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <Settings className="h-5 w-5" />
            <span className="sr-only">{t('backup.menu_title')}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{t('backup.menu_title')}</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={handleOpenBackup}>
            <Download className="ml-2 h-4 w-4" />
            <span>{t('backup.backup_button')}</span>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleRestoreFileClick}>
            <Upload className="ml-2 h-4 w-4" />
            <span>{t('backup.restore_button')}</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onSelect={(e) => e.preventDefault()} onClick={() => setIsAboutModalOpen(true)}>
            <Info className="ml-2 h-4 w-4" />
            <span>{t('user_nav.about_button')}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Modern Backup Modal */}
      <Dialog open={showBackupModal} onOpenChange={setShowBackupModal}>
        <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto bg-background/95 backdrop-blur-sm">
          <DialogHeader className="items-center text-center">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
              <Download className="h-6 w-6" />
            </div>
            <DialogTitle className="text-xl font-bold">{t('backup.backup_modal_title')}</DialogTitle>
            <DialogDescription>{t('backup.backup_modal_desc')}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="backup-password">{t('backup.backup_password_label')}</Label>
              <div className="relative">
                <Input
                  id="backup-password"
                  type={showBackupPass ? "text" : "password"}
                  placeholder="••••••••••••"
                  value={backupPassword}
                  onChange={(e) => setBackupPassword(e.target.value)}
                  className="pl-10"
                />
                <button
                  type="button"
                  onClick={() => setShowBackupPass(!showBackupPass)}
                  className="absolute left-3 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  {showBackupPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* List credentials with checkboxes */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">{t('dashboard.title')}</span>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="h-7 text-xs font-semibold px-2" onClick={handleSelectAll}>
                    {t('backup.select_all')}
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 text-xs font-semibold px-2" onClick={handleDeselectAll}>
                    {t('backup.deselect_all')}
                  </Button>
                </div>
              </div>

              <div className="relative">
                <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('dashboard.search_placeholder')}
                  className="pr-9"
                  value={backupSearch}
                  onChange={(e) => setBackupSearch(e.target.value)}
                />
              </div>

              {/* Scrollable checklist */}
              <div className="border rounded-xl p-3 max-h-[180px] overflow-y-auto space-y-4 bg-muted/10">
                {backupCategories.length > 0 ? (
                  backupCategories.map(cat => (
                    <div key={cat} className="space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                        <Folder className="h-3 w-3 text-primary" />
                        <span>{cat}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pl-3 pr-3">
                        {groupedBackupCreds[cat].map(cred => {
                          const isChecked = selectedCredIds.includes(cred.id);
                          return (
                            <label
                              key={cred.id}
                              className={cn(
                                "flex items-center gap-2 p-2 rounded-lg border text-sm font-medium cursor-pointer transition-all",
                                isChecked ? "border-primary bg-primary/5" : "border-border hover:bg-muted/40"
                              )}
                            >
                              <Checkbox
                                id={cred.id}
                                checked={isChecked}
                                onCheckedChange={() => toggleSelectCred(cred.id)}
                              />
                              <span className="truncate select-none">{cred.title}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-4">{t('dashboard.no_results_title')}</p>
                )}
              </div>
            </div>

            <Button className="w-full mt-2" onClick={triggerDownloadBackup}>
              <Download className="ml-2 h-4 w-4" />
              {t('backup.backup_download_btn')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modern Restore Modal */}
      <Dialog open={showRestoreModal} onOpenChange={setShowRestoreModal}>
        <DialogContent className="sm:max-w-[420px] bg-background/95 backdrop-blur-sm">
          <DialogHeader className="items-center text-center">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
              <Upload className="h-6 w-6" />
            </div>
            <DialogTitle className="text-xl font-bold">{t('backup.restore_modal_title')}</DialogTitle>
            <DialogDescription>{t('backup.restore_modal_desc')}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* File info */}
            {restoreFile && (
              <div className="flex items-center gap-2 p-3 border rounded-xl bg-muted/20">
                <ShieldCheck className="h-5 w-5 text-green-500" />
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-bold truncate">{restoreFile.name}</p>
                  <p className="text-xs text-muted-foreground">{(restoreFile.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
            )}

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="restore-password">{t('backup.backup_password_label')}</Label>
              <div className="relative">
                <Input
                  id="restore-password"
                  type={showRestorePass ? "text" : "password"}
                  placeholder="••••••••••••"
                  value={restorePassword}
                  onChange={(e) => setRestorePassword(e.target.value)}
                  className="pl-10"
                />
                <button
                  type="button"
                  onClick={() => setShowRestorePass(!showRestorePass)}
                  className="absolute left-3 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  {showRestorePass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Checkbox 1: Delete existing */}
            <div className="flex items-center gap-3 p-3 border rounded-xl bg-muted/10 transition-all">
              <Checkbox
                id="delete-existing"
                checked={deleteExisting}
                onCheckedChange={(checked) => setDeleteExisting(!!checked)}
              />
              <Label htmlFor="delete-existing" className="text-sm font-medium leading-none cursor-pointer">
                {t('backup.delete_existing_label')}
              </Label>
            </div>

            {/* Checkbox 2: Replace duplicates (ONLY visible if Checkbox 1 is NOT checked) */}
            {!deleteExisting && (
              <div className="flex items-center gap-3 p-3 border rounded-xl bg-muted/10 transition-all animate-in fade-in slide-in-from-top-2 duration-200">
                <Checkbox
                  id="replace-duplicates"
                  checked={replaceDuplicates}
                  onCheckedChange={(checked) => setReplaceDuplicates(!!checked)}
                />
                <Label htmlFor="replace-duplicates" className="text-sm font-medium leading-none cursor-pointer">
                  {t('backup.replace_duplicates_label')}
                </Label>
              </div>
            )}

            <Button className="w-full mt-2" onClick={triggerRestore} disabled={isRestoring}>
              {isRestoring ? (
                <span className="animate-spin mr-2 h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
              ) : (
                <Upload className="ml-2 h-4 w-4" />
              )}
              {t('backup.restore_submit_btn')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".jeypass-backup"
        className="hidden"
      />
      
      <AboutModal isOpen={isAboutModalOpen} onOpenChange={setIsAboutModalOpen} />
    </>
  );
}
