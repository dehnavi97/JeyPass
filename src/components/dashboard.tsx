"use client";

import { useState, useMemo, useEffect } from "react";
import { PlusCircle, Shield, Folder, Search } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useVault } from "@/hooks/use-vault";
import { Button } from "@/components/ui/button";
import { CredentialCard } from "@/components/credential-card";
import { CredentialForm } from "@/components/credential-form";
import { UserNav } from "@/components/user-nav";
import { BackupRestore } from "@/components/backup-restore";
import { Logo } from "@/components/icons";
import type { Credential } from "@/lib/types";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { PasswordGeneratorModal } from "./password-generator-modal";
import { ThemeSwitcher } from "./theme-switcher";
import { FloatingActionMenu } from "./floating-action-menu";
import { isElectron } from "@/lib/utils";

export function Dashboard() {
  const { credentials, deleteCredential } = useVault();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [credentialToEdit, setCredentialToEdit] = useState<Credential | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isElectronApp, setIsElectronApp] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    setIsElectronApp(isElectron());
  }, []);

  const handleAddNew = () => {
    setCredentialToEdit(null);
    setIsFormOpen(true);
  };

  const handleEdit = (credential: Credential) => {
    setCredentialToEdit(credential);
    setIsFormOpen(true);
  };
  
  const handleOpenGenerator = () => {
    setIsGeneratorOpen(true);
  };

  const filteredCredentials = useMemo(() => {
    return credentials.filter((cred) =>
      cred.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [credentials, searchTerm]);

  const groupedCredentials = useMemo(() => {
    const defaultCategory = t('form.default_category');
    return filteredCredentials.reduce((acc, cred) => {
      const category = cred.category || defaultCategory;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(cred);
      return acc;
    }, {} as Record<string, Credential[]>);
  }, [filteredCredentials, t]);

  const categories = Object.keys(groupedCredentials).sort();

  return (
    <>
      <div className="flex min-h-screen w-full flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur md:px-6">
          <div className="flex items-center gap-2">
            <a className={`${isElectronApp ? 'hidden' : 'flex'} items-center gap-2 font-semibold`} href="#">
              <Logo className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold hidden sm:inline-block">JeyPass</span>
            </a>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 md:grow-0">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={t('dashboard.search_placeholder')}
                className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <ThemeSwitcher />
            <BackupRestore />
            <UserNav />
          </div>
        </header>

        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <div className="flex items-center justify-between gap-2 md:hidden">
            <h1 className="text-2xl font-semibold">{t('dashboard.title')}</h1>
          </div>
          {credentials.length > 0 && filteredCredentials.length > 0 ? (
            <Accordion type="multiple" defaultValue={categories} className="w-full">
              {categories.map((category) => (
                <AccordionItem value={category} key={category}>
                  <AccordionTrigger className="text-xl font-semibold">
                    <div className="flex items-center gap-2">
                      <Folder className="h-6 w-6 text-primary/80" />
                      {category} ({groupedCredentials[category].length})
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid gap-4 pt-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {groupedCredentials[category].map((cred) => (
                        <CredentialCard
                          key={cred.id}
                          credential={cred}
                          onEdit={handleEdit}
                          onDelete={deleteCredential}
                        />
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
             <div className="flex flex-1 items-center justify-center rounded-lg border-2 border-dashed border-border py-24 text-center">
              <div>
                <Shield className="mx-auto h-16 w-16 text-muted-foreground" />
                <h3 className="mt-4 text-2xl font-semibold">
                  {searchTerm ? t('dashboard.no_results_title') : t('dashboard.empty_vault_title')}
                </h3>
                <p className="mt-2 text-muted-foreground">
                  {searchTerm
                    ? t('dashboard.no_results_description')
                    : t('dashboard.empty_vault_description')}
                </p>
                {!searchTerm && (
                  <Button className="mt-6 md:hidden" onClick={handleAddNew}>
                    <PlusCircle className="ml-2" />
                    {t('dashboard.add_new_credential_button')}
                  </Button>
                )}
              </div>
            </div>
          )}
        </main>
         
        <FloatingActionMenu 
          onAddCredential={handleAddNew}
          onGeneratePassword={handleOpenGenerator}
        />
      </div>

      <CredentialForm
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        credentialToEdit={credentialToEdit}
      />
      <PasswordGeneratorModal
        isOpen={isGeneratorOpen}
        onOpenChange={setIsGeneratorOpen}
      />
    </>
  );
}
