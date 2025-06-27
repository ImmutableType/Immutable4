// lib/encryption/services/keyDerivation.ts
import { KeyDerivationParams, EncryptionError, ENCRYPTION_CONFIG } from '../types/encryption';

export class KeyDerivationService {
  
  /**
   * Derive decryption key using PBKDF2
   * Format: userAddress:articleId:licenseTokenId
   */
  async deriveDecryptionKey(params: KeyDerivationParams): Promise<Uint8Array> {
    try {
      // Validate inputs
      if (!params.userAddress || !params.articleId || !params.licenseTokenId) {
        throw new EncryptionError('All key derivation parameters are required');
      }

      // Normalize user address to lowercase
      const normalizedAddress = params.userAddress.toLowerCase();
      
      // Combine inputs for key material
      const keyMaterial = `${normalizedAddress}:${params.articleId}:${params.licenseTokenId}`;
      
      console.log('🔑 Deriving key for:', { 
        address: normalizedAddress, 
        articleId: params.articleId, 
        tokenId: params.licenseTokenId 
      });

      // Convert to bytes
      const encoder = new TextEncoder();
      const keyMaterialBytes = encoder.encode(keyMaterial);
      
      // Import key material for PBKDF2
      const baseKey = await crypto.subtle.importKey(
        'raw',
        keyMaterialBytes,
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
      );
      
      // Fixed salt for consistency (same inputs = same key)
      const salt = encoder.encode('ImmutableType');
      
      // Derive key using PBKDF2
      const derivedKey = await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: salt,
          iterations: 100000,
          hash: 'SHA-256'
        },
        baseKey,
        { 
          name: 'AES-GCM', // We'll export as raw and use for ChaCha20
          length: ENCRYPTION_CONFIG.keyLength * 8 // 256 bits
        },
        true, // extractable
        ['encrypt', 'decrypt']
      );
      
      // Export as raw bytes
      const keyBuffer = await crypto.subtle.exportKey('raw', derivedKey);
      const keyBytes = new Uint8Array(keyBuffer);
      
      console.log('🔑 Key derived successfully, length:', keyBytes.length);
      
      return keyBytes;

    } catch (error) {
      console.error('❌ Key derivation failed:', error);
      throw new EncryptionError(`Key derivation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create cache key for decrypted content
   */
  createCacheKey(userAddress: string, articleId: string): string {
    const normalizedAddress = userAddress.toLowerCase();
    return `${normalizedAddress}_${articleId}`;
  }

  /**
   * Validate key derivation parameters
   */
  validateParams(params: KeyDerivationParams): void {
    if (!params.userAddress) {
      throw new EncryptionError('User address is required for key derivation');
    }
    
    if (!params.articleId) {
      throw new EncryptionError('Article ID is required for key derivation');
    }
    
    if (!params.licenseTokenId) {
      throw new EncryptionError('License token ID is required for key derivation');
    }

    // Validate Ethereum address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(params.userAddress)) {
      throw new EncryptionError('Invalid Ethereum address format');
    }
  }
}

// Export singleton instance
export const keyDerivationService = new KeyDerivationService();