"use client";

import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useScrollDirection } from "@/hooks/use-scroll-direction";

type FloatingActionMenuProps = {
  onAddCredential: () => void;
  onGeneratePassword: () => void;
};

export function FloatingActionMenu({ onAddCredential }: FloatingActionMenuProps) {
  const { t } = useTranslation();
  const scrollDirection = useScrollDirection();

  const menuVisible = scrollDirection === "up" || scrollDirection === "none";

  return (
    <TooltipProvider>
      <div className={cn(
        "fixed bottom-6 left-6 z-50 transition-transform duration-300 ease-in-out",
        menuVisible ? "translate-y-0" : "translate-y-24"
      )}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="lg"
              className="rounded-full shadow-xl h-16 w-16 bg-primary hover:bg-primary/95 text-primary-foreground transform active:scale-95 transition-transform duration-200"
              onClick={onAddCredential}
            >
              <Plus className="h-8 w-8" />
              <span className="sr-only">{t('dashboard.add_credential_button')}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={15}>
            <p>{t('dashboard.add_credential_button')}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
