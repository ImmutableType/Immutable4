// lib/blockchain/contracts/GMAction.ts
import { ethers } from 'ethers';
import deploymentInfo from '@/deployments/GMActionV2.json';

// ABI for the GM Action contract
// Use ABI from deployment file
// ABI for the GM Action contract
const GM_ACTION_ABI = [
    "function sayGM() external",
    "function hasUserSaidGMToday(address user) external view returns (bool)",
    "function getUserStats(address user) external view returns (uint256 total, uint256 streak, bool saidToday)",
    "function getTodaysGMCount() external view returns (uint256)",
    "function totalGMs(address user) external view returns (uint256)",
    "function currentStreak(address user) external view returns (uint256)",
    "function getCurrentDay() public view returns (uint256)",
    "event GMSaid(address indexed user, uint256 indexed day, uint256 streak)"
  ];

export interface GMStats {
  total: number;
  streak: number;
  saidToday: boolean;
}

export class GMActionService {
  private contract: ethers.Contract;
  private provider: ethers.Provider;
  
  constructor(provider: ethers.Provider, signer?: ethers.Signer) {
    this.provider = provider;
    this.contract = new ethers.Contract(
      deploymentInfo.address,
      GM_ACTION_ABI,
      signer || provider
    );
  }
  
  // Say GM
  async sayGM(): Promise<{ txHash: string }> {
    try {
      const tx = await this.contract.sayGM();
      const receipt = await tx.wait();
      return { txHash: receipt.hash };
    } catch (error: any) {
      if (error.message?.includes('Already said GM today')) {
        throw new Error('You have already said GM today!');
      }
      if (error.message?.includes('Must have a profile')) {
        throw new Error('You must have a profile to say GM');
      }
      throw error;
    }
  }
  
  // Check if user has said GM today
  async hasUserSaidGMToday(address: string): Promise<boolean> {
    return await this.contract.hasUserSaidGMToday(address);
  }
  
  // Get user stats
  async getUserStats(address: string): Promise<GMStats> {
    const stats = await this.contract.getUserStats(address);
    return {
      total: Number(stats.total),
      streak: Number(stats.streak),
      saidToday: stats.saidToday
    };
  }
  
  // Get today's GM count
  async getTodaysGMCount(): Promise<number> {
    const count = await this.contract.getTodaysGMCount();
    return Number(count);
  }
  
  // Get total GMs for a user
  async getTotalGMs(address: string): Promise<number> {
    const total = await this.contract.totalGMs(address);
    return Number(total);
  }
  
  // Listen for GM events
  onGMSaid(callback: (user: string, day: number, streak: number) => void) {
    this.contract.on('GMSaid', (user, day, streak) => {
      callback(user, Number(day), Number(streak));
    });
  }
  
  // Remove event listeners
  removeAllListeners() {
    this.contract.removeAllListeners();
  }
}