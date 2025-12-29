"use client";

import { Languages } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const languages = [
  { code: "en", name: "English" },
  { code: "fa", name: "فارسی" },
  { code: "ar", name: "العربية" },
  { code: "fr", name: "Français" },
  { code: "tr", name: "Türkçe" },
  { code: "de", name: "Deutsch" },
];

export function LanguageSwitcher() {
  const { setLanguage } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <Languages className="ml-2 h-[1.2rem] w-[1.2rem]" />
          <span>Switch Language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center">
        {languages.map((lang) => (
          <DropdownMenuItem key={lang.code} onClick={() => setLanguage(lang.code)}>
            {lang.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
