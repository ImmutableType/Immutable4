// lib/encryption/crypto/chacha20poly1305.ts
import { chacha20poly1305 } from '@noble/ciphers/chacha';
import { randomBytes } from '@noble/ciphers/webcrypto';
import { EncryptionError, ENCRYPTION_CONFIG } from '../types/encryption';

export class ChaCha20Poly1305Service {
  
  /**
   * Encrypt plaintext using ChaCha20-Poly1305
   */
  async encrypt(
    plaintext: string, 
    key: Uint8Array, 
    nonce?: Uint8Array
  ): Promise<{
    nonce: Uint8Array;
    ciphertext: Uint8Array;
    authTag: Uint8Array;
  }> {
    try {
      // Validate key length
      if (key.length !== ENCRYPTION_CONFIG.keyLength) {
        throw new EncryptionError(`Invalid key length: expected ${ENCRYPTION_CONFIG.keyLength}, got ${key.length}`);
      }

      // Generate nonce if not provided
      const encryptionNonce = nonce || randomBytes(ENCRYPTION_CONFIG.nonceLength);
      
      if (encryptionNonce.length !== ENCRYPTION_CONFIG.nonceLength) {
        throw new EncryptionError(`Invalid nonce length: expected ${ENCRYPTION_CONFIG.nonceLength}, got ${encryptionNonce.length}`);
      }

      // Convert plaintext to bytes
      const plaintextBytes = new TextEncoder().encode(plaintext);

      // Create ChaCha20-Poly1305 cipher
      const cipher = chacha20poly1305(key, encryptionNonce);
      
      // Encrypt (this includes authentication tag)
      const encrypted = cipher.encrypt(plaintextBytes);
      
      // Split encrypted data and auth tag
      // ChaCha20-Poly1305 returns ciphertext + 16-byte auth tag at the end
      const ciphertext = encrypted.slice(0, -ENCRYPTION_CONFIG.tagLength);
      const authTag = encrypted.slice(-ENCRYPTION_CONFIG.tagLength);

      return {
        nonce: encryptionNonce,
        ciphertext,
        authTag
      };

    } catch (error) {
      console.error('ChaCha20-Poly1305 encryption failed:', error);
      throw new EncryptionError(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Decrypt ciphertext using ChaCha20-Poly1305
   */
  async decrypt(
    ciphertext: Uint8Array,
    key: Uint8Array,
    nonce: Uint8Array,
    authTag: Uint8Array
  ): Promise<string> {
    try {
      // Validate inputs
      if (key.length !== ENCRYPTION_CONFIG.keyLength) {
        throw new EncryptionError(`Invalid key length: expected ${ENCRYPTION_CONFIG.keyLength}, got ${key.length}`);
      }

      if (nonce.length !== ENCRYPTION_CONFIG.nonceLength) {
        throw new EncryptionError(`Invalid nonce length: expected ${ENCRYPTION_CONFIG.nonceLength}, got ${nonce.length}`);
      }

      if (authTag.length !== ENCRYPTION_CONFIG.tagLength) {
        throw new EncryptionError(`Invalid auth tag length: expected ${ENCRYPTION_CONFIG.tagLength}, got ${authTag.length}`);
      }

      // Create ChaCha20-Poly1305 cipher
      const cipher = chacha20poly1305(key, nonce);
      
      // Combine ciphertext and auth tag for decryption
      const encryptedData = new Uint8Array(ciphertext.length + authTag.length);
      encryptedData.set(ciphertext);
      encryptedData.set(authTag, ciphertext.length);

      // Decrypt and verify
      const decrypted = cipher.decrypt(encryptedData);
      
      // Convert bytes back to string
      return new TextDecoder().decode(decrypted);

    } catch (error) {
      console.error('ChaCha20-Poly1305 decryption failed:', error);
      
      // Provide specific error messages
      if (error instanceof Error && error.message.includes('tag')) {
        throw new EncryptionError('Authentication failed: Content may be corrupted or tampered with');
      }
      
      throw new EncryptionError(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate secure random bytes - Alternative to imported randomBytes
   */
  private generateRandomBytes(length: number): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(length));
  }

  /**
   * Utility: Convert base64 string to Uint8Array
   */
  base64ToBytes(base64: string): Uint8Array {
    try {
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes;
    } catch (error) {
      throw new EncryptionError(`Invalid base64 string: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Utility: Convert Uint8Array to base64 string
   */
  bytesToBase64(bytes: Uint8Array): string {
    try {
      const binaryString = Array.from(bytes, byte => String.fromCharCode(byte)).join('');
      return btoa(binaryString);
    } catch (error) {
      throw new EncryptionError(`Base64 encoding failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Export singleton instance
export const chaCha20Poly1305Service = new ChaCha20Poly1305Service();