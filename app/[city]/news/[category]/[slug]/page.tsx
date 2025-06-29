// app/[city]/news/[category]/[slug]/page.tsx - FIXED NFT DETECTION
'use client';

import { useEffect, useState, use } from 'react';
import { useArticleDetail } from '../../../../../lib/reader/hooks/useArticleDetail';
import { urlOptimizer } from '../../../../../lib/locations/seo/urlOptimizer';
import { ProfileNFTService } from '../../../../../lib/blockchain/contracts/ProfileNFT';
import { ethers } from 'ethers';
import ArticleHeader from '../../../../../components/article/ArticleHeader';
import ArticleBreadcrumbs from '../../../../../components/article/ArticleBreadcrumbs';
import EncryptionGate from '../../../../../components/article/EncryptionGate';
import ArticleContent from '../../../../../components/article/ArticleContent';
import ReadingControls from '../../../../../components/article/ReadingControls';
import { useReadingPreferences } from '../../../../../lib/hooks/useReadingPreferences';

interface ArticlePageProps {
 params: Promise<{
   city: string;
   category: string;
   slug: string;
 }>;
}

interface JournalistInfo {
  name: string;
  bio: string;
  profileUrl: string;
  walletAddress: string;
  memberSince: string;
  hasProfile: boolean;
}

export default function ArticlePage({ params }: ArticlePageProps) {
 const resolvedParams = use(params);
 const [decryptSuccess, setDecryptSuccess] = useState(false);
 const [journalistInfo, setJournalistInfo] = useState<JournalistInfo | null>(null);
 const [hasAccess, setHasAccess] = useState(false);
 const [isNFTOwner, setIsNFTOwner] = useState(false);
 const { theme, fontSize, fontFamily } = useReadingPreferences();
 
 // Extract article ID from slug
 const articleId = urlOptimizer.extractIdFromSlug(resolvedParams.slug);
 
 // Fetch article data
 const { article, isLoading, error } = useArticleDetail(articleId);

 const handleDecryptSuccess = (success: boolean) => {
   if (success) {
     setDecryptSuccess(true);
     setHasAccess(true);
     console.log('Article unlocked successfully');
   }
 };

 // Check if user has access
 useEffect(() => {
   if (article?.hasAccess || (article?.content && !article.content.startsWith('ENCRYPTED_V1:'))) {
     setHasAccess(true);
   }
 }, [article]);

 // Fetch journalist info from ProfileNFT service
 useEffect(() => {
   const fetchJournalistInfo = async () => {
     if (!article?.author) return;
     
     try {
       const provider = new ethers.JsonRpcProvider('https://testnet.evm.nodes.onflow.org');
       const profileService = new ProfileNFTService(provider);
       
       const profile = await profileService.getProfileByAddress(article.author);
       
       if (profile) {
         setJournalistInfo({
           name: profile.displayName,
           bio: profile.bio || `Verified journalist covering ${resolvedParams.city} news. Contributing to ImmutableType's local journalism network.`,
           profileUrl: `/profile/${article.author}`,
           walletAddress: article.author,
           memberSince: new Date(profile.createdAt).toLocaleDateString('en-US', { 
             month: 'long', 
             year: 'numeric' 
           }),
           hasProfile: true
         });
       } else {
         // Fallback for journalists without profiles
         setJournalistInfo({
           name: `Journalist ${article.author.slice(0, 6)}...`,
           bio: `Verified journalist covering ${resolvedParams.city} news. Contributing to ImmutableType's local journalism network.`,
           profileUrl: `/profile/${article.author}`,
           walletAddress: article.author,
           memberSince: article.createdAt ? new Date(article.createdAt).toLocaleDateString('en-US', { 
             month: 'long', 
             year: 'numeric' 
           }) : 'Unknown',
           hasProfile: false
         });
       }
     } catch (error) {
       console.error('Error fetching journalist info:', error);
       // Fallback
       setJournalistInfo({
         name: `Journalist ${article.author.slice(0, 6)}...`,
         bio: `Verified journalist covering ${resolvedParams.city} news.`,
         profileUrl: `/profile/${article.author}`,
         walletAddress: article.author,
         memberSince: 'Unknown',
         hasProfile: false
       });
     }
   };

   fetchJournalistInfo();
 }, [article, resolvedParams.city]);

 if (isLoading) {
   return <ArticleLoadingSkeleton />;
 }

 if (error || !article) {
   return <ArticleNotFound />;
 }

 // Apply theme styles to container when content is decrypted
 const containerStyle = hasAccess || decryptSuccess ? {
   backgroundColor: theme.bgColor,
   color: theme.textColor,
   transition: 'all 0.3s ease'
 } : {};

 const wrapperStyle = hasAccess || decryptSuccess ? {
   backgroundColor: theme.bgColor,
   color: theme.textColor,
   fontSize: fontSize,
   fontFamily: fontFamily,
   transition: 'all 0.3s ease'
 } : {};

 return (
   <>
  <style jsx>{`
  .article-container {
    min-height: 100vh;
  }

  .article-content-wrapper {
    max-width: 65ch;
    margin: 0 auto;
    padding: 2rem 1.5rem;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    border-radius: 8px;
    margin-top: 2rem;
    margin-bottom: 2rem;
  }

  /* Kindle-like minimal header when user has access */
  .minimal-header {
    margin-bottom: 2rem;
  }

  .minimal-title {
    font-size: 1.8rem;
    font-weight: 700;
    margin-bottom: 0.75rem;
    font-family: 'Special Elite', 'Courier New', monospace;
    line-height: 1.3;
  }

  .minimal-author-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  }

  .author-name {
    font-weight: 600;
  }

  .author-date {
    opacity: 0.7;
  }

  .verified-badge {
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

  /* Journalist Bio Section - Moved to bottom */
  .journalist-bio {
    background: #f0f7ff;
    border-left: 4px solid #2B3990;
    padding: 1.5rem;
    margin: 3rem 0 2rem 0;
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
    font-weight: 600;
    font-size: 18px;
    margin-bottom: 0.25rem;
  }

  .journalist-meta {
    font-size: 0.875rem;
    margin-bottom: 0.5rem;
  }

  .bio-text {
    font-size: 14px;
    line-height: 1.5;
  }

  /* Reader License Story */
  .reader-license-story {
    background: #ffffff;
    border: 2px solid #2B3990;
    border-radius: 12px;
    padding: 2.5rem;
    margin: 3rem 0;
  }

  .story-headline {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    font-size: 28px;
    font-weight: 700;
    color: #333333;
    margin-bottom: 1.5rem;
    text-align: center;
  }

  .story-content p {
    font-size: 16px;
    line-height: 1.6;
    color: #666666;
    margin-bottom: 1.5rem;
  }

  /* Breadcrumb Enhancement */
  .breadcrumb-nav {
    background: #ffffff;
    padding: 1rem 0;
    border-bottom: 1px solid #e8e8e8;
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

    .minimal-title {
      font-size: 1.5rem;
    }

    .bio-header {
      flex-direction: column;
      gap: 0.5rem;
      align-items: flex-start;
    }

    .minimal-author-info {
      flex-wrap: wrap;
    }
  }
`}</style>

     <div className="article-container" style={containerStyle}>
       {/* Reading Controls - Only show when content is decrypted */}
       {(hasAccess || decryptSuccess || (article?.content && !article.content.startsWith('ENCRYPTED_V1:'))) && <ReadingControls />}


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
       <div className="article-content-wrapper" style={wrapperStyle}>
         <article>
           {/* Conditional Header - Full header ONLY when content is locked */}
           {!hasAccess && !decryptSuccess ? (
             <ArticleHeader 
               article={article}
               city={resolvedParams.city}
               category={resolvedParams.category}
             />
           ) : (
             /* Minimal header for clean reading when user has access */
             <div className="minimal-header">
               <h1 className="minimal-title" style={{ color: theme.textColor }}>{article.title}</h1>
               <div className="minimal-author-info" style={{ color: theme.textColor }}>
                 <span className="author-name" style={{ color: theme.textColor }}>
                   By {journalistInfo?.name || `Journalist ${article.author?.slice(0, 6)}...`}
                 </span>
                 <span className="author-date" style={{ opacity: 0.7 }}>
                   • {article.createdAt ? new Date(article.createdAt).toLocaleDateString('en-US', { 
                     month: 'long', 
                     day: 'numeric',
                     year: 'numeric' 
                   }) : 'Date unknown'}
                 </span>
                 {journalistInfo?.hasProfile && (
                   <span className="verified-badge">
                     ✓ Verified
                   </span>
                 )}
               </div>
             </div>
           )}

           {/* EncryptionGate handles ALL content access and purchasing */}
           <EncryptionGate 
             article={article}
             onDecrypt={handleDecryptSuccess}
             journalistInfo={journalistInfo}
           />

           {/* If content is unlocked and not handled by EncryptionGate, show with ArticleContent */}
           {(article.hasAccess || decryptSuccess) && !article.content?.startsWith('ENCRYPTED_V1:') && (
             <ArticleContent article={article} />
           )}

           {/* Journalist Bio Section - ONLY show for non-access state */}
           {!hasAccess && !decryptSuccess && journalistInfo && (
             <div className="journalist-bio">
               <div className="bio-header">
                 <div className="journalist-info">
                   <div className="journalist-name">{journalistInfo.name}</div>
                   <div className="journalist-meta">
                     Member since {journalistInfo.memberSince} • {journalistInfo.walletAddress.slice(0, 6)}...{journalistInfo.walletAddress.slice(-4)}
                   </div>
                   {journalistInfo.hasProfile && (
                     <div className="verification-badge">
                       ✓ Verified Local Journalist
                     </div>
                   )}
                 </div>
               </div>
               <div className="bio-text">{journalistInfo.bio}</div>
             </div>
           )}
         </article>

         {/* Reader License Story - ONLY show when content is locked */}
         {!hasAccess && !decryptSuccess && (
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
         )}
       </div>
     </div>
   </>
 );
}

// Simple Loading Skeleton
function ArticleLoadingSkeleton() {
 return (
   <div style={{ background: '#fafafa', minHeight: '100vh' }}>
     <div style={{ 
       maxWidth: '65ch', 
       margin: '0 auto', 
       padding: '2rem 1.5rem',
       background: '#ffffff',
       boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
       borderRadius: '8px',
       marginTop: '2rem'
     }}>
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

// Simple 404 Component
function ArticleNotFound() {
 return (
   <div style={{ background: '#fafafa', minHeight: '100vh' }}>
     <div style={{ 
       maxWidth: '65ch', 
       margin: '0 auto', 
       padding: '4rem 2rem',
       background: '#ffffff',
       textAlign: 'center'
     }}>
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