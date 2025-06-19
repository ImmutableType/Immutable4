// lib/blockchain/contracts/EncryptedArticleReadService.ts
// READ-ONLY: One job - get native articles from contract for feeds
import { ethers } from 'ethers';

const CONTRACT_ADDRESS = '0xd99aB3390aAF8BC69940626cdbbBf22F436c6753';
const RPC_URL = 'https://testnet.evm.nodes.onflow.org';

// Minimal ABI - just what we need for reading
const MINIMAL_READ_ABI = [
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
     {"internalType": "uint256", "name": "publishedAt", "type": "uint256"}
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
   this.contract = new ethers.Contract(CONTRACT_ADDRESS, MINIMAL_READ_ABI, provider);
 }

 async getArticle(articleId: number): Promise<any> {
   return await this.contract.articles(articleId);
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