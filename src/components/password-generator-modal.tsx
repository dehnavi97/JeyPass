"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Copy, Check, RefreshCw, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PasswordStrengthMeter } from "./password-strength-meter";
import { useTranslation } from "react-i18next";

type PasswordGeneratorModalProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

const CHARSETS = {
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>/?",
};

export function PasswordGeneratorModal({
  isOpen,
  onOpenChange,
}: PasswordGeneratorModalProps) {
  const [length, setLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  const generatePassword = useCallback(() => {
    let charset = CHARSETS.lowercase;
    if (includeUppercase) charset += CHARSETS.uppercase;
    if (includeNumbers) charset += CHARSETS.numbers;
    if (includeSymbols) charset += CHARSETS.symbols;

    if (charset === "") {
      toast({
        variant: "destructive",
        title: t('generator.error_title'),
        description: t('generator.error_description'),
      });
      setGeneratedPassword("");
      return;
    }

    let newPassword = "";
    const crypto = window.crypto;
    const randomValues = new Uint32Array(length);
    crypto.getRandomValues(randomValues);

    for (let i = 0; i < length; i++) {
      newPassword += charset[randomValues[i] % charset.length];
    }
    setGeneratedPassword(newPassword);
  }, [length, includeUppercase, includeNumbers, includeSymbols, toast, t]);

  useEffect(() => {
    if (isOpen) {
      generatePassword();
    }
  }, [isOpen, generatePassword]);

  useEffect(() => {
    generatePassword();
  }, [length, includeUppercase, includeNumbers, includeSymbols, generatePassword]);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedPassword);
    setCopied(true);
    toast({ title: t('generator.copy_success_title'), description: t('generator.copy_success_description') });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-sm max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex flex-col items-center text-center gap-2 py-4">
            <ShieldCheck className="h-16 w-16 text-primary animate-pulse" />
            <DialogTitle className="text-3xl font-bold">{t('generator.title')}</DialogTitle>
            <DialogDescription>{t('generator.description')}</DialogDescription>
          </div>
        </DialogHeader>

        <div className="space-y-6 p-4">
          <div className="relative rounded-md bg-muted/50 p-4 pt-12">
            <div className="absolute top-2 left-2 flex gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopy}>
                {copied ? <Check className="text-green-500" /> : <Copy />}
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={generatePassword}>
                <RefreshCw className="transition-transform duration-500 hover:rotate-180" />
              </Button>
            </div>
            <p className="text-center font-mono text-xl tracking-wider break-all">{generatedPassword}</p>
          </div>

          <PasswordStrengthMeter password={generatedPassword} />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="length" className="text-lg">{t('generator.length_label')}: <span className="font-bold text-primary">{length}</span></Label>
              <Slider
                id="length"
                min={8}
                max={64}
                step={1}
                value={[length]}
                onValueChange={(value) => setLength(value[0])}
                className="w-[60%]"
              />
            </div>
            <div dir="ltr" className="grid grid-cols-2 gap-4 pt-4">
              <div className="flex items-center space-x-2">
                <Label htmlFor="uppercase" className="text-base cursor-pointer">{t('generator.uppercase_label')}</Label>
                <Switch id="uppercase" checked={includeUppercase} onCheckedChange={setIncludeUppercase} />
              </div>
              <div className="flex items-center space-x-2">
                <Label htmlFor="numbers" className="text-base cursor-pointer">{t('generator.numbers_label')}</Label>
                <Switch id="numbers" checked={includeNumbers} onCheckedChange={setIncludeNumbers} />
              </div>
              <div className="flex items-center space-x-2">
                <Label htmlFor="symbols" className="text-base cursor-pointer">{t('generator.symbols_label')}</Label>
                <Switch id="symbols" checked={includeSymbols} onCheckedChange={setIncludeSymbols} />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
