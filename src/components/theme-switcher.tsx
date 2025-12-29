"use client";

import { useState } from "react";
import { Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { ThemeCustomizerModal } from "./theme-customizer-modal";

export function ThemeSwitcher() {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button variant="outline" size="icon" onClick={() => setIsModalOpen(true)}>
        <Palette className="h-[1.2rem] w-[1.2rem]" />
        <span className="sr-only">{t('theme.switch_theme')}</span>
      </Button>
      <ThemeCustomizerModal isOpen={isModalOpen} onOpenChange={setIsModalOpen} />
    </>
  );
}
