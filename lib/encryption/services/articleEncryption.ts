// lib/encryption/services/articleEncryption.ts
import { 
    EncryptionError, 
    ENCRYPTION_VERSION,
    ENCRYPTION_CONFIG 
  } from '../types/encryption';
  import { chaCha20Poly1305Service } from '../crypto/chacha20poly1305';
  import { keyDerivationService } from './keyDerivation';
  
  export interface ArticleEncryptionParams {
    userAddress: string;
    articleId: string;
    licenseTokenId?: string; // Optional, defaults to "0" for publishing
  }
  
  export interface EncryptionResult {
    success: boolean;
    encryptedContent?: string;
    error?: string;
    metadata?: {
      version: string;
      keyDerivationParams: ArticleEncryptionParams;
      encryptedSize: number;
    };
  }
  
  export class ArticleEncryptionService {
    
    /**
     * Main entry point for article encryption during publishing
     */
    async encryptArticle(
      plainContent: string,
      params: ArticleEncryptionParams
    ): Promise<EncryptionResult> {
      try {
        console.log('🔐 Starting encryption for article:', params.articleId);
        
        // Validate inputs
        if (!plainContent || plainContent.trim().length === 0) {
          throw new EncryptionError('Content cannot be empty');
        }
        
        if (!params.userAddress || !params.articleId) {
          throw new EncryptionError('User address and article ID are required');
        }
        
        // Use default license token ID for publishing if not provided
        const encryptionParams = {
          ...params,
          licenseTokenId: params.licenseTokenId || "0"
        };
        
        // Validate parameters
        keyDerivationService.validateParams(encryptionParams);
        
        // Derive encryption key using same logic as decryption
        const encryptionKey = await keyDerivationService.deriveDecryptionKey(encryptionParams);
        
        // Encrypt content using ChaCha20-Poly1305
        const encryptionResult = await chaCha20Poly1305Service.encrypt(
          plainContent,
          encryptionKey
        );
        
        // Format encrypted content: "ENCRYPTED_V1:nonce:content:tag"
        const encryptedContent = this.formatEncryptedContent(encryptionResult);
        
        console.log('✅ Encryption successful, size:', encryptedContent.length);
        
        return {
          success: true,
          encryptedContent,
          metadata: {
            version: ENCRYPTION_VERSION,
            keyDerivationParams: encryptionParams,
            encryptedSize: encryptedContent.length
          }
        };
        
      } catch (error) {
        console.error('❌ Encryption failed:', error);
        
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown encryption error'
        };
      }
    }
    
    /**
     * Format encrypted data into the expected string format
     * Format: "ENCRYPTED_V1:nonce_base64:content_base64:tag_base64"
     */
    private formatEncryptedContent(encryptionResult: {
      nonce: Uint8Array;
      ciphertext: Uint8Array;
      authTag: Uint8Array;
    }): string {
      try {
        const nonceBase64 = chaCha20Poly1305Service.bytesToBase64(encryptionResult.nonce);
        const contentBase64 = chaCha20Poly1305Service.bytesToBase64(encryptionResult.ciphertext);
        const tagBase64 = chaCha20Poly1305Service.bytesToBase64(encryptionResult.authTag);
        
        return `${ENCRYPTION_VERSION}:${nonceBase64}:${contentBase64}:${tagBase64}`;
        
      } catch (error) {
        throw new EncryptionError(`Failed to format encrypted content: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    /**
     * Validate encryption parameters
     */
    validateEncryptionParams(params: ArticleEncryptionParams): void {
      if (!params.userAddress) {
        throw new EncryptionError('User address is required for encryption');
      }
      
      if (!params.articleId) {
        throw new EncryptionError('Article ID is required for encryption');
      }
      
      // Validate Ethereum address format
      if (!/^0x[a-fA-F0-9]{40}$/.test(params.userAddress)) {
        throw new EncryptionError('Invalid Ethereum address format');
      }
    }
    
    /**
     * Estimate encrypted content size (for UI feedback)
     */
    estimateEncryptedSize(plainContent: string): number {
      // Base64 encoding increases size by ~33%
      // Plus overhead for version, nonce, and tag
      const contentBytes = new TextEncoder().encode(plainContent).length;
      const encryptedBytes = contentBytes;
      const base64Overhead = Math.ceil(encryptedBytes * 1.33);
      const formatOverhead = ENCRYPTION_VERSION.length + 3 + // version + colons
                            Math.ceil(ENCRYPTION_CONFIG.nonceLength * 1.33) + // nonce
                            Math.ceil(ENCRYPTION_CONFIG.tagLength * 1.33);   // tag
      
      return base64Overhead + formatOverhead;
    }
    
    /**
     * Predict next article ID from contract (helper for publishing)
     */
    async predictNextArticleId(): Promise<string> {
      try {
        // Import the read service to get current count
        const { EncryptedArticleReadService } = await import('../../blockchain/contracts/EncryptedArticleReadService');
        const readService = new EncryptedArticleReadService();
        
        const currentTotal = await readService.getTotalArticles();
        const nextId = currentTotal + 1;
        
        console.log('🔢 Predicted next article ID:', nextId);
        return nextId.toString();
        
      } catch (error) {
        console.warn('⚠️ Could not predict article ID, using timestamp fallback');
        // Fallback to timestamp-based ID if contract read fails
        return `temp_${Date.now()}`;
      }
    }
  }
  
  // Export singleton instance
  export const articleEncryptionService = new ArticleEncryptionService();