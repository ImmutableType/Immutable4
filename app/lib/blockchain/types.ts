export interface Article {
    id: string;
    title: string;
    author: string;
    contentHash: string;
    timestamp: number;
    preview?: string;
  }
  
  export interface ArticleContractResponse {
    contentHash: string;
    titleHash: string;
    author: string;
    timestamp: number;
  }
  
  export interface ArticleInput {
    contentHash: string;
    title: string;
  }
  
  export interface Publisher {
    publisherId: number;
    address: string;
    username: string;
    name: string;
    bio: string;
    verified: boolean;
    profileAddress?: string;
    socialLinks?: SocialLink[];
    createdAt?: number;
  }
  
  export interface ProfileData {
    name: string;
    bio: string;
    socialLinks: SocialLink[];
  }
  
  export interface SocialLink {
    platform: string;
    url: string;
  }