// app/(client)/locations/florida/miami/community-curation/page.tsx
'use client'
import React, { useState } from 'react';
import LocationArticleFeed from '../../../../../../components/locations/LocationArticleFeed';
import ArticleModal from '../../../../../../components/reader/ArticleModal';

export default function MiamiCommunityCurationPage() {
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
    <div className="miami-community-curation-page">
      <h1 style={{ 
        fontSize: '28px', 
        fontWeight: 'bold', 
        marginBottom: '16px',
        fontFamily: "'Special Elite', monospace"
      }}>
        Community Curation in Miami
      </h1>
      
      <p style={{
        fontSize: '16px',
        lineHeight: '1.6',
        marginBottom: '24px',
        color: '#666'
      }}>
        Discover valuable journalism from across the web related to Miami, curated by the community and preserved on the Flow EVM blockchain.
      </p>
      
      <LocationArticleFeed 
        city="Miami" 
        state="Florida" 
        filters={{ contentType: 'community' }} 
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