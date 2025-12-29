"use client";

import { useRef, useState } from "react";
import { Download, Upload, Info, Settings } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { useVault } from "@/hooks/use-vault";
import { useToast } from "@/hooks/use-toast";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AboutModal } from "./about-modal";


export function BackupRestore() {
  const { backup, restore } = useVault();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [showRestoreAlert, setShowRestoreAlert] = useState(false);
  const { t } = useTranslation();

  const handleBackup = () => {
    backup();
    toast({
      title: t('backup.backup_success_title'),
      description: t('backup.backup_success_description'),
    });
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const success = await restore(file);
      if (success) {
        toast({
          title: t('backup.restore_success_title'),
          description: t('backup.restore_success_description'),
        });
        setTimeout(() => window.location.reload(), 2000);
      } else {
        toast({
          variant: "destructive",
          title: t('backup.restore_fail_title'),
          description: t('backup.restore_fail_description'),
        });
      }
    }
    // Reset the input value to allow selecting the same file again
    if(event.target) event.target.value = "";
  };

  const handleRestoreClick = () => {
    // Close the alert dialog first
    setShowRestoreAlert(false);
    // Then trigger the file input
    fileInputRef.current?.click();
  };

  return (
    <>
      <AlertDialog open={showRestoreAlert} onOpenChange={setShowRestoreAlert}>
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
            <DropdownMenuItem onClick={handleBackup}>
              <Download className="ml-2 h-4 w-4" />
              <span>{t('backup.backup_button')}</span>
            </DropdownMenuItem>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Upload className="ml-2 h-4 w-4" />
                <span>{t('backup.restore_button')}</span>
              </DropdownMenuItem>
            </AlertDialogTrigger>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={(e) => e.preventDefault()} onClick={() => setIsAboutModalOpen(true)}>
              <Info className="ml-2 h-4 w-4" />
              <span>{t('user_nav.about_button')}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('backup.restore_confirm_title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('backup.restore_confirm_description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestoreClick}>{t('common.continue')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
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
