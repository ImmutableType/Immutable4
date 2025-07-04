// lib/blockchain/contracts/EncryptedArticleReadService.ts
// READ-ONLY: One job - get native articles from contract for feeds
import { ethers } from 'ethers';

const CONTRACT_ADDRESS = '0xd99aB3390aAF8BC69940626cdbbBf22F436c6753';
const RPC_URL = 'https://testnet.evm.nodes.onflow.org';

// Updated ABI with ALL fields from the contract
const FULL_READ_ABI = [
  {
    "inputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "name": "articles",
    "outputs": [
      {"internalType": "uint256", "name": "id", "type": "uint256"},                    // 1
      {"internalType": "string", "name": "title", "type": "string"},                  // 2
      {"internalType": "string", "name": "encryptedContent", "type": "string"},       // 3
      {"internalType": "string", "name": "summary", "type": "string"},                // 4
      {"internalType": "address", "name": "author", "type": "address"},               // 5
      {"internalType": "string", "name": "location", "type": "string"},               // 6
      {"internalType": "string", "name": "category", "type": "string"},               // 7
      {"internalType": "uint256", "name": "publishedAt", "type": "uint256"},          // 8
      {"internalType": "uint256", "name": "nftCount", "type": "uint256"},             // 9
      {"internalType": "uint256", "name": "nftPrice", "type": "uint256"},             // 10 - THIS IS WHAT WE NEED!
      {"internalType": "uint256", "name": "journalistRetained", "type": "uint256"},   // 11
      {"internalType": "uint256", "name": "readerLicenseRatio", "type": "uint256"},   // 12
      {"internalType": "uint8", "name": "creationSource", "type": "uint8"},           // 13
      {"internalType": "uint256", "name": "proposalId", "type": "uint256"}            // 14
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTotalArticles",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
];

export class EncryptedArticleReadService {
  private contract: ethers.Contract;

  constructor() {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    this.contract = new ethers.Contract(CONTRACT_ADDRESS, FULL_READ_ABI, provider);
  }

  async getArticle(articleId: number): Promise<any> {
    const article = await this.contract.articles(articleId);
    // Return a properly formatted object with all fields
    return {
      id: article[0],
      title: article[1],
      encryptedContent: article[2],
      summary: article[3],
      author: article[4],
      location: article[5],
      category: article[6],
      publishedAt: article[7],
      nftCount: article[8],
      nftPrice: ethers.formatEther(article[9]), // Convert to FLOW string
      journalistRetained: article[10],
      readerLicenseRatio: article[11],
      creationSource: article[12],
      proposalId: article[13]
    };
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
}

export default EncryptedArticleReadService;