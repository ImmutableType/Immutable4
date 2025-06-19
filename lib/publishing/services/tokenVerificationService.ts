// lib/publishing/services/tokenVerificationService.ts
import { TokenType, PublishingToken, TokenVerificationResponse, getHighestTokenType } from '../types/publishingToken';
import tokensData from '../mockData/tokens.json';

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockTokenVerificationService = {
  // Get all tokens for a user
  getUserTokens: async (userId: string): Promise<PublishingToken[]> => {
    await delay(500); // Simulate network delay
    
    const { tokens } = tokensData;
    return tokens.filter(token => token.issuedTo === userId && token.active) as PublishingToken[];
  },
  
  // Verify if user has a specific token
  verifyToken: async (userId: string, requiredTokenType: TokenType): Promise<TokenVerificationResponse> => {
    await delay(500); // Simulate network delay
    
    const { tokens } = tokensData;
    const userTokens = tokens.filter(token => token.issuedTo === userId && token.active) as PublishingToken[];
    
    // Check if user has the required token type
    const hasToken = userTokens.some(token => {
      // Creator tokens grant all access
      if (token.tokenType === 'creator') return true;
      
      // Journalist tokens grant journalist and subscriber access
      if (token.tokenType === 'journalist' && (requiredTokenType === 'journalist' || requiredTokenType === 'subscriber')) return true;
      
      // Subscriber tokens only grant subscriber access
      if (token.tokenType === 'subscriber' && requiredTokenType === 'subscriber') return true;
      
      return false;
    });
    
    const highestTokenType = getHighestTokenType(userTokens);
    
    return {
      hasToken,
      tokens: userTokens,
      highestTokenType
    };
  },
  
  // Check what's the highest token type the user has
  getUserHighestTokenType: async (userId: string): Promise<TokenType | undefined> => {
    await delay(500); // Simulate network delay
    
    const { tokens } = tokensData;
    const userTokens = tokens.filter(token => token.issuedTo === userId && token.active) as PublishingToken[];
    
    return getHighestTokenType(userTokens);
  }
};