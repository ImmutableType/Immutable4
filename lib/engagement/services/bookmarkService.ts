// lib/engagement/services/bookmarkService.ts
import { ethers } from 'ethers';
import BookmarkContractService, { ContentType, Bookmark } from '../../blockchain/contracts/BookmarkContract';
import { CONTRACT_ADDRESSES, NETWORK_CONFIG } from '../../constants/deployments';

class BookmarkService {
  private contractService: BookmarkContractService;
  private provider: ethers.JsonRpcProvider;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(NETWORK_CONFIG.RPC_URL);
    this.contractService = new BookmarkContractService(CONTRACT_ADDRESSES.BOOKMARK_CONTRACT, this.provider);
  }

  /**
   * Add bookmark with wallet connection
   */
  async addBookmark(contentId: string, contentType: 'article' | 'proposal'): Promise<void> {
    if (!window.ethereum) {
      throw new Error('MetaMask not found');
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    
    const contractContentType = contentType === 'article' ? ContentType.ARTICLE : ContentType.PROPOSAL;
    
    try {
      const tx = await this.contractService.addBookmark(contentId, contractContentType, signer);
      console.log('Adding bookmark, transaction:', tx.hash);
      
      // Wait for confirmation
      const receipt = await tx.wait();
      console.log('Bookmark added successfully:', receipt);
    } catch (error: any) {
      console.error('Error adding bookmark:', error);
      throw new Error(error.message || 'Failed to add bookmark');
    }
  }

  /**
   * Remove bookmark with wallet connection
   */
  async removeBookmark(contentId: string, contentType: 'article' | 'proposal'): Promise<void> {
    if (!window.ethereum) {
      throw new Error('MetaMask not found');
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    
    const contractContentType = contentType === 'article' ? ContentType.ARTICLE : ContentType.PROPOSAL;
    
    try {
      const tx = await this.contractService.removeBookmark(contentId, contractContentType, signer);
      console.log('Removing bookmark, transaction:', tx.hash);
      
      // Wait for confirmation
      const receipt = await tx.wait();
      console.log('Bookmark removed successfully:', receipt);
    } catch (error: any) {
      console.error('Error removing bookmark:', error);
      throw new Error(error.message || 'Failed to remove bookmark');
    }
  }

  /**
   * Get user's bookmarks
   */
  async getUserBookmarks(userAddress: string): Promise<{
    articles: Bookmark[];
    proposals: Bookmark[];
    total: Bookmark[];
  }> {
    try {
      const [allBookmarks, articles, proposals] = await Promise.all([
        this.contractService.getUserBookmarks(userAddress),
        this.contractService.getUserBookmarksByType(userAddress, ContentType.ARTICLE),
        this.contractService.getUserBookmarksByType(userAddress, ContentType.PROPOSAL)
      ]);

      return {
        articles,
        proposals,
        total: allBookmarks
      };
    } catch (error) {
      console.error('Error fetching user bookmarks:', error);
      return { articles: [], proposals: [], total: [] };
    }
  }

  /**
   * Check if content is bookmarked
   */
  async isBookmarked(
    userAddress: string, 
    contentId: string, 
    contentType: 'article' | 'proposal'
  ): Promise<boolean> {
    const contractContentType = contentType === 'article' ? ContentType.ARTICLE : ContentType.PROPOSAL;
    return await this.contractService.isBookmarked(userAddress, contentId, contractContentType);
  }

  /**
   * Get bookmark count for user
   */
  async getUserBookmarkCount(userAddress: string): Promise<number> {
    return await this.contractService.getUserBookmarkCount(userAddress);
  }

  /**
   * Get bookmark fee in FLOW
   */
  async getBookmarkFee(): Promise<string> {
    const feeWei = await this.contractService.getBookmarkFee();
    return ethers.formatEther(feeWei);
  }

  /**
   * Check if user has a profile (required for bookmarking)
   */
  async hasProfile(userAddress: string): Promise<boolean> {
    try {
      const provider = new ethers.JsonRpcProvider(NETWORK_CONFIG.RPC_URL);
      const profileContract = new ethers.Contract(
        CONTRACT_ADDRESSES.PROFILE_NFT,
        ['function hasProfile(address owner) external view returns (bool)'],
        provider
      );
      
      return await profileContract.hasProfile(userAddress);
    } catch (error) {
      console.error('Error checking profile status:', error);
      return false;
    }
  }
}

// Export singleton instance
export const bookmarkService = new BookmarkService();
export default bookmarkService;