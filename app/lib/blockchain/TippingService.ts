// core/smart-contracts/services/TippingService.ts
import { ethers, Contract } from 'ethers';

// Define the ABI directly instead of importing from a file
const tippingAbi = [
  "function sendTip(address publisher) external payable",
  "function setPlatformFee(uint256 feePercentage) external",
  "event TipSent(address indexed sender, address indexed publisher, uint256 amount, uint256 platformFee)"
];

interface TippingSystemFunctions {
  sendTip(publisherProfile: string): Promise<ethers.ContractTransaction>;
  setPlatformFee(feePercentage: number): Promise<ethers.ContractTransaction>;
}

type TippingSystemContract = TippingSystemFunctions & Contract;

export class TippingService {
  private contract: TippingSystemContract;
  
  constructor(
    provider: ethers.BrowserProvider | ethers.JsonRpcProvider,
    tippingAddress: string
  ) {
    this.contract = new Contract(
      tippingAddress,
      tippingAbi,
      provider
    ) as unknown as TippingSystemContract;
  }
  
  async sendTip(
    publisherProfileAddress: string,
    amount: string, // ETH amount in string format (e.g. "0.01")
    signer: ethers.Signer
  ): Promise<string | null> {
    try {
      const connectedContract = this.contract.connect(signer);
      const tipAmount = ethers.parseEther(amount);
      
      const tx = await (connectedContract as any).sendTip(publisherProfileAddress, {
        value: tipAmount
      });
      
      const receipt = await tx.wait();
      return receipt?.hash || null;
    } catch (error) {
      console.error("Error sending tip:", error);
      return null;
    }
  }
}