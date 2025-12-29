"use client";

import { Code, Send, Sparkles, Star } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Logo } from "./icons";
import { Button } from "./ui/button";
import { useTranslation } from "react-i18next";

type AboutModalProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

export function AboutModal({ isOpen, onOpenChange }: AboutModalProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-sm max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex flex-col items-center text-center gap-4 py-6">
            <div className="relative">
              <Sparkles className="absolute -top-4 -right-4 text-yellow-400 h-8 w-8 animate-pulse" />
              <Logo className="h-24 w-24 text-primary animate-bounce" />
            </div>
            <DialogTitle className="text-4xl font-bold tracking-tighter">
              JeyPass
            </DialogTitle>
            <p className="text-muted-foreground">{t('about.version')} 1.0.0</p>
          </div>
        </DialogHeader>
        <div className="space-y-4 text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Code className="h-4 w-4" />
            <span>{t('about.developer')}: Javad Dehnavi</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Star className="h-4 w-4" />
            <span>{t('about.description')}</span>
          </div>
        </div>

        <div className="mt-6 p-4 bg-accent/10 rounded-lg text-center">
          <p className="text-muted-foreground mb-3">{t('about.telegram_prompt')}:</p>
          <Button
            variant="outline"
            className="w-full bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 hover:text-blue-700 border-blue-500/20"
            onClick={() => window.open("https://t.me/Jey_Box", "_blank")}
          >
            <Send className="ml-2" />
            t.me/Jey_Box
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
