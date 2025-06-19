// lib/blockchain/contracts/EmojiToken.ts
import { ethers } from 'ethers';
import deploymentInfo from '@/deployments/EmojiToken.json';

// ABI for the EmojiToken contract
const EMOJI_TOKEN_ABI = [
  // View functions
  "function name() external view returns (string)",
  "function symbol() external view returns (string)",
  "function decimals() external view returns (uint8)",
  "function totalSupply() external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  
  // Constants
  "function MAX_SUPPLY() external view returns (uint256)",
  "function FOUNDER_ALLOCATION() external view returns (uint256)",
  "function PUBLIC_SALE_ALLOCATION() external view returns (uint256)",
  "function REWARDS_ALLOCATION() external view returns (uint256)",
  "function RESERVE_ALLOCATION() external view returns (uint256)",
  "function FIRST_PROFILES_ALLOCATION() external view returns (uint256)",
  "function FIRST_PROFILES_BONUS() external view returns (uint256)",
  "function MAX_PROFILE_BONUSES() external view returns (uint256)",
  "function PRICE() external view returns (uint256)",
  "function MAX_PURCHASE_PERCENTAGE() external view returns (uint256)",
  
  // State variables
  "function totalMinted() external view returns (uint256)",
  "function publicSaleMinted() external view returns (uint256)",
  "function rewardsMinted() external view returns (uint256)",
  "function reserveMinted() external view returns (uint256)",
  "function profileBonusesIssued() external view returns (uint256)",
  "function treasury() external view returns (address)",
  "function profileNFT() external view returns (address)",
  "function profileBonusClaimed(uint256 profileId) external view returns (bool)",
  
  // Write functions
  "function claimProfileBonus(uint256 profileId) external",
  "function purchase() external payable",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) external returns (bool)",
  "function burn(uint256 amount) external",
  "function burnFrom(address account, uint256 amount) external",
  
  // View functions
  "function getRemainingAllocation(string memory allocationType) external view returns (uint256)",
  
  // Events
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
  "event TokensPurchased(address indexed buyer, uint256 amount, uint256 flowPaid)",
  "event TokensBurnedForEngagement(address indexed user, uint256 amount, string action)",
  "event ProfileBonusClaimed(uint256 indexed profileId, address indexed owner, uint256 amount)"
];

export interface TokenInfo {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  balance: string;
}

export interface AllocationInfo {
  publicSaleRemaining: string;
  rewardsRemaining: string;
  reserveRemaining: string;
  profileBonusesRemaining: string;
}

export class EmojiTokenService {
  private contract: ethers.Contract;
  private provider: ethers.Provider;
  
  constructor(provider: ethers.Provider, signer?: ethers.Signer) {
    this.provider = provider;
    this.contract = new ethers.Contract(
      deploymentInfo.address,
      EMOJI_TOKEN_ABI,
      signer || provider
    );
  }
  
  // Get token info
  async getTokenInfo(address: string): Promise<TokenInfo> {
    const [name, symbol, decimals, totalSupply, balance] = await Promise.all([
      this.contract.name(),
      this.contract.symbol(),
      this.contract.decimals(),
      this.contract.totalSupply(),
      this.contract.balanceOf(address)
    ]);
    
    return {
      name,
      symbol,
      decimals: Number(decimals),
      totalSupply: ethers.formatEther(totalSupply),
      balance: ethers.formatEther(balance)
    };
  }
  
  // Get balance for an address
  async getBalance(address: string): Promise<string> {
    const balance = await this.contract.balanceOf(address);
    return ethers.formatEther(balance);
  }
  
  // Get raw balance in wei
  async getBalanceWei(address: string): Promise<bigint> {
    return await this.contract.balanceOf(address);
  }
  
  // Check if profile bonus has been claimed
  async isProfileBonusClaimed(profileId: number): Promise<boolean> {
    return await this.contract.profileBonusClaimed(profileId);
  }
  
  // Check if profile is eligible for bonus
  async isProfileEligibleForBonus(profileId: number): Promise<boolean> {
    if (profileId <= 0 || profileId > 100) return false;
    const claimed = await this.contract.profileBonusClaimed(profileId);
    return !claimed;
  }
  
  // Claim profile bonus
  async claimProfileBonus(profileId: number): Promise<{ txHash: string }> {
    try {
      const tx = await this.contract.claimProfileBonus(profileId);
      const receipt = await tx.wait();
      return { txHash: receipt.hash };
    } catch (error: any) {
      if (error.message?.includes('Not eligible')) {
        throw new Error('This profile is not eligible for the bonus');
      }
      if (error.message?.includes('Already claimed')) {
        throw new Error('Bonus has already been claimed for this profile');
      }
      if (error.message?.includes('Not profile owner')) {
        throw new Error('You must be the owner of this profile to claim the bonus');
      }
      throw error;
    }
  }
  
  // Purchase tokens
  async purchase(flowAmount: string): Promise<{ txHash: string; tokensReceived: string }> {
    try {
      const tx = await this.contract.purchase({
        value: ethers.parseEther(flowAmount)
      });
      const receipt = await tx.wait();
      
      // Calculate tokens received (1 FLOW = 100 EMOJI)
      const tokensReceived = (parseFloat(flowAmount) * 100).toString();
      
      return { 
        txHash: receipt.hash,
        tokensReceived
      };
    } catch (error: any) {
      if (error.message?.includes('Exceeds max purchase limit')) {
        throw new Error('Purchase amount exceeds maximum allowed (10% of circulating supply)');
      }
      if (error.message?.includes('Exceeds public sale allocation')) {
        throw new Error('Not enough tokens remaining in public sale');
      }
      throw error;
    }
  }
  
  // Get remaining allocations
  async getRemainingAllocations(): Promise<AllocationInfo> {
    const [publicSale, rewards, reserve, profiles] = await Promise.all([
      this.contract.getRemainingAllocation('public'),
      this.contract.getRemainingAllocation('rewards'),
      this.contract.getRemainingAllocation('reserve'),
      this.contract.getRemainingAllocation('profiles')
    ]);
    
    return {
      publicSaleRemaining: ethers.formatEther(publicSale),
      rewardsRemaining: ethers.formatEther(rewards),
      reserveRemaining: ethers.formatEther(reserve),
      profileBonusesRemaining: ethers.formatEther(profiles)
    };
  }
  
  // Get constants
  async getConstants() {
    const [price, firstProfileBonus, maxProfiles] = await Promise.all([
      this.contract.PRICE(),
      this.contract.FIRST_PROFILES_BONUS(),
      this.contract.MAX_PROFILE_BONUSES()
    ]);
    
    return {
      pricePerToken: ethers.formatEther(price),
      firstProfileBonus: ethers.formatEther(firstProfileBonus),
      maxEligibleProfiles: Number(maxProfiles)
    };
  }
  
  // Approve spending
  async approve(spender: string, amount: string): Promise<{ txHash: string }> {
    const tx = await this.contract.approve(spender, ethers.parseEther(amount));
    const receipt = await tx.wait();
    return { txHash: receipt.hash };
  }
  
  // Transfer tokens
  async transfer(to: string, amount: string): Promise<{ txHash: string }> {
    const tx = await this.contract.transfer(to, ethers.parseEther(amount));
    const receipt = await tx.wait();
    return { txHash: receipt.hash };
  }
  
  // Burn tokens
  async burn(amount: string): Promise<{ txHash: string }> {
    const tx = await this.contract.burn(ethers.parseEther(amount));
    const receipt = await tx.wait();
    return { txHash: receipt.hash };
  }
  
  // Listen for transfer events
  onTransfer(callback: (from: string, to: string, value: string) => void) {
    this.contract.on('Transfer', (from, to, value) => {
      callback(from, to, ethers.formatEther(value));
    });
  }
  
  // Listen for profile bonus claimed events
  onProfileBonusClaimed(callback: (profileId: number, owner: string, amount: string) => void) {
    this.contract.on('ProfileBonusClaimed', (profileId, owner, amount) => {
      callback(Number(profileId), owner, ethers.formatEther(amount));
    });
  }
  
  // Remove all listeners
  removeAllListeners() {
    this.contract.removeAllListeners();
  }
}