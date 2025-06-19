// app/[city]/news/[category]/[slug]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useArticleDetail } from '../../../../../lib/reader/hooks/useArticleDetail';
import { urlOptimizer } from '../../../../../lib/locations/seo/urlOptimizer';
import ArticleHeader from '../../../../../components/article/ArticleHeader';
import ArticleBreadcrumbs from '../../../../../components/article/ArticleBreadcrumbs';
import EngagementBar from '../../../../../components/article/EngagementBar';
import EncryptionGate from '../../../../../components/article/EncryptionGate';
import ArticleContent from '../../../../../components/article/ArticleContent';

interface ArticlePageProps {
 params: {
   city: string;
   category: string;
   slug: string;
 };
}

export default function ArticlePage({ params }: ArticlePageProps) {
 const [decryptSuccess, setDecryptSuccess] = useState(false);
 
 // Extract article ID from slug
 const articleId = urlOptimizer.extractIdFromSlug(params.slug);
 
 // Fetch article data
 const { article, isLoading, error } = useArticleDetail(articleId);

 const handleDecryptSuccess = (success: boolean) => {
   if (success) {
     setDecryptSuccess(true);
     console.log('Article unlocked successfully');
   }
 };

 // Calculate reading metrics from actual content
 const getWordCount = () => {
   if (!article) return 0;
   const content = article.hasAccess ? article.content : (article.summary || '');
   return content.split(' ').length;
 };

 const getReadingTime = () => {
   const wordCount = getWordCount();
   return Math.ceil(wordCount / 200); // 200 words per minute
 };

 // Get journalist info from article data
 const getJournalistInfo = () => {
   if (!article) return null;
   return {
     name: article.authorName || article.author || "Anonymous",
     bio: `${article.authorType} covering ${params.city} news. Verified contributor to ImmutableType's local journalism network.`,
     articlesPublished: 247, // This would come from a real service
     profileUrl: `/profile/${article.author}`
   };
 };

 if (isLoading) {
   return <ArticleLoadingSkeleton />;
 }

 if (error || !article) {
   return <ArticleNotFound />;
 }

 const journalist = getJournalistInfo();

 return (
   <>
     {/* Clean Typography & Layout Styles */}
     <style jsx>{`
       /* Modern Fluid Typography */
       :root {
         --body-size: clamp(16px, 4vw, 18px);
         --h1-size: clamp(30px, 8vw, 50px);
         --h2-size: clamp(24px, 6vw, 36px);
         --h3-size: clamp(20px, 5vw, 28px);
         --line-height: 1.5;
         --line-height-headings: 1.2;
         
         /* Sophisticated Color Palette */
         --text-primary: #333333;
         --text-secondary: #666666;
         --text-light: #999999;
         --background-primary: #fafafa;
         --background-white: #ffffff;
         --border-light: #e8e8e8;
         --border-medium: #d0d0d0;
         --highlight-bg: #f0f7ff;
       }

       /* Layout */
       .article-container {
         background: var(--background-primary);
         min-height: 100vh;
       }

       .article-content-wrapper {
         max-width: 70ch; /* Optimal reading width */
         margin: 0 auto;
         padding: 2rem 1.5rem;
         background: var(--background-white);
         box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
         border-radius: 8px;
         margin-top: 2rem;
         margin-bottom: 2rem;
       }

       /* Article Meta Bar */
       .article-meta-bar {
         display: flex;
         justify-content: space-between;
         align-items: center;
         padding: 1rem 0;
         border-bottom: 1px solid var(--border-light);
         margin-bottom: 2rem;
         font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
         font-size: 14px;
         color: var(--text-secondary);
       }

       .reading-stats {
         display: flex;
         gap: 1.5rem;
       }

       .stat-item {
         display: flex;
         align-items: center;
         gap: 0.5rem;
       }

       /* Journalist Bio Section */
       .journalist-bio {
         background: var(--highlight-bg);
         border-left: 4px solid var(--color-blockchain-blue);
         padding: 1.5rem;
         margin: 2rem 0;
         border-radius: 0 8px 8px 0;
       }

       .bio-header {
         display: flex;
         justify-content: space-between;
         align-items: center;
         margin-bottom: 1rem;
       }

       .journalist-name {
         font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
         font-weight: 600;
         color: var(--text-primary);
         font-size: 18px;
       }

       .articles-count {
         background: var(--color-blockchain-blue);
         color: white;
         padding: 0.25rem 0.75rem;
         border-radius: 4px;
         font-size: 12px;
         font-weight: 600;
       }

       .bio-text {
         color: var(--text-secondary);
         font-size: 14px;
         line-height: 1.5;
       }

       /* Ownership Section */
       .ownership-section {
         background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
         border-radius: 12px;
         padding: 2rem;
         margin: 3rem 0;
         text-align: center;
       }

       .ownership-headline {
         font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
         font-size: 24px;
         font-weight: 600;
         color: var(--text-primary);
         margin-bottom: 1rem;
       }

       .ownership-description {
         color: var(--text-secondary);
         margin-bottom: 2rem;
         line-height: 1.5;
       }

       .nft-ownership-btn {
         background: linear-gradient(135deg, #6f42c1 0%, #5a32a3 100%);
         color: white;
         border: none;
         padding: 1rem 2rem;
         border-radius: 8px;
         font-weight: 600;
         cursor: pointer;
         transition: all 0.3s ease;
         text-decoration: none;
         display: inline-block;
       }

       .nft-ownership-btn:hover {
         transform: translateY(-1px);
         box-shadow: 0 4px 15px rgba(111, 66, 193, 0.3);
       }

       /* Reader License Story */
       .reader-license-story {
         background: var(--background-white);
         border: 2px solid var(--color-blockchain-blue);
         border-radius: 12px;
         padding: 2.5rem;
         margin: 3rem 0;
       }

       .story-headline {
         font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
         font-size: 28px;
         font-weight: 700;
         color: var(--text-primary);
         margin-bottom: 1.5rem;
         text-align: center;
       }

       .story-content p {
         font-size: 16px;
         line-height: 1.6;
         color: var(--text-secondary);
         margin-bottom: 1.5rem;
       }

       /* Breadcrumb Enhancement */
       .breadcrumb-nav {
         background: var(--background-white);
         padding: 1rem 0;
         border-bottom: 1px solid var(--border-light);
       }

       .breadcrumb-container {
         max-width: 1200px;
         margin: 0 auto;
         padding: 0 1.5rem;
       }

       /* Mobile Optimizations */
       @media (max-width: 768px) {
         .article-content-wrapper {
           margin: 0;
           border-radius: 0;
           padding: 1.5rem 1rem;
         }

         .article-meta-bar {
           flex-direction: column;
           gap: 1rem;
           align-items: flex-start;
         }
         
         .reading-stats {
           gap: 1rem;
         }

         .bio-header {
           flex-direction: column;
           gap: 0.5rem;
           align-items: flex-start;
         }
       }
     `}</style>

     <div className="article-container">
       {/* Enhanced Breadcrumbs */}
       <nav className="breadcrumb-nav">
         <div className="breadcrumb-container">
           <ArticleBreadcrumbs 
             city={params.city}
             category={params.category}
             state="florida"
             article={article}
           />
         </div>
       </nav>

       {/* Main Article Container */}
       <div className="article-content-wrapper">
         <article>
           {/* Enhanced Article Header */}
           <ArticleHeader 
             article={article}
             city={params.city}
             category={params.category}
           />

           {/* Article Meta Bar */}
           <div className="article-meta-bar">
             <div className="reading-stats">
               <div className="stat-item">
                 📖 <span>{getWordCount()} words</span>
               </div>
               <div className="stat-item">
                 ⏱️ <span>{getReadingTime()} min read</span>
               </div>
               <div className="stat-item">
                 🎧 <span>Audio coming soon</span>
               </div>
             </div>
           </div>

           {/* Journalist Bio Section */}
           {journalist && (
             <div className="journalist-bio">
               <div className="bio-header">
                 <div className="journalist-name">{journalist.name}</div>
                 <div className="articles-count">{journalist.articlesPublished} Articles</div>
               </div>
               <div className="bio-text">{journalist.bio}</div>
             </div>
           )}

           {/* EncryptionGate handles ALL content access and purchasing */}
           <EncryptionGate 
             article={article}
             onDecrypt={handleDecryptSuccess}
           />

           {/* If content is unlocked and not handled by EncryptionGate, show with ArticleContent */}
           {(article.hasAccess || decryptSuccess) && !article.content.startsWith('ENCRYPTED_V1:') && (
             <ArticleContent article={article} />
           )}
         </article>

         {/* Article Ownership Section */}
         <div className="ownership-section">
           <h3 className="ownership-headline">Own This Article as an NFT</h3>
           <p className="ownership-description">
             Preserve this journalism permanently on the blockchain. Support the author 
             and own a piece of {params.city}'s news history.
           </p>
           <a 
             href={journalist?.profileUrl || `/profile/${article.author}`}
             className="nft-ownership-btn"
           >
             View Author Profile & Collect
           </a>
         </div>

         {/* Reader License Story */}
         <div className="reader-license-story">
           <h3 className="story-headline">Reader Licenses: Breaking the Grip of Mainstream Media</h3>
           <div className="story-content">
             <p>
               Traditional media locks you into expensive monthly subscriptions for content you may never read. 
               Reader Licenses revolutionize news consumption—pay only $0.05-$0.08 per article you actually want to access.
             </p>
             <p>
               No bundled content. No monthly commitments. No editorial boards influenced by corporate advertisers. 
               Just direct support for independent journalists who serve your community.
             </p>
             <p>
               Powered by blockchain technology, Reader Licenses ensure journalists receive immediate payment 
               while giving you complete ownership utility over the content you choose to unlock. 
               This is journalism freed from external influence—accountable only to readers like you.
             </p>
           </div>
         </div>

         {/* Engagement Features */}
         <div className="engagement-section" style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border-light)' }}>
           <EngagementBar 
             article={article}
           />
         </div>
       </div>
     </div>
   </>
 );
}

// Enhanced Loading Skeleton
function ArticleLoadingSkeleton() {
 return (
   <div className="article-container">
     <div className="article-content-wrapper">
       <div className="animate-pulse">
         <div style={{ height: '12px', background: '#e0e0e0', borderRadius: '4px', width: '40%', marginBottom: '1rem' }}></div>
         <div style={{ height: '32px', background: '#e0e0e0', borderRadius: '4px', width: '90%', marginBottom: '1.5rem' }}></div>
         <div style={{ height: '16px', background: '#e0e0e0', borderRadius: '4px', width: '60%', marginBottom: '2rem' }}></div>
         <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
           <div style={{ height: '16px', background: '#e0e0e0', borderRadius: '4px', width: '100%' }}></div>
           <div style={{ height: '16px', background: '#e0e0e0', borderRadius: '4px', width: '100%' }}></div>
           <div style={{ height: '16px', background: '#e0e0e0', borderRadius: '4px', width: '85%' }}></div>
         </div>
       </div>
     </div>
   </div>
 );
}

// Enhanced 404 Component
function ArticleNotFound() {
 return (
   <div className="article-container">
     <div className="article-content-wrapper" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
       <h1 style={{ fontSize: '2rem', fontWeight: '600', color: '#333', marginBottom: '1rem' }}>
         Article Not Found
       </h1>
       <p style={{ color: '#666', marginBottom: '2rem' }}>
         The article you're looking for doesn't exist or has been removed.
       </p>
       <a 
         href="/miami/news" 
         style={{ 
           color: '#2c5aa0', 
           textDecoration: 'none',
           fontWeight: '500',
           fontSize: '16px'
         }}
       >
         ← Back to Miami News
       </a>
     </div>
   </div>
 );
}