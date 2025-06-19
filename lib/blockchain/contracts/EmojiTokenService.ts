// lib/blockchain/contracts/EmojiTokenService.ts
import { ethers } from 'ethers';

const EMOJI_TOKEN_ADDRESS = '0x572F036576D1D9F41876e714D47f69CEa6933c36';
const EMOJI_TOKEN_ABI = [
  'function purchase() external payable',
  'function balanceOf(address owner) external view returns (uint256)',
  'function totalSupply() external view returns (uint256)',
  'function PRICE() external view returns (uint256)',
  'function MAX_PURCHASE_PERCENTAGE() external view returns (uint256)',
  'function symbol() external view returns (string)',
  'function name() external view returns (string)',
  'function decimals() external view returns (uint8)',
  'event TokensPurchased(address indexed buyer, uint256 amount, uint256 flowPaid)'
];

export interface PurchaseResult {
  success: boolean;
  transactionHash?: string;
  emojiAmount?: number;
  flowPaid?: string;
  error?: string;
}

export interface PurchaseEstimate {
  emojiAmount: number;
  flowCost: string;
  maxPurchaseAmount: number;
  withinLimits: boolean;
}

export class EmojiTokenService {
  private contract: ethers.Contract | null = null;
  private provider: ethers.BrowserProvider | null = null;

  async initialize(): Promise<void> {
    if (typeof window !== 'undefined' && window.ethereum) {
      this.provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await this.provider.getSigner();
      this.contract = new ethers.Contract(EMOJI_TOKEN_ADDRESS, EMOJI_TOKEN_ABI, signer);
    }
  }

  async getBalance(address: string): Promise<string> {
    if (!this.contract) await this.initialize();
    if (!this.contract) throw new Error('Contract not initialized');

    const balance = await this.contract.balanceOf(address);
    return ethers.formatEther(balance);
  }

  async getTokenPrice(): Promise<string> {
    if (!this.contract) await this.initialize();
    if (!this.contract) throw new Error('Contract not initialized');

    const price = await this.contract.PRICE();
    return ethers.formatEther(price);
  }

  calculateEmojiAmount(flowAmount: string): number {
    // Each token costs 0.01 FLOW
    const flowValue = parseFloat(flowAmount);
    return flowValue / 0.01;
  }

  calculateFlowCost(emojiAmount: number): string {
    // Each token costs 0.01 FLOW
    const cost = emojiAmount * 0.01;
    return cost < 1 ? "< 1" : cost.toFixed(0);
  }

  async getMaxPurchaseAmount(): Promise<number> {
    if (!this.contract) await this.initialize();
    if (!this.contract) throw new Error('Contract not initialized');

    const totalSupply = await this.contract.totalSupply();
    const maxPercentage = await this.contract.MAX_PURCHASE_PERCENTAGE();
    
    const totalSupplyFormatted = parseFloat(ethers.formatEther(totalSupply));
    const maxPurchase = (totalSupplyFormatted * parseInt(maxPercentage.toString())) / 100;
    
    return Math.floor(maxPurchase);
  }

  async estimatePurchase(emojiAmount: number): Promise<PurchaseEstimate> {
    const flowCost = this.calculateFlowCost(emojiAmount);
    const maxPurchaseAmount = await this.getMaxPurchaseAmount();
    
    return {
      emojiAmount,
      flowCost,
      maxPurchaseAmount,
      withinLimits: emojiAmount <= maxPurchaseAmount
    };
  }




  async purchaseTokens(emojiAmount: number): Promise<PurchaseResult> {
    try {
      if (!this.contract) await this.initialize();
      if (!this.contract) throw new Error('Contract not initialized');
  
      const estimate = await this.estimatePurchase(emojiAmount);
      
      if (!estimate.withinLimits) {
        return {
          success: false,
          error: `Amount exceeds maximum purchase limit of ${estimate.maxPurchaseAmount} EMOJI`
        };
      }
  
      // FIX: Calculate correct FLOW amount for the EMOJI tokens wanted
      const flowCost = emojiAmount * 0.01; // Each EMOJI costs 0.01 FLOW
      const flowValue = ethers.parseEther(flowCost.toString()); // ✅ Direct calculation
      
      console.log(`Purchasing ${emojiAmount} EMOJI for ${flowCost} FLOW`);
      
      const tx = await this.contract.purchase({
        value: flowValue
      });
  
      const receipt = await tx.wait();
      
      return {
        success: true,
        transactionHash: receipt.hash,
        emojiAmount: emojiAmount, // Use the intended amount
        flowPaid: flowCost.toString()
      };
  
    } catch (error: any) {
      console.error('Purchase failed:', error);
      return {
        success: false,
        error: error.message || 'Purchase failed'
      };
    }
  }





  async purchaseWithFlow(flowAmount: string): Promise<PurchaseResult> {
    const emojiAmount = this.calculateEmojiAmount(flowAmount);
    return this.purchaseTokens(emojiAmount);
  }

  // Preset purchase amounts
  getPresetAmounts(): Array<{emoji: number, flow: string}> {
    return [
      { emoji: 1000, flow: this.calculateFlowCost(1000) },
      { emoji: 500, flow: this.calculateFlowCost(500) },
      { emoji: 100, flow: this.calculateFlowCost(100) },
      { emoji: 10, flow: this.calculateFlowCost(10) },
      { emoji: 1, flow: this.calculateFlowCost(1) }
    ];
  }
}

// Singleton instance
export const emojiTokenService = new EmojiTokenService();