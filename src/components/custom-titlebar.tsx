"use client";

import { useEffect, useState } from "react";
import { Logo } from "./icons";

// Define the API exposed by the preload script
declare global {
  interface Window {
    electron: {
      minimize: () => void;
      maximize: () => void;
      close: () => void;
      on: (channel: string, callback: (...args: any[]) => void) => () => void;
    };
  }
}

export function CustomTitlebar() {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    // These listeners update the state when the window is maximized or unmaximized
    // by the OS, e.g., by double-clicking the title bar.
    const unsubMaximize = window.electron.on('window-maximized', () => setIsMaximized(true));
    const unsubUnmaximize = window.electron.on('window-unmaximized', () => setIsMaximized(false));

    // Cleanup function to remove listeners
    return () => {
      unsubMaximize();
      unsubUnmaximize();
    };
  }, []);

  const handleMinimize = () => window.electron.minimize();
  const handleMaximize = () => window.electron.maximize();
  const handleClose = () => window.electron.close();

  // We don't render anything if not in Electron
  if (typeof window === 'undefined' || !window.electron) {
    return null;
  }

  return (
    <div className="titlebar" dir="ltr">
      <div className="titlebar-drag-region">
        <Logo className="h-5 w-5 text-primary mr-2" />
        <span>JeyPass</span>
      </div>
      <div className="titlebar-controls">
        <button onClick={handleMinimize} className="titlebar-button">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 5H10" stroke="currentColor" strokeWidth="1"/></svg>
        </button>
        <button onClick={handleMaximize} className="titlebar-button">
          {isMaximized ? (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 8V2H8" stroke="currentColor" strokeWidth="1"/><path d="M2.5 7.5H8.5V1.5H2.5V7.5Z" stroke="currentColor" strokeWidth="1"/></svg>
          ) : (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1.5 1.5H8.5V8.5H1.5V1.5Z" stroke="currentColor" strokeWidth="1"/></svg>
          )}
        </button>
        <button onClick={handleClose} className="titlebar-button close">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L9 9" stroke="currentColor" strokeWidth="1"/><path d="M9 1L1 9" stroke="currentColor" strokeWidth="1"/></svg>
        </button>
      </div>
    </div>
  );
}
