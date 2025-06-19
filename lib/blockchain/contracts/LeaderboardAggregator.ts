// lib/blockchain/contracts/LeaderboardAggregator.ts
import { ethers } from 'ethers';
import deploymentInfo from '@/deployments/LeaderboardAggregator.json';

// Updated ABI for the optimized LeaderboardAggregator contract
const LEADERBOARD_AGGREGATOR_ABI = [
  // Constants
  "function UPDATE_REWARD_POINTS() external view returns (uint256)",
  "function UPDATE_REWARD_EMOJI() external view returns (uint256)",
  "function MAX_LEADERBOARD_SIZE() external view returns (uint256)",
  "function MAX_CANDIDATES_PER_UPDATE() external view returns (uint256)",
  "function BASE_SCORE() external view returns (uint256)",
  "function POINTS_PER_ARTICLE() external view returns (uint256)",
  "function POINTS_PER_PROPOSAL() external view returns (uint256)",
  "function POINTS_PER_FUNDED_PROPOSAL() external view returns (uint256)",
  "function POINTS_PER_TIP_GIVEN() external view returns (uint256)",
  "function POINTS_PER_GM() external view returns (uint256)",
  "function STREAK_BONUS() external view returns (uint256)",
  "function STREAK_THRESHOLD() external view returns (uint256)",
  
  // State variables
  "function lastUpdateDay() external view returns (uint256)",
  "function lastUpdateTime() external view returns (uint256)",
  "function lastProcessedProfile() external view returns (uint256)",
  "function updaterRewards(address user) external view returns (uint256)",
  "function profileToLeaderboardIndex(uint256 profileId) external view returns (uint256)",
  "function isInLeaderboard(uint256 profileId) external view returns (bool)",
  "function leaderboard(uint256 index) external view returns (uint256 profileId, uint256 score, address owner, uint256 lastUpdated)",
  
  // Contract addresses
  "function profileNFT() external view returns (address)",
  "function gmAction() external view returns (address)",
  "function membershipToken() external view returns (address)",
  "function publisherToken() external view returns (address)",
  "function emojiToken() external view returns (address)",
  "function articlesContract() external view returns (address)",
  "function proposalsContract() external view returns (address)",
  "function tipsContract() external view returns (address)",
  "function owner() external view returns (address)",
  
  // Main functions
  "function updateLeaderboard() external",
  "function calculateScore(uint256 profileId, address profileOwner) external view returns (uint256)",
  "function getLeaderboard() external view returns (tuple(uint256 profileId, uint256 score, address owner, uint256 lastUpdated)[])",
  "function canUpdate() external view returns (bool)",
  "function getTimeUntilNextUpdate() external view returns (uint256)",
  "function getProfileRank(uint256 profileId) external view returns (uint256 rank, uint256 score)",
  "function getUpdateInfo() external view returns (bool canUpdateNow, uint256 timeUntilUpdate, uint256 lastUpdate)",
  "function getCurrentDay() external view returns (uint256)",
  "function forceUpdateDay() external",
  
  // Placeholder functions
  "function getArticleCount(address user) external view returns (uint256)",
  "function getProposalCount(address user) external view returns (uint256)",
  "function getFundedProposalCount(address user) external view returns (uint256)",
  "function getTipsGivenCount(address user) external view returns (uint256)",
  
  // Owner functions
  "function setArticlesContract(address _contract) external",
  "function setProposalsContract(address _contract) external",
  "function setTipsContract(address _contract) external",
  
  // Events
  "event LeaderboardUpdated(address indexed updater, uint256 timestamp)",
  "event ScoreCalculated(uint256 indexed profileId, uint256 score)",
  "event RewardClaimed(address indexed user, uint256 points, uint256 emoji)",
  "event ContractSet(string contractType, address contractAddress)"
];

export interface LeaderboardEntry {
  profileId: number;
  score: number;
  owner: string;
  lastUpdated: Date;
}

export interface UpdateInfo {
  canUpdate: boolean;
  timeUntilUpdate: number;
  lastUpdateTime: Date;
}

export interface ProfileRank {
  rank: number;
  score: number;
  isInLeaderboard: boolean;
}

export interface ScoringConstants {
  baseScore: number;
  pointsPerGM: number;
  pointsPerArticle: number;
  pointsPerProposal: number;
  pointsPerFundedProposal: number;
  pointsPerTipGiven: number;
  streakBonus: number;
  streakThreshold: number;
  updateRewardPoints: number;
  updateRewardEmoji: string;
  maxLeaderboardSize: number;
  maxCandidatesPerUpdate: number;
}

export interface UserCounts {
  articles: number;
  proposals: number;
  fundedProposals: number;
  tipsGiven: number;
}

export class LeaderboardAggregatorService {
  private contract: ethers.Contract;
  private provider: ethers.Provider;
  
  constructor(provider: ethers.Provider, signer?: ethers.Signer) {
    this.provider = provider;
    console.log('LeaderboardAggregator deployment info:', deploymentInfo);
    console.log('LeaderboardAggregator using address:', deploymentInfo.address);
    this.contract = new ethers.Contract(
      deploymentInfo.address,
      LEADERBOARD_AGGREGATOR_ABI,
      signer || provider
    );
  }
  
  // Get the full leaderboard
  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    try {
      const leaderboardData = await this.contract.getLeaderboard();
      
      return leaderboardData
        .filter((entry: any) => entry.profileId > 0) // Filter out empty entries
        .map((entry: any) => ({
          profileId: Number(entry.profileId),
          score: Number(entry.score),
          owner: entry.owner,
          lastUpdated: new Date(Number(entry.lastUpdated) * 1000)
        }));
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }
  }
  
  // Get a specific profile's rank and score
  async getProfileRank(profileId: number): Promise<ProfileRank> {
    try {
      const [rank, score] = await this.contract.getProfileRank(profileId);
      
      return {
        rank: Number(rank),
        score: Number(score),
        isInLeaderboard: rank > 0
      };
    } catch (error) {
      console.error('Error fetching profile rank:', error);
      return { rank: 0, score: 0, isInLeaderboard: false };
    }
  }
  
  // Calculate score for a profile (view function, doesn't update)
  async calculateScore(profileId: number, profileOwner: string): Promise<number> {
    try {
      const score = await this.contract.calculateScore(profileId, profileOwner);
      return Number(score);
    } catch (error) {
      console.error('Error calculating score:', error);
      return 0;
    }
  }
  
  // Check if leaderboard can be updated (improved method)
  async getUpdateInfo(): Promise<UpdateInfo> {
    try {
      const [canUpdateNow, timeUntilUpdate, lastUpdate] = await this.contract.getUpdateInfo();
      
      return {
        canUpdate: canUpdateNow,
        timeUntilUpdate: Number(timeUntilUpdate),
        lastUpdateTime: new Date(Number(lastUpdate) * 1000)
      };
    } catch (error) {
      console.error('Error fetching update info:', error);
      // Fallback to individual calls
      try {
        const [canUpdate, timeUntilUpdate, lastUpdateTime] = await Promise.all([
          this.contract.canUpdate(),
          this.contract.getTimeUntilNextUpdate(),
          this.contract.lastUpdateTime()
        ]);
        
        return {
          canUpdate,
          timeUntilUpdate: Number(timeUntilUpdate),
          lastUpdateTime: new Date(Number(lastUpdateTime) * 1000)
        };
      } catch (fallbackError) {
        console.error('Error in fallback update info:', fallbackError);
        return {
          canUpdate: false,
          timeUntilUpdate: 3600, // Default 1 hour
          lastUpdateTime: new Date()
        };
      }
    }
  }
  
  // Update the leaderboard
  async updateLeaderboard(): Promise<{ txHash: string }> {
    try {
      // Set higher gas limit for the optimized contract
      const tx = await this.contract.updateLeaderboard({
        gasLimit: 500000 // 500k should be enough for 20-25 profiles
      });
      const receipt = await tx.wait();
      return { txHash: receipt.hash };
    } catch (error: any) {
      console.error('Update leaderboard error:', error);
      
      // Enhanced error handling
      if (error.message?.includes('Already updated today')) {
        throw new Error('Leaderboard has already been updated today');
      }
      if (error.message?.includes('Must hold membership or publisher token')) {
        throw new Error('You must hold a membership or publisher token to update the leaderboard');
      }
      if (error.message?.includes('insufficient funds')) {
        throw new Error('Insufficient FLOW tokens to pay for gas');
      }
      if (error.message?.includes('user rejected')) {
        throw new Error('Transaction was cancelled');
      }
      
      // Generic error
      throw new Error(`Failed to update leaderboard: ${error.message || 'Unknown error'}`);
    }
  }
  
  // Get updater rewards for an address
  async getUpdaterRewards(address: string): Promise<number> {
    try {
      const rewards = await this.contract.updaterRewards(address);
      return Number(rewards);
    } catch (error) {
      console.error('Error fetching updater rewards:', error);
      return 0;
    }
  }
  
  // Get current blockchain day
  async getCurrentDay(): Promise<number> {
    try {
      const currentDay = await this.contract.getCurrentDay();
      return Number(currentDay);
    } catch (error) {
      console.error('Error fetching current day:', error);
      return Math.floor(Date.now() / (1000 * 60 * 60 * 24));
    }
  }
  
  // Get last update day
  async getLastUpdateDay(): Promise<number> {
    try {
      const lastDay = await this.contract.lastUpdateDay();
      return Number(lastDay);
    } catch (error) {
      console.error('Error fetching last update day:', error);
      return 0;
    }
  }
  
  // Get scoring constants
  async getScoringConstants(): Promise<ScoringConstants> {
    try {
      const [
        baseScore,
        pointsPerGM,
        pointsPerArticle,
        pointsPerProposal,
        pointsPerFundedProposal,
        pointsPerTipGiven,
        streakBonus,
        streakThreshold,
        updateRewardPoints,
        updateRewardEmoji,
        maxLeaderboardSize,
        maxCandidatesPerUpdate
      ] = await Promise.all([
        this.contract.BASE_SCORE(),
        this.contract.POINTS_PER_GM(),
        this.contract.POINTS_PER_ARTICLE(),
        this.contract.POINTS_PER_PROPOSAL(),
        this.contract.POINTS_PER_FUNDED_PROPOSAL(),
        this.contract.POINTS_PER_TIP_GIVEN(),
        this.contract.STREAK_BONUS(),
        this.contract.STREAK_THRESHOLD(),
        this.contract.UPDATE_REWARD_POINTS(),
        this.contract.UPDATE_REWARD_EMOJI(),
        this.contract.MAX_LEADERBOARD_SIZE(),
        this.contract.MAX_CANDIDATES_PER_UPDATE()
      ]);
      
      return {
        baseScore: Number(baseScore),
        pointsPerGM: Number(pointsPerGM),
        pointsPerArticle: Number(pointsPerArticle),
        pointsPerProposal: Number(pointsPerProposal),
        pointsPerFundedProposal: Number(pointsPerFundedProposal),
        pointsPerTipGiven: Number(pointsPerTipGiven),
        streakBonus: Number(streakBonus),
        streakThreshold: Number(streakThreshold),
        updateRewardPoints: Number(updateRewardPoints),
        updateRewardEmoji: ethers.formatEther(updateRewardEmoji),
        maxLeaderboardSize: Number(maxLeaderboardSize),
        maxCandidatesPerUpdate: Number(maxCandidatesPerUpdate)
      };
    } catch (error) {
      console.error('Error fetching scoring constants:', error);
      // Return defaults
      return {
        baseScore: 10,
        pointsPerGM: 10,
        pointsPerArticle: 30,
        pointsPerProposal: 20,
        pointsPerFundedProposal: 20,
        pointsPerTipGiven: 20,
        streakBonus: 50,
        streakThreshold: 7,
        updateRewardPoints: 100,
        updateRewardEmoji: '10.0',
        maxLeaderboardSize: 20,
        maxCandidatesPerUpdate: 25
      };
    }
  }
  
  // Get counts for a user (placeholder functions for now)
  async getUserCounts(address: string): Promise<UserCounts> {
    try {
      const [articles, proposals, fundedProposals, tipsGiven] = await Promise.all([
        this.contract.getArticleCount(address),
        this.contract.getProposalCount(address),
        this.contract.getFundedProposalCount(address),
        this.contract.getTipsGivenCount(address)
      ]);
      
      return {
        articles: Number(articles),
        proposals: Number(proposals),
        fundedProposals: Number(fundedProposals),
        tipsGiven: Number(tipsGiven)
      };
    } catch (error) {
      console.error('Error fetching user counts:', error);
      return {
        articles: 0,
        proposals: 0,
        fundedProposals: 0,
        tipsGiven: 0
      };
    }
  }
  
  // Format time until update for display
  formatTimeUntilUpdate(seconds: number): string {
    if (seconds <= 0) return 'Update available!';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `Next update in ${hours}h ${minutes}m`;
    }
    return `Next update in ${minutes}m`;
  }
  
  // Check if user can update (has required tokens)
  async canUserUpdate(userAddress: string): Promise<boolean> {
    try {
      const [membershipBalance, publisherBalance] = await Promise.all([
        this.contract.membershipToken().then((addr: string) => {
          const membershipContract = new ethers.Contract(addr, [
            "function balanceOf(address owner) external view returns (uint256)"
          ], this.provider);
          return membershipContract.balanceOf(userAddress);
        }),
        this.contract.publisherToken().then((addr: string) => {
          const publisherContract = new ethers.Contract(addr, [
            "function balanceOf(address owner) external view returns (uint256)"
          ], this.provider);
          return publisherContract.balanceOf(userAddress);
        })
      ]);
      
      return Number(membershipBalance) > 0 || Number(publisherBalance) > 0;
    } catch (error) {
      console.error('Error checking user update eligibility:', error);
      return false;
    }
  }
  
  // Listen for leaderboard updates
  onLeaderboardUpdated(callback: (updater: string, timestamp: Date) => void) {
    this.contract.on('LeaderboardUpdated', (updater, timestamp) => {
      callback(updater, new Date(Number(timestamp) * 1000));
    });
  }
  
  // Listen for reward claims
  onRewardClaimed(callback: (user: string, points: number, emoji: string) => void) {
    this.contract.on('RewardClaimed', (user, points, emoji) => {
      callback(user, Number(points), ethers.formatEther(emoji));
    });
  }
  
  // Remove all listeners
  removeAllListeners() {
    this.contract.removeAllListeners();
  }
  
  // Force update day (owner only - for testing)
  async forceUpdateDay(): Promise<{ txHash: string }> {
    try {
      const tx = await this.contract.forceUpdateDay();
      const receipt = await tx.wait();
      return { txHash: receipt.hash };
    } catch (error: any) {
      throw new Error(`Failed to force update day: ${error.message || 'Unknown error'}`);
    }
  }
}