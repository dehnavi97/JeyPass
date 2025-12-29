"use client";

import React, { createContext, useState, useEffect } from "react";
import {
  deriveKey,
  encryptData,
  decryptData,
  generateSalt,
  bytesToHex,
  hexToBytes,
} from "@/lib/crypto";

const VERIFICATION_STRING = "jeypass-verification";
const LOCAL_STORAGE_PREFIX = "jeypass_";

interface AuthContextType {
  isAuthenticated: boolean;
  masterKey: CryptoKey | null;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
  setupMasterPassword: (password: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [masterKey, setMasterKey] = useState<CryptoKey | null>(null);

  const setupMasterPassword = async (password: string): Promise<boolean> => {
    const salt = generateSalt();
    const key = await deriveKey(password, salt);
    const verificationHash = await encryptData(VERIFICATION_STRING, key);

    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}salt`, bytesToHex(salt));
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}verificationHash`, verificationHash);
    
    const emptyCredentials = await encryptData("[]", key);
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}credentials`, emptyCredentials);

    setMasterKey(key);
    setIsAuthenticated(true);
    return true;
  };

  const login = async (password: string): Promise<boolean> => {
    try {
      const saltHex = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}salt`);
      const verificationHash = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}verificationHash`);

      if (!saltHex || !verificationHash) {
        return false;
      }
      
      const salt = hexToBytes(saltHex);
      const key = await deriveKey(password, salt);
      const decrypted = await decryptData(verificationHash, key);

      if (decrypted === VERIFICATION_STRING) {
        setMasterKey(key);
        setIsAuthenticated(true);
        return true;
      }
    } catch (error) {
      console.error("Login failed:", error);
    }
    return false;
  };

  const logout = () => {
    setMasterKey(null);
    setIsAuthenticated(false);
  };

  const value = {
    isAuthenticated,
    masterKey,
    login,
    logout,
    setupMasterPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthContext };
