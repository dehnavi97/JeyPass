import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Checks if the app is running in an Electron environment
 * by looking for the preload script's exposed API.
 * @returns {boolean} True if running in Electron, false otherwise.
 */
export function isElectron(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check if the electron API is exposed via the preload script
  return !!window.electron;
}
