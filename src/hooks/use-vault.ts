"use client";

import { useContext } from "react";
import { VaultContext } from "@/contexts/vault-provider";

export function useVault() {
  const context = useContext(VaultContext);
  if (context === undefined) {
    throw new Error("useVault must be used within a VaultProvider");
  }
  return context;
}
