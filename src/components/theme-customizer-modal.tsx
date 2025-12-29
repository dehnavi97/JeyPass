"use client";

import { Check, Paintbrush, Type } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useTheme } from "@/contexts/theme-provider";
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";

type ThemeCustomizerModalProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

const themes = [
  { name: "light", bg: "hsl(200 17% 94%)", primary: "hsl(231 48% 48%)" },
  { name: "dark", bg: "hsl(222 47% 11%)", primary: "hsl(231 48% 60%)" },
  { name: "ocean", bg: "hsl(204 95% 96%)", primary: "hsl(198 89% 45%)" },
  { name: "desert", bg: "hsl(39 31% 94%)", primary: "hsl(25 95% 53%)" },
  { name: "garnet", bg: "hsl(0 12% 7%)", primary: "hsl(0 100% 30%)" },
  { name: "forest", bg: "hsl(120 20% 8%)", primary: "hsl(130 50% 40%)" },
  { name: "onion", bg: "hsl(25 56% 96%)", primary: "hsl(15 84% 60%)" },
  { name: "pastel", bg: "hsl(255 60% 97%)", primary: "hsl(280 80% 70%)" },
  { name: "galaxy", bg: "hsl(258 35% 8%)", primary: "hsl(258 95% 68%)" },
  { name: "seabun", bg: "hsl(190 30% 10%)", primary: "hsl(180 70% 55%)" },
  { name: "azargol", bg: "hsl(330 25% 9%)", primary: "hsl(340 90% 65%)" },
  { name: "cyber", bg: "hsl(120 5% 5%)", primary: "hsl(120 95% 50%)" },
];

const fontSizes = [
  { name: "x-small", label: "xs" },
  { name: "small", label: "sm" },
  { name: "medium", label: "md" },
  { name: "large", label: "lg" },
  { name: "x-large", label: "xl" },
];

export function ThemeCustomizerModal({ isOpen, onOpenChange }: ThemeCustomizerModalProps) {
  const { t } = useTranslation();
  const { theme, setTheme, fontSize, setFontSize } = useTheme();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-background/90 backdrop-blur-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center items-center">
          <Paintbrush className="h-8 w-8 text-primary mb-2" />
          <DialogTitle className="text-2xl font-bold">{t('customizer.title')}</DialogTitle>
          <DialogDescription>{t('customizer.description')}</DialogDescription>
        </DialogHeader>

        <div className="py-6 space-y-8">
          {/* Theme Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-center">{t('customizer.theme_title')}</h3>
            <div className="grid grid-cols-4 gap-4">
              {themes.map((item) => (
                <div key={item.name} className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => setTheme(item.name as any)}>
                  <div
                    className={cn(
                      "h-16 w-16 rounded-full flex items-center justify-center transition-all duration-300 ring-2 ring-offset-2 ring-offset-background",
                      theme === item.name ? "ring-primary" : "ring-transparent"
                    )}
                    style={{ backgroundColor: item.bg }}
                  >
                    <div className="h-8 w-8 rounded-full" style={{ backgroundColor: item.primary }}></div>
                     {theme === item.name && (
                        <Check className="absolute h-6 w-6 text-primary-foreground/80" />
                    )}
                  </div>
                  <span className="text-sm font-medium capitalize">{t(`theme.${item.name}`)}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="border-t border-border -mx-6"></div>

          {/* Font Size Selection */}
          <div className="space-y-4">
             <h3 className="text-lg font-semibold text-center flex items-center justify-center gap-2">
                <Type className="h-5 w-5" />
                {t('customizer.font_size_title')}
            </h3>
            <RadioGroup
              value={fontSize}
              onValueChange={(value) => setFontSize(value as any)}
              className="grid grid-cols-5 gap-2"
            >
              {fontSizes.map((size) => (
                <div key={size.name}>
                  <RadioGroupItem value={size.name} id={`font-${size.name}`} className="peer sr-only" />
                  <Label
                    htmlFor={`font-${size.name}`}
                    className={cn(
                        "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary",
                        "cursor-pointer"
                    )}
                  >
                    <span className={cn(
                        "font-bold uppercase",
                        size.name === 'x-small' && 'text-[10px]',
                        size.name === 'small' && 'text-xs',
                        size.name === 'medium' && 'text-sm',
                        size.name === 'large' && 'text-base',
                        size.name === 'x-large' && 'text-lg',
                    )}>
                        Aa
                    </span>
                    <span className="text-xs capitalize mt-2">{t(`customizer.${size.name}`)}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
