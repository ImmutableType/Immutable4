import { ethers } from 'ethers';

// Emoji mapping for UI <-> Contract communication
const EMOJI_MAP = {
  '👍': 'thumbsUp',
  '👏': 'clap',
  '🔥': 'fire',
  '🤔': 'thinking'
} as const;

const EMOJI_REVERSE_MAP = {
  'thumbsUp': '👍',
  'clap': '👏',
  'fire': '🔥',
  'thinking': '🤔'
} as const;

// ABI for ChainReactions contract
const CHAIN_REACTIONS_ABI = [
  "function addReaction(uint256 contentId, string emoji, bool isPowerUp) external",
  "function getReactions(uint256 contentId) external view returns (uint256 thumbsUp, uint256 clap, uint256 fire, uint256 thinking, uint256 supporters)",
  "function getBatchReactions(uint256[] contentIds) external view returns (uint256[] thumbsUp, uint256[] clap, uint256[] fire, uint256[] thinking, uint256[] supporters)",
  "function hasReacted(uint256, address) external view returns (bool)",
  "event ReactionAdded(uint256 indexed contentId, address indexed user, string emoji, bool isPowerUp, uint256 timestamp)"
];

export interface ReactionData {
  '👍': number;
  '👏': number;
  '🔥': number;
  '🤔': number;
  supporters: number;
  [key: string]: number;  // ADD THIS
}

export class ChainReactionService {
  private contract: ethers.Contract;
  private contractAddress: string;

  constructor(contractAddress: string, provider: ethers.Provider | ethers.Signer) {
    this.contractAddress = contractAddress;
    this.contract = new ethers.Contract(contractAddress, CHAIN_REACTIONS_ABI, provider);
  }

  /**
   * Get reactions for a single content item
   */
  async getReactions(contentId: string | number): Promise<ReactionData> {
    try {
      const id = typeof contentId === 'string' ? parseInt(contentId) : contentId;
      const result = await this.contract.getReactions(id);
      
      return {
        '👍': Number(result.thumbsUp),
        '👏': Number(result.clap),
        '🔥': Number(result.fire),
        '🤔': Number(result.thinking),
        supporters: Number(result.supporters)
      };
    } catch (error) {
      console.error('Error fetching reactions:', error);
      return {
        '👍': 0,
        '👏': 0,
        '🔥': 0,
        '🤔': 0,
        supporters: 0
      };
    }
  }

  /**
   * Get reactions for multiple content items
   */
  async getBatchReactions(contentIds: (string | number)[]): Promise<Map<string, ReactionData>> {
    try {
      const ids = contentIds.map(id => typeof id === 'string' ? parseInt(id) : id);
      const result = await this.contract.getBatchReactions(ids);
      
      const reactionsMap = new Map<string, ReactionData>();
      
      for (let i = 0; i < ids.length; i++) {
        reactionsMap.set(ids[i].toString(), {
          '👍': Number(result.thumbsUp[i]),
          '👏': Number(result.clap[i]),
          '🔥': Number(result.fire[i]),
          '🤔': Number(result.thinking[i]),
          supporters: Number(result.supporters[i])
        });
      }
      
      return reactionsMap;
    } catch (error) {
      console.error('Error fetching batch reactions:', error);
      return new Map();
    }
  }

  /**
   * Add a reaction to content
   */
  async addReaction(
    contentId: string | number,
    emoji: string,
    isPowerUp: boolean,
    signer: ethers.Signer
  ): Promise<ethers.TransactionResponse> {
    const contractWithSigner = this.contract.connect(signer) as ethers.Contract;
    const id = typeof contentId === 'string' ? parseInt(contentId) : contentId;
    
    // Convert emoji to identifier for contract
    const emojiIdentifier = EMOJI_MAP[emoji as keyof typeof EMOJI_MAP] || emoji;
    
    try {
      const tx = await contractWithSigner.addReaction(id, emojiIdentifier, isPowerUp);
      return tx;
    } catch (error: any) {
      if (error.message?.includes('insufficient allowance')) {
        throw new Error('Insufficient EMOJI tokens. Please reload your EMOJI balance.');
      }
      throw error;
    }
  }

  /**
   * Check if a user has reacted to content
   */
  async hasUserReacted(contentId: string | number, userAddress: string): Promise<boolean> {
    try {
      const id = typeof contentId === 'string' ? parseInt(contentId) : contentId;
      return await this.contract.hasReacted(id, userAddress);
    } catch (error) {
      console.error('Error checking user reaction:', error);
      return false;
    }
  }

  /**
   * Listen for reaction events
   */
  onReactionAdded(callback: (contentId: number, user: string, emoji: string, isPowerUp: boolean) => void) {
    this.contract.on('ReactionAdded', (contentId, user, emoji, isPowerUp, timestamp) => {
      // Convert identifier back to emoji for UI
      const emojiChar = EMOJI_REVERSE_MAP[emoji as keyof typeof EMOJI_REVERSE_MAP] || emoji;
      callback(Number(contentId), user, emojiChar, isPowerUp);
    });
  }

  /**
   * Remove event listeners
   */
  removeAllListeners() {
    this.contract.removeAllListeners();
  }
}