// lib/blockchain/contracts/ReaderLicenseAMMService.ts (ENHANCED - NFT + READER LICENSE DETECTION)
import { ethers } from 'ethers';

export interface LicenseInfo {
  articleId: string;
  editionNumber: number;
  totalGenerated: number;
  activeLicenses: number;
  lastRegenerationTime: bigint;
}

export interface AccessInfo {
  expiryTime: bigint;
  hasAccess: boolean;
}

export interface PurchaseRecord {
  timestamp: bigint;
  price: bigint;
  buyer: string;
  seller: string;
}

export interface LicenseStats {
  currentPrice: bigint;
  totalSupply: number;
  activeLicenses: number;
  shouldRegenerate: boolean;
  holders: string[];
  balances: number[];
}

// ✅ ENHANCED: Interface for complete access detection
export interface LicenseAccess {
  hasAccess: boolean;
  accessType: 'nft_owner' | 'reader_license' | 'none';
  tokenId?: string;
  expiryTime?: bigint;
  needsActivation?: boolean;
}

// ✅ NEW: EncryptedArticles contract interface
interface EncryptedArticlesInterface {
  holderNFTCount(articleId: bigint, holder: string): Promise<bigint>;
  tokenToArticle(tokenId: bigint): Promise<bigint>;
  articleNFTHolders(articleId: bigint, index: bigint): Promise<string>;
  articles(articleId: bigint): Promise<any>;
}

// ReaderLicenseAMM contract interface (existing)
interface ReaderLicenseAMMContractInterface {
  getCurrentPrice(articleId: bigint): Promise<bigint>;
  buyLicense(articleId: bigint, seller: string, overrides?: ethers.Overrides): Promise<ethers.ContractTransactionResponse>;
  burnLicenseForAccess(articleId: bigint): Promise<ethers.ContractTransactionResponse>;
  shouldRegenerate(articleId: bigint): Promise<boolean>;
  regenerateLicenses(articleId: bigint): Promise<ethers.ContractTransactionResponse>;
  hasActiveAccess(articleId: bigint, user: string): Promise<boolean>;
  getEncryptedContent(articleId: bigint): Promise<string>;
  getArticleSummary(articleId: bigint): Promise<string>;
  getLicenseHolders(articleId: bigint): Promise<[string[], bigint[]]>;
  getPurchaseHistory(articleId: bigint): Promise<PurchaseRecord[]>;
  licenseInfo(articleId: bigint): Promise<[bigint, bigint, bigint, bigint, bigint]>;
  accessInfo(articleId: bigint, user: string): Promise<[bigint, boolean]>;
  licenseBalances(articleId: bigint, user: string): Promise<bigint>;
  gasPool(): Promise<bigint>;
  balanceOf(user: string): Promise<bigint>;
  tokenOfOwnerByIndex(owner: string, index: bigint): Promise<bigint>;
}

export class ReaderLicenseAMMService {
  private ammContract: ethers.Contract & ReaderLicenseAMMContractInterface;
  private articlesContract: ethers.Contract & EncryptedArticlesInterface;
  private provider: ethers.Provider;

  // ✅ UPDATED: Contract addresses from your deployments
  private static readonly ENCRYPTED_ARTICLES_ADDRESS = '0xd99aB3390aAF8BC69940626cdbbBf22F436c6753';
  private static readonly READER_LICENSE_AMM_ADDRESS = '0x4E0f2A3A8AfEd1f86D83AAB1a989E01c316996d2';

  // ReaderLicenseAMM ABI (existing)
  private static readonly AMM_ABI = [
    "function getCurrentPrice(uint256 _articleId) external view returns (uint256)",
    "function buyLicense(uint256 _articleId, address _seller) external payable",
    "function burnLicenseForAccess(uint256 _articleId) external",
    "function shouldRegenerate(uint256 _articleId) external view returns (bool)",
    "function regenerateLicenses(uint256 _articleId) external",
    "function hasActiveAccess(uint256 _articleId, address _user) external view returns (bool)",
    "function getEncryptedContent(uint256 _articleId) external view returns (string)",
    "function getArticleSummary(uint256 _articleId) external view returns (string)",
    "function getLicenseHolders(uint256 _articleId) external view returns (address[], uint256[])",
    "function getPurchaseHistory(uint256 _articleId) external view returns (tuple(uint256 timestamp, uint256 price, address buyer, address seller)[])",
    "function licenseInfo(uint256) external view returns (uint256 articleId, uint256 editionNumber, uint256 totalGenerated, uint256 activeLicenses, uint256 lastRegenerationTime)",
    "function accessInfo(uint256, address) external view returns (uint256 expiryTime, bool hasAccess)",
    "function licenseBalances(uint256, address) external view returns (uint256)",
    "function gasPool() external view returns (uint256)",
    "function balanceOf(address owner) external view returns (uint256)",
    "function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256)",
    "event LicenseMinted(uint256 indexed articleId, address indexed holder, uint256 count, uint256 editionNumber)",
    "event LicensePurchased(uint256 indexed articleId, address indexed buyer, address indexed seller, uint256 price)",
    "event LicenseBurned(uint256 indexed articleId, address indexed user, uint256 expiryTime)",
    "event LicenseRegenerated(uint256 indexed articleId, uint256 count, uint256 totalActive)",
    "event AccessGranted(uint256 indexed articleId, address indexed user, uint256 expiryTime)"
  ];

  // ✅ NEW: EncryptedArticles ABI for NFT ownership checking
  private static readonly ARTICLES_ABI = [
    "function holderNFTCount(uint256, address) external view returns (uint256)",
    "function tokenToArticle(uint256) external view returns (uint256)",
    "function articleNFTHolders(uint256, uint256) external view returns (address)",
    "function articles(uint256) external view returns (uint256 id, string title, string encryptedContent, string summary, address author, string location, string category, uint256 publishedAt, uint256 nftCount, uint256 nftPrice, uint256 journalistRetained, uint256 readerLicenseRatio, uint8 creationSource, uint256 proposalId)"
  ];

  constructor(contractAddress?: string, provider?: ethers.Provider) {
    // Use provided or default addresses
    const ammAddress = contractAddress || ReaderLicenseAMMService.READER_LICENSE_AMM_ADDRESS;
    
    if (!provider) {
      provider = new ethers.JsonRpcProvider('https://testnet.evm.nodes.onflow.org');
    }
    
    this.provider = provider;
    
    // Initialize both contracts
    this.ammContract = new ethers.Contract(
      ammAddress,
      ReaderLicenseAMMService.AMM_ABI,
      provider
    ) as ethers.Contract & ReaderLicenseAMMContractInterface;

    this.articlesContract = new ethers.Contract(
      ReaderLicenseAMMService.ENCRYPTED_ARTICLES_ADDRESS,
      ReaderLicenseAMMService.ARTICLES_ABI,
      provider
    ) as ethers.Contract & EncryptedArticlesInterface;
  }

  // ✅ NEW: Check NFT ownership for an article
  async checkNFTOwnership(articleId: string | number, userAddress: string): Promise<{
    ownsNFT: boolean;
    nftTokenId?: string;
  }> {
    try {
      console.log('🔍 Checking NFT ownership for article:', articleId, 'user:', userAddress);
      
      const nftCount = await this.articlesContract.holderNFTCount(BigInt(articleId), userAddress);
      const ownsNFT = nftCount > BigInt(0);
      
      console.log('🔍 NFT ownership result:', { ownsNFT, nftCount: nftCount.toString() });
      
      if (ownsNFT) {
        // For now, return a placeholder token ID since we don't need the exact token ID for decryption
        // In the future, we could implement a method to find the specific token ID
        return {
          ownsNFT: true,
          nftTokenId: 'nft_owner' // Placeholder - NFT owners get permanent access
        };
      }
      
      return { ownsNFT: false };
    } catch (error) {
      console.error('❌ Error checking NFT ownership:', error);
      return { ownsNFT: false };
    }
  }

  // ✅ COMPLETELY REWRITTEN: Check access with NFT priority
  async getAccessDetails(articleId: string | number, userAddress: string): Promise<LicenseAccess> {
    try {
      console.log('🔍 Checking access for article:', articleId, 'user:', userAddress);
      
      // Step 1: Check NFT ownership first (highest priority)
      const nftOwnership = await this.checkNFTOwnership(articleId, userAddress);
      
      if (nftOwnership.ownsNFT) {
        console.log('✅ NFT ownership detected - granting immediate access');
        return {
          hasAccess: true,
          accessType: 'nft_owner',
          tokenId: nftOwnership.nftTokenId,
          needsActivation: false
        };
      }
      
      // Step 2: Check reader license access (if no NFT)
      console.log('🔍 No NFT found, checking reader license access...');
      const hasLicenseAccess = await this.hasActiveAccess(articleId, userAddress);
      
      if (hasLicenseAccess) {
        console.log('✅ Active reader license found');
        
        // Get license token ID for decryption
        try {
          const tokenId = await this.getUserLicenseTokenId(userAddress);
          const accessInfo = await this.getAccessInfo(articleId, userAddress);
          
          return {
            hasAccess: true,
            accessType: 'reader_license',
            tokenId,
            expiryTime: accessInfo?.expiryTime,
            needsActivation: false
          };
        } catch (tokenError) {
          console.error('❌ Error getting license token ID:', tokenError);
          return {
            hasAccess: false,
            accessType: 'none'
          };
        }
      }
      
      // Step 3: Check if user has unburned reader licenses that need activation
      console.log('🔍 No active access, checking for unburned reader licenses...');
      const licenseBalance = await this.getLicenseBalance(articleId, userAddress);
      
      if (licenseBalance > 0) {
        console.log('✅ Unburned reader license found - needs activation');
        
        try {
          const tokenId = await this.getUserLicenseTokenId(userAddress);
          return {
            hasAccess: true,
            accessType: 'reader_license',
            tokenId,
            needsActivation: true
          };
        } catch (tokenError) {
          console.error('❌ Error getting license token ID for activation:', tokenError);
        }
      }
      
      // Step 4: No access found
      console.log('❌ No access found');
      return {
        hasAccess: false,
        accessType: 'none'
      };
      
    } catch (error) {
      console.error('❌ Error checking access details:', error);
      return {
        hasAccess: false,
        accessType: 'none'
      };
    }
  }

  // ✅ ALL EXISTING METHODS PRESERVED (getCurrentPrice, buyLicense, etc.)
  async getCurrentPrice(articleId: string | number): Promise<bigint> {
    try {
      return await this.ammContract.getCurrentPrice(BigInt(articleId));
    } catch (error) {
      console.error('Error fetching current price:', error);
      return BigInt(0);
    }
  }

  async buyLicense(
    articleId: string | number,
    seller: string,
    signer: ethers.Signer
  ): Promise<ethers.TransactionResponse> {
    const contractWithSigner = this.ammContract.connect(signer) as ethers.Contract & ReaderLicenseAMMContractInterface;
    const currentPrice = await this.getCurrentPrice(articleId);
    const gasReimbursement = ethers.parseEther('0.005');
    const totalCost = currentPrice + gasReimbursement;
    
    return await contractWithSigner.buyLicense(BigInt(articleId), seller, {
      value: totalCost
    });
  }

  async burnLicenseForAccess(
    articleId: string | number,
    signer: ethers.Signer
  ): Promise<ethers.TransactionResponse> {
    const contractWithSigner = this.ammContract.connect(signer) as ethers.Contract & ReaderLicenseAMMContractInterface;
    return await contractWithSigner.burnLicenseForAccess(BigInt(articleId));
  }

  async shouldRegenerate(articleId: string | number): Promise<boolean> {
    try {
      return await this.ammContract.shouldRegenerate(BigInt(articleId));
    } catch (error) {
      console.error('Error checking regeneration status:', error);
      return false;
    }
  }

  async regenerateLicenses(
    articleId: string | number,
    signer: ethers.Signer
  ): Promise<ethers.TransactionResponse> {
    const contractWithSigner = this.ammContract.connect(signer) as ethers.Contract & ReaderLicenseAMMContractInterface;
    return await contractWithSigner.regenerateLicenses(BigInt(articleId));
  }

  async hasActiveAccess(articleId: string | number, userAddress: string): Promise<boolean> {
    try {
      return await this.ammContract.hasActiveAccess(BigInt(articleId), userAddress);
    } catch (error) {
      console.error('Error checking active access:', error);
      return false;
    }
  }

  async getEncryptedContent(articleId: string | number, signer: ethers.Signer): Promise<string | null> {
    try {
      const contractWithSigner = this.ammContract.connect(signer);
      return await (contractWithSigner as any).getEncryptedContent(BigInt(articleId));
    } catch (error) {
      console.error('Error fetching encrypted content:', error);
      return null;
    }
  }

  async getArticleSummary(articleId: string | number): Promise<string> {
    try {
      return await this.ammContract.getArticleSummary(BigInt(articleId));
    } catch (error) {
      console.error('Error fetching article summary:', error);
      return '';
    }
  }

  async getLicenseHolders(articleId: string | number): Promise<{ holders: string[], balances: number[] }> {
    try {
      const [holders, balances] = await this.ammContract.getLicenseHolders(BigInt(articleId));
      return {
        holders,
        balances: balances.map(balance => Number(balance))
      };
    } catch (error) {
      console.error('Error fetching license holders:', error);
      return { holders: [], balances: [] };
    }
  }

  async getPurchaseHistory(articleId: string | number): Promise<PurchaseRecord[]> {
    try {
      return await this.ammContract.getPurchaseHistory(BigInt(articleId));
    } catch (error) {
      console.error('Error fetching purchase history:', error);
      return [];
    }
  }

  async getLicenseInfo(articleId: string | number): Promise<LicenseInfo | null> {
    try {
      const [articleIdBN, editionNumber, totalGenerated, activeLicenses, lastRegenerationTime] = await this.ammContract.licenseInfo(BigInt(articleId));
      
      return {
        articleId: articleIdBN.toString(),
        editionNumber: Number(editionNumber),
        totalGenerated: Number(totalGenerated),
        activeLicenses: Number(activeLicenses),
        lastRegenerationTime
      };
    } catch (error) {
      console.error('Error fetching license info:', error);
      return null;
    }
  }

  async getAccessInfo(articleId: string | number, userAddress: string): Promise<AccessInfo | null> {
    try {
      const [expiryTime, hasAccess] = await this.ammContract.accessInfo(BigInt(articleId), userAddress);
      return {
        expiryTime,
        hasAccess
      };
    } catch (error) {
      console.error('Error fetching access info:', error);
      return null;
    }
  }

  async getLicenseBalance(articleId: string | number, userAddress: string): Promise<number> {
    try {
      const balance = await this.ammContract.licenseBalances(BigInt(articleId), userAddress);
      return Number(balance);
    } catch (error) {
      console.error('Error fetching license balance:', error);
      return 0;
    }
  }

  async getLicenseStats(articleId: string | number): Promise<LicenseStats> {
    try {
      const [currentPrice, licenseInfo, shouldRegenerate, licenseHolders] = await Promise.all([
        this.getCurrentPrice(articleId),
        this.getLicenseInfo(articleId),
        this.shouldRegenerate(articleId),
        this.getLicenseHolders(articleId)
      ]);

      return {
        currentPrice,
        totalSupply: licenseInfo?.totalGenerated || 0,
        activeLicenses: licenseInfo?.activeLicenses || 0,
        shouldRegenerate,
        holders: licenseHolders.holders,
        balances: licenseHolders.balances
      };
    } catch (error) {
      console.error('Error fetching license stats:', error);
      return {
        currentPrice: BigInt(0),
        totalSupply: 0,
        activeLicenses: 0,
        shouldRegenerate: false,
        holders: [],
        balances: []
      };
    }
  }

  async getGasPool(): Promise<bigint> {
    try {
      return await this.ammContract.gasPool();
    } catch (error) {
      console.error('Error fetching gas pool:', error);
      return BigInt(0);
    }
  }

  async estimateBuyLicenseGas(
    articleId: string | number,
    seller: string,
    signer: ethers.Signer
  ): Promise<bigint> {
    try {
      const contractWithSigner = this.ammContract.connect(signer);
      const currentPrice = await this.getCurrentPrice(articleId);
      const gasReimbursement = ethers.parseEther('0.005');
      const totalCost = currentPrice + gasReimbursement;
      
      const gasEstimate = await (contractWithSigner as any).estimateGas.buyLicense(BigInt(articleId), seller, {
        value: totalCost
      });
      
      return gasEstimate;
    } catch (error) {
      console.error('Error estimating gas for license purchase:', error);
      return BigInt(100000);
    }
  }

  // ✅ EXISTING METHODS FOR READER LICENSES
  async getUserLicenseTokenId(userAddress: string): Promise<string> {
    try {
      const balance = await this.ammContract.balanceOf(userAddress);
      
      if (balance == BigInt(0)) {
        throw new Error('No reader license found');
      }
      
      const tokenId = await this.ammContract.tokenOfOwnerByIndex(userAddress, BigInt(0));
      return tokenId.toString();
    } catch (error) {
      console.error('Error getting license token ID:', error);
      throw new Error('Failed to retrieve license token ID');
    }
  }

  async hasReaderLicense(userAddress: string): Promise<boolean> {
    try {
      const balance = await this.ammContract.balanceOf(userAddress);
      return balance > BigInt(0);
    } catch (error) {
      console.error('Error checking reader license:', error);
      return false;
    }
  }

  // ✅ EVENT LISTENERS (existing)
  onLicensePurchased(callback: (articleId: string, buyer: string, seller: string, price: bigint) => void) {
    this.ammContract.on('LicensePurchased', (articleId, buyer, seller, price) => {
      callback(articleId.toString(), buyer, seller, price);
    });
  }

  onLicenseBurned(callback: (articleId: string, user: string, expiryTime: bigint) => void) {
    this.ammContract.on('LicenseBurned', (articleId, user, expiryTime) => {
      callback(articleId.toString(), user, expiryTime);
    });
  }

  onAccessGranted(callback: (articleId: string, user: string, expiryTime: bigint) => void) {
    this.ammContract.on('AccessGranted', (articleId, user, expiryTime) => {
      callback(articleId.toString(), user, expiryTime);
    });
  }

  onLicenseRegenerated(callback: (articleId: string, count: number, totalActive: number) => void) {
    this.ammContract.on('LicenseRegenerated', (articleId, count, totalActive) => {
      callback(articleId.toString(), Number(count), Number(totalActive));
    });
  }

  removeAllListeners() {
    this.ammContract.removeAllListeners();
  }
}

// Helper function
export function createReaderLicenseAMMService(
  contractAddress?: string,
  provider?: ethers.Provider
): ReaderLicenseAMMService {
  return new ReaderLicenseAMMService(contractAddress, provider);
}

export default ReaderLicenseAMMService;