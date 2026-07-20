"use client";

import { useState } from "react";
import { LogOut, User, Timer, TimerOff, KeyRound, Loader2, Lock, Eye, EyeOff } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useAutoLogoutTimer } from "@/hooks/use-auto-logout-timer";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { useToast } from "@/hooks/use-toast";

const LOGOUT_TIMEOUT = 5 * 60; // 5 minutes in seconds

export function UserNav() {
  const { logout, changeMasterPassword } = useAuth();
  const { t } = useTranslation();
  const { toast } = useToast();

  const [isPaused, setIsPaused] = useState(false);
  const { remainingTime, toggle, reset } = useAutoLogoutTimer(logout, LOGOUT_TIMEOUT, isPaused);

  // Password Change state
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [oldPassVisible, setOldPassVisible] = useState(false);
  const [newPassVisible, setNewPassVisible] = useState(false);
  const [confirmPassVisible, setConfirmPassVisible] = useState(false);

  const handleLogout = () => {
    logout();
    reset();
  };
  
  const togglePause = () => {
      setIsPaused(!isPaused);
      toggle();
  };

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

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 8) {
      setError(t('auth.password_min_length'));
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError(t('user_nav.password_mismatch'));
      return;
    }

    setIsPending(true);
    try {
      const success = await changeMasterPassword(oldPassword, newPassword);
      if (success) {
        toast({
          title: t('user_nav.change_password_success'),
          variant: "default",
        });
        setIsChangePasswordOpen(false);
        // Reset fields
        setOldPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
      } else {
        setError(t('user_nav.change_password_fail'));
      }
    } catch (err) {
      setError(t('user_nav.change_password_fail'));
    } finally {
      setIsPending(false);
    }
  };

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

          <DropdownMenuItem onClick={() => setIsChangePasswordOpen(true)}>
            <KeyRound className="ml-2 h-4 w-4" />
            <span>{t('user_nav.change_password_button')}</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="ml-2 h-4 w-4" />
            <span>{t('user_nav.logout_button')}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Change Password Modal */}
      <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
        <DialogContent className="sm:max-w-[420px] bg-background/95 backdrop-blur-sm">
          <DialogHeader className="items-center text-center">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
              <KeyRound className="h-6 w-6" />
            </div>
            <DialogTitle className="text-xl font-bold">{t('user_nav.change_password_title')}</DialogTitle>
            <DialogDescription>{t('user_nav.change_password_desc')}</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleChangePasswordSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="old-password">{t('user_nav.old_password_label')}</Label>
              <div className="relative">
                <Input
                  id="old-password"
                  type={oldPassVisible ? "text" : "password"}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="pl-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setOldPassVisible(!oldPassVisible)}
                  className="absolute left-3 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  {oldPassVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">{t('user_nav.new_password_label')}</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={newPassVisible ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pl-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setNewPassVisible(!newPassVisible)}
                  className="absolute left-3 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  {newPassVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-new-password">{t('user_nav.confirm_new_password_label')}</Label>
              <div className="relative">
                <Input
                  id="confirm-new-password"
                  type={confirmPassVisible ? "text" : "password"}
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="pl-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setConfirmPassVisible(!confirmPassVisible)}
                  className="absolute left-3 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  {confirmPassVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && <p className="text-sm font-semibold text-destructive">{error}</p>}

            <Button type="submit" className="w-full mt-2" disabled={isPending}>
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Lock className="ml-2 h-4 w-4" />
                  {t('user_nav.change_password_button')}
                </>
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
