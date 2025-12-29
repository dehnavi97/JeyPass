"use client";

import { useEffect, useTransition, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Sparkles, Upload, Camera } from "lucide-react";
import { useTranslation } from "react-i18next";
import jsQR from "jsqr";
import { Capacitor } from "@capacitor/core";
import { Camera as CapCamera, CameraResultType, CameraSource, PermissionStatus } from "@capacitor/camera";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { Credential, NewCredential } from "@/lib/types";
import { useVault } from "@/hooks/use-vault";
import { useToast } from "@/hooks/use-toast";
import { PasswordStrengthMeter } from "./password-strength-meter";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

type CredentialFormProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  credentialToEdit?: Credential | null;
};

const QR_CODE_PREFIX = "jeypass:";

export function CredentialForm({
  isOpen,
  onOpenChange,
  credentialToEdit,
}: CredentialFormProps) {
  const { addCredential, updateCredential } = useVault();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const { t } = useTranslation();
  const qrCodeInputRef = useRef<HTMLInputElement>(null);

  const formSchema = z.object({
    title: z.string().min(1, t('form.title_required')),
    username: z.string().optional(),
    password: z.string().min(1, t('form.password_required')),
    category: z.string().optional(),
    totpSecret: z.string().optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      username: "",
      password: "",
      category: "",
      totpSecret: "",
    },
  });

  const password = form.watch("password");

  useEffect(() => {
    if (isOpen) {
      if (credentialToEdit) {
        form.reset({
          title: credentialToEdit.title,
          username: credentialToEdit.username,
          password: credentialToEdit.password,
          category: credentialToEdit.category || "",
          totpSecret: credentialToEdit.totpSecret || "",
        });
      } else {
        form.reset({ title: "", username: "", password: "", category: "", totpSecret: "" });
      }
    }
  }, [credentialToEdit, isOpen, form, t]);
  
  const processQrCodeData = (data: string) => {
    try {
      if (data.startsWith(QR_CODE_PREFIX)) {
        const jsonData = data.substring(QR_CODE_PREFIX.length);
        const credentialData: NewCredential = JSON.parse(jsonData);
        form.reset({
          title: credentialData.title || "",
          username: credentialData.username || "",
          password: credentialData.password || "",
          category: credentialData.category || "",
          totpSecret: credentialData.totpSecret || "",
        });
        toast({ title: t('form.qr_import_success_title'), description: t('form.qr_import_success_description') });
      } else if (data.startsWith('otpauth://')) {
        const url = new URL(data);
        const secret = url.searchParams.get('secret');
        if (secret) {
          form.setValue('totpSecret', secret);
          toast({ title: t('form.qr_success_title'), description: t('form.qr_success_description') });
        } else {
          throw new Error("Secret not found in TOTP QR code.");
        }
      } else {
        throw new Error("Unsupported QR code format.");
      }
    } catch (error) {
      toast({ variant: "destructive", title: t('form.qr_fail_title'), description: t('form.qr_fail_description') });
    }
  };

  const processImage = (src: string) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, img.width, img.height);
      const imageData = ctx.getImageData(0, 0, img.width, img.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      
      if (code) {
        processQrCodeData(code.data);
      } else {
        toast({ variant: "destructive", title: t('form.qr_fail_title'), description: t('form.qr_fail_not_found') });
      }
    };
    img.src = src;
  };

  const handleQrCodeUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      processImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };
  
  const handleCameraScan = async () => {
    if (!Capacitor.isPluginAvailable('Camera')) {
       toast({ variant: "destructive", title: t('form.camera_error_title'), description: t('form.camera_error_unavailable') });
       return;
    }
    try {
        // Check and request permissions
        let permissionStatus: PermissionStatus = await CapCamera.checkPermissions();
        if (permissionStatus.camera !== 'granted') {
          permissionStatus = await CapCamera.requestPermissions({ permissions: ['camera'] });
        }

        if (permissionStatus.camera !== 'granted') {
            toast({ variant: "destructive", title: t('form.camera_error_title'), description: t('form.camera_error_denied') });
            return;
        }

        const image = await CapCamera.getPhoto({
            quality: 90,
            allowEditing: false, // More reliable for QR scanning
            resultType: CameraResultType.Uri,
            source: CameraSource.Camera,
        });

        if (image.webPath) {
            processImage(image.webPath);
        }
    } catch (error: any) {
        console.error("Camera error: ", error);
        // Handle user cancellation gracefully
        if (error.message && error.message.toLowerCase().includes('cancelled')) {
          return;
        }
        toast({ variant: "destructive", title: t('form.camera_error_title'), description: t('form.camera_error_generic') });
    }
  };


  const onSubmit = (values: z.infer<typeof formSchema>) => {
    startTransition(() => {
      const dataToSave = {
        ...values,
        category: values.category || t('form.default_category'),
      };
      if (credentialToEdit) {
        updateCredential(credentialToEdit.id, dataToSave);
        toast({ title: t('form.toast_update_title'), description: t('form.toast_update_description', { title: values.title }) });
      } else {
        addCredential(dataToSave);
        toast({ title: t('form.toast_add_title'), description: t('form.toast_add_description', { title: values.title }) });
      }
      onOpenChange(false);
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{credentialToEdit ? t('form.edit_title') : t('form.add_title')}</DialogTitle>
          <DialogDescription>
            {t('form.description')}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.title_label')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('form.title_placeholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.category_label')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('form.category_placeholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.username_label')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('form.username_placeholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.password_label')}</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <PasswordStrengthMeter password={password} />
            
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-yellow-500"/>
                    {t('form.totp_title')}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <FormField
                    control={form.control}
                    name="totpSecret"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('form.totp_label')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('form.totp_placeholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">{t('common.or')}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Button type="button" variant="outline" className="w-full" onClick={() => qrCodeInputRef.current?.click()}>
                      <Upload className="ml-2 h-4 w-4" />
                      {t('form.qr_button_scan')}
                    </Button>
                     {Capacitor.isNativePlatform() && (
                        <Button type="button" variant="outline" className="w-full" onClick={handleCameraScan}>
                            <Camera className="ml-2 h-4 w-4" />
                            {t('form.qr_button_camera')}
                        </Button>
                    )}
                  </div>
                  <input
                    ref={qrCodeInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleQrCodeUpload}
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>


            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              {credentialToEdit ? t('form.save_button') : t('form.add_button')}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
