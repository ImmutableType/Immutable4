// components/profile/ArticlesTab.tsx
'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import EncryptedArticleReadService from '@/lib/blockchain/contracts/EncryptedArticleReadService';
import ArticleNFTCard from '@/components/cards/types/ArticleNFTCard';

interface EncryptedArticle {
  id: string;
  title: string;
  summary: string;
  author: string;
  location: string;
  category: string;
  publishedAt: string;
}

interface ArticlesTabProps {
  profile: {
    walletAddress: string;
    displayName?: string;
  };
}

const ArticlesTab: React.FC<ArticlesTabProps> = ({ profile }) => {
  const router = useRouter();
  const [articles, setArticles] = useState<EncryptedArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchArticles() {
      if (!profile?.walletAddress) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const service = new EncryptedArticleReadService();
        const totalArticles = await service.getTotalArticles();
        
        const userArticles: EncryptedArticle[] = [];
        
        // Check each article to see if it belongs to this user
        for (let i = 1; i <= totalArticles; i++) {
          try {
            const article = await service.getArticle(i);
            
            // Check if this article belongs to the profile owner
            if (article.author.toLowerCase() === profile.walletAddress.toLowerCase()) {
              userArticles.push({
                id: article.id.toString(),
                title: article.title,
                summary: article.summary,
                author: article.author,
                location: article.location,
                category: article.category,
                publishedAt: new Date(Number(article.publishedAt) * 1000).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })
              });
            }
          } catch (articleError) {
            // Skip articles that can't be read
            continue;
          }
        }
        
        // Sort by published date (newest first)
        userArticles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
        
        setArticles(userArticles);
        
      } catch (error) {
        console.error('Error fetching articles:', error);
        setError('Failed to load articles');
      } finally {
        setLoading(false);
      }
    }
    
    fetchArticles();
  }, [profile?.walletAddress]);

  const handleCardClick = (articleId: string) => {
    router.push(`/miami/news/general/native_${articleId}`);
  };

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
            borderTop: '3px solid var(--color-typewriter-red)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}></div>
          <span style={{ fontFamily: 'var(--font-ui)' }}>Loading articles...</span>
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
          Error Loading Articles
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
          📝
        </div>
        <h3 style={{
          fontFamily: 'var(--font-headlines)',
          fontSize: '1.5rem',
          marginBottom: '1rem',
        }}>
          No Articles Published Yet
        </h3>
        <p style={{
          fontSize: '1rem',
          lineHeight: '1.5',
          maxWidth: '400px',
          margin: '0 auto',
        }}>
          This user hasn't published any native articles yet. Published articles will appear here.
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
          Published Articles ({articles.length})
        </h2>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
        gap: '1.5rem',
      }}>
        {articles.map((article) => (
          <ArticleNFTCard
            key={article.id}
            article={article}
            onCardClick={handleCardClick}
            showPurchaseButton={true}
          />
        ))}
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

export default ArticlesTab;