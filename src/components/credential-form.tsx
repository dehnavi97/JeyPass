"use client";

import { useEffect, useTransition, useRef, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Sparkles, Upload, Camera, Wand2, Eye, EyeOff, AlignLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import jsQR from "jsqr";
import { Capacitor } from "@capacitor/core";
import { Camera as CapCamera, CameraResultType, CameraSource, PermissionStatus } from "@capacitor/camera";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Credential, NewCredential } from "@/lib/types";
import { useVault } from "@/hooks/use-vault";
import { useToast } from "@/hooks/use-toast";
import { PasswordStrengthMeter } from "./password-strength-meter";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PasswordGeneratorModal } from "./password-generator-modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectSeparator,
} from "@/components/ui/select";

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
  const { credentials, addCredential, updateCredential } = useVault();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const { t } = useTranslation();
  const qrCodeInputRef = useRef<HTMLInputElement>(null);

  // Password Generator Modal inside Form
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  // States for Category & Tab selectors
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [customCategory, setCustomCategory] = useState("");
  const [showNewTabInput, setShowNewTabInput] = useState(false);
  const [customTab, setCustomTab] = useState("");

  const formSchema = z.object({
    title: z.string().min(1, t('form.title_required')),
    username: z.string().optional(),
    password: z.string().min(1, t('form.password_required')),
    category: z.string().optional(),
    totpSecret: z.string().optional(),
    tab: z.string().optional(),
    description: z.string().optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      username: "",
      password: "",
      category: "",
      totpSecret: "",
      tab: "",
      description: "",
    },
  });

  const passwordValue = form.watch("password");

  // Load existing categories and tabs to show in dropdown
  const existingCategories = useMemo(() => {
    const cats = new Set<string>();
    credentials.forEach(c => {
      if (c.category && c.category.trim()) {
        cats.add(c.category.trim());
      }
    });
    // Add default category if empty
    if (cats.size === 0) {
      cats.add(t('form.default_category'));
    }
    return Array.from(cats).sort();
  }, [credentials, t]);

  const existingTabs = useMemo(() => {
    const tabs = new Set<string>();
    tabs.add("Default");
    credentials.forEach(c => {
      if (c.tab && c.tab.trim()) {
        tabs.add(c.tab.trim());
      }
    });
    return Array.from(tabs).sort();
  }, [credentials]);

  useEffect(() => {
    if (isOpen) {
      setShowNewCategoryInput(false);
      setCustomCategory("");
      setShowNewTabInput(false);
      setCustomTab("");

      if (credentialToEdit) {
        form.reset({
          title: credentialToEdit.title,
          username: credentialToEdit.username || "",
          password: credentialToEdit.password || "",
          category: credentialToEdit.category || "",
          totpSecret: credentialToEdit.totpSecret || "",
          tab: credentialToEdit.tab || "Default",
          description: credentialToEdit.description || "",
        });
      } else {
        form.reset({
          title: "",
          username: "",
          password: "",
          category: t('form.default_category'),
          totpSecret: "",
          tab: "Default",
          description: "",
        });
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
          category: credentialData.category || t('form.default_category'),
          totpSecret: credentialData.totpSecret || "",
          tab: credentialData.tab || "Default",
          description: credentialData.description || "",
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
            allowEditing: false,
            resultType: CameraResultType.Uri,
            source: CameraSource.Camera,
        });

        if (image.webPath) {
            processImage(image.webPath);
        }
    } catch (error: any) {
        console.error("Camera error: ", error);
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
        tab: values.tab || "Default",
        description: values.description || "",
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
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto bg-background/95 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{credentialToEdit ? t('form.edit_title') : t('form.add_title')}</DialogTitle>
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
                      <Input placeholder={t('form.title_placeholder')} {...field} className="rounded-xl" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                {/* Modern Category Selector */}
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem className="flex flex-col space-y-1.5 justify-end">
                      <FormLabel>{t('form.category_label')}</FormLabel>
                      {!showNewCategoryInput ? (
                        <Select
                          onValueChange={(val) => {
                            if (val === "__CREATE_NEW__") {
                              setShowNewCategoryInput(true);
                              field.onChange("");
                            } else {
                              field.onChange(val);
                            }
                          }}
                          value={field.value || t('form.default_category')}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full rounded-xl border border-input bg-card text-card-foreground">
                              <SelectValue placeholder={t('form.category_placeholder')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {existingCategories.map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {cat}
                              </SelectItem>
                            ))}
                            <SelectSeparator />
                            <SelectItem value="__CREATE_NEW__" className="text-primary font-bold">
                              + ساخت دسته‌بندی جدید...
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="flex gap-1 items-center">
                          <Input
                            placeholder="نام جدید..."
                            value={customCategory}
                            onChange={(e) => {
                              setCustomCategory(e.target.value);
                              field.onChange(e.target.value);
                            }}
                            className="flex-1 rounded-xl h-10"
                            autoFocus
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-xs h-10"
                            onClick={() => {
                              setShowNewCategoryInput(false);
                              setCustomCategory("");
                              field.onChange(t('form.default_category'));
                            }}
                          >
                            لغو
                          </Button>
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Modern Tab Selector */}
                <FormField
                  control={form.control}
                  name="tab"
                  render={({ field }) => (
                    <FormItem className="flex flex-col space-y-1.5 justify-end">
                      <FormLabel>تب (Tab)</FormLabel>
                      {!showNewTabInput ? (
                        <Select
                          onValueChange={(val) => {
                            if (val === "__CREATE_NEW__") {
                              setShowNewTabInput(true);
                              field.onChange("");
                            } else {
                              field.onChange(val);
                            }
                          }}
                          value={field.value || "Default"}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full rounded-xl border border-input bg-card text-card-foreground">
                              <SelectValue placeholder="انتخاب تب..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {existingTabs.map((tb) => (
                              <SelectItem key={tb} value={tb}>
                                {tb}
                              </SelectItem>
                            ))}
                            <SelectSeparator />
                            <SelectItem value="__CREATE_NEW__" className="text-primary font-bold">
                              + ساخت تب جدید...
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="flex gap-1 items-center">
                          <Input
                            placeholder="نام جدید..."
                            value={customTab}
                            onChange={(e) => {
                              setCustomTab(e.target.value);
                              field.onChange(e.target.value);
                            }}
                            className="flex-1 rounded-xl h-10"
                            autoFocus
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-xs h-10"
                            onClick={() => {
                              setShowNewTabInput(false);
                              setCustomTab("");
                              field.onChange("Default");
                            }}
                          >
                            لغو
                          </Button>
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.username_label')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('form.username_placeholder')} {...field} className="rounded-xl" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password Field with embedded Generator and eye visibility toggles */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.password_label')}</FormLabel>
                    <div className="relative flex items-center">
                      <FormControl>
                        <Input
                          type={passwordVisible ? "text" : "password"}
                          placeholder="••••••••••••"
                          {...field}
                          className="rounded-xl pl-20"
                        />
                      </FormControl>
                      <div className="absolute left-2 flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => setPasswordVisible(!passwordVisible)}
                        >
                          {passwordVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 border-primary/20 text-primary hover:bg-primary/5 rounded-lg"
                          onClick={() => setIsGeneratorOpen(true)}
                        >
                          <Wand2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <PasswordStrengthMeter password={passwordValue} />

              {/* Description Field (Requirement 9) */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5">
                      <AlignLeft className="h-4 w-4 text-muted-foreground" />
                      توضیحات (Description)
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="توضیحات یا یادداشت دلخواه خود را بنویسید..."
                        {...field}
                        className="rounded-xl min-h-[70px] resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                            <Input placeholder={t('form.totp_placeholder')} {...field} className="rounded-xl" />
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
                      <Button type="button" variant="outline" className="w-full rounded-xl" onClick={() => qrCodeInputRef.current?.click()}>
                        <Upload className="ml-2 h-4 w-4" />
                        {t('form.qr_button_scan')}
                      </Button>
                       {Capacitor.isNativePlatform() && (
                          <Button type="button" variant="outline" className="w-full rounded-xl" onClick={handleCameraScan}>
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

              <Button type="submit" className="w-full rounded-xl font-bold" disabled={isPending}>
                {isPending && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                {credentialToEdit ? t('form.save_button') : t('form.add_button')}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Embedded Password Generator Modal */}
      <PasswordGeneratorModal
        isOpen={isGeneratorOpen}
        onOpenChange={setIsGeneratorOpen}
        onUsePassword={(generated) => {
          form.setValue("password", generated);
          toast({
            title: "گذرواژه اعمال شد",
            description: "گذرواژه قوی ساخته شده در فرم قرار گرفت.",
          });
        }}
      />
    </>
  );
}
