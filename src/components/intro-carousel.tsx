"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/contexts/theme-provider";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Shield, FolderHeart, Database, ChevronLeft, ChevronRight, Languages } from "lucide-react";
import { Logo } from "@/components/icons";
import { cn } from "@/lib/utils";

type IntroCarouselProps = {
  onComplete: () => void;
};

const languagesList = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "fa", name: "فارسی", flag: "🇮🇷" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "tr", name: "Türkçe", flag: "🇹🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
];

const themesList = [
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

export function IntroCarousel({ onComplete }: IntroCarouselProps) {
  const { t, i18n } = useTranslation();
  const { language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [currentSlide, setCurrentSlide] = useState(0);

  const totalSlides = 4;
  const isRTL = i18n.dir() === "rtl";

  const handleNext = () => {
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  // Modern Slide Definitions
  const renderSlideContent = () => {
    switch (currentSlide) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="mx-auto mb-2 flex justify-center">
                <Logo className="h-16 w-16 text-primary animate-bounce" />
              </div>
              <h2 className="text-2xl font-black text-foreground sm:text-3xl">
                {t("intro.slide1_title", "زبان و ظاهر برنامه")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t("intro.slide1_desc", "زبان مورد نظر و تمی که بیشتر دوست دارید را انتخاب کنید.")}
              </p>
            </div>

            <div className="space-y-4">
              {/* Language Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold tracking-wider uppercase text-muted-foreground flex items-center gap-1">
                  <Languages className="h-4 w-4 text-primary" />
                  {t("intro.lang_label", "زبان برنامه")}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {languagesList.map((lang) => (
                    <Button
                      key={lang.code}
                      variant={language === lang.code ? "default" : "outline"}
                      className={cn(
                        "h-12 w-full flex items-center justify-center gap-1.5 rounded-xl text-xs font-semibold transition-all border",
                        language === lang.code
                          ? "shadow-lg shadow-primary/20 scale-[1.03]"
                          : "hover:bg-accent"
                      )}
                      onClick={() => setLanguage(lang.code)}
                    >
                      <span className="text-base">{lang.flag}</span>
                      <span>{lang.name}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Theme Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold tracking-wider uppercase text-muted-foreground">
                  {t("intro.theme_label", "پوسته دلخواه")}
                </label>
                <div className="grid grid-cols-4 gap-2 max-h-[140px] overflow-y-auto p-1 border rounded-xl bg-muted/20">
                  {themesList.map((item) => (
                    <button
                      key={item.name}
                      type="button"
                      className={cn(
                        "relative flex flex-col items-center gap-1 p-2 rounded-lg border transition-all duration-200",
                        theme === item.name
                          ? "border-primary bg-primary/10 scale-[1.05]"
                          : "border-transparent hover:bg-muted"
                      )}
                      onClick={() => setTheme(item.name as any)}
                    >
                      <div
                        className="h-7 w-7 rounded-full flex items-center justify-center ring-1 ring-border shadow-inner"
                        style={{ backgroundColor: item.bg }}
                      >
                        <div
                          className="h-3.5 w-3.5 rounded-full"
                          style={{ backgroundColor: item.primary }}
                        />
                      </div>
                      <span className="text-[10px] font-medium capitalize truncate max-w-full">
                        {t(`theme.${item.name}`)}
                      </span>
                      {theme === item.name && (
                        <Check className="absolute top-1 right-1 h-3 w-3 text-primary" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="flex flex-col items-center justify-center text-center space-y-6 py-4">
            <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-primary shadow-xl shadow-primary/5 animate-pulse">
              <Shield className="h-12 w-12" />
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl font-black text-foreground sm:text-3xl">
                {t("intro.slide2_title", "کاملا آفلاین و امن")}
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground max-w-md mx-auto">
                {t(
                  "intro.slide2_desc",
                  "تمامی رمزهای عبور شما به صورت محلی با پیشرفته‌ترین استانداردهای رمزنگاری (AES-GCM-256) ذخیره و قفل می‌شوند. اطلاعات شما هرگز از دستگاهتان خارج نخواهند شد."
                )}
              </p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="flex flex-col items-center justify-center text-center space-y-6 py-4">
            <div className="h-24 w-24 rounded-full bg-accent/10 flex items-center justify-center text-accent shadow-xl shadow-accent/5 animate-pulse">
              <FolderHeart className="h-12 w-12" />
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl font-black text-foreground sm:text-3xl">
                {t("intro.slide3_title", "دسته‌بندی و تب‌های هوشمند")}
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground max-w-md mx-auto">
                {t(
                  "intro.slide3_desc",
                  "برای دسترسی سریع‌تر، رمزهای خود را در دسته‌ها و تب‌های متنوع سازمان‌دهی کنید."
                )}
              </p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="flex flex-col items-center justify-center text-center space-y-6 py-4">
            <div className="h-24 w-24 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-xl shadow-emerald-500/5 animate-pulse">
              <Database className="h-12 w-12" />
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl font-black text-foreground sm:text-3xl">
                {t("intro.slide4_title", "پشتیبان‌گیری رمزگذاری‌شده")}
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground max-w-md mx-auto">
                {t(
                  "intro.slide4_desc",
                  "به راحتی از رمزهای انتخابی خود نسخه پشتیبان تهیه کنید و با یک گذرواژه اختصاصی از آن محافظت کنید."
                )}
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background/50 backdrop-blur-sm">
      <Card className="w-full max-w-lg shadow-2xl border-primary/10 overflow-hidden bg-card/95 relative">
        <CardContent className="p-6 sm:p-8 flex flex-col justify-between min-h-[460px]">
          {/* Header Title & Indicator */}
          <div className="flex items-center justify-between border-b pb-4 mb-4">
            <span className="text-xs font-bold text-muted-foreground/80 tracking-wider uppercase">
              {t("intro.title", "به جی‌پاس خوش آمدید")}
            </span>
            <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
              {currentSlide + 1} / {totalSlides}
            </span>
          </div>

          {/* Active Slide Body */}
          <div className="flex-1 flex flex-col justify-center py-4">
            {renderSlideContent()}
          </div>

          {/* Footer Controls */}
          <div className="flex flex-col space-y-4 pt-6 border-t mt-4">
            {/* Dots indicator */}
            <div className="flex justify-center gap-2">
              {Array.from({ length: totalSlides }).map((_, index) => (
                <button
                  key={index}
                  type="button"
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    currentSlide === index ? "w-6 bg-primary" : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  )}
                  onClick={() => setCurrentSlide(index)}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            <div className="flex items-center justify-between gap-4">
              {/* Prev Button */}
              {currentSlide > 0 ? (
                <Button
                  variant="ghost"
                  className="gap-1 rounded-xl"
                  onClick={handlePrev}
                >
                  {isRTL ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                  {t("intro.prev", "قبلی")}
                </Button>
              ) : (
                <div />
              )}

              {/* Next / Start Button */}
              <Button
                className={cn(
                  "rounded-xl font-bold px-6",
                  currentSlide === totalSlides - 1
                    ? "bg-primary hover:bg-primary/95 text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02] transition-transform"
                    : ""
                )}
                onClick={handleNext}
              >
                {currentSlide === totalSlides - 1 ? (
                  t("intro.start", "شروع کار با برنامه")
                ) : (
                  <>
                    {t("intro.next", "بعدی")}
                    {isRTL ? <ChevronLeft className="h-4 w-4 mr-1" /> : <ChevronRight className="h-4 w-4 ml-1" />}
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
