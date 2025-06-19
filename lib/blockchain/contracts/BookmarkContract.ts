// lib/blockchain/contracts/BookmarkContract.ts
import { ethers } from 'ethers';

export enum ContentType {
  ARTICLE = 0,
  PROPOSAL = 1
}

export interface Bookmark {
  contentId: string;
  contentType: ContentType;
  timestamp: bigint;
  isActive: boolean;
}

export interface BookmarkStats {
  totalBookmarks: number;
  articleBookmarks: number;
  proposalBookmarks: number;
}

// Define the contract interface
interface BookmarkContractInterface {
  addBookmark(contentId: string, contentType: number, overrides?: ethers.Overrides): Promise<ethers.ContractTransactionResponse>;
  removeBookmark(contentId: string, contentType: number, overrides?: ethers.Overrides): Promise<ethers.ContractTransactionResponse>;
  getUserBookmarks(user: string): Promise<[string, number, bigint, boolean][]>;
  getUserBookmarkCount(user: string): Promise<bigint>;
  getUserBookmarksByType(user: string, contentType: number): Promise<[string, number, bigint, boolean][]>;
  isBookmarked(user: string, contentId: string, contentType: number): Promise<boolean>;
  getContentBookmarkCount(contentId: string, contentType: number): Promise<bigint>;
  getBookmarkFee(): Promise<bigint>;
  getContractInfo(): Promise<[string, string, bigint]>;
}

export class BookmarkContractService {
  private contract: ethers.Contract & BookmarkContractInterface;
  private provider: ethers.Provider;

  // Contract ABI - essential functions only
  private static readonly ABI = [
    "function addBookmark(string calldata contentId, uint8 contentType) external payable",
    "function removeBookmark(string calldata contentId, uint8 contentType) external payable",
    "function getUserBookmarks(address user) external view returns (tuple(string contentId, uint8 contentType, uint256 timestamp, bool isActive)[])",
    "function getUserBookmarkCount(address user) external view returns (uint256)",
    "function getUserBookmarksByType(address user, uint8 contentType) external view returns (tuple(string contentId, uint8 contentType, uint256 timestamp, bool isActive)[])",
    "function isBookmarked(address user, string calldata contentId, uint8 contentType) external view returns (bool)",
    "function getContentBookmarkCount(string calldata contentId, uint8 contentType) external view returns (uint256)",
    "function getBookmarkFee() external pure returns (uint256)",
    "function getContractInfo() external view returns (address profileContract, address treasury, uint256 fee)",
    "event BookmarkAdded(address indexed user, string indexed contentId, uint8 indexed contentType, uint256 timestamp)",
    "event BookmarkRemoved(address indexed user, string indexed contentId, uint8 indexed contentType, uint256 timestamp)",
    "event TreasuryFeePaid(address indexed payer, uint256 amount)"
  ];

  constructor(contractAddress: string, provider: ethers.Provider) {
    this.provider = provider;
    this.contract = new ethers.Contract(
      contractAddress, 
      BookmarkContractService.ABI, 
      provider
    ) as ethers.Contract & BookmarkContractInterface;
  }

  /**
   * Add a bookmark for content
   */
  async addBookmark(
    contentId: string, 
    contentType: ContentType, 
    signer: ethers.Signer
  ): Promise<ethers.TransactionResponse> {
    const contractWithSigner = this.contract.connect(signer) as ethers.Contract & BookmarkContractInterface;
    const fee = await this.getBookmarkFee();
    
    return await contractWithSigner.addBookmark(contentId, contentType, {
      value: fee
    });
  }

  /**
   * Remove a bookmark for content
   */
  async removeBookmark(
    contentId: string, 
    contentType: ContentType, 
    signer: ethers.Signer
  ): Promise<ethers.TransactionResponse> {
    const contractWithSigner = this.contract.connect(signer) as ethers.Contract & BookmarkContractInterface;
    const fee = await this.getBookmarkFee();
    
    return await contractWithSigner.removeBookmark(contentId, contentType, {
      value: fee
    });
  }

  /**
   * Get all bookmarks for a user
   */
  async getUserBookmarks(userAddress: string): Promise<Bookmark[]> {
    try {
      const bookmarks = await this.contract.getUserBookmarks(userAddress);
      return bookmarks.map((bookmark: [string, number, bigint, boolean]) => ({
        contentId: bookmark[0],
        contentType: bookmark[1] as ContentType,
        timestamp: bookmark[2],
        isActive: bookmark[3]
      }));
    } catch (error) {
      console.error('Error fetching user bookmarks:', error);
      return [];
    }
  }

  /**
   * Get bookmark count for a user
   */
  async getUserBookmarkCount(userAddress: string): Promise<number> {
    try {
      const count = await this.contract.getUserBookmarkCount(userAddress);
      return Number(count);
    } catch (error) {
      console.error('Error fetching bookmark count:', error);
      return 0;
    }
  }

  /**
   * Get bookmarks by type for a user
   */
  async getUserBookmarksByType(
    userAddress: string, 
    contentType: ContentType
  ): Promise<Bookmark[]> {
    try {
      const bookmarks = await this.contract.getUserBookmarksByType(userAddress, contentType);
      return bookmarks.map((bookmark: [string, number, bigint, boolean]) => ({
        contentId: bookmark[0],
        contentType: bookmark[1] as ContentType,
        timestamp: bookmark[2],
        isActive: bookmark[3]
      }));
    } catch (error) {
      console.error('Error fetching bookmarks by type:', error);
      return [];
    }
  }

  /**
   * Check if content is bookmarked by user
   */
  async isBookmarked(
    userAddress: string, 
    contentId: string, 
    contentType: ContentType
  ): Promise<boolean> {
    try {
      return await this.contract.isBookmarked(userAddress, contentId, contentType);
    } catch (error) {
      console.error('Error checking bookmark status:', error);
      return false;
    }
  }

  /**
   * Get bookmark count for specific content
   */
  async getContentBookmarkCount(
    contentId: string, 
    contentType: ContentType
  ): Promise<number> {
    try {
      const count = await this.contract.getContentBookmarkCount(contentId, contentType);
      return Number(count);
    } catch (error) {
      console.error('Error fetching content bookmark count:', error);
      return 0;
    }
  }

  /**
   * Get the bookmark fee (0.001 FLOW)
   */
  async getBookmarkFee(): Promise<bigint> {
    try {
      return await this.contract.getBookmarkFee();
    } catch (error) {
      console.error('Error fetching bookmark fee:', error);
      return ethers.parseEther('0.001'); // Fallback to expected fee
    }
  }

  /**
   * Get bookmark statistics for a user
   */
  async getUserBookmarkStats(userAddress: string): Promise<BookmarkStats> {
    try {
      const [total, articles, proposals] = await Promise.all([
        this.getUserBookmarkCount(userAddress),
        this.getUserBookmarksByType(userAddress, ContentType.ARTICLE),
        this.getUserBookmarksByType(userAddress, ContentType.PROPOSAL)
      ]);

      return {
        totalBookmarks: total,
        articleBookmarks: articles.length,
        proposalBookmarks: proposals.length
      };
    } catch (error) {
      console.error('Error fetching bookmark stats:', error);
      return {
        totalBookmarks: 0,
        articleBookmarks: 0,
        proposalBookmarks: 0
      };
    }
  }

  /**
   * Listen for bookmark events
   */
  onBookmarkAdded(callback: (user: string, contentId: string, contentType: ContentType) => void) {
    this.contract.on('BookmarkAdded', (user, contentId, contentType) => {
      callback(user, contentId, contentType);
    });
  }

  onBookmarkRemoved(callback: (user: string, contentId: string, contentType: ContentType) => void) {
    this.contract.on('BookmarkRemoved', (user, contentId, contentType) => {
      callback(user, contentId, contentType);
    });
  }

  /**
   * Clean up event listeners
   */
  removeAllListeners() {
    this.contract.removeAllListeners();
  }
}

// Default export for easy importing
export default BookmarkContractService;