"use client";

import { useEffect, useState } from "react";
import { Logo } from "./icons";
import { isDesktopApp } from "@/lib/utils";

async function getAppWindow() {
  const { getCurrentWindow } = await import("@tauri-apps/api/window");
  return getCurrentWindow();
}

export function CustomTitlebar() {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    const syncState = async () => {
      if (!isDesktopApp()) return;
      const appWindow = await getAppWindow();
      setIsMaximized(await appWindow.isMaximized());
    };

    void syncState();
  }, []);

  const handleMinimize = async () => {
    const appWindow = await getAppWindow();
    await appWindow.hide();
    await appWindow.setSkipTaskbar(true);
  };

  const handleMaximize = async () => {
    const appWindow = await getAppWindow();
    const maximized = await appWindow.isMaximized();

    if (maximized) {
      await appWindow.unmaximize();
      setIsMaximized(false);
    } else {
      await appWindow.toggleMaximize();
      setIsMaximized(true);
    }
  };

  const handleClose = async () => {
    const appWindow = await getAppWindow();
    await appWindow.destroy();
  };

  if (typeof window === 'undefined' || !isDesktopApp()) {
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
