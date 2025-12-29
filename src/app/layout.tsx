"use client";

import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from '@/contexts/theme-provider';
import { LanguageProvider } from '@/contexts/language-provider';
import { AuthProvider } from '@/contexts/auth-provider';
import { CustomTitlebar } from '@/components/custom-titlebar';
import { isElectron } from '@/lib/utils';
import { useEffect, useState } from 'react';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isElectronApp, setIsElectronApp] = useState(false);

  useEffect(() => {
    setIsElectronApp(isElectron());
  }, []);

  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <title>JeyPass Secure Vault</title>
        <meta name="description" content="A modern, secure, and offline-capable password manager." />
      </head>
      <body>
        <AuthProvider>
          <LanguageProvider>
            <ThemeProvider>
              {isElectronApp && <CustomTitlebar />}
              <main className={isElectronApp ? "container-after-titlebar" : "h-screen"}>
                {children}
              </main>
              <Toaster />
            </ThemeProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
