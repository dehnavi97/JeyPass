"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";

type Theme = "dark" | "light" | "ocean" | "desert" | "garnet" | "forest" | "onion" | "pastel" | "galaxy" | "seabun" | "azargol" | "cyber";
type FontSize = "x-small" | "small" | "medium" | "large" | "x-large";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  defaultFontSize?: FontSize;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
};

const initialState: ThemeProviderState = {
  theme: "light",
  setTheme: () => null,
  fontSize: "medium",
  setFontSize: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

// Helper to convert HSL string to HEX, needed for status bar
function hslToHex(hslStr: string): string {
  const [h, s, l] = hslStr.split(" ").map(parseFloat);
  const saturation = s / 100;
  const lightness = l / 100;

  const c = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lightness - c / 2;
  let r = 0, g = 0, b = 0;

  if (0 <= h && h < 60) {
    r = c; g = x; b = 0;
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x;
  }
  
  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);

  return `#${[r, g, b].map(c => c.toString(16).padStart(2, '0')).join('')}`;
}


export function ThemeProvider({
  children,
  defaultTheme = "light",
  defaultFontSize = "medium",
  storageKey = "jeypass-appearance",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return defaultTheme;
    const stored = localStorage.getItem(storageKey);
    return (stored ? JSON.parse(stored).theme : defaultTheme) || defaultTheme;
  });

  const [fontSize, setFontSize] = useState<FontSize>(() => {
    if (typeof window === "undefined") return defaultFontSize;
    const stored = localStorage.getItem(storageKey);
    return (stored ? JSON.parse(stored).fontSize : defaultFontSize) || defaultFontSize;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Handle theme classes
    root.classList.remove("light", "dark", "theme-ocean", "theme-desert", "theme-garnet", "theme-forest", "theme-onion", "theme-pastel", "theme-galaxy", "theme-seabun", "theme-azargol", "theme-cyber");
    const isDark = ["dark", "garnet", "forest", "galaxy", "seabun", "azargol", "cyber"].includes(theme);
    root.classList.add(isDark ? "dark" : "light");
    if (theme !== "light" && theme !== "dark") {
        root.classList.add(`theme-${theme}`);
    }

    // Handle font size CSS variable
    let baseSize = 16;
    if (fontSize === "x-small") baseSize = 12;
    else if (fontSize === "small") baseSize = 14;
    else if (fontSize === "large") baseSize = 18;
    else if (fontSize === "x-large") baseSize = 20;
    root.style.setProperty('--font-size-base', `${baseSize}px`);
    
    // Save to local storage
    const appearance = JSON.stringify({ theme, fontSize });
    localStorage.setItem(storageKey, appearance);

    // Handle Capacitor Status Bar
    if (Capacitor.isNativePlatform()) {
      const setStatusBar = async () => {
        try {
          // Set style (dark or light icons)
          await StatusBar.setStyle({
            style: isDark ? Style.Dark : Style.Light,
          });

          // Set background color
          // We need a brief delay to ensure CSS variables are applied
          setTimeout(async () => {
            const bgColorHsl = getComputedStyle(root).getPropertyValue('--background').trim();
            const bgColorHex = hslToHex(bgColorHsl);
            await StatusBar.setBackgroundColor({ color: bgColorHex });
          }, 50);

        } catch (error) {
          console.error("Failed to set status bar style", error);
        }
      };
      setStatusBar();
    }

  }, [theme, fontSize, storageKey]);

  const value = {
    theme,
    setTheme,
    fontSize,
    setFontSize,
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
