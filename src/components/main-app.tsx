"use client";

import { VaultProvider } from "@/contexts/vault-provider";
import { AuthPage } from "@/components/auth-page";
import { Dashboard } from "@/components/dashboard";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

function AppContent() {
  const { isAuthenticated, isReady, isSetup } = useLanguage();
  
  if (!isReady) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
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
