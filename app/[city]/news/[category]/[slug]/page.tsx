// app/[city]/news/[category]/[slug]/page.tsx (ENHANCED - Real Data + Clean UI)
'use client';

import { useEffect, useState, use } from 'react';
import { useArticleDetail } from '../../../../../lib/reader/hooks/useArticleDetail';
import { urlOptimizer } from '../../../../../lib/locations/seo/urlOptimizer';
import ArticleHeader from '../../../../../components/article/ArticleHeader';
import ArticleBreadcrumbs from '../../../../../components/article/ArticleBreadcrumbs';
import EncryptionGate from '../../../../../components/article/EncryptionGate';

interface ArticlePageProps {
 params: Promise<{
   city: string;
   category: string;
   slug: string;
 }>;
}

export default function ArticlePage({ params }: ArticlePageProps) {
 const resolvedParams = use(params);
 const [decryptSuccess, setDecryptSuccess] = useState(false);
 
 // Extract article ID from slug
 const articleId = urlOptimizer.extractIdFromSlug(resolvedParams.slug);
 
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
   return content.split(' ').filter(word => word.length > 0).length;
 };

 const getReadingTime = () => {
   const wordCount = getWordCount();
   return Math.ceil(wordCount / 200); // 200 words per minute
 };

 // ✨ ENHANCED: Get real journalist info from article data
 const getJournalistInfo = () => {
   if (!article) return null;
   return {
     name: article.authorName || article.author || "Anonymous Journalist",
     displayName: article.authorName || `Journalist ${article.author?.slice(0, 6)}...`,
     walletAddress: article.author,
     bio: `${article.authorType || 'Journalist'} covering ${resolvedParams.city} news. Verified contributor to ImmutableType's local journalism network.`,
     articlesPublished: 247, // This would come from ProfileNFT contract in the future
     profileUrl: `/profile/${article.author}`,
     verified: article.authorType === 'Journalist' ? 'Verified Local Journalist' : 'Verified Local',
     memberSince: article.createdAt ? new Date(article.createdAt).toLocaleDateString('en-US', { 
       month: 'long', 
       year: 'numeric' 
     }) : 'Recently'
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
     {/* ✨ ENHANCED: Clean Typography & Layout Styles */}
     <style jsx>{`
       /* Modern Fluid Typography */
       :root {
         --body-size: clamp(16px, 4vw, 18px);
         --h1-size: clamp(28px, 7vw, 42px);
         --h2-size: clamp(22px, 5vw, 32px);
         --line-height: 1.6;
         --line-height-headings: 1.3;
         
         /* Improved Color Palette */
         --text-primary: #1a1a1a;
         --text-secondary: #4a4a4a;
         --text-light: #737373;
         --background-primary: #fafafa;
         --background-white: #ffffff;
         --border-light: #e5e5e5;
         --highlight-bg: #f0f7ff;
         
         /* Reading Width Optimization */
         --reading-width: 65ch;
       }

       /* Layout Container */
       .article-container {
         background: var(--background-primary);
         min-height: 100vh;
       }

       .article-content-wrapper {
         max-width: var(--reading-width);
         margin: 0 auto;
         padding: 2rem 1.5rem;
         background: var(--background-white);
         box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
         border-radius: 8px;
         margin-top: 1rem;
         margin-bottom: 3rem;
       }

       /* ✨ ENHANCED: Article Meta Bar */
       .article-meta-bar {
         display: flex;
         justify-content: space-between;
         align-items: center;
         padding: 1.25rem 0;
         border-bottom: 1px solid var(--border-light);
         margin-bottom: 2rem;
         font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
         font-size: 14px;
         color: var(--text-secondary);
       }

       .reading-stats {
         display: flex;
         gap: 2rem;
         align-items: center;
       }

       .stat-item {
         display: flex;
         align-items: center;
         gap: 0.5rem;
         font-weight: 500;
       }

       /* ✨ ENHANCED: Professional Journalist Bio */
       .journalist-bio {
         background: var(--highlight-bg);
         border-left: 4px solid var(--color-blockchain-blue);
         padding: 1.75rem;
         margin: 2.5rem 0;
         border-radius: 0 8px 8px 0;
       }

       .bio-header {
         display: flex;
         justify-content: space-between;
         align-items: flex-start;
         margin-bottom: 1rem;
       }

       .journalist-info {
         flex: 1;
       }

       .journalist-name {
         font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
         font-weight: 700;
         color: var(--text-primary);
         font-size: 1.125rem;
         margin-bottom: 0.25rem;
       }

       .journalist-meta {
         font-size: 0.875rem;
         color: var(--text-light);
         margin-bottom: 0.5rem;
       }

       .verification-badge {
         display: inline-flex;
         align-items: center;
         gap: 0.25rem;
         background: #dcfce7;
         color: #166534;
         padding: 0.25rem 0.5rem;
         border-radius: 4px;
         font-size: 0.75rem;
         font-weight: 600;
       }

       .articles-count {
         background: var(--color-blockchain-blue);
         color: white;
         padding: 0.4rem 0.8rem;
         border-radius: 6px;
         font-size: 0.8rem;
         font-weight: 700;
         white-space: nowrap;
       }

       .bio-text {
         color: var(--text-secondary);
         font-size: 0.95rem;
         line-height: 1.5;
       }

       /* ✨ NEW: Bookmark & Share Icons */
       .article-actions {
         display: flex;
         gap: 1rem;
         align-items: center;
         margin-bottom: 1.5rem;
         padding: 1rem 0;
         border-bottom: 1px solid var(--border-light);
       }

       .action-button {
         display: flex;
         align-items: center;
         gap: 0.5rem;
         padding: 0.5rem 1rem;
         border: 1px solid var(--border-light);
         background: var(--background-white);
         border-radius: 6px;
         cursor: pointer;
         font-size: 0.875rem;
         color: var(--text-secondary);
         transition: all 0.2s ease;
         text-decoration: none;
       }

       .action-button:hover {
         background: var(--highlight-bg);
         border-color: var(--color-blockchain-blue);
         color: var(--color-blockchain-blue);
       }

       /* ✨ ENHANCED: Reader License Messaging */
       .reader-license-story {
         background: var(--background-white);
         border: 2px solid var(--color-blockchain-blue);
         border-radius: 12px;
         padding: 2.5rem;
         margin: 3rem 0;
       }

       .story-headline {
         font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
         font-size: 1.5rem;
         font-weight: 700;
         color: var(--text-primary);
         margin-bottom: 1.5rem;
         text-align: center;
       }

       .story-content p {
         font-size: 1rem;
         line-height: 1.7;
         color: var(--text-secondary);
         margin-bottom: 1.5rem;
       }

       /* ✨ NEW: Read More from Journalist */
       .read-more-section {
         background: var(--highlight-bg);
         border: 1px solid #bfdbfe;
         border-radius: 12px;
         padding: 2rem;
         margin: 3rem 0;
         text-align: center;
       }

       .read-more-headline {
         font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
         font-size: 1.25rem;
         font-weight: 600;
         color: var(--text-primary);
         margin-bottom: 1rem;
       }

       .read-more-description {
         color: var(--text-secondary);
         margin-bottom: 1.5rem;
         line-height: 1.6;
       }

       .read-more-btn {
         background: var(--color-blockchain-blue);
         color: white;
         border: none;
         padding: 0.75rem 1.5rem;
         border-radius: 8px;
         font-weight: 600;
         cursor: pointer;
         transition: all 0.3s ease;
         text-decoration: none;
         display: inline-block;
         font-size: 0.95rem;
       }

       .read-more-btn:hover {
         background: #1e40af;
         transform: translateY(-1px);
       }

       /* ✨ ENHANCED: Reading Width Note */
       .reading-width-note {
         text-align: center;
         font-size: 0.8rem;
         color: var(--text-light);
         font-style: italic;
         margin-top: 2rem;
         padding-top: 1rem;
         border-top: 1px solid var(--border-light);
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
           gap: 1.5rem;
         }

         .bio-header {
           flex-direction: column;
           gap: 1rem;
           align-items: flex-start;
         }

         .article-actions {
           flex-wrap: wrap;
           gap: 0.75rem;
         }

         .action-button {
           font-size: 0.8rem;
           padding: 0.4rem 0.8rem;
         }
       }
     `}</style>

     <div className="article-container">
       {/* Enhanced Breadcrumbs */}
       <nav className="breadcrumb-nav">
         <div className="breadcrumb-container">
           <ArticleBreadcrumbs 
             city={resolvedParams.city}
             category={resolvedParams.category}
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
             city={resolvedParams.city}
             category={resolvedParams.category}
           />

           {/* ✨ NEW: Bookmark & Share Actions */}
           <div className="article-actions">
             <button className="action-button" title="Bookmark this article">
               🔖 <span>Bookmark</span>
             </button>
             <button className="action-button" title="Share article">
               📤 <span>Share</span>
             </button>
             <button className="action-button" title="Copy link">
               🔗 <span>Copy Link</span>
             </button>
           </div>

           {/* ✨ ENHANCED: Article Meta Bar */}
           <div className="article-meta-bar">
             <div className="reading-stats">
               <div className="stat-item">
                 📖 <span>{getWordCount()} words</span>
               </div>
               <div className="stat-item">
                 ⏱️ <span>{getReadingTime()} min read</span>
               </div>
               {/* ✨ REMOVED: Audio coming soon icon */}
             </div>
             <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
               {article.createdAt && new Date(article.createdAt).toLocaleDateString('en-US', {
                 month: 'long',
                 day: 'numeric',
                 year: 'numeric',
                 hour: '2-digit',
                 minute: '2-digit'
               })}
             </div>
           </div>

           {/* ✨ ENHANCED: Professional Journalist Bio */}
           {journalist && (
             <div className="journalist-bio">
               <div className="bio-header">
                 <div className="journalist-info">
                   <div className="journalist-name">{journalist.displayName}</div>
                   <div className="journalist-meta">
                     Member since {journalist.memberSince} • {journalist.walletAddress?.slice(0, 6)}...{journalist.walletAddress?.slice(-4)}
                   </div>
                   <div className="verification-badge">
                     ✓ {journalist.verified}
                   </div>
                 </div>
                 <div className="articles-count">{journalist.articlesPublished} Articles</div>
               </div>
               <div className="bio-text">{journalist.bio}</div>
             </div>
           )}

           {/* ✨ EncryptionGate handles ALL content access, purchasing, and decryption */}
           <EncryptionGate 
             article={article}
             onDecrypt={handleDecryptSuccess}
           />

           {/* ✨ ENHANCED: Reader License Messaging (cleaned up) */}
           <div className="reader-license-story">
             <h3 className="story-headline">Reader Licenses: Revolutionary Micropayments for Journalism</h3>
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
                 while giving you complete control over the content you choose to unlock. 
                 This is journalism freed from external influence—accountable only to readers like you.
               </p>
             </div>
           </div>

           {/* ✨ NEW: Read More from this Journalist */}
           {journalist && (
             <div className="read-more-section">
               <h3 className="read-more-headline">Read More from {journalist.displayName}</h3>
               <p className="read-more-description">
                 Discover more articles from this verified journalist covering {resolvedParams.city} news. 
                 See their complete portfolio and follow their reporting.
               </p>
               <a 
                 href={journalist.profileUrl}
                 className="read-more-btn"
               >
                 View Profile & Articles →
               </a>
             </div>
           )}

           {/* ✨ NEW: Reading Width Note */}
           <div className="reading-width-note">
             <p>📏 This article width is optimized for fastest reading speed (65 characters per line)</p>
           </div>
         </article>
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
         <div style={{ height: '14px', background: '#e5e5e5', borderRadius: '4px', width: '50%', marginBottom: '1rem' }}></div>
         <div style={{ height: '36px', background: '#e5e5e5', borderRadius: '4px', width: '90%', marginBottom: '1.5rem' }}></div>
         <div style={{ height: '16px', background: '#e5e5e5', borderRadius: '4px', width: '70%', marginBottom: '2rem' }}></div>
         <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
           <div style={{ height: '16px', background: '#e5e5e5', borderRadius: '4px', width: '100%' }}></div>
           <div style={{ height: '16px', background: '#e5e5e5', borderRadius: '4px', width: '95%' }}></div>
           <div style={{ height: '16px', background: '#e5e5e5', borderRadius: '4px', width: '85%' }}></div>
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
       <h1 style={{ fontSize: '2rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '1rem' }}>
         Article Not Found
       </h1>
       <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
         The article you're looking for doesn't exist or has been removed.
       </p>
       <a 
         href="/miami/news" 
         style={{ 
           color: 'var(--color-blockchain-blue)', 
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