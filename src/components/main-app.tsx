"use client";

import { useState, useEffect } from "react";
import { VaultProvider } from "@/contexts/vault-provider";
import { AuthPage } from "@/components/auth-page";
import { Dashboard } from "@/components/dashboard";
import { IntroCarousel } from "@/components/intro-carousel";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

function AppContent() {
  const { isAuthenticated, isReady, isSetup } = useLanguage();
  const [introCompleted, setIntroCompleted] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const completed = localStorage.getItem("jeypass_intro_completed") === "true";
      setIntroCompleted(completed);
    }
  }, []);
  
  if (!isReady || introCompleted === null) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // If we are setting up for the first time, and intro isn't completed, show the gorgeous Intro Carousel
  if (isSetup && !introCompleted) {
    return (
      <IntroCarousel
        onComplete={() => {
          localStorage.setItem("jeypass_intro_completed", "true");
          setIntroCompleted(true);
        }}
      />
    );
  }

  if (isAuthenticated) {
    return (
      <VaultProvider>
        <Dashboard />
      </VaultProvider>
    );
  }

  return <AuthPage isSetup={isSetup} />;
}

export function MainApp() {
  return <AppContent />;
}
