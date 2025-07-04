// components/locations/LocationArticleFeed.tsx
'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useFeed } from '../../lib/reader/hooks/useFeed';
import { ArticleCard, ProposalCard } from '../cards';
import CommunityCard from '../cards/types/CommunityCard';
import PortfolioCard from '../cards/types/PortfolioCard';
import { getColorPlaceholder } from '../../lib/utils/placeholderUtils';
import { getArticleCardType } from '../../lib/reader/adapters/articleTransformers';
import { urlOptimizer } from '../../lib/locations/seo/urlOptimizer';

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

// ✅ HELPER: Flexible location matching
function locationMatches(articleLocation: string, targetCity: string, targetState: string): boolean {
  if (!articleLocation) return false;
  
  const normalizedArticle = articleLocation.toLowerCase();
  const normalizedCity = targetCity.toLowerCase();
  const normalizedState = targetState.toLowerCase();
  
  // Direct city match
  if (!normalizedArticle.includes(normalizedCity)) return false;
  
  // Flexible state matching - handle FL vs Florida, etc.
  const stateAbbreviations: Record<string, string[]> = {
    'florida': ['florida', 'fl'],
    'california': ['california', 'ca'],
    'texas': ['texas', 'tx'],
    'new york': ['new york', 'ny'],
  };
  
  const possibleStates = stateAbbreviations[normalizedState] || [normalizedState];
  return possibleStates.some(state => normalizedArticle.includes(state));
}

interface LocationArticleFeedProps {
  city: string;
  state: string;
  category?: string;
  filters?: {
    recency?: 'all' | 'latest' | 'week' | 'month';
    engagement?: 'all' | 'most-tipped' | 'trending';
    contentType?: 'all' | 'articles' | 'proposals' | 'community';
    category?: string;
  };
  onArticleSelect?: (articleId: string) => void;
}

const LocationArticleFeed: React.FC<LocationArticleFeedProps> = ({ 
  city, 
  state, 
  category,
  filters = { recency: 'all', engagement: 'all', contentType: 'all' },
  onArticleSelect 
}) => {
  const router = useRouter();
  
  // Use identical useFeed hook as Florida page
  const {
    articles,
    proposals,
    isLoading,
    error,
  } = useFeed();

  console.log('LocationArticleFeed: Raw articles from useFeed:', articles.length);
  console.log('LocationArticleFeed: Article types:', articles.map(a => `${a.id}:${a.articleType}:${a.location}`));

  // ✅ FIXED FILTERING with flexible location matching
  const filteredArticles = React.useMemo(() => {
    console.log(`LocationArticleFeed: Starting with ${articles.length} articles`);
    
    let filtered = articles.filter(article => {
      // ✅ FIXED: Flexible location matching
      const matchesLocation = locationMatches(article.location, city, state);
      
      if (!matchesLocation) {
        console.log(`Article ${article.id} location mismatch: "${article.location}" vs "${city}, ${state}"`);
        return false;
      }
      
      // Category filtering (optional)
      if (category && article.category.toLowerCase() !== category.toLowerCase()) {
        console.log(`Article ${article.id} category mismatch: ${article.category} vs ${category}`);
        return false;
      }
      
      console.log(`✅ Including article ${article.id} (${article.articleType}) for ${city}`);
      return true;
    });

    console.log(`After location filtering: ${filtered.length} articles`);

    // ✅ FIXED: Only apply time filter if it's not 'all'
    if (filters.recency && filters.recency !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (filters.recency) {
        case 'latest':
          filterDate.setHours(now.getHours() - 24);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
      }
      
      const beforeTimeFilter = filtered.length;
      filtered = filtered.filter(article => {
        const articleDate = new Date(article.createdAt);
        const isRecent = articleDate >= filterDate;
        if (!isRecent) {
          console.log(`Article ${article.id} filtered out by time: ${article.createdAt} vs ${filterDate.toISOString()}`);
        }
        return isRecent;
      });
      console.log(`Time filter (${filters.recency}): ${beforeTimeFilter} → ${filtered.length} articles`);
    }

    // Apply engagement filters
    if (filters.engagement && filters.engagement !== 'all') {
      switch (filters.engagement) {
        case 'most-tipped':
          filtered = filtered.sort((a, b) => 
            b.readerMetrics.tipAmount - a.readerMetrics.tipAmount
          );
          break;
        case 'trending':
          filtered = filtered.sort((a, b) => 
            b.readerMetrics.viewCount - a.readerMetrics.viewCount
          );
          break;
      }
    }

    console.log(`LocationArticleFeed FINAL: ${filtered.length} articles for ${city}, ${state}`);
    console.log('Final article types:', filtered.map(a => `${a.id}:${a.articleType}`));
    return filtered;
  }, [articles, city, state, category, filters]);

  // Filter proposals by location
  const filteredProposals = React.useMemo(() => {
    return proposals.filter(proposal => {
      return locationMatches(proposal.location, city, state);
    });
  }, [proposals, city, state]);

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
    const commonProps = {
      id: article.id,
      title: article.title,
      summary: article.summary,
      imageUrl: getColorPlaceholder(article),
      createdAt: article.createdAt,
      location: parseLocation(article.location),
      category: article.category,
      tags: article.tags,
      onClick: () => handleArticleClick(article)
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
              reactions: {},
              supporters: 0
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
              reactions: {},
              supporters: 0
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
              reactions: {},
              supporters: 0
            }}
          />
        );
    }
  };

  // Determine what content to display
  const renderContent = () => {
    if (isLoading) {
      return (
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          fontFamily: 'var(--font-ui)'
        }}>
          Loading {city} articles from blockchain...
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
          Error loading {city} content: {error}
        </div>
      );
    }

    const hasArticles = filteredArticles.length > 0;
    const hasProposals = filteredProposals.length > 0;
    const showProposals = filters.contentType === 'all' || filters.contentType === 'proposals';
    const showArticles = filters.contentType === 'all' || filters.contentType === 'articles' || filters.contentType === 'community';

    if (!hasArticles && !hasProposals) {
      return (
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          fontFamily: 'var(--font-ui)'
        }}>
          <h3 style={{
            fontFamily: 'var(--font-headlines)',
            marginBottom: '1rem'
          }}>
            No {city} Content Found
          </h3>
          <p style={{ color: 'var(--color-digital-silver)' }}>
            No articles or proposals match your current filters for {city}, {state}.
          </p>
          <div style={{ 
            marginTop: '2rem', 
            fontSize: '0.8rem',
            color: 'var(--color-digital-silver)',
            fontFamily: 'monospace',
            textAlign: 'left',
            backgroundColor: 'var(--color-parchment)',
            padding: '1rem',
            borderRadius: '4px'
          }}>
            <strong>Debug Info:</strong><br />
            • Total articles from blockchain: {articles.length}<br />
            • Articles after location filter: {filteredArticles.length}<br />
            • Proposals after location filter: {filteredProposals.length}<br />
            • Looking for: {city}, {state}<br />
            • Current filters: {JSON.stringify(filters)}<br />
            • Available locations: {Array.from(new Set(articles.map(a => a.location))).join(', ')}
          </div>
        </div>
      );
    }

    return (
      <div>
        {/* Display location-filtered articles */}
        {showArticles && filteredArticles.map(renderArticle)}
        
        {/* Display location-filtered proposals */}
        {showProposals && filteredProposals.map(proposal => (
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
              reactions: {},
              supporters: 0,
              journalistInterest: proposal.journalistInterest || 0
            }}
            contentHash=""
            onClick={() => handleArticleClick(proposal)}
          />
        ))}
        
        {/* Content summary with debug info */}
        <div style={{
          padding: '1rem',
          marginTop: '2rem',
          backgroundColor: 'var(--color-parchment)',
          borderRadius: '4px',
          textAlign: 'center',
          fontSize: '0.9rem',
          color: 'var(--color-digital-silver)'
        }}>
          Showing {filteredArticles.length} articles and {filteredProposals.length} proposals for {city}, {state}
          {category && ` in ${category}`}
          <br />
          <small>Debug: Total articles: {articles.length} | Filter: {filters.recency || 'all'}</small>
        </div>
      </div>
    );
  };

  return (
    <div>
      {renderContent()}
    </div>
  );
};

export default LocationArticleFeed;