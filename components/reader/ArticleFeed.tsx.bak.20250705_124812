// File: components/reader/ArticleFeed.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ethers } from 'ethers';
import { FeedFilters } from '../../lib/reader/types/feed';
import { useFeed } from '../../lib/reader/hooks/useFeed';
import { ArticleCard, ProposalCard } from '../cards';
import CommunityCard from '../cards/types/CommunityCard';
import PortfolioCard from '../cards/types/PortfolioCard';
import FilterBar from './FilterBar';
import { getColorPlaceholder } from '../../lib/utils/placeholderUtils';
import { getArticleCardType } from '../../lib/reader/adapters/articleTransformers';
import { urlOptimizer } from '../../lib/locations/seo/urlOptimizer';
import { ChainReactionService, ReactionData } from '../../lib/blockchain/contracts/ChainReactionService';
import { useWallet } from '../../lib/hooks/useWallet';

// Contract address for ChainReactions
const CHAIN_REACTIONS_ADDRESS = '0xBB7B7A498Fc23084A0322A869e2D121966898EE5';

// Helper for parsing location
function parseLocation(locationString: string): { city: string; state: string } | undefined {
 if (!locationString) return undefined;
 
 const parts = locationString.split(',').map((part: string) => part.trim());
 if (parts.length >= 2) {
   return { city: parts[0], state: parts[1] };
 }
 return { city: locationString, state: '' };
}

// Helper for truncating wallet address
function truncateAddress(address: string): string {
 return address.substring(0, 6) + '...' + address.substring(address.length - 4);
}

// Helper to extract numeric ID
function extractNumericId(id: string): string {
  const match = id.match(/(\d+)$/);
  return match ? match[1] : id;
}

interface ArticleFeedProps {
 onArticleSelect?: (articleId: string) => void;
}

const ArticleFeed: React.FC<ArticleFeedProps> = ({ onArticleSelect }) => {
 const router = useRouter();
 const { address, getSigner } = useWallet();
 const [reactionService, setReactionService] = useState<ChainReactionService | null>(null);
 const [reactionsMap, setReactionsMap] = useState<Map<string, ReactionData>>(new Map());
 const [isLoadingReactions, setIsLoadingReactions] = useState(false);
 
 const {
   articles,
   proposals,
   filters,
   categories,
   locations,
   isLoading,
   error,
   updateFilters
 } = useFeed();

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

 // Fetch reactions for all content
 const fetchReactions = useCallback(async () => {
   if (!reactionService || (articles.length === 0 && proposals.length === 0)) return;
   
   setIsLoadingReactions(true);
   try {
     // Collect all content IDs (numeric only)
     const contentIds = [
       ...articles.map(a => extractNumericId(a.id)),
       ...proposals.map(p => extractNumericId(p.id))
     ];
     
     // Fetch reactions in batch
     const reactions = await reactionService.getBatchReactions(contentIds);
     
     // Store reactions with numeric IDs as keys
     setReactionsMap(reactions);
   } catch (error) {
     console.error('Failed to fetch reactions:', error);
   } finally {
     setIsLoadingReactions(false);
   }
 }, [articles, proposals, reactionService]);

 // Fetch reactions when content changes
 useEffect(() => {
   fetchReactions();
 }, [fetchReactions]);

 // Add page visibility handler to refresh when returning to page
 useEffect(() => {
   const handleVisibilityChange = () => {
     if (document.visibilityState === 'visible') {
       fetchReactions();
     }
   };

   document.addEventListener('visibilitychange', handleVisibilityChange);
   return () => {
     document.removeEventListener('visibilitychange', handleVisibilityChange);
   };
 }, [fetchReactions]);

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
     const numericId = extractNumericId(contentId);
     
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
       newMap.set(numericId, updatedReactions); // Use numeric ID as key
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

 const handleFilterChange = (newFilters: FeedFilters) => {
   updateFilters(newFilters);
 };

 const handleArticleClick = (article: any) => {
   try {
     const geographicUrl = urlOptimizer.buildGeographicUrl(article);
     if (geographicUrl) {
       router.push(geographicUrl);
     } else {
       if (onArticleSelect) {
         onArticleSelect(article.id);
       }
     }
   } catch (error) {
     console.error('Error navigating to article:', error);
     if (onArticleSelect) {
       onArticleSelect(article.id);
     }
   }
 };

 // Render individual article based on type
 const renderArticle = (article: any) => {
   const cardType = getArticleCardType(article);
   const numericId = extractNumericId(article.id);
   const reactions = reactionsMap.get(numericId) || {
     '👍': 0,
     '👏': 0,
     '🔥': 0,
     '🤔': 0,
     supporters: 0
   };
   
   const commonProps = {
     id: article.id,
     title: article.title,
     summary: article.summary,
     imageUrl: getColorPlaceholder(article),
     createdAt: article.createdAt,
     location: parseLocation(article.location),
     category: article.category,
     tags: article.tags,
     onClick: () => handleArticleClick(article),
     onReaction: handleReaction
   };

   switch (cardType) {
     case 'community':
       return (
         <CommunityCard
           key={article.id}
           {...commonProps}
           submitter={{
             name: article.authorName || truncateAddress(article.author),
             id: article.author
           }}
           sourceUrl={article.originalUrl || '#'}
           sourceName={article.publicationName || 'External Source'}
           sharedAt={article.createdAt}
           metrics={{
             reactions,
             supporters: reactions.supporters
           }}
           contentHash={article.contentHash}
         />
       );

     case 'portfolio':
       return (
         <PortfolioCard
           key={article.id}
           {...commonProps}
           author={{
             name: article.authorName || truncateAddress(article.author),
             id: article.author
           }}
           originalUrl={article.originalUrl || '#'}
           publicationName={article.publicationName || 'Unknown Publication'}
           originalAuthor={article.originalAuthor}
           originalPublishDate={article.originalPublishDate || article.createdAt}
           verifiedAt={article.createdAt}
           portfolioType={article.portfolioType || 'verification'}
           metrics={{
             reactions,
             supporters: reactions.supporters
           }}
           contentHash={article.contentHash}
         />
       );

     case 'article':
     default:
       const isEncrypted = article.articleType === 'native';
       const displaySummary = isEncrypted && !article.hasAccess 
         ? article.summary 
         : article.summary;

       return (
         <ArticleCard
           key={article.id}
           {...commonProps}
           summary={displaySummary}
           author={{
             name: article.authorName || truncateAddress(article.author),
             id: article.author,
             type: article.authorType
           }}
           proposer={article.proposalId ? {
             name: "Community Proposal",
             id: article.proposalId
           } : undefined}
           contentHash={article.contentHash}
           isVerified={Boolean(article.contentHash)}
           metrics={{
             views: article.readerMetrics.viewCount,
             comments: article.readerMetrics.commentCount,
             tips: article.readerMetrics.tipAmount,
             reactions,
             supporters: reactions.supporters
           }}
         />
       );
   }
 };

 // Determine what content to display based on filters
 const renderContent = () => {
   if (isLoading) {
     return (
       <div style={{
         padding: '2rem',
         textAlign: 'center',
         fontFamily: 'var(--font-ui)'
       }}>
         Loading articles from blockchain...
       </div>
     );
   }

   if (error) {
     return (
       <div style={{
         padding: '2rem',
         textAlign: 'center',
         fontFamily: 'var(--font-ui)',
         color: 'var(--color-typewriter-red)'
       }}>
         {error}
       </div>
     );
   }

   if (articles.length === 0 && proposals.length === 0) {
     return (
       <div style={{
         padding: '2rem',
         textAlign: 'center',
         fontFamily: 'var(--font-ui)'
       }}>
         No content found. Try adjusting your filters or check that articles have been published to the blockchain.
       </div>
     );
   }

   return (
     <div>
       {/* Display articles */}
       {filters.contentType !== 'proposals' && articles.map(renderArticle)}
       
       {/* Display proposals if in proposal mode */}
       {filters.contentType === 'proposals' && proposals.map(proposal => {
         const numericId = extractNumericId(proposal.id);
         const reactions = reactionsMap.get(numericId) || {
           '👍': 0,
           '👏': 0,
           '🔥': 0,
           '🤔': 0,
           supporters: 0
         };
         
         return (
           <ProposalCard
             key={proposal.id}
             id={proposal.id}
             title={proposal.title}
             summary={proposal.summary}
             imageUrl={getColorPlaceholder(proposal)}
             proposer={{
               name: proposal.proposerName || truncateAddress(proposal.proposer),
               id: proposal.proposer
             }}
             createdAt={proposal.createdAt}
             location={parseLocation(proposal.location)}
             category={proposal.category}
             tags={proposal.tags || []}
             status='active'
             funding={{
               amount: proposal.fundingAmount,
               goal: proposal.fundingGoal,
               percentage: (proposal.fundingAmount / proposal.fundingGoal) * 100
             }}
             metrics={{
               reactions,
               supporters: reactions.supporters,
               journalistInterest: proposal.journalistInterest || 0
             }}
             contentHash=""
             onClick={() => handleArticleClick(proposal)}
             onReaction={handleReaction}
           />
         );
       })}
     </div>
   );
 };

 return (
   <div>
     <FilterBar 
       filters={filters}
       onFilterChange={handleFilterChange}
       categories={categories}
       locations={locations}
     />
     {renderContent()}
   </div>
 );
};

export default ArticleFeed;