// lib/publishing/types/encryptedArticle.ts

// Profile reference type
interface ProfileReference {
    id: string;
    displayName?: string;
    walletAddress: string;
    avatarUrl?: string;
    isVerified?: boolean;
  }
  
  // Base encrypted article type
  export interface EncryptedArticle {
    id: string;
    title: string;
    encryptedContent: string;    // Full encrypted article content
    summary: string;             // Public teaser/summary
    author: string;              // Wallet address
    location: string;            // Geographic location
    category: string;
    tags: string[];
    publishedAt: string;
    
    // NFT Economics
    nftCount: number;           // Total NFT editions
    nftPrice: number;           // FLOW per NFT
    journalistRetained: number; // NFTs kept by journalist
    readerLicenseRatio: number; // Licenses per NFT (default 10)
    
    // Creation metadata
    creationSource: 'NATIVE' | 'PROPOSAL';
    proposalId: number;         // 0 for native articles
    
    // UI/Display fields
    authorName?: string;        // Display name
    transactionHash?: string;   // Blockchain transaction reference
    fee: number;               // 1 FLOW standard fee
    author_profile?: ProfileReference; // Populated author profile
  }
  
  export interface EncryptedArticleInput {
    title: string;
    encryptedContent: string;
    summary: string;
    location: string;
    category: string;
    tags: string[];
    nftCount: number;
    nftPrice: number;
    journalistRetained: number;
    readerLicenseRatio: number;
  }
  
  export interface NFTEdition {
    tokenId: string;
    articleId: string;
    editionNumber: number;
    owner: string;
    mintedAt: string;
    licensesGenerated: number;
  }
  
  export interface ReaderLicense {
    articleId: string;
    holder: string;
    balance: number;
    hasActiveAccess: boolean;
    accessExpiryTime?: string;
  }
  
  export interface LicenseInfo {
    articleId: string;
    totalGenerated: number;
    activeLicenses: number;
    lastRegenerationTime: string;
    currentPrice: string; // in FLOW
  }
  
  export interface UserEncryptedStats {
    totalArticles: number;
    articlesToday: number;
    remainingToday: number;
    totalNFTsSold: number;
    totalLicensesGenerated: number;
  }
  
  export interface ContractInfo {
    publisherCredentialsContract: string;
    membershipTokensContract: string;
    readerLicenseAMM: string;
    treasury: string;
    publishingFee: bigint;
    totalArticleCount: number;
  }
  
  // Type guard functions
  export function isNativeArticle(article: EncryptedArticle): boolean {
    return article.creationSource === 'NATIVE';
  }
  
  export function isProposalArticle(article: EncryptedArticle): boolean {
    return article.creationSource === 'PROPOSAL';
  }
  
  // Response types
  export interface EncryptedArticlesResponse {
    articles: EncryptedArticle[];
    total: number;
    nextCursor?: string;
  }
  
  export interface EncryptedMintingResult {
    success: boolean;
    articleId: string;
    txHash: string;
    article: {
      id: string;
      title: string;
      transactionHash: string;
      createdAt: string;
    };
    error?: string;
  }