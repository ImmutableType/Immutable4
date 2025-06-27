// services/contract/publisherProfileService.ts
import { ethers, Contract } from 'ethers';
import publisherProfileAbi from '../../artifacts/contracts/PublisherProfile.sol/PublisherProfile.json';
import { ProfileData, SocialLink } from './types';

interface PublisherProfileFunctions {
    getProfile(): Promise<[string, string, string, string, bigint, bigint]>;
    updateProfile(username: string, bio: string, avatarHash: string, socialLinks: string): Promise<ethers.ContractTransaction>;
}

type PublisherProfileContract = PublisherProfileFunctions & Contract;

export class PublisherProfileService {
    private contract: PublisherProfileContract | null = null;
    private provider: ethers.BrowserProvider | ethers.JsonRpcProvider;
    
    constructor(provider: ethers.BrowserProvider | ethers.JsonRpcProvider) {
        this.provider = provider;
    }
    
    connectToContract(contractAddress: string): void {
        this.contract = new Contract(
            contractAddress,
            publisherProfileAbi.abi,
            this.provider
        ) as unknown as PublisherProfileContract;
    }
    
    async deployNewProfile(
        signer: ethers.Signer,
        username: string, 
        bio: string
    ): Promise<string> {
        const factory = new ethers.ContractFactory(
            publisherProfileAbi.abi, 
            publisherProfileAbi.bytecode, 
            signer
        );
        
        const contract = await factory.deploy(
            await signer.getAddress(),
            username,
            bio
        );
        
        await contract.waitForDeployment();
        const address = await contract.getAddress();
        
        this.connectToContract(address);
        return address;
    }
    
    async getProfile(): Promise<ProfileData | null> {
        if (!this.contract) {
            throw new Error("Contract not connected");
        }
        
        try {
            const [username, bio, avatarHash, socialLinksJson, createdAt, lastUpdated] = 
                await this.contract.getProfile();
            
            return {
                username,
                bio,
                avatarHash,
                socialLinks: socialLinksJson as any,
                createdAt: Number(createdAt),
                lastUpdated: Number(lastUpdated)
            } as any;
        } catch (error) {
            console.error("Error fetching profile:", error);
            return null;
        }
    }
    
    async updateProfile(
        profile: { 
            username: string;
            bio: string;
            avatarHash: string;
            socialLinks: SocialLink[];
        },
        signer: ethers.Signer
    ): Promise<boolean> {
        if (!this.contract) {
            throw new Error("Contract not connected");
        }
        
        try {
            const connectedContract = this.contract.connect(signer);
            const socialLinksJson = JSON.stringify(profile.socialLinks);
            
            const tx = await (connectedContract as any).updateProfile(
                profile.username,
                profile.bio,
                profile.avatarHash,
                socialLinksJson
            );
            
            await tx.wait();
            return true;
        } catch (error) {
            console.error("Error updating profile:", error);
            return false;
        }
    }
}