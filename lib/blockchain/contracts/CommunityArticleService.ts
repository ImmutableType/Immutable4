// lib/blockchain/contracts/CommunityArticleService.ts
import { ethers } from 'ethers';

export interface CommunityArticle {
  id: string;
  title: string;
  description: string;
  contentUrl: string;
  category: string;
  location: string;
  tags: string[];
  originalAuthor: string;
  sourceDomain: string;
  author: string;
  timestamp: bigint;
  isActive: boolean;
}

export interface ArticleInput {
  title: string;
  description: string;
  contentUrl: string;
  category: string;
  location: string;
  tags: string[];
  originalAuthor: string;
  sourceDomain: string;
}

export interface UserPostingStats {
  totalPosts: number;
  postsToday: number;
  remainingToday: number;
}

export interface ContractInfo {
  membershipContract: string;
  treasury: string;
  fee: bigint;
  totalArticleCount: number;
}

// Define the contract interface
interface CommunityArticlesContractInterface {
  createCommunityArticle(input: ArticleInput, overrides?: ethers.Overrides): Promise<ethers.ContractTransactionResponse>;
  getArticle(articleId: bigint): Promise<[bigint, string, string, string, string, string, string[], string, string, string, bigint, boolean]>;
  getArticlesByAuthor(author: string): Promise<bigint[]>;
  getUserPostingStats(user: string): Promise<[bigint, bigint, bigint]>;
  canUserPost(user: string): Promise<boolean>;
  getContractInfo(): Promise<[string, string, bigint, bigint]>;
  COMMUNITY_ARTICLE_FEE(): Promise<bigint>;
}

export class CommunityArticleService {
  private contract: ethers.Contract & CommunityArticlesContractInterface;
  private provider: ethers.Provider;

  // Contract ABI - essential functions only
  private static readonly ABI = [
    "function createCommunityArticle(tuple(string title, string description, string contentUrl, string category, string location, string[] tags, string originalAuthor, string sourceDomain) input) external payable",
    "function getArticle(uint256 _articleId) external view returns (tuple(uint256 id, string title, string description, string contentUrl, string category, string location, string[] tags, string originalAuthor, string sourceDomain, address author, uint256 timestamp, bool isActive))",
    "function getArticlesByAuthor(address _author) external view returns (uint256[])",
    "function getUserPostingStats(address _user) external view returns (uint256 totalPosts, uint256 postsToday, uint256 remainingToday)",
    "function canUserPost(address _user) external view returns (bool)",
    "function getContractInfo() external view returns (address membershipContract, address treasury, uint256 fee, uint256 totalArticleCount)",
    "function COMMUNITY_ARTICLE_FEE() external pure returns (uint256)",
    "event CommunityArticleCreated(uint256 indexed articleId, address indexed author, string indexed category, string title, string contentUrl, uint256 timestamp)",
    "event TreasuryFeePaid(address indexed payer, uint256 amount, uint256 articleId)"
  ];

  constructor(contractAddress: string, provider: ethers.Provider) {
    this.provider = provider;
    this.contract = new ethers.Contract(
      contractAddress, 
      CommunityArticleService.ABI, 
      provider
    ) as ethers.Contract & CommunityArticlesContractInterface;
  }

  /**
   * Create a community article
   */
  async createCommunityArticle(
    articleInput: ArticleInput,
    signer: ethers.Signer
  ): Promise<ethers.TransactionResponse> {
    const contractWithSigner = this.contract.connect(signer) as ethers.Contract & CommunityArticlesContractInterface;
    const fee = await this.getArticleFee();
    
    return await contractWithSigner.createCommunityArticle(articleInput, {
      value: fee
    });
  }

  /**
   * Get article by ID
   */
  async getArticle(articleId: string | number): Promise<CommunityArticle | null> {
    try {
      const article = await this.contract.getArticle(BigInt(articleId));
      
      return {
        id: article[0].toString(),
        title: article[1],
        description: article[2],
        contentUrl: article[3],
        category: article[4],
        location: article[5],
        tags: article[6],
        originalAuthor: article[7],
        sourceDomain: article[8],
        author: article[9],
        timestamp: article[10],
        isActive: article[11]
      };
    } catch (error) {
      console.error('Error fetching article:', error);
      return null;
    }
  }

  /**
   * Get articles by author
   */
  async getArticlesByAuthor(authorAddress: string): Promise<string[]> {
    try {
      const articleIds = await this.contract.getArticlesByAuthor(authorAddress);
      return articleIds.map(id => id.toString());
    } catch (error) {
      console.error('Error fetching articles by author:', error);
      return [];
    }
  }

  /**
   * Get user posting statistics
   */
  async getUserPostingStats(userAddress: string): Promise<UserPostingStats> {
    try {
      const [totalPosts, postsToday, remainingToday] = await this.contract.getUserPostingStats(userAddress);
      
      return {
        totalPosts: Number(totalPosts),
        postsToday: Number(postsToday),
        remainingToday: Number(remainingToday)
      };
    } catch (error) {
      console.error('Error fetching user posting stats:', error);
      return {
        totalPosts: 0,
        postsToday: 0,
        remainingToday: 0
      };
    }
  }

  /**
   * Check if user can post
   */
  async canUserPost(userAddress: string): Promise<boolean> {
    try {
      return await this.contract.canUserPost(userAddress);
    } catch (error) {
      console.error('Error checking if user can post:', error);
      return false;
    }
  }

  /**
   * Get contract information
   */
  async getContractInfo(): Promise<ContractInfo> {
    try {
      const [membershipContract, treasury, fee, totalArticleCount] = await this.contract.getContractInfo();
      
      return {
        membershipContract,
        treasury,
        fee,
        totalArticleCount: Number(totalArticleCount)
      };
    } catch (error) {
      console.error('Error fetching contract info:', error);
      throw error;
    }
  }

  /**
   * Get the article creation fee (0.009 FLOW)
   */
  async getArticleFee(): Promise<bigint> {
    try {
      return await this.contract.COMMUNITY_ARTICLE_FEE();
    } catch (error) {
      console.error('Error fetching article fee:', error);
      return ethers.parseEther('0.009'); // Fallback to expected fee
    }
  }

  /**
   * Get multiple articles by IDs (batch fetch)
   */
  async getArticlesBatch(articleIds: string[]): Promise<CommunityArticle[]> {
    const articles: CommunityArticle[] = [];
    
    for (const id of articleIds) {
      const article = await this.getArticle(id);
      if (article) {
        articles.push(article);
      }
    }
    
    return articles;
  }

  /**
   * Get recent articles (latest first)
   */
  async getRecentArticles(authorAddress: string, limit: number = 10): Promise<CommunityArticle[]> {
    try {
      const articleIds = await this.getArticlesByAuthor(authorAddress);
      
      // Get the most recent articles (reverse order, take limit)
      const recentIds = articleIds.reverse().slice(0, limit);
      
      return await this.getArticlesBatch(recentIds);
    } catch (error) {
      console.error('Error fetching recent articles:', error);
      return [];
    }
  }

  /**
   * Listen for article creation events
   */
  onArticleCreated(callback: (articleId: string, author: string, category: string, title: string, contentUrl: string) => void) {
    this.contract.on('CommunityArticleCreated', (articleId, author, category, title, contentUrl) => {
      callback(articleId.toString(), author, category, title, contentUrl);
    });
  }

  /**
   * Listen for treasury fee events
   */
  onTreasuryFeePaid(callback: (payer: string, amount: bigint, articleId: string) => void) {
    this.contract.on('TreasuryFeePaid', (payer, amount, articleId) => {
      callback(payer, amount, articleId.toString());
    });
  }

  /**
   * Clean up event listeners
   */
  removeAllListeners() {
    this.contract.removeAllListeners();
  }

/**
 * Estimate gas for article creation
 */
async estimateCreateArticleGas(
  articleInput: ArticleInput,
  signer: ethers.Signer
): Promise<bigint> {
  try {
    const contractWithSigner = this.contract.connect(signer);
    const fee = await this.getArticleFee();
    
    // Type assertion to access estimateGas
    const gasEstimate = await (contractWithSigner as any).estimateGas.createCommunityArticle(articleInput, {
      value: fee
    });
    
    return gasEstimate;
  } catch (error) {
    console.error('Error estimating gas:', error);
    return BigInt(300000); // Fallback estimate
  }
}

  /**
   * Wait for transaction confirmation and return article ID
   */
  async waitForArticleCreation(txHash: string): Promise<string | null> {
    try {
      const receipt = await this.provider.waitForTransaction(txHash);
      
      if (receipt && receipt.logs) {
        // Parse the CommunityArticleCreated event
        for (const log of receipt.logs) {
          try {
            const parsedLog = this.contract.interface.parseLog({
              topics: log.topics,
              data: log.data
            });
            
            if (parsedLog && parsedLog.name === 'CommunityArticleCreated') {
              return parsedLog.args.articleId.toString();
            }
          } catch (e) {
            // Skip logs that can't be parsed
            continue;
          }
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error waiting for article creation:', error);
      return null;
    }
  }
}

// Helper function to create service instance
export function createCommunityArticleService(
  contractAddress: string,
  provider: ethers.Provider
): CommunityArticleService {
  return new CommunityArticleService(contractAddress, provider);
}

// Default export
export default CommunityArticleService;