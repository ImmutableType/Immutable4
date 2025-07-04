// lib/blockchain/services/AvailabilityCache.ts
import { ethers } from 'ethers';

interface AvailabilityData {
  articleId: string;
  isAvailable: boolean;
  availableCount: number;
  timestamp: number;
}

interface CacheEntry {
  data: AvailabilityData;
  timestamp: number;
}

export class AvailabilityCache {
  private cache = new Map<string, CacheEntry>();
  private readonly TTL = 15 * 60 * 1000; // 15 minutes
  private readonly MAX_ENTRIES = 1000;
  private readonly CONTRACT_ADDRESS = '0xd99aB3390aAF8BC69940626cdbbBf22F436c6753';
  private provider: ethers.JsonRpcProvider;

  constructor() {
    this.provider = new ethers.JsonRpcProvider('https://testnet.evm.nodes.onflow.org');
  }

  /**
   * Get availability for multiple articles
   * Returns a map of articleId -> availability data
   */
  async getBatchAvailability(articleIds: string[]): Promise<Map<string, AvailabilityData>> {
    const results = new Map<string, AvailabilityData>();
    const uncachedIds: string[] = [];

    // Check cache first
    for (const articleId of articleIds) {
      const cached = this.getFromCache(articleId);
      if (cached) {
        results.set(articleId, cached);
      } else {
        uncachedIds.push(articleId);
      }
    }

    // Fetch uncached items
    if (uncachedIds.length > 0) {
      const freshData = await this.fetchBatchAvailability(uncachedIds);
      // Fix: Use forEach instead of for...of
      freshData.forEach((data, id) => {
        this.setInCache(id, data);
        results.set(id, data);
      });
    }

    return results;
  }

  /**
   * Get availability for a single article
   */
  async getAvailability(articleId: string): Promise<AvailabilityData> {
    // Check cache first
    const cached = this.getFromCache(articleId);
    if (cached) {
      return cached;
    }

    // Fetch fresh data
    const freshData = await this.fetchSingleAvailability(articleId);
    this.setInCache(articleId, freshData);
    return freshData;
  }

  /**
   * Fetch availability data from blockchain
   */
  private async fetchBatchAvailability(articleIds: string[]): Promise<Map<string, AvailabilityData>> {
    console.log(`🔍 Fetching availability for ${articleIds.length} articles...`);
    
    const results = new Map<string, AvailabilityData>();
    const contract = new ethers.Contract(
      this.CONTRACT_ADDRESS,
      ["function getAvailableEditions(uint256) view returns (uint256[])"],
      this.provider
    );

    // Process in chunks to avoid rate limiting
    const CHUNK_SIZE = 10;
    for (let i = 0; i < articleIds.length; i += CHUNK_SIZE) {
      const chunk = articleIds.slice(i, i + CHUNK_SIZE);
      
      const promises = chunk.map(async (articleId) => {
        try {
          const availableEditions = await contract.getAvailableEditions(parseInt(articleId));
          const availableCount = availableEditions.length;
          
          return {
            articleId,
            data: {
              articleId,
              isAvailable: availableCount > 0,
              availableCount,
              timestamp: Date.now()
            }
          };
        } catch (error) {
          console.warn(`⚠️ Failed to fetch availability for article ${articleId}:`, error);
          return {
            articleId,
            data: {
              articleId,
              isAvailable: false,
              availableCount: -1, // -1 indicates error
              timestamp: Date.now()
            }
          };
        }
      });

      const chunkResults = await Promise.all(promises);
      for (const result of chunkResults) {
        results.set(result.articleId, result.data);
      }

      // Small delay between chunks
      if (i + CHUNK_SIZE < articleIds.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return results;
  }

  /**
   * Fetch availability for a single article
   */
  private async fetchSingleAvailability(articleId: string): Promise<AvailabilityData> {
    const contract = new ethers.Contract(
      this.CONTRACT_ADDRESS,
      ["function getAvailableEditions(uint256) view returns (uint256[])"],
      this.provider
    );

    try {
      const availableEditions = await contract.getAvailableEditions(parseInt(articleId));
      const availableCount = availableEditions.length;
      
      return {
        articleId,
        isAvailable: availableCount > 0,
        availableCount,
        timestamp: Date.now()
      };
    } catch (error) {
      console.warn(`⚠️ Failed to fetch availability for article ${articleId}:`, error);
      return {
        articleId,
        isAvailable: false,
        availableCount: -1, // -1 indicates error
        timestamp: Date.now()
      };
    }
  }

  /**
   * Get from cache if valid
   */
  private getFromCache(articleId: string): AvailabilityData | null {
    const entry = this.cache.get(articleId);
    if (!entry) return null;

    // Check if expired
    if (Date.now() - entry.timestamp > this.TTL) {
      this.cache.delete(articleId);
      return null;
    }

    return entry.data;
  }

  /**
   * Store in cache with size management
   */
  private setInCache(articleId: string, data: AvailabilityData) {
    // Enforce max cache size
    if (this.cache.size >= this.MAX_ENTRIES && !this.cache.has(articleId)) {
      // Remove oldest entry
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(articleId, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Clear expired entries
   */
  cleanCache() {
    const now = Date.now();
    // Fix: Convert to array first
    const entries = Array.from(this.cache.entries());
    for (const [key, entry] of entries) {
      if (now - entry.timestamp > this.TTL) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      maxSize: this.MAX_ENTRIES,
      ttl: this.TTL
    };
  }
}

// Singleton instance
let cacheInstance: AvailabilityCache | null = null;

export function getAvailabilityCache(): AvailabilityCache {
  if (!cacheInstance) {
    cacheInstance = new AvailabilityCache();
  }
  return cacheInstance;
}