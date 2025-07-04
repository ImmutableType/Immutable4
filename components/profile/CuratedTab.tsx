// components/profile/CuratedTab.tsx
'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import CommunityArticleService, { CommunityArticle } from '@/lib/blockchain/contracts/CommunityArticleService';
import CommunityCard from '@/components/cards/types/CommunityCard';
import { ChainReactionService, ReactionData } from '@/lib/blockchain/contracts/ChainReactionService';
import { useWallet } from '@/lib/hooks/useWallet';

interface CuratedTabProps {
  profile: {
    walletAddress: string;
    displayName?: string;
  };
}

const CONTRACT_ADDRESS = '0xD3d12E3b86Ed9f8Cdd095E0f90EDF7eE61Eb8611';
const CHAIN_REACTIONS_ADDRESS = '0xBB7B7A498Fc23084A0322A869e2D121966898EE5';

const CuratedTab: React.FC<CuratedTabProps> = ({ profile }) => {
  const { address, getSigner } = useWallet();
  const [articles, setArticles] = useState<CommunityArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reactionService, setReactionService] = useState<ChainReactionService | null>(null);
  const [reactionsMap, setReactionsMap] = useState<Map<string, ReactionData>>(new Map());
  const [isLoadingReactions, setIsLoadingReactions] = useState(false);

  // Initialize ChainReactionService
  useEffect(() => {
    const initService = async () => {
      try {
        const provider = new ethers.JsonRpcProvider('https://testnet.evm.nodes.onflow.org');
        const service = new ChainReactionService(CHAIN_REACTIONS_ADDRESS, provider);
        setReactionService(service);
      } catch (error) {
        console.error('Failed to initialize ChainReactionService:', error);
      }
    };
    initService();
  }, []);

  useEffect(() => {
    async function fetchCuratedArticles() {
      if (!profile?.walletAddress) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const provider = new ethers.JsonRpcProvider('https://testnet.evm.nodes.onflow.org');
        const service = new CommunityArticleService(CONTRACT_ADDRESS, provider);
        
        // Get article IDs by author
        const articleIds = await service.getArticlesByAuthor(profile.walletAddress);
        
        if (articleIds.length === 0) {
          setArticles([]);
          return;
        }
        
        // Fetch full article details
        const articleDetails = await service.getArticlesBatch(articleIds);
        
        // Sort by timestamp (newest first)
        articleDetails.sort((a, b) => Number(b.timestamp) - Number(a.timestamp));
        
        setArticles(articleDetails);
      } catch (error) {
        console.error('Error fetching curated articles:', error);
        setError('Failed to load curated articles');
      } finally {
        setLoading(false);
      }
    }
    
    fetchCuratedArticles();
  }, [profile?.walletAddress]);

  // Fetch reactions for all articles
  useEffect(() => {
    const fetchReactions = async () => {
      if (!reactionService || articles.length === 0) return;
      
      setIsLoadingReactions(true);
      try {
        // Extract numeric IDs - assuming format might be "community_1" or just "1"
        const contentIds = articles.map(a => {
          const match = a.id.match(/(\d+)$/);
          return match ? match[1] : a.id;
        });
        
        // Fetch reactions in batch
        const reactions = await reactionService.getBatchReactions(contentIds);
        setReactionsMap(reactions);
      } catch (error) {
        console.error('Failed to fetch reactions:', error);
      } finally {
        setIsLoadingReactions(false);
      }
    };
    
    fetchReactions();
  }, [articles, reactionService]);

  // Handle reaction
  const handleReaction = useCallback(async (contentId: string, reactionType: string, isPowerUp: boolean) => {
    if (!reactionService) {
      alert('Please wait for the service to initialize');
      return;
    }

    const signer = await getSigner();
    if (!signer) {
      alert('Please connect your wallet to react');
      return;
    }

    try {
      console.log(`Adding reaction: ${reactionType} (Power-up: ${isPowerUp}) to content ${contentId}`);
      
      // Extract numeric ID
      const match = contentId.match(/(\d+)$/);
      const numericId = match ? match[1] : contentId;
      
      // Send transaction
      const tx = await reactionService.addReaction(numericId, reactionType, isPowerUp, signer);
      console.log('Transaction sent:', tx.hash);
      
      // Wait for confirmation
      await tx.wait();
      console.log('Reaction confirmed!');
      
      // Refresh reactions for this content
      const updatedReactions = await reactionService.getReactions(numericId);
      setReactionsMap(prev => {
        const newMap = new Map(prev);
        newMap.set(contentId, updatedReactions);
        return newMap;
      });
      
    } catch (error: any) {
      console.error('Failed to add reaction:', error);
      if (error.message?.includes('Insufficient EMOJI tokens')) {
        alert('Insufficient EMOJI tokens. Please reload your EMOJI balance.');
      } else if (error.message?.includes('user rejected')) {
        console.log('User rejected transaction');
      } else {
        alert('Failed to add reaction. Please try again.');
      }
    }
  }, [reactionService, getSigner]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '3rem',
        color: 'var(--color-black)',
        opacity: 0.7,
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid var(--color-digital-silver)',
            borderTop: '3px solid var(--color-alert-amber)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}></div>
          <span style={{ fontFamily: 'var(--font-ui)' }}>Loading curated content...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '3rem',
        color: 'var(--color-typewriter-red)',
      }}>
        <h3 style={{
          fontFamily: 'var(--font-headlines)',
          marginBottom: '1rem',
        }}>
          Error Loading Curated Content
        </h3>
        <p>{error}</p>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '3rem',
        color: 'var(--color-black)',
        opacity: 0.7,
      }}>
        <div style={{
          fontSize: '3rem',
          marginBottom: '1rem',
        }}>
          🌐
        </div>
        <h3 style={{
          fontFamily: 'var(--font-headlines)',
          fontSize: '1.5rem',
          marginBottom: '1rem',
        }}>
          No Curated Content Yet
        </h3>
        <p style={{
          fontSize: '1rem',
          lineHeight: '1.5',
          maxWidth: '400px',
          margin: '0 auto',
        }}>
          This user hasn't curated any community content yet. Curated articles will appear here.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
      }}>
        <h2 style={{
          fontFamily: 'var(--font-headlines)',
          fontSize: '1.5rem',
          margin: 0,
        }}>
          Curated Content ({articles.length})
        </h2>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
      }}>
        {articles.map((article) => {
          const reactions = reactionsMap.get(article.id) || {
            '👍': 0,
            '👏': 0,
            '🔥': 0,
            '🤔': 0,
            supporters: 0
          };

          return (
            <CommunityCard
              key={article.id}
              id={article.id}
              title={article.title}
              summary={article.description}
              submitter={{
                name: profile.displayName || `${profile.walletAddress.slice(0, 6)}...${profile.walletAddress.slice(-4)}`,
                id: profile.walletAddress
              }}
              sourceUrl={article.contentUrl}
              sourceName={article.sourceDomain}
              createdAt={new Date(Number(article.timestamp) * 1000).toISOString()}
              sharedAt={new Date(Number(article.timestamp) * 1000).toISOString()}
              location={{
                city: article.location,
                state: 'FL' // Default for Miami
              }}
              category={article.category}
              tags={article.tags}
              metrics={{
                reactions,
                supporters: reactions.supporters
              }}
              contentHash={''}
              onReaction={handleReaction}
            />
          );
        })}
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default CuratedTab;