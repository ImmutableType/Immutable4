// services/contract/publisherRegistryService.ts
import { ethers, Contract } from 'ethers';
import registryAbi from '../../artifacts/contracts/PublisherRegistry.sol/PublisherRegistry.json';

interface PublisherRegistryFunctions {
    registerPublisher(username: string, profileContract: string): Promise<ethers.ContractTransaction>;
    getPublisherProfile(username: string): Promise<string>;
    getPublisherUsername(profileContract: string): Promise<string>;
    getAllUsernames(): Promise<string[]>;
    getPublisherCount(): Promise<bigint>;
}

type PublisherRegistryContract = PublisherRegistryFunctions & Contract;

export class PublisherRegistryService {
    private contract: PublisherRegistryContract;
    
    constructor(
        provider: ethers.BrowserProvider | ethers.JsonRpcProvider,
        registryAddress: string
    ) {
        this.contract = new Contract(
            registryAddress,
            registryAbi.abi,
            provider
        ) as unknown as PublisherRegistryContract;
    }
    
    async registerPublisher(
        username: string, 
        profileAddress: string,
        signer: ethers.Signer
    ): Promise<boolean> {
        try {
            const connectedContract = this.contract.connect(signer);
            const tx = await connectedContract.registerPublisher(username, profileAddress);
            await tx.wait();
            return true;
        } catch (error) {
            console.error("Error registering publisher:", error);
            return false;
        }
    }
    
    async getPublisherProfile(username: string): Promise<string | null> {
        try {
            const address = await this.contract.getPublisherProfile(username);
            return address !== ethers.ZeroAddress ? address : null;
        } catch (error) {
            console.error("Error getting publisher profile:", error);
            return null;
        }
    }
    
    async getPublisherUsername(profileAddress: string): Promise<string | null> {
        try {
            const username = await this.contract.getPublisherUsername(profileAddress);
            return username !== "" ? username : null;
        } catch (error) {
            console.error("Error getting publisher username:", error);
            return null;
        }
    }
    
    async getAllUsernames(): Promise<string[]> {
        try {
            return await this.contract.getAllUsernames();
        } catch (error) {
            console.error("Error getting all usernames:", error);
            return [];
        }
    }
    
    async getPublisherCount(): Promise<number> {
        try {
            const count = await this.contract.getPublisherCount();
            return Number(count);
        } catch (error) {
            console.error("Error getting publisher count:", error);
            return 0;
        }
    }
}