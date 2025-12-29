"use client";

import { useState } from "react";
import { LogOut, User, Timer, TimerOff } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useAutoLogoutTimer } from "@/hooks/use-auto-logout-timer";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

const LOGOUT_TIMEOUT = 5 * 60; // 5 minutes in seconds

export function UserNav() {
  const { logout } = useAuth();
  const { t } = useTranslation();
  const [isPaused, setIsPaused] = useState(false);
  const { remainingTime, toggle, reset } = useAutoLogoutTimer(logout, LOGOUT_TIMEOUT, isPaused);

  const handleLogout = () => {
    logout();
    reset();
  };
  
  const togglePause = () => {
      setIsPaused(!isPaused);
      toggle();
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  const timerColor = cn({
    "text-green-500": remainingTime > 60,
    "text-yellow-500": remainingTime <= 60 && remainingTime > 20,
    "text-red-500 animate-pulse": remainingTime <= 20,
    "text-muted-foreground opacity-70": isPaused,
  });

  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={`flex cursor-pointer items-center gap-1.5 rounded-md p-2 transition-colors hover:bg-muted/50 font-mono text-sm ${timerColor}`}
              onClick={togglePause}
            >
              {isPaused ? <TimerOff className="h-4 w-4" /> : <Timer className="h-4 w-4" />}
              <span>{formatTime(remainingTime)}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t('user_nav.timer_tooltip')}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DropdownMenu onOpenChange={(open) => { if (open && isPaused) { togglePause(); }}}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary text-primary-foreground">
                <User />
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{t('user_nav.title')}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {t('user_nav.subtitle')}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="ml-2 h-4 w-4" />
            <span>{t('user_nav.logout_button')}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
