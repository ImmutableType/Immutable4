// services/contract/publisherService.ts
import { ethers } from 'ethers';
import { ArticleContract } from './index';
import { Article, Publisher, ProfileData, SocialLink } from './types';
import { PublisherProfileService } from './publisherProfileService';
import { PublisherRegistryService } from './publisherRegistryService';

export class PublisherService {
    private articleContract: ArticleContract;
    private profileService: PublisherProfileService;
    private registryService: PublisherRegistryService;
    private provider: ethers.BrowserProvider | ethers.JsonRpcProvider;
    
    // Fallback to hardcoded data during transition
    private mockPublishers: Record<string, Publisher> = {
        'damon': {
            address: '0x9402F9f20b4a27b55B1cC6cf015D98f764814fb2',
            profileAddress: '0x9402F9f20b4a27b55B1cC6cf015D98f764814fb2',
            username: 'damonp',
            name: 'Damon Peters',
            bio: 'Founder of ImmutableType',
            profileImage: '/profiles/damon.jpg',
            verified: true,
            socialLinks: [
                { platform: 'twitter', url: 'https://x.com/Damon_Peters' },
                { platform: 'website', url: 'https://immutabletype.com' }
            ],
            createdAt: Date.now(),
            lastUpdated: Date.now()
        }
    };

    constructor(
        provider: ethers.BrowserProvider | ethers.JsonRpcProvider,
        registryAddress?: string
    ) {
        this.provider = provider;
        this.articleContract = new ArticleContract(provider);
        this.profileService = new PublisherProfileService(provider);
        
        if (registryAddress) {
            this.registryService = new PublisherRegistryService(provider, registryAddress);
        }
    }

    // Set registry address after construction if needed
    setRegistryAddress(registryAddress: string): void {
        this.registryService = new PublisherRegistryService(this.provider, registryAddress);
    }

    // Fetch publisher profile by address - first try blockchain, then fallback
    async getPublisherByAddress(address: string): Promise<Publisher | null> {
        // If registry is available, try to get the profile
        if (this.registryService) {
            try {
                // First get username from profile address
                const username = await this.registryService.getPublisherUsername(address);
                
                if (username) {
                    // Connect to the profile contract
                    this.profileService.connectToContract(address);
                    const profileData = await this.profileService.getProfile();
                    
                    if (profileData) {
                        // Parse social links
                        let socialLinks: SocialLink[] = [];
                        try {
                            socialLinks = JSON.parse(profileData.socialLinks);
                        } catch {
                            // If parsing fails, leave as empty array
                        }
                        
                        return {
                            address: '', // Unknown from profile
                            profileAddress: address,
                            username: profileData.username,
                            name: profileData.username, // Use username as name if not specified
                            bio: profileData.bio,
                            profileImage: profileData.avatarHash ? `https://magenta-magic-haddock-509.mypinata.cloud/ipfs/${profileData.avatarHash}` : '/profiles/default.jpg',
                            verified: true,
                            socialLinks,
                            createdAt: profileData.createdAt,
                            lastUpdated: profileData.lastUpdated
                        };
                    }
                }
            } catch (error) {
                console.error("Error fetching publisher from blockchain:", error);
            }
        }

        // Fallback to mock data during transition
        return this.mockPublishers[address] || null;
    }

    // Fetch publisher profile by username
    async getPublisherByUsername(username: string): Promise<Publisher | null> {
        // If registry is available, try to get the profile
        if (this.registryService) {
            try {
                const profileAddress = await this.registryService.getPublisherProfile(username);
                
                if (profileAddress) {
                    return this.getPublisherByAddress(profileAddress);
                }
            } catch (error) {
                console.error("Error fetching publisher by username:", error);
            }
        }

        // Fallback to mock data during transition
        return this.mockPublishers[username] || null;
    }

    // Get all articles by a specific publisher
    async getArticlesByPublisher(publisherAddress: string): Promise<Article[]> {
        try {
            // Get token IDs for this publisher
            const tokenIds = await this.articleContract.getPublisherArticles(publisherAddress);
            
            // Fetch each article
            const articles: Article[] = [];
            for (const tokenId of tokenIds) {
                const article = await this.articleContract.getArticle(tokenId);
                if (article) {
                    articles.push(article);
                }
            }
            
            return articles;
        } catch (error) {
            console.error("Error fetching publisher articles:", error);
            return [];
        }
    }
    
    // Create a new publisher profile
    async createPublisherProfile(
        signer: ethers.Signer,
        username: string,
        bio: string
    ): Promise<string | null> {
        try {
            // Deploy the profile contract
            const profileAddress = await this.profileService.deployNewProfile(
                signer,
                username,
                bio
            );
            
            // Register in the registry
            if (this.registryService) {
                await this.registryService.registerPublisher(
                    username,
                    profileAddress,
                    signer
                );
            }
            
            return profileAddress;
        } catch (error) {
            console.error("Error creating publisher profile:", error);
            return null;
        }
    }
}