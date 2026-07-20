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
  changeMasterPassword: (oldPassword: string, newPassword: string) => Promise<boolean>;
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

  const changeMasterPassword = async (oldPassword: string, newPassword: string): Promise<boolean> => {
    try {
      const saltHex = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}salt`);
      const verificationHash = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}verificationHash`);

      if (!saltHex || !verificationHash) {
        return false;
      }

      const salt = hexToBytes(saltHex);
      const oldKey = await deriveKey(oldPassword, salt);
      const decryptedVerification = await decryptData(verificationHash, oldKey);

      if (decryptedVerification !== VERIFICATION_STRING) {
        return false;
      }

      const encryptedCredentials = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}credentials`);
      let credentialsJSON = "[]";
      if (encryptedCredentials) {
        credentialsJSON = await decryptData(encryptedCredentials, oldKey);
      }

      const newSalt = generateSalt();
      const newKey = await deriveKey(newPassword, newSalt);
      const newVerificationHash = await encryptData(VERIFICATION_STRING, newKey);
      const newEncryptedCredentials = await encryptData(credentialsJSON, newKey);

      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}salt`, bytesToHex(newSalt));
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}verificationHash`, newVerificationHash);
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}credentials`, newEncryptedCredentials);

      setMasterKey(newKey);
      return true;
    } catch (error) {
      console.error("Change password failed:", error);
      return false;
    }
  };

  const value = {
    isAuthenticated,
    masterKey,
    login,
    logout,
    setupMasterPassword,
    changeMasterPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthContext };
