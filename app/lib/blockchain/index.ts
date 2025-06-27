import { ethers, Contract } from 'ethers';
import contractArtifact from '../../artifacts/contracts/ArticleMinter.sol/ArticleMinter.json';
import { Article, ArticleContractResponse, ArticleInput } from './types';

interface ArticleMinterFunctions {
   publishArticle(contentHash: string, title: string): Promise<ethers.ContractTransaction>;
   publishArticle(contentHash: string, title: string, publisherProfile: string): Promise<ethers.ContractTransaction>;
   getArticle(tokenId: number): Promise<ArticleContractResponse>;
   getContentURI(tokenId: number): Promise<string>;
   getPublisherArticles(publisherProfile: string): Promise<number[]>;
   interface: ethers.Interface;
   runner: { provider: ethers.Provider | null };
}

type ArticleMinterContract = ArticleMinterFunctions & Contract;

export class ArticleContract {
    private contract: ArticleMinterContract;
    
    constructor(
        provider: ethers.BrowserProvider | ethers.JsonRpcProvider,
        contractAddress?: string
    ) {
        if (!provider) {
            throw new Error("Provider required");
        }
        
        // FORCE the new contract address
        const NEW_CONTRACT_ADDRESS = "0x10BEc95F81222Fc32416b87b4e7cA600bd398bab";
        
        // Skip environment variables completely
        const address = NEW_CONTRACT_ADDRESS;
        console.log(`Creating ArticleContract with FIXED address: ${address}`);
        
        this.contract = new Contract(
            address,
            contractArtifact.abi,
            provider
        ) as unknown as ArticleMinterContract;
    }

    async publishArticle(input: ArticleInput): Promise<ethers.ContractTransaction> {
        console.log(`Publishing article to contract: ${await this.contract.getAddress()}`);
        
        if ((input as any).publisherProfile) {
            return await this.contract.publishArticle(
                input.contentHash,
                input.title,
                (input as any).publisherProfile
            );
        } else {
            return await this.contract.publishArticle(
                input.contentHash,
                input.title
            );
        }
    }

    async getArticle(tokenId: number): Promise<Article | null> {
        try {
            const rawData = await this.contract.getArticle(tokenId);
            const [contentHash, title, author, publisherProfile, contractTimestamp] = rawData as any;
            
            let timestamp = Number(contractTimestamp);
            
            // Get the provider from the contract
            const provider = this.contract.runner.provider;
            
            // If timestamp is suspiciously early, try to get real transaction data
            if (timestamp < 1672531200) { // Before Jan 1, 2023
                try {
                    // Get the ArticlePublished event filter
                    const filter = {
                        address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
                        topics: [
                            ethers.id("ArticlePublished(uint256,address,string,string,address,uint256)"),
                            ethers.toBeHex(tokenId, 32) // tokenId as a topic
                        ]
                    };
                    
                    // Query logs directly
                    const logs = await provider!.getLogs({
                        ...filter,
                        fromBlock: 0,
                        toBlock: "latest"
                    });
                    
                    if (logs.length > 0) {
                        // Get the block with the transaction
                        const block = await provider!.getBlock(logs[0].blockNumber);
                        if (block && block.timestamp) {
                            timestamp = Number(block.timestamp);
                            console.log(`Found real timestamp for article ${tokenId}: ${timestamp} (${new Date(timestamp * 1000).toISOString()})`);
                        }
                    } else {
                        console.log(`No logs found for article ${tokenId}`);
                    }
                } catch (error) {
                    console.error(`Error getting real timestamp for article ${tokenId}:`, error);
                }
            }
            
            return {
                id: tokenId.toString(),
                title,
                author,
                publisherProfile: publisherProfile !== ethers.ZeroAddress ? publisherProfile : undefined,
                timestamp: timestamp,
                preview: '',
                contentHash
            } as any;
        } catch (error: any) {
            if (error.message && error.message.includes('Article does not exist')) {
                return null;
            }
            console.error("Error fetching article:", error);
            return null;
        }
    }

    async getPublisherArticles(publisherProfile: string): Promise<number[]> {
        try {
            const tokenIds = await this.contract.getPublisherArticles(publisherProfile);
            return tokenIds.map(id => Number(id));
        } catch (error) {
            console.error("Error fetching publisher articles:", error);
            return [];
        }
    }
}