// lib/blockchain/contracts/MembershipTokens.ts
import { ethers } from 'ethers';

// Contract address and ABI based on the provided contract
const MEMBERSHIP_TOKEN_ADDRESS = '0xC90bE82B23Dca9453445b69fB22D5A90402654b2';

const MEMBERSHIP_TOKEN_ABI = [
  // View functions
  "function name() external view returns (string)",
  "function symbol() external view returns (string)",
  "function balanceOf(address owner) external view returns (uint256)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function tokenURI(uint256 tokenId) external view returns (string)",
  "function isTokenMinted(uint256 tokenId) external view returns (bool)",
  "function getMember(uint256 tokenId) external view returns (address owner, string memory name, uint256 mintedAt, bool isActive)",
  "function getAvailableTokens() external view returns (uint256[] memory)",
  "function totalMinted() external view returns (uint256)",
  "function MAX_TOKEN_ID() external view returns (uint256)",
  
  // Events
  "event TokenMinted(uint256 indexed tokenId, address indexed owner, string name)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"
];

export interface MembershipToken {
  tokenId: number;
  owner: string;
  name: string;
  mintedAt: string;
  isActive: boolean;
  tokenURI: string;
  svgImage?: string;
}

export class MembershipTokensService {
  private contract: ethers.Contract;
  private provider: ethers.Provider;
  
  constructor(provider: ethers.Provider, signer?: ethers.Signer) {
    this.provider = provider;
    this.contract = new ethers.Contract(
      MEMBERSHIP_TOKEN_ADDRESS,
      MEMBERSHIP_TOKEN_ABI,
      signer || provider
    );
  }
  
  // Get token info by ID
  async getToken(tokenId: number): Promise<MembershipToken | null> {
    try {
      const [member, tokenURI, isActive] = await Promise.all([
        this.contract.getMember(tokenId),
        this.contract.tokenURI(tokenId),
        this.contract.isTokenMinted(tokenId)
      ]);
      
      if (!isActive) return null;
      
      // Parse SVG from tokenURI
      let svgImage: string | undefined;
      try {
        if (tokenURI.startsWith('data:application/json;base64,')) {
          const base64Data = tokenURI.replace('data:application/json;base64,', '');
          const jsonString = atob(base64Data);
          const metadata = JSON.parse(jsonString);
          svgImage = metadata.image;
        }
      } catch (e) {
        console.warn('Could not parse token metadata:', e);
      }
      
      return {
        tokenId,
        owner: member.owner,
        name: member.name,
        mintedAt: new Date(Number(member.mintedAt) * 1000).toISOString(),
        isActive: member.isActive,
        tokenURI,
        svgImage
      };
    } catch (error) {
      console.error('Error fetching membership token:', error);
      return null;
    }
  }
  
  // Get tokens owned by address
  async getTokensByOwner(address: string): Promise<MembershipToken[]> {
    try {
      const balance = await this.contract.balanceOf(address);
      const tokens: MembershipToken[] = [];
      
      if (balance > BigInt(0)) {
        // Check tokens 0-99 to find which ones this wallet owns
        const promises: Promise<MembershipToken | null>[] = [];
        for (let i = 0; i <= 99; i++) {
          promises.push(this.checkTokenOwnership(i, address));
        }
        
        const results = await Promise.all(promises);
        tokens.push(...results.filter((token): token is MembershipToken => token !== null));
      }
      
      return tokens;
    } catch (error) {
      console.error('Error fetching tokens by owner:', error);
      return [];
    }
  }
  
  private async checkTokenOwnership(tokenId: number, address: string): Promise<MembershipToken | null> {
    try {
      const [exists, owner] = await Promise.all([
        this.contract.isTokenMinted(tokenId),
        this.contract.ownerOf(tokenId).catch(() => null)
      ]);
      
      if (exists && owner && owner.toLowerCase() === address.toLowerCase()) {
        return await this.getToken(tokenId);
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }
  
  // Get contract info
  async getContractInfo() {
    const [name, symbol, totalMinted, maxTokenId] = await Promise.all([
      this.contract.name(),
      this.contract.symbol(),
      this.contract.totalMinted(),
      this.contract.MAX_TOKEN_ID()
    ]);
    
    return {
      name,
      symbol,
      totalMinted: Number(totalMinted),
      maxTokenId: Number(maxTokenId)
    };
  }
}