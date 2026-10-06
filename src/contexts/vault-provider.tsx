"use client";

import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "@/hooks/use-auth";
import { encryptData, decryptData } from "@/lib/crypto";
import type { Credential, NewCredential, Workspace } from "@/lib/types";

const LOCAL_STORAGE_KEY = "jeypass_credentials";
const WORKSPACES_STORAGE_KEY = "jeypass_workspaces";

export const DEFAULT_WORKSPACE: Workspace = {
  id: "default",
  name: "Default",
  isDefault: true,
  color: "blue",
};

interface VaultContextType {
  credentials: Credential[];
  workspaces: Workspace[];
  activeWorkspaceId: string;
  setActiveWorkspaceId: (id: string) => void;
  addCredential: (newCredential: NewCredential) => void;
  updateCredential: (id: string, updatedData: NewCredential) => void;
  deleteCredential: (id: string) => void;
  moveCredentialWorkspace: (credentialId: string, targetWorkspaceId: string) => void;
  addWorkspace: (name: string, color?: string) => Workspace;
  updateWorkspace: (id: string, name: string, color?: string) => void;
  deleteWorkspace: (id: string) => void;
  backup: () => void;
  restore: (file: File) => Promise<boolean>;
}

export const VaultContext = createContext<VaultContextType | undefined>(
  undefined
);

export const VaultProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { masterKey, isAuthenticated } = useAuth();
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([DEFAULT_WORKSPACE]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>("all");

  const saveWorkspaces = useCallback((wsList: Workspace[]) => {
    try {
      localStorage.setItem(WORKSPACES_STORAGE_KEY, JSON.stringify(wsList));
    } catch (err) {
      console.error("Failed to save workspaces:", err);
    }
  }, []);

  // Load workspaces on initial mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(WORKSPACES_STORAGE_KEY);
      if (stored) {
        const parsed: Workspace[] = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Ensure default workspace always exists
          const hasDefault = parsed.some((w) => w.id === "default" || w.isDefault);
          if (!hasDefault) {
            parsed.unshift(DEFAULT_WORKSPACE);
          }
          setWorkspaces(parsed);
          return;
        }
      }
    } catch (err) {
      console.error("Failed to load workspaces:", err);
    }
    setWorkspaces([DEFAULT_WORKSPACE]);
    saveWorkspaces([DEFAULT_WORKSPACE]);
  }, [saveWorkspaces]);

  const saveCredentials = useCallback(
    async (creds: Credential[]) => {
      if (!masterKey) return;
      try {
        const encryptedData = await encryptData(
          JSON.stringify(creds),
          masterKey
        );
        localStorage.setItem(LOCAL_STORAGE_KEY, encryptedData);
        setCredentials(creds);
      } catch (error) {
        console.error("Failed to save credentials:", error);
      }
    },
    [masterKey]
  );

  useEffect(() => {
    const loadCredentials = async () => {
      if (!isAuthenticated || !masterKey) {
        setCredentials([]);
        return;
      }
      try {
        const encryptedData = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (encryptedData) {
          const decryptedData = await decryptData(encryptedData, masterKey);
          const loadedCredentials: Credential[] = JSON.parse(decryptedData);
          // Migrate legacy credentials without workspaceId to "default"
          const migrated = loadedCredentials.map((c) => ({
            ...c,
            workspaceId: c.workspaceId || "default",
          }));
          setCredentials(migrated);
        } else {
          await saveCredentials([]);
        }
      } catch (error) {
        console.error("Failed to load or decrypt credentials:", error);
        setCredentials([]);
      }
    };

    loadCredentials();
  }, [isAuthenticated, masterKey, saveCredentials]);

  const addCredential = (newCredential: NewCredential) => {
    const targetWs =
      newCredential.workspaceId ||
      (activeWorkspaceId !== "all" ? activeWorkspaceId : "default");
    const cred: Credential = {
      id: uuidv4(),
      ...newCredential,
      workspaceId: targetWs,
    };
    const updatedCredentials = [...credentials, cred];
    saveCredentials(updatedCredentials);
  };

  const updateCredential = (id: string, updatedData: NewCredential) => {
    const updatedCredentials = credentials.map((cred) =>
      cred.id === id ? { ...cred, ...updatedData } : cred
    );
    saveCredentials(updatedCredentials);
  };

  const deleteCredential = (id: string) => {
    const updatedCredentials = credentials.filter((cred) => cred.id !== id);
    saveCredentials(updatedCredentials);
  };

  const moveCredentialWorkspace = (credentialId: string, targetWorkspaceId: string) => {
    const updatedCredentials = credentials.map((cred) =>
      cred.id === credentialId ? { ...cred, workspaceId: targetWorkspaceId } : cred
    );
    saveCredentials(updatedCredentials);
  };

  const addWorkspace = (name: string, color: string = "blue") => {
    const newWs: Workspace = {
      id: uuidv4(),
      name: name.trim(),
      color,
      createdAt: Date.now(),
    };
    const updated = [...workspaces, newWs];
    setWorkspaces(updated);
    saveWorkspaces(updated);
    return newWs;
  };

  const updateWorkspace = (id: string, name: string, color?: string) => {
    const updated = workspaces.map((ws) =>
      ws.id === id
        ? { ...ws, name: name.trim(), ...(color ? { color } : {}) }
        : ws
    );
    setWorkspaces(updated);
    saveWorkspaces(updated);
  };

  const deleteWorkspace = (id: string) => {
    if (id === "default") return;

    // Move any credentials in this workspace back to default
    const updatedCredentials = credentials.map((cred) =>
      cred.workspaceId === id ? { ...cred, workspaceId: "default" } : cred
    );
    saveCredentials(updatedCredentials);

    const updatedWorkspaces = workspaces.filter((ws) => ws.id !== id);
    setWorkspaces(updatedWorkspaces);
    saveWorkspaces(updatedWorkspaces);

    if (activeWorkspaceId === id) {
      setActiveWorkspaceId("default");
    }
  };

  const backup = () => {
    const salt = localStorage.getItem("jeypass_salt");
    const verificationHash = localStorage.getItem("jeypass_verificationHash");
    const creds = localStorage.getItem(LOCAL_STORAGE_KEY);
    const ws = localStorage.getItem(WORKSPACES_STORAGE_KEY);

    if (!salt || !verificationHash || !creds) {
      console.error("Missing data for backup.");
      return;
    }

    const backupData = JSON.stringify({
      salt,
      verificationHash,
      credentials: creds,
      workspaces: ws,
    });

    const blob = new Blob([backupData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `jeypass-backup-${
      new Date().toISOString().split("T")[0]
    }.jeypass-backup`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const restore = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const result = e.target?.result;
          if (typeof result !== "string") {
            resolve(false);
            return;
          }
          const backupData = JSON.parse(result);
          if (
            backupData.salt &&
            backupData.verificationHash &&
            backupData.credentials
          ) {
            localStorage.setItem("jeypass_salt", backupData.salt);
            localStorage.setItem(
              "jeypass_verificationHash",
              backupData.verificationHash
            );
            localStorage.setItem(LOCAL_STORAGE_KEY, backupData.credentials);
            if (backupData.workspaces) {
              localStorage.setItem(WORKSPACES_STORAGE_KEY, backupData.workspaces);
            }
            resolve(true);
          } else {
            resolve(false);
          }
        } catch (error) {
          console.error("Failed to restore backup:", error);
          resolve(false);
        }
      };
      reader.readAsText(file);
    });
  };

  const value = {
    credentials,
    workspaces,
    activeWorkspaceId,
    setActiveWorkspaceId,
    addCredential,
    updateCredential,
    deleteCredential,
    moveCredentialWorkspace,
    addWorkspace,
    updateWorkspace,
    deleteWorkspace,
    backup,
    restore,
  };

  return (
    <VaultContext.Provider value={value}>{children}</VaultContext.Provider>
  );
};
