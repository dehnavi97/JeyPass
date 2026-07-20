"use client";

import { useState, useMemo, useEffect } from "react";
import { PlusCircle, Shield, Folder, Search, Tag, Pencil, Save, X, Info } from "lucide-react";
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
import { isDesktopApp, cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export function Dashboard() {
  const { credentials, deleteCredential } = useVault();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [credentialToEdit, setCredentialToEdit] = useState<Credential | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDesktopAppShell, setIsDesktopAppShell] = useState(false);
  const { t } = useTranslation();

  // Active Tab state (default to "Default")
  const [activeTab, setActiveTab] = useState("Default");

  // Category descriptions state (stored as name -> desc map in localStorage)
  const [categoryDescriptions, setCategoryDescriptions] = useState<Record<string, string>>({});
  const [editCategoryName, setEditCategoryName] = useState<string | null>(null);
  const [categoryDescInput, setCategoryDescInput] = useState("");

  // Category Open/Collapsed states
  const [openCategories, setOpenCategories] = useState<string[]>([]);

  useEffect(() => {
    setIsDesktopAppShell(isDesktopApp());

    // Load active tab from localStorage
    const savedTab = localStorage.getItem("jeypass_active_tab");
    if (savedTab) {
      setActiveTab(savedTab);
    }

    // Load category descriptions
    const savedDescs = localStorage.getItem("jeypass_category_descriptions");
    if (savedDescs) {
      try {
        setCategoryDescriptions(JSON.parse(savedDescs));
      } catch (e) {
        console.error("Failed to parse category descriptions", e);
      }
    }
  }, []);

  // Save/Load open categories
  useEffect(() => {
    const savedOpen = localStorage.getItem("jeypass_open_categories");
    if (savedOpen) {
      try {
        setOpenCategories(JSON.parse(savedOpen));
      } catch (e) {
        // Fallback below
      }
    }
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

  // Get all unique tabs across credentials
  const allTabs = useMemo(() => {
    const tabsSet = new Set<string>();
    tabsSet.add("Default"); // Ensure Default tab is always present
    credentials.forEach((cred) => {
      if (cred.tab && cred.tab.trim()) {
        tabsSet.add(cred.tab.trim());
      }
    });
    return Array.from(tabsSet).sort();
  }, [credentials]);

  const handleTabChange = (tabName: string) => {
    setActiveTab(tabName);
    localStorage.setItem("jeypass_active_tab", tabName);
  };

  // Filter credentials by the active tab
  const tabFilteredCredentials = useMemo(() => {
    return credentials.filter((cred) => {
      const credTab = cred.tab || "Default";
      return credTab.toLowerCase() === activeTab.toLowerCase();
    });
  }, [credentials, activeTab]);

  // Apply search filtering on top of tab filtering
  const filteredCredentials = useMemo(() => {
    return tabFilteredCredentials.filter((cred) =>
      cred.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [tabFilteredCredentials, searchTerm]);

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

  const categories = useMemo(() => {
    return Object.keys(groupedCredentials).sort();
  }, [groupedCredentials]);

  // If open categories are empty, default to opening all categories
  useEffect(() => {
    if (categories.length > 0 && openCategories.length === 0) {
      const savedOpen = localStorage.getItem("jeypass_open_categories");
      if (!savedOpen) {
        setOpenCategories(categories);
      }
    }
  }, [categories, openCategories]);

  const handleAccordionChange = (values: string[]) => {
    setOpenCategories(values);
    localStorage.setItem("jeypass_open_categories", JSON.stringify(values));
  };

  // Save category description
  const saveCategoryDescription = () => {
    if (!editCategoryName) return;
    const updated = {
      ...categoryDescriptions,
      [editCategoryName]: categoryDescInput
    };
    setCategoryDescriptions(updated);
    localStorage.setItem("jeypass_category_descriptions", JSON.stringify(updated));
    setEditCategoryName(null);
  };

  const handleOpenEditDesc = (cat: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevents expanding/collapsing the accordion item
    setEditCategoryName(cat);
    setCategoryDescInput(categoryDescriptions[cat] || "");
  };

  return (
    <>
      <div className="flex min-h-screen w-full flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur md:px-6">
          <div className="flex items-center gap-2">
            <a className={`${isDesktopAppShell ? 'hidden' : 'flex'} items-center gap-2 font-semibold`} href="#">
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
          {/* Tabs Bar */}
          <div className="flex items-center overflow-x-auto gap-2 pb-2 border-b scrollbar-none">
            {allTabs.map((tabName) => {
              const isActive = activeTab.toLowerCase() === tabName.toLowerCase();
              return (
                <button
                  key={tabName}
                  onClick={() => handleTabChange(tabName)}
                  className={cn(
                    "px-4 py-2 text-sm font-bold rounded-xl transition-all duration-300 whitespace-nowrap border flex items-center gap-1.5",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]"
                      : "bg-card text-muted-foreground border-border hover:bg-muted/40 hover:text-foreground"
                  )}
                >
                  <Tag className="h-4 w-4" />
                  <span>{tabName}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between gap-2 md:hidden">
            <h1 className="text-2xl font-semibold">{t('dashboard.title')}</h1>
          </div>

          {credentials.length > 0 && filteredCredentials.length > 0 ? (
            <Accordion
              type="multiple"
              value={openCategories}
              onValueChange={handleAccordionChange}
              className="w-full"
            >
              {categories.map((category) => (
                <AccordionItem value={category} key={category}>
                  <AccordionTrigger className="text-xl font-semibold hover:no-underline">
                    <div className="flex items-center justify-between w-full pl-4 pr-4">
                      <div className="flex flex-col items-start gap-1">
                        <div className="flex items-center gap-2">
                          <Folder className="h-6 w-6 text-primary/80" />
                          <span>{category} ({groupedCredentials[category].length})</span>
                        </div>
                        {categoryDescriptions[category] && (
                          <span className="text-xs text-muted-foreground font-normal pl-8 block max-w-md text-right leading-relaxed">
                            {categoryDescriptions[category]}
                          </span>
                        )}
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-muted rounded-full"
                        onClick={(e) => handleOpenEditDesc(category, e)}
                      >
                        <Pencil className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                      </Button>
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

      {/* Category Description Modal */}
      <Dialog open={editCategoryName !== null} onOpenChange={(open) => !open && setEditCategoryName(null)}>
        <DialogContent className="sm:max-w-[420px] bg-background/95 backdrop-blur-sm">
          <DialogHeader className="items-center text-center">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
              <Folder className="h-6 w-6" />
            </div>
            <DialogTitle className="text-xl font-bold">توضیحات دسته {editCategoryName}</DialogTitle>
            <DialogDescription>یک توضیح کوتاه برای این دسته‌بندی بنویسید تا در صفحه اصلی نمایش داده شود.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cat-desc">توضیحات</Label>
              <Input
                id="cat-desc"
                value={categoryDescInput}
                onChange={(e) => setCategoryDescInput(e.target.value)}
                maxLength={100}
                placeholder="توضیح کوتاه..."
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setEditCategoryName(null)}>
                <X className="ml-2 h-4 w-4" />
                لغو
              </Button>
              <Button className="flex-1" onClick={saveCategoryDescription}>
                <Save className="ml-2 h-4 w-4" />
                ذخیره
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
