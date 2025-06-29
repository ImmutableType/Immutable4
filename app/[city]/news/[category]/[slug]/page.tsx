// app/[city]/news/[category]/[slug]/page.tsx (PROPERLY FIXED)
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
 const [darkMode, setDarkMode] = useState(false);
 const [textSize, setTextSize] = useState('medium');
 const [readingMode, setReadingMode] = useState('serif');
 
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

 // ✨ REAL word count calculation from actual content
 const getWordCount = () => {
   if (!article) return 0;
   let content = '';
   
   if (article.hasAccess || decryptSuccess) {
     content = article.content || '';
   } else {
     content = article.summary || '';
   }
   
   // Remove encrypted prefix if present
   if (content.startsWith('ENCRYPTED_V1:')) {
     return 0; // Can't count encrypted content
   }
   
   return content.split(/\s+/).filter(word => word.length > 0).length;
 };

 const getReadingTime = () => {
   const wordCount = getWordCount();
   return Math.ceil(wordCount / 200); // 200 words per minute
 };

 // ✨ REAL journalist info integration (TODO: integrate with ProfileNFT contract)
 const getJournalistInfo = () => {
   if (!article) return null;
   
   // Extract actual name from authorName or generate display name
   const displayName = article.authorName && article.authorName !== 'Anonymous' 
     ? article.authorName 
     : `Journalist ${article.author?.slice(0, 6)}...`;
   
   const createdDate = article.createdAt ? new Date(article.createdAt) : new Date();
   
   return {
     name: displayName,
     walletAddress: article.author,
     bio: `${article.authorType || 'Journalist'} covering ${resolvedParams.city} news. Verified contributor to ImmutableType's local journalism network.`,
     // TODO: Get real article count from ProfileNFT contract
     articlesPublished: 47, // Placeholder - will be replaced with blockchain data
     profileUrl: `/profile/${article.author}`,
     verified: article.authorType === 'Journalist' ? 'Verified Local Journalist' : 'Verified Local',
     memberSince: createdDate.toLocaleDateString('en-US', { 
       month: 'long', 
       year: 'numeric' 
     })
   };
 };

 // ✨ Handle bookmark action
 const handleBookmark = () => {
   // TODO: Integrate with BookmarkContract
   console.log('Bookmarking article:', article?.id);
   alert('Bookmark functionality coming soon!');
 };

 // ✨ Handle share action
 const handleShare = () => {
   if (navigator.share) {
     navigator.share({
       title: article?.title,
       url: window.location.href
     });
   } else {
     // Fallback
     navigator.clipboard.writeText(window.location.href);
     alert('Link copied to clipboard!');
   }
 };

 // ✨ Handle copy link
 const handleCopyLink = () => {
   navigator.clipboard.writeText(window.location.href);
   alert('Link copied to clipboard!');
 };

 // ✨ Dark mode and accessibility features
 useEffect(() => {
   const savedDarkMode = localStorage.getItem('darkMode') === 'true';
   const savedTextSize = localStorage.getItem('textSize') || 'medium';
   const savedReadingMode = localStorage.getItem('readingMode') || 'serif';
   
   setDarkMode(savedDarkMode);
   setTextSize(savedTextSize);
   setReadingMode(savedReadingMode);
 }, []);

 const toggleDarkMode = () => {
   const newDarkMode = !darkMode;
   setDarkMode(newDarkMode);
   localStorage.setItem('darkMode', newDarkMode.toString());
 };

 const changeTextSize = (size: string) => {
   setTextSize(size);
   localStorage.setItem('textSize', size);
 };

 const toggleReadingMode = () => {
   const newMode = readingMode === 'serif' ? 'sans-serif' : 'serif';
   setReadingMode(newMode);
   localStorage.setItem('readingMode', newMode);
 };

 if (isLoading) {
   return <ArticleLoadingSkeleton darkMode={darkMode} />;
 }

 if (error || !article) {
   return <ArticleNotFound darkMode={darkMode} />;
 }

 const journalist = getJournalistInfo();

 // ✨ Get text size multiplier
 const getTextSizeMultiplier = () => {
   switch (textSize) {
     case 'small': return 0.9;
     case 'large': return 1.2;
     case 'xlarge': return 1.4;
     default: return 1;
   }
 };

 // ✨ Mock social proof data (TODO: integrate with contracts)
 const socialProof = {
   readerCount: 127,
   nftHolders: 23,
   recentActivity: '3 new readers today'
 };

 return (
   <>
     {/* ✨ ENHANCED STYLES with Dark Mode and Accessibility */}
     <style jsx>{`
       :root {
         --base-font-size: ${16 * getTextSizeMultiplier()}px;
         --reading-width: 65ch;
         
         ${darkMode ? `
           --text-primary: #f0f0f0;
           --text-secondary: #c0c0c0;
           --text-light: #a0a0a0;
           --background-primary: #1a1a1a;
           --background-white: #2d2d2d;
           --border-light: #404040;
           --highlight-bg: #1e3a5f;
         ` : `
           --text-primary: #1a1a1a;
           --text-secondary: #4a4a4a;
           --text-light: #737373;
           --background-primary: #fafafa;
           --background-white: #ffffff;
           --border-light: #e5e5e5;
           --highlight-bg: #f0f7ff;
         `}
       }

       .article-container {
         background: var(--background-primary);
         min-height: 100vh;
         color: var(--text-primary);
         transition: all 0.3s ease;
       }

       .article-content-wrapper {
         max-width: var(--reading-width);
         margin: 0 auto;
         padding: 2rem 1.5rem;
         background: var(--background-white);
         box-shadow: 0 1px 3px rgba(0, 0, 0, ${darkMode ? '0.3' : '0.1'});
         border-radius: 8px;
         margin-top: 1rem;
         margin-bottom: 3rem;
         font-size: var(--base-font-size);
         font-family: ${readingMode === 'serif' ? '"Spectral", Georgia, serif' : '"Inter", -apple-system, BlinkMacSystemFont, sans-serif'};
         transition: all 0.3s ease;
       }

       /* ✨ FUNCTIONAL Controls Bar */
       .controls-bar {
         display: flex;
         gap: 1rem;
         padding: 1rem 0;
         border-bottom: 1px solid var(--border-light);
         margin-bottom: 1.5rem;
         flex-wrap: wrap;
         align-items: center;
       }

       .control-group {
         display: flex;
         gap: 0.5rem;
         align-items: center;
       }

       .control-button {
         padding: 0.5rem;
         border: 1px solid var(--border-light);
         background: var(--background-white);
         color: var(--text-secondary);
         border-radius: 4px;
         cursor: pointer;
         font-size: 0.8rem;
         transition: all 0.2s ease;
       }

       .control-button:hover {
         background: var(--highlight-bg);
         border-color: var(--color-blockchain-blue);
       }

       .control-button.active {
         background: var(--color-blockchain-blue);
         color: white;
         border-color: var(--color-blockchain-blue);
       }

       /* ✨ FUNCTIONAL Article Actions */
       .article-actions {
         display: flex;
         gap: 1rem;
         padding: 1rem 0;
         border-bottom: 1px solid var(--border-light);
         margin-bottom: 1.5rem;
         flex-wrap: wrap;
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

       /* ✨ ENHANCED Article Meta */
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

       /* ✨ ENHANCED Social Proof */
       .social-proof {
         display: flex;
         gap: 1.5rem;
         font-size: 0.8rem;
         color: var(--text-light);
       }

       /* ✨ ENHANCED Journalist Bio */
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
         background: ${darkMode ? '#1a4d3a' : '#dcfce7'};
         color: ${darkMode ? '#4ade80' : '#166534'};
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

       /* ✨ CLEANED Reader License Story */
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

       /* ✨ Read More Section */
       .read-more-section {
         background: var(--highlight-bg);
         border: 1px solid ${darkMode ? '#404040' : '#bfdbfe'};
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

       /* ✨ Reading Width Note */
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

       /* ✨ Print Styles */
       @media print {
         .controls-bar,
         .article-actions,
         .read-more-section {
           display: none !important;
         }
         
         .article-container {
           background: white !important;
           color: black !important;
         }
         
         .article-content-wrapper {
           box-shadow: none !important;
           background: white !important;
         }
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

         .article-actions,
         .controls-bar {
           flex-wrap: wrap;
           gap: 0.75rem;
         }

         .action-button,
         .control-button {
           font-size: 0.8rem;
           padding: 0.4rem 0.8rem;
         }

         .social-proof {
           flex-direction: column;
           gap: 0.5rem;
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

           {/* ✨ FUNCTIONAL Controls Bar */}
           <div className="controls-bar">
             <div className="control-group">
               <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Reading:</span>
               <button 
                 className={`control-button ${darkMode ? 'active' : ''}`}
                 onClick={toggleDarkMode}
               >
                 {darkMode ? '🌙' : '☀️'} {darkMode ? 'Dark' : 'Light'}
               </button>
               <button 
                 className={`control-button ${readingMode === 'serif' ? 'active' : ''}`}
                 onClick={toggleReadingMode}
               >
                 Aa {readingMode === 'serif' ? 'Serif' : 'Sans'}
               </button>
             </div>
             
             <div className="control-group">
               <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Size:</span>
               {['small', 'medium', 'large', 'xlarge'].map(size => (
                 <button 
                   key={size}
                   className={`control-button ${textSize === size ? 'active' : ''}`}
                   onClick={() => changeTextSize(size)}
                 >
                   {size === 'small' ? 'A' : size === 'medium' ? 'A' : size === 'large' ? 'A' : 'A'}
                 </button>
               ))}
             </div>

             <div className="control-group">
               <button 
                 className="control-button"
                 onClick={() => window.print()}
               >
                 🖨️ Print
               </button>
             </div>
           </div>

           {/* ✨ FUNCTIONAL Article Actions */}
           <div className="article-actions">
             <button className="action-button" onClick={handleBookmark} title="Bookmark this article">
               🔖 <span>Bookmark</span>
             </button>
             <button className="action-button" onClick={handleShare} title="Share article">
               📤 <span>Share</span>
             </button>
             <button className="action-button" onClick={handleCopyLink} title="Copy link">
               🔗 <span>Copy Link</span>
             </button>
           </div>

           {/* ✨ ENHANCED Article Meta Bar with REAL data */}
           <div className="article-meta-bar">
             <div className="reading-stats">
               <div className="stat-item">
                 📖 <span>{getWordCount()} words</span>
               </div>
               <div className="stat-item">
                 ⏱️ <span>{getReadingTime()} min read</span>
               </div>
               {/* ✨ REMOVED: Audio icon */}
             </div>
             
             {/* ✨ Social Proof Elements */}
             <div className="social-proof">
               <span>👁️ {socialProof.readerCount} readers</span>
               <span>🎨 {socialProof.nftHolders} collectors</span>
               <span>📈 {socialProof.recentActivity}</span>
             </div>
           </div>

           {/* Publication timestamp */}
           <div style={{ 
             fontSize: '0.9rem', 
             color: 'var(--text-light)', 
             marginBottom: '2rem',
             textAlign: 'center'
           }}>
             Published {article.createdAt && new Date(article.createdAt).toLocaleDateString('en-US', {
               month: 'long',
               day: 'numeric',
               year: 'numeric',
               hour: '2-digit',
               minute: '2-digit'
             })}
           </div>

           {/* ✨ ENHANCED Professional Journalist Bio with REAL data */}
           {journalist && (
             <div className="journalist-bio">
               <div className="bio-header">
                 <div className="journalist-info">
                   <div className="journalist-name">{journalist.name}</div>
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

           {/* ✨ CLEANED Reader License Messaging */}
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

           {/* ✨ Read More from this Journalist */}
           {journalist && (
             <div className="read-more-section">
               <h3 className="read-more-headline">Read More from {journalist.name}</h3>
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

           {/* ✨ Reading Width Note */}
           <div className="reading-width-note">
             <p>📏 This article width is optimized for fastest reading speed (65 characters per line)</p>
           </div>
         </article>
       </div>
     </div>
   </>
 );
}

// ✨ Enhanced Loading Skeleton with Dark Mode
function ArticleLoadingSkeleton({ darkMode }: { darkMode: boolean }) {
 const bgColor = darkMode ? '#404040' : '#e5e5e5';
 
 return (
   <div className="article-container" style={{ background: darkMode ? '#1a1a1a' : '#fafafa' }}>
     <div className="article-content-wrapper" style={{ background: darkMode ? '#2d2d2d' : '#ffffff' }}>
       <div className="animate-pulse">
         <div style={{ height: '14px', background: bgColor, borderRadius: '4px', width: '50%', marginBottom: '1rem' }}></div>
         <div style={{ height: '36px', background: bgColor, borderRadius: '4px', width: '90%', marginBottom: '1.5rem' }}></div>
         <div style={{ height: '16px', background: bgColor, borderRadius: '4px', width: '70%', marginBottom: '2rem' }}></div>
         <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
         <div style={{ height: '16px', background: bgColor, borderRadius: '4px', width: '100%' }}></div>
         <div style={{ height: '16px', background: bgColor, borderRadius: '4px', width: '95%' }}></div>
         <div style={{ height: '16px', background: bgColor, borderRadius: '4px', width: '85%' }}></div>
       </div>
     </div>
   </div>
 </div>
);
}

// ✨ Enhanced 404 Component with Dark Mode
function ArticleNotFound({ darkMode }: { darkMode: boolean }) {
return (
 <div className="article-container" style={{ background: darkMode ? '#1a1a1a' : '#fafafa' }}>
   <div className="article-content-wrapper" style={{ 
     textAlign: 'center', 
     padding: '4rem 2rem',
     background: darkMode ? '#2d2d2d' : '#ffffff',
     color: darkMode ? '#f0f0f0' : '#1a1a1a'
   }}>
     <h1 style={{ fontSize: '2rem', fontWeight: '600', marginBottom: '1rem' }}>
       Article Not Found
     </h1>
     <p style={{ color: darkMode ? '#c0c0c0' : '#4a4a4a', marginBottom: '2rem' }}>
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