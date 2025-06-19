// lib/blockchain/contracts/EncryptedArticleService.ts
import { ethers } from 'ethers';
import { 
  EncryptedArticle, 
  EncryptedArticleInput, 
  EncryptedMintingResult,
  ContractInfo,
  UserEncryptedStats 
} from '../../publishing/types/encryptedArticle';

// CORRECT ABI based on the actual contract
const ENCRYPTED_ARTICLE_ABI = [
  {
    "inputs": [
      {"internalType": "string", "name": "_title", "type": "string"},
      {"internalType": "string", "name": "_encryptedContent", "type": "string"},
      {"internalType": "string", "name": "_summary", "type": "string"},
      {"internalType": "string", "name": "_location", "type": "string"},
      {"internalType": "string", "name": "_category", "type": "string"},
      {"internalType": "string[]", "name": "_tags", "type": "string[]"},
      {"internalType": "uint256", "name": "_nftCount", "type": "uint256"},
      {"internalType": "uint256", "name": "_nftPrice", "type": "uint256"},
      {"internalType": "uint256", "name": "_journalistRetained", "type": "uint256"},
      {"internalType": "uint256", "name": "_readerLicenseRatio", "type": "uint256"}
    ],
    "name": "publishArticle",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "PUBLISHING_FEE",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTotalArticles",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "name": "articles",
    "outputs": [
      {"internalType": "uint256", "name": "id", "type": "uint256"},
      {"internalType": "string", "name": "title", "type": "string"},
      {"internalType": "string", "name": "encryptedContent", "type": "string"},
      {"internalType": "string", "name": "summary", "type": "string"},
      {"internalType": "address", "name": "author", "type": "address"},
      {"internalType": "string", "name": "location", "type": "string"},
      {"internalType": "string", "name": "category", "type": "string"},
      {"internalType": "uint256", "name": "publishedAt", "type": "uint256"},
      {"internalType": "uint256", "name": "nftCount", "type": "uint256"},
      {"internalType": "uint256", "name": "nftPrice", "type": "uint256"},
      {"internalType": "uint256", "name": "journalistRetained", "type": "uint256"},
      {"internalType": "uint256", "name": "readerLicenseRatio", "type": "uint256"},
      {"internalType": "uint8", "name": "creationSource", "type": "uint8"},
      {"internalType": "uint256", "name": "proposalId", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

export class EncryptedArticleService {
  private contract: ethers.Contract;
  private provider: ethers.Provider;

  constructor(contractAddress: string, provider: ethers.Provider) {
    this.provider = provider;
    this.contract = new ethers.Contract(contractAddress, ENCRYPTED_ARTICLE_ABI, provider);
  }

  async getArticle(articleId: number): Promise<any> {
    try {
      return await this.contract.articles(articleId);
    } catch (error) {
      console.error(`Error fetching article ${articleId}:`, error);
      return null;
    }
  }

  async getTotalArticles(): Promise<number> {
    try {
      const total = await this.contract.getTotalArticles();
      return Number(total);
    } catch (error) {
      console.error('Error getting total articles:', error);
      return 0;
    }
  }

  async getPublishingFee(): Promise<bigint> {
    try {
      return await this.contract.PUBLISHING_FEE();
    } catch (error) {
      console.log('Using fallback publishing fee of 1 FLOW');
      return ethers.parseEther("1.0");
    }
  }

  async getUserPostingStats(userAddress: string): Promise<UserEncryptedStats> {
    return {
      totalArticles: 0,
      articlesToday: 0,
      remainingToday: 5,
      totalNFTsSold: 0,
      totalLicensesGenerated: 0
    };
  }

  async estimatePublishArticleGas(
    articleData: EncryptedArticleInput,
    signer: ethers.Signer
  ): Promise<bigint> {
    try {
      const contractWithSigner = this.contract.connect(signer);
      const fee = await this.getPublishingFee();
      
      return await (contractWithSigner as any).publishArticle.estimateGas(
        articleData.title,
        articleData.encryptedContent,
        articleData.summary,
        articleData.location,
        articleData.category,
        articleData.tags,
        articleData.nftCount,
        ethers.parseEther(articleData.nftPrice.toString()),
        articleData.journalistRetained,
        articleData.readerLicenseRatio,
        { value: fee }
      );
    } catch (error) {
      console.error('Error estimating gas:', error);
      return BigInt(500000);
    }
  }

  async publishArticle(
    articleData: EncryptedArticleInput,
    signer: ethers.Signer
  ): Promise<ethers.TransactionResponse> {
    const contractWithSigner = this.contract.connect(signer);
    const fee = await this.getPublishingFee();

    return await (contractWithSigner as any).publishArticle(
      articleData.title,
      articleData.encryptedContent,
      articleData.summary,
      articleData.location,
      articleData.category,
      articleData.tags,
      articleData.nftCount,
      ethers.parseEther(articleData.nftPrice.toString()),
      articleData.journalistRetained,
      articleData.readerLicenseRatio,
      { value: fee }
    );
  }

  async waitForArticleCreation(txHash: string): Promise<EncryptedMintingResult> {
    try {
      const receipt = await this.provider.waitForTransaction(txHash);
      
      if (!receipt) {
        throw new Error('Transaction receipt not found');
      }
      
      return {
        success: true,
        articleId: `encrypted_${Date.now()}`,
        txHash: receipt.hash,
        article: {
          id: `encrypted_${Date.now()}`,
          title: 'Article',
          transactionHash: receipt.hash,
          createdAt: new Date().toISOString()
        }
      };
    } catch (error) {
      return {
        success: false,
        articleId: '',
        txHash: '',
        article: {
          id: '',
          title: '',
          transactionHash: '',
          createdAt: ''
        },
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

export function createEncryptedArticleService(
  contractAddress: string,
  provider: ethers.Provider
): EncryptedArticleService {
  return new EncryptedArticleService(contractAddress, provider);
}

export default EncryptedArticleService;