// lib/blockchain/contracts/PublisherCredentials.ts
import { ethers } from 'ethers';

// Contract address and ABI based on the provided contract
const PUBLISHER_CREDENTIALS_ADDRESS = '0x8b351Bc93799898a201E796405dBC30Aad49Ee21';

const PUBLISHER_CREDENTIALS_ABI = [
  // View functions
  "function name() external view returns (string)",
  "function symbol() external view returns (string)",
  "function balanceOf(address owner) external view returns (uint256)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function getCredential(uint256 tokenId) external view returns (address journalist, string memory name, string[] memory geographicRights, string[] memory subjectRights, uint256 issuedAt, bool isActive)",
  "function hasValidCredential(address journalist) external view returns (bool)",
  "function journalistToTokenId(address journalist) external view returns (uint256)",
  "function totalSupply() external view returns (uint256)",
  
  // Events
  "event CredentialIssued(uint256 indexed tokenId, address indexed journalist, string name)",
  "event CredentialRevoked(uint256 indexed tokenId, address indexed journalist)"
];

export interface PublisherCredential {
  tokenId: number;
  journalist: string;
  name: string;
  geographicRights: string[];
  subjectRights: string[];
  issuedAt: string;
  isActive: boolean;
}

export class PublisherCredentialsService {
  private contract: ethers.Contract;
  private provider: ethers.Provider;
  
  constructor(provider: ethers.Provider, signer?: ethers.Signer) {
    this.provider = provider;
    this.contract = new ethers.Contract(
      PUBLISHER_CREDENTIALS_ADDRESS,
      PUBLISHER_CREDENTIALS_ABI,
      signer || provider
    );
  }
  
  // Get credential by token ID
  async getCredential(tokenId: number): Promise<PublisherCredential | null> {
    try {
      const credential = await this.contract.getCredential(tokenId);
      
      return {
        tokenId,
        journalist: credential.journalist,
        name: credential.name,
        geographicRights: credential.geographicRights,
        subjectRights: credential.subjectRights,
        issuedAt: new Date(Number(credential.issuedAt) * 1000).toISOString(),
        isActive: credential.isActive
      };
    } catch (error) {
      console.error('Error fetching publisher credential:', error);
      return null;
    }
  }
  
  // Get credential by journalist address
  async getCredentialByAddress(address: string): Promise<PublisherCredential | null> {
    try {
      const hasCredential = await this.contract.hasValidCredential(address);
      if (!hasCredential) return null;
      
      const tokenId = await this.contract.journalistToTokenId(address);
      if (tokenId === 0) return null;
      
      return await this.getCredential(Number(tokenId));
    } catch (error) {
      console.error('Error fetching credential by address:', error);
      return null;
    }
  }
  
  // Check if address has valid credential
  async hasValidCredential(address: string): Promise<boolean> {
    try {
      return await this.contract.hasValidCredential(address);
    } catch (error) {
      console.error('Error checking credential validity:', error);
      return false;
    }
  }
  
  // Get contract info
  async getContractInfo() {
    const [name, symbol, totalSupply] = await Promise.all([
      this.contract.name(),
      this.contract.symbol(),
      this.contract.totalSupply()
    ]);
    
    return {
      name,
      symbol,
      totalSupply: Number(totalSupply)
    };
  }
}