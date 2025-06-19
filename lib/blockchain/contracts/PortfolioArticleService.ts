// lib/blockchain/contracts/PortfolioArticleService.ts
import { ethers } from 'ethers';

export interface PortfolioArticle {
  id: string;
  title: string;
  description: string;
  contentUrl: string;
  category: string;
  location: string;
  tags: string[];
  originalAuthor: string;
  sourceDomain: string;
  publicationName: string;      // NEW: Original publication
  originalPublishDate: string;  // NEW: When originally published
  portfolioType: string;        // NEW: "verification" | "showcase"
  author: string;
  timestamp: bigint;
  isActive: boolean;
}

export interface PortfolioArticleInput {
  title: string;
  description: string;
  contentUrl: string;
  category: string;
  location: string;
  tags: string[];
  originalAuthor: string;
  sourceDomain: string;
  publicationName: string;
  originalPublishDate: string;
  portfolioType: string;
}

export interface UserPostingStats {
  totalPosts: number;
  postsToday: number;
  remainingToday: number;
}

export interface ContractInfo {
  publisherCredentialsContract: string; // Updated name
  treasury: string;
  fee: bigint;
  totalArticleCount: number;
}

// Define the contract interface
interface PortfolioArticlesContractInterface {
  createPortfolioArticle(input: PortfolioArticleInput, overrides?: ethers.Overrides): Promise<ethers.ContractTransactionResponse>;
  getArticle(articleId: bigint): Promise<[bigint, string, string, string, string, string, string[], string, string, string, string, string, string, bigint, boolean]>;
  getArticlesByAuthor(author: string): Promise<bigint[]>;
  getUserPostingStats(user: string): Promise<[bigint, bigint, bigint]>;
  canUserPost(user: string): Promise<boolean>;
  getContractInfo(): Promise<[string, string, bigint, bigint]>;
  PORTFOLIO_ARTICLE_FEE(): Promise<bigint>;
}

export class PortfolioArticleService {
  private contract: ethers.Contract & PortfolioArticlesContractInterface;
  private provider: ethers.Provider;

  // Contract ABI - essential functions only
  private static readonly ABI = [
    "function createPortfolioArticle(tuple(string title, string description, string contentUrl, string category, string location, string[] tags, string originalAuthor, string sourceDomain, string publicationName, string originalPublishDate, string portfolioType) input) external payable",
    "function getArticle(uint256 _articleId) external view returns (tuple(uint256 id, string title, string description, string contentUrl, string category, string location, string[] tags, string originalAuthor, string sourceDomain, string publicationName, string originalPublishDate, string portfolioType, address author, uint256 timestamp, bool isActive))",
    "function getArticlesByAuthor(address _author) external view returns (uint256[])",
    "function getUserPostingStats(address _user) external view returns (uint256 totalPosts, uint256 postsToday, uint256 remainingToday)",
    "function canUserPost(address _user) external view returns (bool)",
    "function getContractInfo() external view returns (address publisherCredentialsContract, address treasury, uint256 fee, uint256 totalArticleCount)",
    "function PORTFOLIO_ARTICLE_FEE() external pure returns (uint256)",
    "event PortfolioArticleCreated(uint256 indexed articleId, address indexed author, string indexed category, string title, string contentUrl, string publicationName, uint256 timestamp)",
    "event TreasuryFeePaid(address indexed payer, uint256 amount, uint256 articleId)"
  ];

  constructor(contractAddress: string, provider: ethers.Provider) {
    this.provider = provider;
    this.contract = new ethers.Contract(
      contractAddress, 
      PortfolioArticleService.ABI, 
      provider
    ) as ethers.Contract & PortfolioArticlesContractInterface;
  }

  /**
   * Create a portfolio article
   */
  async createPortfolioArticle(
    articleInput: PortfolioArticleInput,
    signer: ethers.Signer
  ): Promise<ethers.TransactionResponse> {
    const contractWithSigner = this.contract.connect(signer) as ethers.Contract & PortfolioArticlesContractInterface;
    const fee = await this.getArticleFee();
    
    return await contractWithSigner.createPortfolioArticle(articleInput, {
      value: fee
    });
  }

  /**
   * Get article by ID
   */
  async getArticle(articleId: string | number): Promise<PortfolioArticle | null> {
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
        publicationName: article[9],
        originalPublishDate: article[10],
        portfolioType: article[11],
        author: article[12],
        timestamp: article[13],
        isActive: article[14]
      };
    } catch (error) {
      console.error('Error fetching portfolio article:', error);
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
      console.error('Error fetching portfolio articles by author:', error);
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
   * Check if user can post (has valid publisher credential)
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
      const [publisherCredentialsContract, treasury, fee, totalArticleCount] = await this.contract.getContractInfo();
      
      return {
        publisherCredentialsContract, // Updated name
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
   * Get the article creation fee (1 FLOW)
   */
  async getArticleFee(): Promise<bigint> {
    try {
      return await this.contract.PORTFOLIO_ARTICLE_FEE();
    } catch (error) {
      console.error('Error fetching article fee:', error);
      return ethers.parseEther('1.0'); // Fallback to 1 FLOW
    }
  }

  /**
   * Get multiple articles by IDs (batch fetch)
   */
  async getArticlesBatch(articleIds: string[]): Promise<PortfolioArticle[]> {
    const articles: PortfolioArticle[] = [];
    
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
  async getRecentArticles(authorAddress: string, limit: number = 10): Promise<PortfolioArticle[]> {
    try {
      const articleIds = await this.getArticlesByAuthor(authorAddress);
      
      // Get the most recent articles (reverse order, take limit)
      const recentIds = articleIds.reverse().slice(0, limit);
      
      return await this.getArticlesBatch(recentIds);
    } catch (error) {
      console.error('Error fetching recent portfolio articles:', error);
      return [];
    }
  }

  /**
   * Listen for article creation events
   */
  onArticleCreated(callback: (articleId: string, author: string, category: string, title: string, contentUrl: string, publicationName: string) => void) {
    this.contract.on('PortfolioArticleCreated', (articleId, author, category, title, contentUrl, publicationName) => {
      callback(articleId.toString(), author, category, title, contentUrl, publicationName);
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
    articleInput: PortfolioArticleInput,
    signer: ethers.Signer
  ): Promise<bigint> {
    try {
      const contractWithSigner = this.contract.connect(signer);
      const fee = await this.getArticleFee();
      
      // Type assertion to access estimateGas
      const gasEstimate = await (contractWithSigner as any).estimateGas.createPortfolioArticle(articleInput, {
        value: fee
      });
      
      return gasEstimate;
    } catch (error) {
      console.error('Error estimating gas:', error);
      return BigInt(400000); // Fallback estimate (higher than community)
    }
  }

  /**
   * Wait for transaction confirmation and return article ID
   */
  async waitForArticleCreation(txHash: string): Promise<string | null> {
    try {
      const receipt = await this.provider.waitForTransaction(txHash);
      
      if (receipt && receipt.logs) {
        // Parse the PortfolioArticleCreated event
        for (const log of receipt.logs) {
          try {
            const parsedLog = this.contract.interface.parseLog({
              topics: log.topics,
              data: log.data
            });
            
            if (parsedLog && parsedLog.name === 'PortfolioArticleCreated') {
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
      console.error('Error waiting for portfolio article creation:', error);
      return null;
    }
  }
}

// Helper function to create service instance
export function createPortfolioArticleService(
  contractAddress: string,
  provider: ethers.Provider
): PortfolioArticleService {
  return new PortfolioArticleService(contractAddress, provider);
}

// Default export
export default PortfolioArticleService;