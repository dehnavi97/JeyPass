"use client";

import { deriveKey, encryptData, decryptData, generateSalt, bytesToHex, hexToBytes } from "./crypto";
import type { NewCredential } from "./types";
import { Capacitor } from "@capacitor/core";

export interface JpasFileEnvelope {
  magic: "JPAS";
  version: number;
  appName: "JeyPass";
  salt: string;
  data: string;
  title?: string;
  timestamp: number;
}

/**
 * Encrypts a credential object using AES-256-GCM and a user-provided password,
 * returning the formatted JSON string representing the .jpas file.
 */
export async function exportCredentialToJpas(
  credential: NewCredential,
  password: string
): Promise<string> {
  const salt = generateSalt();
  const key = await deriveKey(password, salt);

  const payloadString = JSON.stringify({
    title: credential.title,
    username: credential.username || "",
    password: credential.password,
    category: credential.category || "",
    totpSecret: credential.totpSecret || "",
    workspaceId: credential.workspaceId || "default",
    exportedAt: new Date().toISOString(),
  });

  const encryptedHex = await encryptData(payloadString, key);

  const envelope: JpasFileEnvelope = {
    magic: "JPAS",
    version: 1,
    appName: "JeyPass",
    salt: bytesToHex(salt),
    data: encryptedHex,
    title: credential.title,
    timestamp: Date.now(),
  };

  return JSON.stringify(envelope, null, 2);
}

/**
 * Decrypts a .jpas file content using the user-provided password.
 * Throws an error if the password is wrong or the file is corrupted.
 */
export async function importCredentialFromJpas(
  fileContent: string,
  password: string
): Promise<NewCredential> {
  let envelope: any;
  try {
    envelope = JSON.parse(fileContent);
  } catch {
    throw new Error("INVALID_JSON");
  }

  if (
    !envelope ||
    envelope.magic !== "JPAS" ||
    !envelope.salt ||
    !envelope.data
  ) {
    throw new Error("INVALID_FORMAT");
  }

  const salt = hexToBytes(envelope.salt);
  const key = await deriveKey(password, salt);

  let decryptedString: string;
  try {
    decryptedString = await decryptData(envelope.data, key);
  } catch {
    throw new Error("INCORRECT_PASSWORD");
  }

  let credentialData: any;
  try {
    credentialData = JSON.parse(decryptedString);
  } catch {
    throw new Error("DECRYPTED_CORRUPTED");
  }

  if (!credentialData.title || !credentialData.password) {
    throw new Error("MISSING_CREDENTIAL_DATA");
  }

  return {
    title: String(credentialData.title),
    username: credentialData.username ? String(credentialData.username) : undefined,
    password: String(credentialData.password),
    category: credentialData.category ? String(credentialData.category) : undefined,
    totpSecret: credentialData.totpSecret ? String(credentialData.totpSecret) : undefined,
    workspaceId: credentialData.workspaceId ? String(credentialData.workspaceId) : undefined,
  };
}

/**
 * Saves a .jpas file cross-platform:
 * - On Capacitor (Android / iOS): writes file and invokes native share/save sheet.
 * - On Web and Tauri: triggers standard browser blob download (<a download>).
 */
export async function saveJpasFile(
  filename: string,
  content: string
): Promise<{ success: boolean; error?: string }> {
  const safeFilename = filename.endsWith(".jpas") ? filename : `${filename}.jpas`;

  if (typeof window !== "undefined" && Capacitor.isNativePlatform()) {
    try {
      const { Filesystem, Directory } = await import("@capacitor/filesystem");
      const { Share } = await import("@capacitor/share");

      const writeResult = await Filesystem.writeFile({
        path: safeFilename,
        data: content,
        directory: Directory.Cache,
      });

      const canShare = await Share.canShare().then((res) => res.value).catch(() => false);
      if (canShare) {
        await Share.share({
          title: safeFilename,
          text: `JeyPass Encrypted Credential: ${safeFilename}`,
          url: writeResult.uri,
          dialogTitle: `Save ${safeFilename}`,
        });
        return { success: true };
      }
    } catch (err: any) {
      console.warn("Capacitor save/share fallback to standard download:", err);
    }
  }

  // Web and Desktop (Tauri Webview)
  try {
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = safeFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to download file" };
  }
}
