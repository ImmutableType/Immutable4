// app/(client)/locations/florida/miami/news/page.tsx
'use client'
import React, { useState } from 'react';
import LocationArticleFeed from '../../../../../../components/locations/LocationArticleFeed';
import ArticleModal from '../../../../../../components/reader/ArticleModal';

export default function MiamiNewsPage() {
  // State for modal
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  
  // Handler for article selection
  const handleArticleSelect = (articleId: string) => {
    setSelectedArticleId(articleId);
  };

  // Handler for closing the modal
  const handleCloseModal = () => {
    setSelectedArticleId(null);
  };

  return (
    <div className="miami-news-page">
      <h1>Miami News</h1>
      <p>Stay informed with the latest news and updates from Miami, Florida.</p>
      <LocationArticleFeed 
        city="Miami" 
        state="Florida" 
        filters={{ contentType: 'articles' }} 
        onArticleSelect={handleArticleSelect}
      />
      
      {/* Article Modal */}
      {selectedArticleId && (
        <ArticleModal 
          articleId={selectedArticleId} 
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}