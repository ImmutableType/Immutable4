// lib/profile/services/activityService.ts
import { ethers } from 'ethers';

export interface ActivityItem {
  id: string;
  type: 'gm' | 'bookmark' | 'community-article' | 'portfolio-article' | 'native-article' | 'license-purchase' | 'leaderboard' | 'emoji-purchase' | 'tip-sent' | 'tip-received';
  action: string;
  timestamp: string;
  txHash: string;
  blockNumber: number;
  details?: {
    title?: string;
    amount?: string;
    recipient?: string;
    contentType?: 'article' | 'proposal';
    tipType?: 'FLOW' | 'EMOJI';
  };
}

const ACTIVITY_CONTRACTS = {
  GMAction: { 
    address: '0x6018f8E6F53057b4aF5155BA97C4ef4AB416532C',
    abi: ["event GMSaid(address indexed user, uint256 indexed day, uint256 streak)"]
  },
  Bookmark: { 
    address: '0x66f856f960AEF5011FdCc7383B9F81d2515930c9',
    abi: [
      "event BookmarkAdded(address indexed user, string indexed contentId, uint8 indexed contentType, uint256 timestamp)",
      "event BookmarkRemoved(address indexed user, string indexed contentId, uint8 indexed contentType, uint256 timestamp)"
    ]
  },
  CommunityArticles: { 
    address: '0xD3d12E3b86Ed9f8Cdd095E0f90EDF7eE61Eb8611',
    abi: ["event CommunityArticleCreated(uint256 indexed articleId, address indexed author, string indexed category, string title, string contentUrl, uint256 timestamp)"]
  },
  PortfolioArticles: { 
    address: '0xF2Da11169CE742Ea0B75B7207E774449e26f8ee1',
    abi: ["event PortfolioArticleCreated(uint256 indexed articleId, address indexed author, string indexed category, string title, string contentUrl, string publicationName, uint256 timestamp)"]
  },
  EncryptedArticles: { 
    address: '0xd99aB3390aAF8BC69940626cdbbBf22F436c6753',
    abi: [
      "event ArticlePublished(uint256 indexed articleId, address indexed author, string title, string location, uint256 nftCount, uint256 nftPrice)",
      "event NFTMinted(uint256 indexed tokenId, uint256 indexed articleId, address indexed buyer, uint256 editionNumber, uint256 price, uint256 licensesGenerated)"
    ]
  },
  ReaderLicenseAMM: { 
    address: '0x01Df3b8cE28Fc473A73C3C0339480CcFD4E02E9a',
    abi: ["event LicensePurchased(address indexed buyer, uint256 indexed articleId, uint256 amount, uint256 price)"]
  },
  LeaderboardV4: { 
    address: '0x5001A51d7479a9cd91Ac4CBEB81931f197F63d56',
    abi: ["event LeaderboardSnapshotUpdated(address indexed updater, uint256 timestamp)"]
  },
  EmojiToken: { 
    address: '0x572F036576D1D9F41876e714D47f69CEa6933c36',
    abi: ["event TokensPurchased(address indexed buyer, uint256 amount, uint256 flowPaid)"]
  },
  TippingContract: { 
    address: '0xbA1bba49FD1A6B949844CEFddc94d182272A19b8',
    abi: [
      "event FlowTipSent(address indexed from, address indexed to, uint256 indexed profileId, uint256 amount, uint256 fee, uint256 emojiRewards, bool isPlatform)",
      "event EmojiTipSent(address indexed from, address indexed to, uint256 indexed profileId, uint256 amount, bool isPlatform)"
    ]
  }
};

export class ActivityService {
  private provider: ethers.JsonRpcProvider;

  constructor() {
    this.provider = new ethers.JsonRpcProvider('https://testnet.evm.nodes.onflow.org');
  }

  async getUserActivities(userAddressOrProfileId: string, limit: number = 20, offset: number = 0): Promise<ActivityItem[]> {
    const userAddress = await this.resolveToWalletAddress(userAddressOrProfileId);
    if (!userAddress) {
      throw new Error('Could not resolve user address');
    }

    const thirtyDaysAgo = Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60);
    const currentBlock = await this.provider.getBlockNumber();
    const fromBlock = Math.max(0, currentBlock - 1000000);

    console.debug('Fetching activities for:', userAddress, 'from block:', fromBlock);

    const allActivities: ActivityItem[] = [];

    const eventPromises = Object.entries(ACTIVITY_CONTRACTS).map(async ([contractName, config]) => {
      try {
        const contract = new ethers.Contract(config.address, config.abi, this.provider);
        const contractActivities: ActivityItem[] = [];
        
        switch (contractName) {
          case 'GMAction':
            try {
              const events = await contract.queryFilter('GMSaid', fromBlock, 'latest');
              for (const event of events) {
                const eventLog = event as ethers.EventLog;
                if (eventLog.args && eventLog.args[0].toLowerCase() === userAddress.toLowerCase()) {
                  const block = await this.provider.getBlock(eventLog.blockNumber);
                  if (block && block.timestamp >= thirtyDaysAgo) {
                    const activity = this.parseEventToActivity(contractName, eventLog, block, userAddress);
                    if (activity) contractActivities.push(activity);
                  }
                }
              }
            } catch (e) {
              console.warn(`Error querying GMAction events:`, e);
            }
            break;

          case 'Bookmark':
            try {
              const addEvents = await contract.queryFilter('BookmarkAdded', fromBlock, 'latest');
              const removeEvents = await contract.queryFilter('BookmarkRemoved', fromBlock, 'latest');
              const allEvents = [...addEvents, ...removeEvents];
              
              for (const event of allEvents) {
                const eventLog = event as ethers.EventLog;
                if (eventLog.args && eventLog.args[0].toLowerCase() === userAddress.toLowerCase()) {
                  const block = await this.provider.getBlock(eventLog.blockNumber);
                  if (block && block.timestamp >= thirtyDaysAgo) {
                    const activity = this.parseEventToActivity(contractName, eventLog, block, userAddress);
                    if (activity) contractActivities.push(activity);
                  }
                }
              }
            } catch (e) {
              console.warn(`Error querying Bookmark events:`, e);
            }
            break;

          case 'CommunityArticles':
            try {
              const events = await contract.queryFilter('CommunityArticleCreated', fromBlock, 'latest');
              for (const event of events) {
                const eventLog = event as ethers.EventLog;
                if (eventLog.args && eventLog.args[1].toLowerCase() === userAddress.toLowerCase()) {
                  const block = await this.provider.getBlock(eventLog.blockNumber);
                  if (block && block.timestamp >= thirtyDaysAgo) {
                    const activity = this.parseEventToActivity(contractName, eventLog, block, userAddress);
                    if (activity) contractActivities.push(activity);
                  }
                }
              }
            } catch (e) {
              console.warn(`Error querying CommunityArticles events:`, e);
            }
            break;

          case 'PortfolioArticles':
            try {
              const events = await contract.queryFilter('PortfolioArticleCreated', fromBlock, 'latest');
              for (const event of events) {
                const eventLog = event as ethers.EventLog;
                if (eventLog.args && eventLog.args[1].toLowerCase() === userAddress.toLowerCase()) {
                  const block = await this.provider.getBlock(eventLog.blockNumber);
                  if (block && block.timestamp >= thirtyDaysAgo) {
                    const activity = this.parseEventToActivity(contractName, eventLog, block, userAddress);
                    if (activity) contractActivities.push(activity);
                  }
                }
              }
            } catch (e) {
              console.warn(`Error querying PortfolioArticles events:`, e);
            }
            break;

          case 'EncryptedArticles':
            try {
              const publishEvents = await contract.queryFilter('ArticlePublished', fromBlock, 'latest');
              const mintEvents = await contract.queryFilter('NFTMinted', fromBlock, 'latest');
              
              for (const event of publishEvents) {
                const eventLog = event as ethers.EventLog;
                if (eventLog.args && eventLog.args[1].toLowerCase() === userAddress.toLowerCase()) {
                  const block = await this.provider.getBlock(eventLog.blockNumber);
                  if (block && block.timestamp >= thirtyDaysAgo) {
                    const activity = this.parseEventToActivity(contractName, eventLog, block, userAddress);
                    if (activity) contractActivities.push(activity);
                  }
                }
              }
              
              for (const event of mintEvents) {
                const eventLog = event as ethers.EventLog;
                if (eventLog.args && eventLog.args[2].toLowerCase() === userAddress.toLowerCase()) {
                  const block = await this.provider.getBlock(eventLog.blockNumber);
                  if (block && block.timestamp >= thirtyDaysAgo) {
                    const activity = this.parseEventToActivity(contractName, eventLog, block, userAddress);
                    if (activity) contractActivities.push(activity);
                  }
                }
              }
            } catch (e) {
              console.warn(`Error querying EncryptedArticles events:`, e);
            }
            break;

          case 'ReaderLicenseAMM':
            try {
              const events = await contract.queryFilter('LicensePurchased', fromBlock, 'latest');
              for (const event of events) {
                const eventLog = event as ethers.EventLog;
                if (eventLog.args && eventLog.args[0].toLowerCase() === userAddress.toLowerCase()) {
                  const block = await this.provider.getBlock(eventLog.blockNumber);
                  if (block && block.timestamp >= thirtyDaysAgo) {
                    const activity = this.parseEventToActivity(contractName, eventLog, block, userAddress);
                    if (activity) contractActivities.push(activity);
                  }
                }
              }
            } catch (e) {
              console.warn(`Error querying ReaderLicenseAMM events:`, e);
            }
            break;

          case 'LeaderboardV4':
            try {
              const events = await contract.queryFilter('LeaderboardSnapshotUpdated', fromBlock, 'latest');
              for (const event of events) {
                const eventLog = event as ethers.EventLog;
                if (eventLog.args && eventLog.args[0].toLowerCase() === userAddress.toLowerCase()) {
                  const block = await this.provider.getBlock(eventLog.blockNumber);
                  if (block && block.timestamp >= thirtyDaysAgo) {
                    const activity = this.parseEventToActivity(contractName, eventLog, block, userAddress);
                    if (activity) contractActivities.push(activity);
                  }
                }
              }
            } catch (e) {
              console.warn(`Error querying LeaderboardV4 events:`, e);
            }
            break;

          case 'EmojiToken':
            try {
              const events = await contract.queryFilter('TokensPurchased', fromBlock, 'latest');
              for (const event of events) {
                const eventLog = event as ethers.EventLog;
                if (eventLog.args && eventLog.args[0].toLowerCase() === userAddress.toLowerCase()) {
                  const block = await this.provider.getBlock(eventLog.blockNumber);
                  if (block && block.timestamp >= thirtyDaysAgo) {
                    const activity = this.parseEventToActivity(contractName, eventLog, block, userAddress);
                    if (activity) contractActivities.push(activity);
                  }
                }
              }
            } catch (e) {
              console.warn(`Error querying EmojiToken events:`, e);
            }
            break;

          case 'TippingContract':
            try {
              const flowEvents = await contract.queryFilter('FlowTipSent', fromBlock, 'latest');
              const emojiEvents = await contract.queryFilter('EmojiTipSent', fromBlock, 'latest');
              const allEvents = [...flowEvents, ...emojiEvents];
              
              for (const event of allEvents) {
                const eventLog = event as ethers.EventLog;
                if (eventLog.args && (
                  eventLog.args[0].toLowerCase() === userAddress.toLowerCase() || 
                  eventLog.args[1].toLowerCase() === userAddress.toLowerCase()
                )) {
                  const block = await this.provider.getBlock(eventLog.blockNumber);
                  if (block && block.timestamp >= thirtyDaysAgo) {
                    const activity = this.parseEventToActivity(contractName, eventLog, block, userAddress);
                    if (activity) contractActivities.push(activity);
                  }
                }
              }
            } catch (e) {
              console.warn(`Error querying TippingContract events:`, e);
            }
            break;
        }

        return contractActivities;
      } catch (contractError) {
        console.error(`Error fetching ${contractName} events:`, contractError);
        return [];
      }
    });

    const contractResults = await Promise.all(eventPromises);
    contractResults.forEach(activities => allActivities.push(...activities));

    allActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return allActivities.slice(offset, offset + limit);
  }

  private async resolveToWalletAddress(identifier: string): Promise<string | null> {
    if (identifier.startsWith('0x')) {
      return identifier;
    }

    try {
      const profileId = identifier.split('-')[0];
      
      const profileContract = new ethers.Contract(
        '0x0c4141ec0d87fA1B7820E5AF277024251d392F05',
        ["function ownerOf(uint256 tokenId) external view returns (address)"],
        this.provider
      );
      
      const owner = await profileContract.ownerOf(profileId);
      return owner;
    } catch (error) {
      console.error('Error resolving profile ID to wallet address:', error);
      return null;
    }
  }

  private parseEventToActivity(contractName: string, event: ethers.EventLog, block: ethers.Block, userAddress: string): ActivityItem | null {
    const timestamp = new Date(block.timestamp * 1000).toISOString();
    const baseActivity = {
      id: `${event.transactionHash}-${event.index || 0}`,
      timestamp,
      txHash: event.transactionHash,
      blockNumber: event.blockNumber,
    };

    try {
      switch (contractName) {
        case 'GMAction':
          return {
            ...baseActivity,
            type: 'gm' as const,
            action: 'Said Good Morning',
            details: {
              amount: `Streak: ${event.args[2]?.toString() || '1'}`
            }
          };

        case 'Bookmark':
          const isAdd = event.fragment?.name === 'BookmarkAdded';
          return {
            ...baseActivity,
            type: 'bookmark' as const,
            action: isAdd ? 'Bookmarked Content' : 'Removed Bookmark',
            details: {
              contentType: event.args[2] === 0 ? 'article' : 'proposal'
            }
          };

        case 'CommunityArticles':
          return {
            ...baseActivity,
            type: 'community-article' as const,
            action: 'Published Community Article',
            details: {
              title: event.args[3] || 'Untitled Article'
            }
          };

        case 'PortfolioArticles':
          return {
            ...baseActivity,
            type: 'portfolio-article' as const,
            action: 'Published Portfolio Article',
            details: {
              title: event.args[3] || 'Untitled Article'
            }
          };

        case 'EncryptedArticles':
          if (event.fragment?.name === 'ArticlePublished') {
            return {
              ...baseActivity,
              type: 'native-article' as const,
              action: 'Published Native Article',
              details: {
                title: event.args[2] || 'Untitled Article'
              }
            };
          } else if (event.fragment?.name === 'NFTMinted') {
            return {
              ...baseActivity,
              type: 'license-purchase' as const,
              action: 'Purchased Article License',
              details: {
                amount: `${ethers.formatEther(event.args[4] || 0)} FLOW`
              }
            };
          }
          break;

        case 'ReaderLicenseAMM':
          return {
            ...baseActivity,
            type: 'license-purchase' as const,
            action: 'Purchased Reader License',
            details: {
              amount: `${ethers.formatEther(event.args[3] || 0)} FLOW`
            }
          };

        case 'LeaderboardV4':
          return {
            ...baseActivity,
            type: 'leaderboard' as const,
            action: 'Updated Daily Leaderboard',
            details: {
              amount: '+100 points, +10 EMOJI'
            }
          };

        case 'EmojiToken':
          return {
            ...baseActivity,
            type: 'emoji-purchase' as const,
            action: 'Purchased EMOJI Tokens',
            details: {
              amount: `${ethers.formatEther(event.args[1] || 0)} EMOJI for ${ethers.formatEther(event.args[2] || 0)} FLOW`
            }
          };

        case 'TippingContract':
          const isSender = event.args[0]?.toLowerCase() === userAddress.toLowerCase();
          const isFlowTip = event.fragment?.name === 'FlowTipSent';
          
          return {
            ...baseActivity,
            type: isSender ? 'tip-sent' : 'tip-received' as const,
            action: isSender ? 
              `Sent ${isFlowTip ? 'FLOW' : 'EMOJI'} Tip` : 
              `Received ${isFlowTip ? 'FLOW' : 'EMOJI'} Tip`,
            details: {
              amount: isFlowTip ? 
                `${ethers.formatEther(event.args[3] || 0)} FLOW` :
                `${ethers.formatEther(event.args[3] || 0)} EMOJI`,
              recipient: isSender ? event.args[1] : event.args[0],
              tipType: isFlowTip ? 'FLOW' : 'EMOJI'
            }
          };
      }
    } catch (parseError) {
      console.warn(`Error parsing ${contractName} event:`, parseError);
    }

    return null;
  }
}