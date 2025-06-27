// lib/blockchain/contracts/TippingContract.ts
import { ethers } from 'ethers';
import deploymentInfo from '@/deployments/TippingContract.json';

// ABI for the TippingContract
const TIPPING_CONTRACT_ABI = [
  // View functions
  "function getMinimumTipAmount() external pure returns (uint256)",
  "function getPlatformFeePercentage() external pure returns (uint256)",
  "function getTreasuryAddress() external view returns (address)",
  "function getProfileNFTAddress() external view returns (address)",
  "function getEmojiTokenAddress() external view returns (address)",
  
  // Tip functions
  "function tipProfileWithFlow(uint256 profileId) external payable",
  "function tipAddressWithFlow(address recipient) external payable",
  "function tipPlatformWithFlow() external payable",
  "function tipProfileWithEmoji(uint256 profileId, uint256 amount) external",
  "function tipAddressWithEmoji(address recipient, uint256 amount) external",
  "function tipPlatformWithEmoji(uint256 amount) external",
  
  // View tip data
  "function getProfileTipStats(uint256 profileId) external view returns (uint256 totalFlowReceived, uint256 totalEmojiReceived, uint256 tipCount)",
  "function getAddressTipStats(address user) external view returns (uint256 totalFlowGiven, uint256 totalEmojiGiven, uint256 totalFlowReceived, uint256 totalEmojiReceived, uint256 tipsGivenCount, uint256 tipsReceivedCount)",
  "function getTotalTipValue(address user) external view returns (uint256)",
  "function getTipsGivenValue(address user) external view returns (uint256)",
  "function getTipsReceivedValue(address user) external view returns (uint256)",
  
  // Events
  "event FlowTipSent(address indexed from, address indexed to, uint256 indexed profileId, uint256 amount, uint256 fee, uint256 emojiRewards, bool isPlatform)",
  "event EmojiTipSent(address indexed from, address indexed to, uint256 indexed profileId, uint256 amount, bool isPlatform)",
  "event EmojiRewardsMinted(address indexed recipient, uint256 amount)"
];

export interface TipStats {
  totalFlowGiven: string;
  totalEmojiGiven: string;
  totalFlowReceived: string;
  totalEmojiReceived: string;
  tipsGivenCount: number;
  tipsReceivedCount: number;
}

export interface ProfileTipStats {
  totalFlowReceived: string;
  totalEmojiReceived: string;
  tipCount: number;
}

export interface TipTransaction {
  txHash: string;
  blockNumber?: number;
  timestamp?: number;
}

export class TippingContractService {
  private contract: ethers.Contract;
  private provider: ethers.Provider;
  
  constructor(provider: ethers.Provider, signer?: ethers.Signer) {
    this.provider = provider;
    
    // Check if contract is deployed
    if (!deploymentInfo.address) {
      throw new Error('TippingContract not deployed. Please deploy the contract first.');
    }
    
    this.contract = new ethers.Contract(
      deploymentInfo.address,
      TIPPING_CONTRACT_ABI,
      signer || provider
    );
  }
  
  // Get contract constants
  async getMinimumTipAmount(): Promise<string> {
    const amount = await this.contract.getMinimumTipAmount();
    return ethers.formatEther(amount);
  }
  
  async getPlatformFeePercentage(): Promise<number> {
    const fee = await this.contract.getPlatformFeePercentage();
    return Number(fee);
  }
  
  // FLOW tipping functions
  async tipProfileWithFlow(
    flowAmount: number,
signer: ethers.Signer,
profileId?: string,
recipient?: string
  ): Promise<TipTransaction> {
    const contractWithSigner = this.contract.connect(signer);
    const amount = ethers.parseEther(flowAmount.toString());
    
    // Calculate total cost (tip + fee)
    const fee = Math.max(1, flowAmount * 0.019); // 1.9% minimum 1 FLOW
    const totalCost = ethers.parseEther((flowAmount + fee).toString());
    
    let tx: ethers.ContractTransactionResponse;
    
    if (profileId) {
      // Tip to profile
      tx = await (contractWithSigner as any).tipProfileWithFlow(profileId, {
        value: totalCost
      });
    } else if (false) {
      // Tip to address
      tx = await (contractWithSigner as any).tipAddressWithFlow(recipient, {
        value: totalCost
      });
    } else {
      // Platform tip
      tx = await (contractWithSigner as any).tipPlatformWithFlow({
        value: amount // No fee for platform tips
      });
    }
    
    const receipt = await tx.wait();
    
    return {
      txHash: receipt!.hash,
      blockNumber: receipt!.blockNumber,
      timestamp: Date.now()
    };
  }
  
  // EMOJI tipping functions
  async tipProfileWithEmoji(
    emojiAmount: number,
signer: ethers.Signer,
profileId?: string,
recipient?: string
  ): Promise<TipTransaction> {
    const contractWithSigner = this.contract.connect(signer);
    const amount = ethers.parseEther(emojiAmount.toString());
    
    let tx: ethers.ContractTransactionResponse;
    
    if (profileId) {
      // Tip to profile
      tx = await (contractWithSigner as any).tipProfileWithEmoji(profileId, amount);
    } else if (false) {
      // Tip to address
      tx = await (contractWithSigner as any).tipAddressWithEmoji(recipient, amount);
    } else {
      // Platform tip
      tx = await (contractWithSigner as any).tipPlatformWithEmoji(amount);
    }
    
    const receipt = await tx.wait();
    
    return {
      txHash: receipt!.hash,
      blockNumber: receipt!.blockNumber,
      timestamp: Date.now()
    };
  }
  
  // Get tip statistics
  async getAddressTipStats(address: string): Promise<TipStats> {
    const stats = await this.contract.getAddressTipStats(address);
    
    return {
      totalFlowGiven: ethers.formatEther(stats.totalFlowGiven),
      totalEmojiGiven: ethers.formatEther(stats.totalEmojiGiven),
      totalFlowReceived: ethers.formatEther(stats.totalFlowReceived),
      totalEmojiReceived: ethers.formatEther(stats.totalEmojiReceived),
      tipsGivenCount: Number(stats.tipsGivenCount),
      tipsReceivedCount: Number(stats.tipsReceivedCount)
    };
  }
  
  async getProfileTipStats(profileId: string): Promise<ProfileTipStats> {
    const stats = await this.contract.getProfileTipStats(profileId);
    
    return {
      totalFlowReceived: ethers.formatEther(stats.totalFlowReceived),
      totalEmojiReceived: ethers.formatEther(stats.totalEmojiReceived),
      tipCount: Number(stats.tipCount)
    };
  }
  
  // Get tip values for leaderboard scoring
  async getTotalTipValue(address: string): Promise<string> {
    const value = await this.contract.getTotalTipValue(address);
    return ethers.formatEther(value);
  }
  
  async getTipsGivenValue(address: string): Promise<string> {
    const value = await this.contract.getTipsGivenValue(address);
    return ethers.formatEther(value);
  }
  
  async getTipsReceivedValue(address: string): Promise<string> {
    const value = await this.contract.getTipsReceivedValue(address);
    return ethers.formatEther(value);
  }
  
  // Event listeners
  onFlowTipSent(callback: (from: string, to: string, profileId: bigint, amount: string, fee: string, emojiRewards: string, isPlatform: boolean) => void) {
    this.contract.on('FlowTipSent', (from, to, profileId, amount, fee, emojiRewards, isPlatform) => {
      callback(
        from,
        to,
        profileId,
        ethers.formatEther(amount),
        ethers.formatEther(fee),
        ethers.formatEther(emojiRewards),
        isPlatform
      );
    });
  }
  
  onEmojiTipSent(callback: (from: string, to: string, profileId: bigint, amount: string, isPlatform: boolean) => void) {
    this.contract.on('EmojiTipSent', (from, to, profileId, amount, isPlatform) => {
      callback(
        from,
        to,
        profileId,
        ethers.formatEther(amount),
        isPlatform
      );
    });
  }
  
  onEmojiRewardsMinted(callback: (recipient: string, amount: string) => void) {
    this.contract.on('EmojiRewardsMinted', (recipient, amount) => {
      callback(recipient, ethers.formatEther(amount));
    });
  }
  
  // Remove all listeners
  removeAllListeners() {
    this.contract.removeAllListeners();
  }
  
  // Helper function to calculate fees
  calculateFlowTipFee(tipAmount: number): number {
    return Math.max(1, tipAmount * 0.019); // 1.9% minimum 1 FLOW
  }
  
  // Helper function to calculate EMOJI rewards
  calculateEmojiRewards(flowAmount: number): number {
    return flowAmount * 10; // 10 EMOJI per 1 FLOW
  }
}