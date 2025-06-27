// lib/encryption/types/encryption.ts
export interface EncryptedData {
    version: string;
    nonce: Uint8Array;
    encryptedContent: Uint8Array;
    authTag: Uint8Array;
  }
  
  export interface LicenseAccess {
    hasAccess: boolean;
    licenseTokenId: string | null;
    licenseType: 'READER_LICENSE' | 'NONE';
    expiryTime?: bigint;
  }
  
  export interface DecryptionResult {
    success: boolean;
    content?: string;
    error?: string;
    cached?: boolean;
  }
  
  export interface DecryptionCache {
    content: string;
    timestamp: number;
    articleId: string;
    userAddress: string;
  }
  
  export interface KeyDerivationParams {
    userAddress: string;
    articleId: string;
    licenseTokenId: string;
  }
  
  export interface ChaCha20Poly1305Config {
    keyLength: number;
    nonceLength: number;
    tagLength: number;
  }
  
  export const ENCRYPTION_CONFIG: ChaCha20Poly1305Config = {
    keyLength: 32,   // 256 bits
    nonceLength: 12, // 96 bits
    tagLength: 16    // 128 bits
  };
  
  export const ENCRYPTION_VERSION = 'ENCRYPTED_V1';
  export const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
  
  export class EncryptionError extends Error {
    constructor(message: string, public code?: string) {
      super(message);
      this.name = 'EncryptionError';
    }
  }
  
  export class LicenseError extends Error {
    constructor(message: string, public code?: string) {
      super(message);
      this.name = 'LicenseError';
    }
  }