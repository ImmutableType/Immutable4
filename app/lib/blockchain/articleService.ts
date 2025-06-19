import { ethers } from 'ethers';
import { ArticleContract } from './index';
import { Article } from './types';

export class ArticleService {
    private contract: ArticleContract;

    constructor(
        provider: ethers.BrowserProvider | ethers.JsonRpcProvider,
        contractAddress?: string
    ) {
        this.contract = new ArticleContract(provider, contractAddress);
    }

    async getArticle(tokenId: number): Promise<Article | null> {
        return await this.contract.getArticle(tokenId);
    }

    async publishArticle(input: any): Promise<any> {
        return await this.contract.publishArticle(input);
    }
}