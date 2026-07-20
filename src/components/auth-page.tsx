"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, LockKeyhole, ShieldAlert } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { Logo } from "@/components/icons";
import { LanguageSwitcher } from "./language-switcher";

type AuthPageProps = {
  isSetup: boolean;
};

export function AuthPage({ isSetup }: AuthPageProps) {
  const { t } = useTranslation();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const { login, setupMasterPassword } = useAuth();

  const formSchema = z.object({
    password: z.string().min(8, t('auth.password_min_length')),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setError(null);
    startTransition(async () => {
      let success = false;
      if (isSetup) {
        success = await setupMasterPassword(values.password);
      } else {
        success = await login(values.password);
      }

      if (!success) {
        setError(t('auth.invalid_password'));
        form.reset();
      }
    });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="w-full max-w-sm shadow-2xl shadow-primary/10">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <Logo className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">
            {isSetup ? t('auth.setup_title') : t('auth.login_title')}
          </CardTitle>
          <CardDescription>
            {isSetup
              ? t('auth.setup_description')
              : t('auth.login_description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex justify-center">
            <LanguageSwitcher />
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('auth.master_password_label')}</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••••••"
                        {...field}
                        autoFocus
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {error && <p className="text-sm font-medium text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <>
                    <LockKeyhole className="ml-2 h-4 w-4" />
                    {isSetup ? t('auth.setup_button') : t('auth.login_button')}
                  </>
                )}
              </Button>
            </form>
          </Form>
          {isSetup && (
            <div className="mt-6 rounded-xl border border-destructive/25 bg-destructive/5 p-4 text-sm space-y-3 shadow-md">
              <div className="flex items-center gap-2 text-destructive font-bold">
                <ShieldAlert className="h-5 w-5 shrink-0" />
                <span className="text-base">{t('auth.setup_warning_header')}</span>
              </div>
              <ul className="space-y-2 text-xs leading-relaxed text-muted-foreground list-disc list-inside">
                <li>{t('auth.setup_warning_no_recovery')}</li>
                <li>{t('auth.setup_warning_safekeeping')}</li>
                <li>{t('auth.setup_warning_never_share')}</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
