// lib/blockchain/contracts/ProposalManager.ts
import { ethers } from 'ethers';

// ABI - Include only the functions we need
const PROPOSAL_MANAGER_ABI = [
  // Read functions
  "function getProposal(uint256 _proposalId) external view returns (tuple(uint256 id, address proposer, string title, string tldr, string description, string category, string location, string[] referenceUrls, string timeline, string contentFormat, string journalistRequirements, string[] tags, uint256 fundingGoal, uint256 nftCount, uint256 nftPrice, uint256 createdAt, uint8 status))",
  "function getProposalReferenceUrls(uint256 _proposalId) external view returns (string[])",
  "function getProposalTags(uint256 _proposalId) external view returns (string[])",
  "function getTotalProposals() external view returns (uint256)",
  "function getProposalsByProposer(address _proposer) external view returns (uint256[])",
  "function PROPOSAL_FEE() external view returns (uint256)",
  
  // Write functions
  "function createProposal(string _title, string _tldr, string _description, string _category, string _location, string[] _referenceUrls, string _timeline, string _contentFormat, string _journalistRequirements, string[] _tags, uint256 _fundingGoal, uint256 _nftCount, uint256 _nftPrice) external payable returns (uint256)",
  
  // Events
  "event ProposalCreated(uint256 indexed proposalId, address indexed proposer, string title, string location, uint256 fundingGoal)"
];

export enum ProposalStatus {
  ACTIVE = 0,
  FUNDED = 1,
  ASSIGNED = 2,
  PUBLISHED = 3,
  CANCELLED = 4
}

export interface ProposalData {
  id: string;
  proposer: string;
  title: string;
  tldr: string;
  description: string;
  category: string;
  location: string;
  referenceUrls: string[];
  timeline: string;
  contentFormat: string;
  journalistRequirements: string;
  tags: string[];
  fundingGoal: string;
  nftCount: number;
  nftPrice: string;
  createdAt: number;
  status: ProposalStatus;
}

export interface CreateProposalParams {
  title: string;
  tldr: string;
  description: string;
  category: string;
  location: string;
  referenceUrls: string[];
  timeline: string;
  contentFormat: string;
  journalistRequirements: string;
  tags: string[];
  fundingGoal: number;
  nftCount: number;
  nftPrice: number;
}

export class ProposalManager {
  private contract: ethers.Contract;
  private contractAddress: string;

  constructor(contractAddress: string, signerOrProvider: ethers.Signer | ethers.Provider) {
    this.contractAddress = contractAddress;
    this.contract = new ethers.Contract(contractAddress, PROPOSAL_MANAGER_ABI, signerOrProvider);
  }

  // Read functions
  async getProposal(proposalId: string): Promise<ProposalData | null> {
    try {
      const proposal = await this.contract.getProposal(proposalId);
      
      return {
        id: proposal.id.toString(),
        proposer: proposal.proposer,
        title: proposal.title,
        tldr: proposal.tldr,
        description: proposal.description,
        category: proposal.category,
        location: proposal.location,
        referenceUrls: proposal.referenceUrls,
        timeline: proposal.timeline,
        contentFormat: proposal.contentFormat,
        journalistRequirements: proposal.journalistRequirements,
        tags: proposal.tags,
        fundingGoal: ethers.formatEther(proposal.fundingGoal),
        nftCount: Number(proposal.nftCount),
        nftPrice: ethers.formatEther(proposal.nftPrice),
        createdAt: Number(proposal.createdAt),
        status: proposal.status as ProposalStatus
      };
    } catch (error) {
      console.error('Error fetching proposal:', error);
      return null;
    }
  }

  async getTotalProposals(): Promise<number> {
    try {
      const total = await this.contract.getTotalProposals();
      return Number(total);
    } catch (error) {
      console.error('Error fetching total proposals:', error);
      return 0;
    }
  }

  async getProposalsByProposer(proposerAddress: string): Promise<string[]> {
    try {
      const proposalIds = await this.contract.getProposalsByProposer(proposerAddress);
      return proposalIds.map((id: bigint) => id.toString());
    } catch (error) {
      console.error('Error fetching proposals by proposer:', error);
      return [];
    }
  }

  async getProposalFee(): Promise<string> {
    try {
      const fee = await this.contract.PROPOSAL_FEE();
      return ethers.formatEther(fee);
    } catch (error) {
      console.error('Error fetching proposal fee:', error);
      return '1'; // Default to 1 FLOW
    }
  }

  // Write functions
  async createProposal(params: CreateProposalParams, signer: ethers.Signer): Promise<ethers.TransactionResponse> {
    const contractWithSigner = this.contract.connect(signer) as ethers.Contract;
    
    // Convert funding goal and NFT price to wei
    const fundingGoalWei = ethers.parseEther(params.fundingGoal.toString());
    const nftPriceWei = ethers.parseEther(params.nftPrice.toString());
    
    // Get the proposal fee
    const proposalFee = await this.contract.PROPOSAL_FEE();
    
    return contractWithSigner.createProposal(
      params.title,
      params.tldr,
      params.description,
      params.category,
      params.location,
      params.referenceUrls,
      params.timeline,
      params.contentFormat,
      params.journalistRequirements,
      params.tags,
      fundingGoalWei,
      params.nftCount,
      nftPriceWei,
      { value: proposalFee }
    );
  }

  // Wait for proposal creation and get ID from event
  async waitForProposalCreation(txHash: string): Promise<string | null> {
    try {
      // Get the signer or provider from the contract
      const signerOrProvider = this.contract.runner;
      if (!signerOrProvider) {
        throw new Error('No signer or provider available');
      }

      // Get the provider - either from signer or directly
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
            
            if (parsedLog && parsedLog.name === 'ProposalCreated') {
              return parsedLog.args[0].toString(); // proposalId
            }
          } catch (e) {
            // Not the event we're looking for
            continue;
          }
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error waiting for proposal creation:', error);
      return null;
    }
  }

  // Utility functions
  getContractAddress(): string {
    return this.contractAddress;
  }

  getStatusString(status: ProposalStatus): string {
    const statusStrings = {
      [ProposalStatus.ACTIVE]: 'Active',
      [ProposalStatus.FUNDED]: 'Funded',
      [ProposalStatus.ASSIGNED]: 'Assigned',
      [ProposalStatus.PUBLISHED]: 'Published',
      [ProposalStatus.CANCELLED]: 'Cancelled'
    };
    return statusStrings[status] || 'Unknown';
  }
}