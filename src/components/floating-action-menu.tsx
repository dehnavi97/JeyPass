"use client";

import { useState } from "react";
import { Plus, KeyRound, ShieldPlus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useScrollDirection } from "@/hooks/use-scroll-direction";

type FloatingActionMenuProps = {
  onAddCredential: () => void;
  onGeneratePassword: () => void;
};

export function FloatingActionMenu({ onAddCredential, onGeneratePassword }: FloatingActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();
  const scrollDirection = useScrollDirection();

  const toggleMenu = () => setIsOpen(!isOpen);

  const menuVisible = scrollDirection === "up" || scrollDirection === "none";

  return (
    <TooltipProvider>
      <div className={cn(
        "fixed bottom-6 left-6 z-50 transition-transform duration-300 ease-in-out",
        menuVisible ? "translate-y-0" : "translate-y-24"
      )}>
        {/* Backdrop - Removed as per user request */}
        
        {/* Action Buttons */}
        <div className={cn(
            "flex flex-col items-center gap-4 transition-all duration-300 ease-out",
            isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        )}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="lg"
                className="rounded-full shadow-lg h-14 w-14 bg-accent hover:bg-accent/90"
                onClick={() => {
                  onGeneratePassword();
                  toggleMenu();
                }}
              >
                <KeyRound className="h-6 w-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={15}>
              <p>{t('dashboard.password_generator_button')}</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="lg"
                className="rounded-full shadow-lg h-14 w-14"
                onClick={() => {
                  onAddCredential();
                  toggleMenu();
                }}
              >
                <ShieldPlus className="h-6 w-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={15}>
              <p>{t('dashboard.add_credential_button')}</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Main FAB */}
        <div className="relative mt-4">
          <Button
            size="lg"
            className={cn(
              "rounded-full shadow-lg h-16 w-16 relative transition-transform duration-300 ease-in-out",
              isOpen ? "rotate-45" : "rotate-0"
            )}
            onClick={toggleMenu}
          >
            <Plus className="h-7 w-7 transition-opacity" />
            <span className="sr-only">Open actions menu</span>
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
}
