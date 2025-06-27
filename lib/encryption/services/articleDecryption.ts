// lib/encryption/services/articleDecryption.ts
import { 
    EncryptedData, 
    DecryptionResult, 
    DecryptionCache,
    KeyDerivationParams,
    EncryptionError, 
    LicenseError,
    ENCRYPTION_VERSION,
    CACHE_TTL_MS 
  } from '../types/encryption';
  import { chaCha20Poly1305Service } from '../crypto/chacha20poly1305';
  import { keyDerivationService } from './keyDerivation';
  
  export class ArticleDecryptionService {
    private decryptionCache = new Map<string, DecryptionCache>();
  
    /**
     * Main entry point for article decryption
     */
    async decryptArticle(
      encryptedContent: string,
      userAddress: string,
      articleId: string,
      licenseTokenId: string
    ): Promise<DecryptionResult> {
      try {
        console.log('🔓 Starting decryption for article:', articleId);
  
        // Check cache first
        const cacheKey = keyDerivationService.createCacheKey(userAddress, articleId);
        const cached = this.getCachedContent(cacheKey);
        
        if (cached) {
          console.log('✅ Returning cached decrypted content');
          return {
            success: true,
            content: cached.content,
            cached: true
          };
        }
  
        // Validate license token ID
        if (!licenseTokenId) {
          throw new LicenseError('License token ID required for decryption');
        }
  
        // Parse encrypted content
        const encryptedData = this.parseEncryptedContent(encryptedContent);
        
        // Derive decryption key
        const keyParams: KeyDerivationParams = {
          userAddress,
          articleId,
          licenseTokenId
        };
        
        keyDerivationService.validateParams(keyParams);
        const decryptionKey = await keyDerivationService.deriveDecryptionKey(keyParams);
        
        // Decrypt content
        const decryptedText = await chaCha20Poly1305Service.decrypt(
          encryptedData.encryptedContent,
          decryptionKey,
          encryptedData.nonce,
          encryptedData.authTag
        );
        
        console.log('✅ Decryption successful');
        
        // Cache the result
        this.cacheDecryptedContent(cacheKey, {
          content: decryptedText,
          timestamp: Date.now(),
          articleId,
          userAddress
        });
        
        return {
          success: true,
          content: decryptedText,
          cached: false
        };
  
      } catch (error) {
        console.error('❌ Decryption failed:', error);
        
        // Return appropriate error
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown decryption error'
        };
      }
    }
  
    /**
     * Parse encrypted content string into components
     * Format: "ENCRYPTED_V1:nonce_base64:content_base64:tag_base64"
     */
    parseEncryptedContent(encryptedString: string): EncryptedData {
      try {
        const parts = encryptedString.split(':');
        
        if (parts.length !== 4) {
          throw new EncryptionError(`Invalid encrypted content format: expected 4 parts, got ${parts.length}`);
        }
        
        if (parts[0] !== ENCRYPTION_VERSION) {
          throw new EncryptionError(`Unsupported encryption version: ${parts[0]}`);
        }
        
        return {
          version: parts[0],
          nonce: chaCha20Poly1305Service.base64ToBytes(parts[1]),
          encryptedContent: chaCha20Poly1305Service.base64ToBytes(parts[2]),
          authTag: chaCha20Poly1305Service.base64ToBytes(parts[3])
        };
  
      } catch (error) {
        console.error('❌ Failed to parse encrypted content:', error);
        throw new EncryptionError(`Invalid encrypted content format: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  
    /**
     * Check if content is encrypted
     */
    isEncrypted(content: string): boolean {
      return content.startsWith(ENCRYPTION_VERSION + ':');
    }
  
    /**
     * Get cached decrypted content
     */
    private getCachedContent(cacheKey: string): DecryptionCache | null {
      const cached = this.decryptionCache.get(cacheKey);
      
      if (!cached) {
        return null;
      }
      
      // Check if cache is expired
      if (Date.now() - cached.timestamp > CACHE_TTL_MS) {
        this.decryptionCache.delete(cacheKey);
        return null;
      }
      
      return cached;
    }
  
    /**
     * Cache decrypted content
     */
    private cacheDecryptedContent(cacheKey: string, cache: DecryptionCache): void {
      this.decryptionCache.set(cacheKey, cache);
      
      // Clean up expired cache entries periodically
      this.cleanupExpiredCache();
    }
  
    /**
     * Clean up expired cache entries
     */
    private cleanupExpiredCache(): void {
      const now = Date.now();
      
      for (const [key, cache] of this.decryptionCache.entries()) {
        if (now - cache.timestamp > CACHE_TTL_MS) {
          this.decryptionCache.delete(key);
        }
      }
    }
  
    /**
     * Clear all cached content
     */
    clearCache(): void {
      this.decryptionCache.clear();
    }
  
    /**
     * Get cache statistics
     */
    getCacheStats(): { size: number; keys: string[] } {
      return {
        size: this.decryptionCache.size,
        keys: Array.from(this.decryptionCache.keys())
      };
    }
  }
  
  // Export singleton instance
  export const articleDecryptionService = new ArticleDecryptionService();