"use client";

import jsQR from "jsqr";
import type { NewCredential } from "./types";

export interface GoogleAuthOtpAccount {
  secret: string;
  name: string;
  issuer: string;
  algorithm?: string;
  digits?: number;
  type?: "totp" | "hotp";
}

class ProtoReader {
  private buffer: Uint8Array;
  private pos = 0;

  constructor(buffer: Uint8Array) {
    this.buffer = buffer;
  }

  hasMore(): boolean {
    return this.pos < this.buffer.length;
  }

  readVarint(): number {
    let result = 0;
    let shift = 0;
    while (this.pos < this.buffer.length) {
      const byte = this.buffer[this.pos++];
      result |= (byte & 0x7f) << shift;
      if ((byte & 0x80) === 0) break;
      shift += 7;
    }
    return result;
  }

  readBytes(): Uint8Array {
    const len = this.readVarint();
    const bytes = this.buffer.slice(this.pos, this.pos + len);
    this.pos += len;
    return bytes;
  }

  readString(): string {
    const bytes = this.readBytes();
    return new TextDecoder().decode(bytes);
  }

  skip(wireType: number) {
    if (wireType === 0) {
      this.readVarint();
    } else if (wireType === 1) {
      this.pos += 8;
    } else if (wireType === 2) {
      const len = this.readVarint();
      this.pos += len;
    } else if (wireType === 5) {
      this.pos += 4;
    }
  }

  readTag(): { fieldNumber: number; wireType: number } | null {
    if (!this.hasMore()) return null;
    const tag = this.readVarint();
    return { fieldNumber: tag >> 3, wireType: tag & 0x07 };
  }
}

/**
 * Converts byte array to standard RFC 4648 Base32 string (used by TOTP)
 */
export function bytesToBase32(bytes: Uint8Array): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = 0;
  let value = 0;
  let output = "";

  for (let i = 0; i < bytes.length; i++) {
    value = (value << 8) | bytes[i];
    bits += 8;
    while (bits >= 5) {
      output += alphabet[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += alphabet[(value << (5 - bits)) & 31];
  }

  return output;
}

function parseOtpParameters(bytes: Uint8Array): GoogleAuthOtpAccount {
  const reader = new ProtoReader(bytes);
  let rawSecret: Uint8Array = new Uint8Array(0);
  let name = "";
  let issuer = "";
  let algorithm = "SHA1";
  let digits = 6;
  let type: "totp" | "hotp" = "totp";

  while (reader.hasMore()) {
    const tag = reader.readTag();
    if (!tag) break;

    switch (tag.fieldNumber) {
      case 1: // secret (bytes)
        rawSecret = reader.readBytes();
        break;
      case 2: // name (string)
        name = reader.readString();
        break;
      case 3: // issuer (string)
        issuer = reader.readString();
        break;
      case 4: // algorithm
        const algVal = reader.readVarint();
        if (algVal === 2) algorithm = "SHA256";
        else if (algVal === 3) algorithm = "SHA512";
        else if (algVal === 4) algorithm = "MD5";
        else algorithm = "SHA1";
        break;
      case 5: // digits
        const digVal = reader.readVarint();
        digits = digVal === 2 ? 8 : 6;
        break;
      case 6: // type
        const typeVal = reader.readVarint();
        type = typeVal === 1 ? "hotp" : "totp";
        break;
      default:
        reader.skip(tag.wireType);
        break;
    }
  }

  const base32Secret = bytesToBase32(rawSecret);

  return {
    secret: base32Secret,
    name,
    issuer,
    algorithm,
    digits,
    type,
  };
}

/**
 * Parses Google Authenticator Migration Protobuf base64 data
 */
export function parseGoogleAuthMigrationData(dataBase64: string): GoogleAuthOtpAccount[] {
  let clean = decodeURIComponent(dataBase64).trim();
  clean = clean.replace(/-/g, "+").replace(/_/g, "/");
  const pad = clean.length % 4;
  if (pad) {
    clean += "=".repeat(4 - pad);
  }

  const binaryString = atob(clean);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const reader = new ProtoReader(bytes);
  const accounts: GoogleAuthOtpAccount[] = [];

  while (reader.hasMore()) {
    const tag = reader.readTag();
    if (!tag) break;

    if (tag.fieldNumber === 1 && tag.wireType === 2) {
      const otpParamBytes = reader.readBytes();
      const account = parseOtpParameters(otpParamBytes);
      if (account.secret) {
        accounts.push(account);
      }
    } else {
      reader.skip(tag.wireType);
    }
  }

  return accounts;
}

/**
 * Parses standard otpauth://totp/... URL
 */
export function parseStandardOtpAuthUrl(urlStr: string): GoogleAuthOtpAccount | null {
  try {
    const url = new URL(urlStr);
    if (!url.protocol.startsWith("otpauth")) return null;

    const secret = url.searchParams.get("secret");
    if (!secret) return null;

    const issuerParam = url.searchParams.get("issuer") || "";
    let rawPath = decodeURIComponent(url.pathname.replace(/^\/\/?/, ""));
    let issuer = issuerParam;
    let name = rawPath;

    if (rawPath.includes(":")) {
      const parts = rawPath.split(":");
      if (!issuer) issuer = parts[0].trim();
      name = parts.slice(1).join(":").trim();
    }

    const type = url.host === "hotp" ? "hotp" : "totp";
    const digits = parseInt(url.searchParams.get("digits") || "6", 10);
    const algorithm = url.searchParams.get("algorithm") || "SHA1";

    return {
      secret: secret.replace(/\s/g, "").toUpperCase(),
      name,
      issuer,
      algorithm,
      digits,
      type,
    };
  } catch {
    return null;
  }
}

/**
 * Parses text (or file content) containing one or multiple Google Authenticator
 * migration URLs (otpauth-migration://...) or standard otpauth:// URLs
 */
export function extractOtpAccountsFromContent(content: string): GoogleAuthOtpAccount[] {
  const accounts: GoogleAuthOtpAccount[] = [];

  // Match all otpauth-migration URLs
  const migrationRegex = /otpauth-migration:\/\/offline\?[^\s"'\n<>]+/gi;
  const migrationMatches = content.match(migrationRegex);

  if (migrationMatches) {
    for (const match of migrationMatches) {
      try {
        const url = new URL(match);
        const dataParam = url.searchParams.get("data");
        if (dataParam) {
          const parsed = parseGoogleAuthMigrationData(dataParam);
          accounts.push(...parsed);
        }
      } catch (err) {
        console.error("Failed to parse migration URL:", err);
      }
    }
  }

  // Match all standard otpauth URLs
  const standardOtpRegex = /otpauth:\/\/(totp|hotp)\/[^\s"'\n<>]+/gi;
  const standardMatches = content.match(standardOtpRegex);

  if (standardMatches) {
    for (const match of standardMatches) {
      const parsed = parseStandardOtpAuthUrl(match);
      if (parsed) {
        accounts.push(parsed);
      }
    }
  }

  // If no URLs matched, check if the raw content itself is a base64 protobuf
  if (accounts.length === 0 && content.trim().length > 20 && !content.includes(" ")) {
    try {
      const parsed = parseGoogleAuthMigrationData(content.trim());
      accounts.push(...parsed);
    } catch {
      // not raw base64
    }
  }

  return accounts;
}

/**
 * Decodes a QR code directly from an Image File using canvas and jsQR
 */
export function decodeQrCodeFromImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("CANVAS_CONTEXT_FAILED"));
            return;
          }
          ctx.drawImage(img, 0, 0, img.width, img.height);
          const imageData = ctx.getImageData(0, 0, img.width, img.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);

          if (code && code.data) {
            resolve(code.data);
          } else {
            reject(new Error("QR_CODE_NOT_FOUND"));
          }
        } catch (err) {
          reject(err);
        }
      };

      img.onerror = () => reject(new Error("IMAGE_LOAD_FAILED"));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error("FILE_READ_FAILED"));
    reader.readAsDataURL(file);
  });
}

/**
 * Converts a GoogleAuthOtpAccount into a NewCredential ready to add to the Vault
 */
export function otpAccountToNewCredential(
  account: GoogleAuthOtpAccount,
  workspaceId: string = "default"
): NewCredential {
  let title = account.issuer || "";
  let username = account.name || "";

  if (account.name.includes(":")) {
    const [issuerPart, userPart] = account.name.split(":");
    if (!title) title = issuerPart.trim();
    if (userPart) username = userPart.trim();
  }

  if (!title) {
    title = username || "Authenticator Account";
  }

  return {
    title,
    username: username !== title ? username : undefined,
    password: "", // 2FA accounts have no static password
    category: "2FA / Authenticator",
    totpSecret: account.secret,
    workspaceId,
  };
}
