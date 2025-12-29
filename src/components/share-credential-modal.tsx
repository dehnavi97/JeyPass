"use client";

import { AlertTriangle, Code } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useTranslation } from "react-i18next";
import type { Credential, NewCredential } from "@/lib/types";
import { QRCodeCanvas } from "./qrcode";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

type ShareCredentialModalProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  credential: Credential;
};

const QR_CODE_PREFIX = "jeypass:";

export function ShareCredentialModal({ isOpen, onOpenChange, credential }: ShareCredentialModalProps) {
  const { t } = useTranslation();

  // Prepare data for QR code, excluding the ID.
  const dataToShare: NewCredential = {
    title: credential.title,
    username: credential.username,
    password: credential.password,
    category: credential.category,
    totpSecret: credential.totpSecret,
  };

  const qrCodeValue = `${QR_CODE_PREFIX}${JSON.stringify(dataToShare)}`;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">{t('share.title')}</DialogTitle>
          <DialogDescription className="text-center">
            {t('share.description')}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center p-4 bg-white rounded-lg">
          <QRCodeCanvas text={qrCodeValue} options={{ width: 256, margin: 2 }} />
        </div>
        <Alert variant="destructive" className="mt-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{t('share.warning_title')}</AlertTitle>
          <AlertDescription>
            {t('share.warning_description')}
          </AlertDescription>
        </Alert>
      </DialogContent>
    </Dialog>
  );
}
