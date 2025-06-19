// app/(client)/locations/florida/miami/proposals/page.tsx
'use client'
import React, { useState } from 'react';
import LocationArticleFeed from '../../../../../../components/locations/LocationArticleFeed';
import ArticleModal from '../../../../../../components/reader/ArticleModal';

export default function MiamiProposalsPage() {
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
    <div className="miami-proposals-page">
      <h1>Miami Proposals</h1>
      <p>Explore community-driven proposals for stories about Miami, Florida.</p>
      <LocationArticleFeed 
        city="Miami" 
        state="Florida" 
        filters={{ contentType: 'proposals' }} 
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