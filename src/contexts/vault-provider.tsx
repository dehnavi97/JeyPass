"use client";

import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "@/hooks/use-auth";
import { encryptData, decryptData, deriveKey, generateSalt, bytesToHex, hexToBytes } from "@/lib/crypto";
import type { Credential, NewCredential } from "@/lib/types";

const LOCAL_STORAGE_KEY = "jeypass_credentials";

interface VaultContextType {
  credentials: Credential[];
  addCredential: (newCredential: NewCredential) => void;
  updateCredential: (id: string, updatedData: NewCredential) => void;
  deleteCredential: (id: string) => void;
  backup: () => void;
  restore: (file: File) => Promise<boolean>;
  backupSelected: (selectedIds: string[], backupPassword: string) => Promise<boolean>;
  restoreCustom: (
    file: File,
    backupPassword: string,
    deleteExisting: boolean,
    replaceDuplicates: boolean
  ) => Promise<boolean>;
}

export const VaultContext = createContext<VaultContextType | undefined>(
  undefined
);

export const VaultProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { masterKey, isAuthenticated } = useAuth();
  const [credentials, setCredentials] = useState<Credential[]>([]);

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
          setCredentials(loadedCredentials);
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
    const cred: Credential = { id: uuidv4(), ...newCredential };
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

  const backup = () => {
    const salt = localStorage.getItem("jeypass_salt");
    const verificationHash = localStorage.getItem("jeypass_verificationHash");
    const creds = localStorage.getItem(LOCAL_STORAGE_KEY);

    if (!salt || !verificationHash || !creds) {
      console.error("Missing data for backup.");
      return;
    }

    const backupData = JSON.stringify({
      salt,
      verificationHash,
      credentials: creds,
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

  const backupSelected = async (selectedIds: string[], backupPassword: string): Promise<boolean> => {
    try {
      const selectedCreds = credentials.filter(c => selectedIds.includes(c.id));
      const cleanCreds = selectedCreds.map(c => ({
        title: c.title,
        username: c.username || "",
        password: c.password || "",
        category: c.category || "",
        totpSecret: c.totpSecret || "",
        tab: c.tab || "Default",
        description: c.description || ""
      }));

      const backupSalt = generateSalt();
      const backupKey = await deriveKey(backupPassword, backupSalt);
      const encryptedHex = await encryptData(JSON.stringify(cleanCreds), backupKey);

      const backupData = JSON.stringify({
        salt: bytesToHex(backupSalt),
        credentials: encryptedHex,
        isCustomProtected: true
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
      return true;
    } catch (e) {
      console.error("Backup Selected failed:", e);
      return false;
    }
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

  const restoreCustom = (
    file: File,
    backupPassword: string,
    deleteExisting: boolean,
    replaceDuplicates: boolean
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const result = e.target?.result;
          if (typeof result !== "string") {
            resolve(false);
            return;
          }
          const backupData = JSON.parse(result);

          if (!backupData.salt || !backupData.credentials) {
            resolve(false);
            return;
          }

          const salt = hexToBytes(backupData.salt);
          const backupKey = await deriveKey(backupPassword, salt);
          const decryptedJSON = await decryptData(backupData.credentials, backupKey);
          const importedCreds: Credential[] = JSON.parse(decryptedJSON);

          if (!Array.isArray(importedCreds)) {
            resolve(false);
            return;
          }

          const importedWithIds = importedCreds.map(c => ({
            id: c.id || uuidv4(),
            title: c.title || "",
            username: c.username || "",
            password: c.password || "",
            category: c.category || "",
            totpSecret: c.totpSecret || "",
            tab: c.tab || "Default",
            description: c.description || ""
          }));

          let finalCreds: Credential[] = [];

          if (deleteExisting) {
            finalCreds = importedWithIds;
          } else {
            finalCreds = [...credentials];

            for (const imp of importedWithIds) {
              const existingIdx = finalCreds.findIndex(
                (c) => c.title.toLowerCase() === imp.title.toLowerCase()
              );

              if (existingIdx !== -1) {
                if (replaceDuplicates) {
                  finalCreds[existingIdx] = imp;
                }
              } else {
                finalCreds.push(imp);
              }
            }
          }

          await saveCredentials(finalCreds);
          resolve(true);
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
    addCredential,
    updateCredential,
    deleteCredential,
    backup,
    restore,
    backupSelected,
    restoreCustom,
  };

  return (
    <VaultContext.Provider value={value}>{children}</VaultContext.Provider>
  );
};
