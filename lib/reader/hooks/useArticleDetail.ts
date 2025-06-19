// lib/reader/hooks/useArticleDetail.ts
'use client'
import { useState, useEffect } from 'react';
import { Article } from '../types/article';
import EncryptedArticleReadService from '../../blockchain/contracts/EncryptedArticleReadService';

export const useArticleDetail = (articleId: string) => {
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!articleId) {
        setArticle(null);
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('🔍 Fetching article:', articleId);
        
        // Extract numeric ID from articleId (remove prefixes like "native_")
        const numericId = parseInt(articleId.replace(/[^0-9]/g, ''));
        
        if (isNaN(numericId) || numericId === 0) {
          throw new Error('Invalid article ID');
        }

        // Use our new read service directly
        const readService = new EncryptedArticleReadService();
        const raw = await readService.getArticle(numericId);
        
        if (!raw || !raw.title || raw.title.length === 0) {
          throw new Error('Article not found');
        }

        console.log('🔍 Found raw article:', raw);

        // Transform to Article interface
        const transformedArticle: Article = {
          id: `native_${numericId}`,
          title: raw.title,
          content: raw.encryptedContent || raw.summary,
          summary: raw.summary,
          author: raw.author,
          authorName: `Journalist ${raw.author.slice(0, 6)}`,
          authorType: 'Journalist',
          contentHash: String(numericId),
          createdAt: new Date(Number(raw.publishedAt) * 1000).toISOString(),
          location: raw.location || 'Miami, FL',
          category: raw.category || 'News',
          tags: [],
          articleType: 'native',
          readerMetrics: {
            viewCount: 0,
            tipAmount: 0,
            commentCount: 0
          }
        };

        console.log('🔍 Transformed article:', transformedArticle);
        setArticle(transformedArticle);
        
      } catch (err) {
        console.error('❌ Error fetching article:', err);
        setError('Failed to fetch article from blockchain');
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticle();
  }, [articleId]);

  return { article, isLoading, error };
};

export default useArticleDetail;