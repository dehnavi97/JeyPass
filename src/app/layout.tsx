"use client";

import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from '@/contexts/theme-provider';
import { LanguageProvider } from '@/contexts/language-provider';
import { AuthProvider } from '@/contexts/auth-provider';
import { CustomTitlebar } from '@/components/custom-titlebar';
import { isDesktopApp } from '@/lib/utils';
import { useEffect, useState } from 'react';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isDesktopAppShell, setIsDesktopAppShell] = useState(false);

  useEffect(() => {
    setIsDesktopAppShell(isDesktopApp());

    if (!isDesktopApp()) {
      return;
    }

    const preventContextMenu = (event: MouseEvent) => {
      event.preventDefault();
    };

    window.addEventListener('contextmenu', preventContextMenu);

    return () => {
      window.removeEventListener('contextmenu', preventContextMenu);
    };
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
              {isDesktopAppShell && <CustomTitlebar />}
              <main className={isDesktopAppShell ? "container-after-titlebar" : "h-screen"}>
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
