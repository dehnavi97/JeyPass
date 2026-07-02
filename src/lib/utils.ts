import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Checks if the app is running in a desktop shell such as Tauri.
 * @returns {boolean} True when the app is running inside Tauri, false otherwise.
 */
export function isDesktopApp(): boolean {
  if (typeof window === 'undefined') return false;

  return Boolean(
    (window as Window & { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__ ||
    (window as Window & { __TAURI__?: unknown }).__TAURI__
  );
}

export function isElectron(): boolean {
  return isDesktopApp();
}
