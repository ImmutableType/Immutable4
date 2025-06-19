// lib/publishing/types/publishingToken.ts
export type TokenType = 'subscriber' | 'journalist' | 'creator';

export interface PublishingToken {
  id: string;
  tokenType: TokenType;
  issuedTo: string;          // Profile ID
  issuedBy: string;          // Admin wallet address
  issuedAt: string;
  expiresAt?: string;        // Optional expiration
  active: boolean;
}

export interface TokenVerificationResponse {
  hasToken: boolean;
  tokens: PublishingToken[];
  highestTokenType?: TokenType;
}

export const TOKEN_TYPE_HIERARCHY: { [key in TokenType]: number } = {
  'subscriber': 1,
  'journalist': 2,
  'creator': 3
};

export function getHighestTokenType(tokens: PublishingToken[]): TokenType | undefined {
  if (tokens.length === 0) return undefined;
  
  let highestToken: PublishingToken | undefined;
  
  tokens.forEach(token => {
    if (!highestToken) {
      highestToken = token;
    } else if (TOKEN_TYPE_HIERARCHY[token.tokenType] > TOKEN_TYPE_HIERARCHY[highestToken.tokenType]) {
      highestToken = token;
    }
  });
  
  return highestToken?.tokenType;
}