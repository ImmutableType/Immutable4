// lib/blockchain/contracts/ProposalEscrow.ts
import { ethers } from 'ethers';

// ABI - Include only the functions we need
const PROPOSAL_ESCROW_ABI = [
  // Read functions
  "function getFundingInfo(uint256 proposalId) external view returns (uint256 totalFunded, uint256 nftsSold, bool fundingComplete, uint256 fundingCompletedAt)",
  "function getContribution(uint256 proposalId, address contributor) external view returns (uint256)",
  "function getClaimTokenId(uint256 proposalId, address contributor) external view returns (uint256)",
  "function fundingInitialized(uint256 proposalId) external view returns (bool)",
  "function WITHDRAWAL_PENALTY_PERCENT() external view returns (uint256)",
  "function OVERSUBSCRIPTION_PERCENT() external view returns (uint256)",
  "function GRACE_PERIOD() external view returns (uint256)",
  "function NFT_PER_WALLET_LIMIT() external view returns (uint256)",
  
  // Write functions
  "function initializeFunding(uint256 proposalId) external",
  "function contributeFunding(uint256 proposalId, uint256 nftQuantity) external payable",
  "function withdrawFunding(uint256 proposalId) external",
  "function finalizeFunding(uint256 proposalId) external",
  
  // Events
  "event FundingInitialized(uint256 indexed proposalId, uint256 fundingGoal, uint256 nftCount)",
  "event FundingContributed(uint256 indexed proposalId, address indexed contributor, uint256 nftQuantity, uint256 amount)",
  "event FundingCompleted(uint256 indexed proposalId, uint256 totalFunded, uint256 nftsSold)",
  "event FundingWithdrawn(uint256 indexed proposalId, address indexed contributor, uint256 refundAmount, uint256 penalty)",
  "event FundingFinalized(uint256 indexed proposalId, address indexed proposer, uint256 amount)"
];

export interface FundingInfo {
  totalFunded: string; // In FLOW
  nftsSold: number;
  fundingComplete: boolean;
  fundingCompletedAt: number; // Timestamp
}

export interface ContributeFundingParams {
  proposalId: string;
  nftQuantity: number;
  nftPrice: string; // In FLOW
}

export class ProposalEscrow {
  private contract: ethers.Contract;
  private contractAddress: string;

  constructor(contractAddress: string, signerOrProvider: ethers.Signer | ethers.Provider) {
    this.contractAddress = contractAddress;
    this.contract = new ethers.Contract(contractAddress, PROPOSAL_ESCROW_ABI, signerOrProvider);
  }

  // Read functions
  async getFundingInfo(proposalId: string): Promise<FundingInfo | null> {
    try {
      const result = await this.contract.getFundingInfo(proposalId);
      return {
        totalFunded: ethers.formatEther(result.totalFunded),
        nftsSold: Number(result.nftsSold),
        fundingComplete: result.fundingComplete,
        fundingCompletedAt: Number(result.fundingCompletedAt)
      };
    } catch (error) {
      console.error('Error fetching funding info:', error);
      return null;
    }
  }

  async getContribution(proposalId: string, contributor: string): Promise<number> {
    try {
      const contribution = await this.contract.getContribution(proposalId, contributor);
      return Number(contribution);
    } catch (error) {
      console.error('Error fetching contribution:', error);
      return 0;
    }
  }

  async getClaimTokenId(proposalId: string, contributor: string): Promise<number | null> {
    try {
      const tokenId = await this.contract.getClaimTokenId(proposalId, contributor);
      return Number(tokenId);
    } catch (error) {
      console.error('Error fetching claim token ID:', error);
      return null;
    }
  }

  async isFundingInitialized(proposalId: string): Promise<boolean> {
    try {
      return await this.contract.fundingInitialized(proposalId);
    } catch (error) {
      console.error('Error checking funding initialization:', error);
      return false;
    }
  }

  // Write functions
  async initializeFunding(proposalId: string, signer: ethers.Signer): Promise<ethers.TransactionResponse> {
    const contractWithSigner = this.contract.connect(signer) as ethers.Contract;
    return contractWithSigner.initializeFunding(proposalId);
  }

  async contributeFunding(
    params: ContributeFundingParams, 
    signer: ethers.Signer
  ): Promise<ethers.TransactionResponse> {
    const contractWithSigner = this.contract.connect(signer) as ethers.Contract;
    
    // Calculate total cost in wei
    const totalCost = ethers.parseEther((Number(params.nftPrice) * params.nftQuantity).toString());
    
    return contractWithSigner.contributeFunding(
      params.proposalId,
      params.nftQuantity,
      { value: totalCost }
    );
  }

  async withdrawFunding(proposalId: string, signer: ethers.Signer): Promise<ethers.TransactionResponse> {
    const contractWithSigner = this.contract.connect(signer) as ethers.Contract;
    return contractWithSigner.withdrawFunding(proposalId);
  }

  async finalizeFunding(proposalId: string, signer: ethers.Signer): Promise<ethers.TransactionResponse> {
    const contractWithSigner = this.contract.connect(signer) as ethers.Contract;
    return contractWithSigner.finalizeFunding(proposalId);
  }

  // Wait for funding contribution and get event data
  async waitForFundingContribution(txHash: string): Promise<{
    proposalId: string;
    contributor: string;
    nftQuantity: number;
    amount: string;
  } | null> {
    try {
      const signerOrProvider = this.contract.runner;
      if (!signerOrProvider) {
        throw new Error('No signer or provider available');
      }

      let provider: ethers.Provider;
      if ('provider' in signerOrProvider && signerOrProvider.provider) {
        provider = signerOrProvider.provider;
      } else if ('waitForTransaction' in signerOrProvider) {
        provider = signerOrProvider as ethers.Provider;
      } else {
        throw new Error('Unable to get provider');
      }
      
      const receipt = await provider.waitForTransaction(txHash);
      
      if (receipt && receipt.logs) {
        for (const log of receipt.logs) {
          try {
            const parsedLog = this.contract.interface.parseLog({
              topics: log.topics as string[],
              data: log.data
            });
            
            if (parsedLog && parsedLog.name === 'FundingContributed') {
              return {
                proposalId: parsedLog.args[0].toString(),
                contributor: parsedLog.args[1],
                nftQuantity: Number(parsedLog.args[2]),
                amount: ethers.formatEther(parsedLog.args[3])
              };
            }
          } catch (e) {
            continue;
          }
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error waiting for funding contribution:', error);
      return null;
    }
  }

  // Utility functions
  getContractAddress(): string {
    return this.contractAddress;
  }
}