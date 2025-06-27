// lib/services/articleCollectionService.ts
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, NETWORK_CONFIG } from '../constants/deployments';

// Use the SAME ABI pattern as marketplace
const ENCRYPTED_ARTICLES_ABI = [
  "function getAvailableEditions(uint256) view returns (uint256[])",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "event ArticlePublished(uint256 indexed articleId, address indexed author, string title, string location, uint256 nftCount, uint256 nftPrice)"
];

const READER_LICENSE_AMM_ABI = [
  "function balanceOf(address account, uint256 id) external view returns (uint256)",
  "function hasActiveAccess(uint256 articleId, address user) external view returns (bool)",
  "function getAccessExpiryTime(uint256 articleId, address user) external view returns (uint256)",
  "function getLicensesBurnedForArticle(uint256 articleId) external view returns (uint256)"
];

export interface ArticleNFT {
  tokenId: string;
  title: string;
  author: string;
  contentHash: string;
  publishedAt: string;
  licensesBurned: number;
  currentPrice: string;
  hasActiveAccess: boolean;
  accessExpiryTime?: number;
}

export interface LicensePortfolioSummary {
  totalArticlesOwned: number;
  totalLicensesBurned: number;
  articlesWithActiveAccess: number;
  totalPortfolioValue: string;
}

export class ArticleCollectionService {
  private provider: ethers.JsonRpcProvider;
  private encryptedArticlesContract: ethers.Contract;
  private readerLicenseAMMContract: ethers.Contract;

  constructor(provider?: ethers.JsonRpcProvider) {
    this.provider = provider || new ethers.JsonRpcProvider(NETWORK_CONFIG.RPC_URL);
    this.encryptedArticlesContract = new ethers.Contract(
      CONTRACT_ADDRESSES.ENCRYPTED_ARTICLES,
      ENCRYPTED_ARTICLES_ABI,
      this.provider
    );
    this.readerLicenseAMMContract = new ethers.Contract(
      CONTRACT_ADDRESSES.READER_LICENSE_AMM,
      READER_LICENSE_AMM_ABI,
      this.provider
    );
  }

  async getUserArticleNFTs(userAddress: string): Promise<ArticleNFT[]> {
    try {
      console.log('ArticleCollectionService: Fetching NFTs for', userAddress);

      // Use the SAME PATTERN as marketplace - get articles from events
      const filter = this.encryptedArticlesContract.filters.ArticlePublished();
      const events = await this.encryptedArticlesContract.queryFilter(filter, 0, 'latest');
      console.log('ArticleCollectionService: Found events:', events.length);

      const nfts: ArticleNFT[] = [];

      for (const event of events) {
        try {
          const eventLog = event as ethers.EventLog;
          const { articleId, author, title, location } = eventLog.args;
          
          console.log(`ArticleCollectionService: Checking ownership of article ${articleId}`);
          
          // Check if user owns this article NFT
          const owner = await this.encryptedArticlesContract.ownerOf(articleId);
          
          if (owner.toLowerCase() === userAddress.toLowerCase()) {
            console.log(`ArticleCollectionService: User owns article ${articleId}`);

            // Get license data from AMM
            const licensesBurned = await this.readerLicenseAMMContract.getLicensesBurnedForArticle(articleId);
            const hasActiveAccess = await this.readerLicenseAMMContract.hasActiveAccess(articleId, userAddress);
            
            let accessExpiryTime: number | undefined;
            if (hasActiveAccess) {
              accessExpiryTime = Number(await this.readerLicenseAMMContract.getAccessExpiryTime(articleId, userAddress));
            }

            const nft: ArticleNFT = {
              tokenId: articleId.toString(),
              title: title,
              author: author,
              contentHash: '', // Not available in events
              publishedAt: 'Recent', // Could get from event block if needed
              licensesBurned: Number(licensesBurned),
              currentPrice: '0', // Will be filled by useLicenseValue hook
              hasActiveAccess,
              accessExpiryTime
            };

            nfts.push(nft);
          }

        } catch (error) {
          console.log(`ArticleCollectionService: Skipping article:`, error);
          continue;
        }
      }

      console.log('ArticleCollectionService: Retrieved', nfts.length, 'NFTs');
      return nfts;

    } catch (error) {
      console.error('Error fetching user article NFTs:', error);
      throw error;
    }
  }

  async getLicensePortfolioSummary(userAddress: string): Promise<LicensePortfolioSummary> {
    try {
      const nfts = await this.getUserArticleNFTs(userAddress);
      
      const totalArticlesOwned = nfts.length;
      const totalLicensesBurned = nfts.reduce((sum, nft) => sum + nft.licensesBurned, 0);
      const articlesWithActiveAccess = nfts.filter(nft => nft.hasActiveAccess).length;

      return {
        totalArticlesOwned,
        totalLicensesBurned,
        articlesWithActiveAccess,
        totalPortfolioValue: '0' // Will be calculated with price data
      };

    } catch (error) {
      console.error('Error getting license portfolio summary:', error);
      throw error;
    }
  }

  async checkArticleAccess(articleId: string, userAddress: string): Promise<{
    hasActiveAccess: boolean;
    accessExpiryTime?: number;
    canBurnLicense: boolean;
    licenseCount: number;
  }> {
    try {
      const hasActiveAccess = await this.readerLicenseAMMContract.hasActiveAccess(articleId, userAddress);
      const licenseBalance = await this.readerLicenseAMMContract.balanceOf(userAddress, articleId);
      
      let accessExpiryTime: number | undefined;
      if (hasActiveAccess) {
        accessExpiryTime = Number(await this.readerLicenseAMMContract.getAccessExpiryTime(articleId, userAddress));
      }

      return {
        hasActiveAccess,
        accessExpiryTime,
        canBurnLicense: Number(licenseBalance) > 0 && !hasActiveAccess,
        licenseCount: Number(licenseBalance)
      };

    } catch (error) {
      console.error('Error checking article access:', error);
      throw error;
    }
  }
}

export const articleCollectionService = new ArticleCollectionService();