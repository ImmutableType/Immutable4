// app/(client)/locations/florida/miami/proposals/[slug]/page.tsx
'use client'
import React from 'react';
import { notFound } from 'next/navigation';
import { useProposals } from '../../../../../../../lib/hooks/proposals/useProposals';
import { urlOptimizer } from '../../../../../../../lib/locations/seo/urlOptimizer';

interface ProposalPageProps {
  params: Promise<{ slug: string; }>;
}

export default async function ProposalPage({ params }: ProposalPageProps) {
  const { slug } = await params;

  // Extract the proposal ID from the slug
  const proposalId = urlOptimizer.extractIdFromSlug(slug);
  // Use the hook to fetch proposal details
  const { proposals, loading, error } = useProposals();
  
  // Find the specific proposal
  const proposal = proposals?.find(p => p.id === proposalId);
  
  if (loading) return <div>Loading proposal...</div>;
  if (error) return <div>Error loading proposal: {error}</div>;
  if (!proposal) return notFound();
  
  // Constants
  const city = "Miami";
  const state = "Florida";
  
  return (
    <div className="proposal-detail-page">
      <h1 className="proposal-title">{proposal.title}</h1>
      
      <div className="proposal-metadata">
        <div className="proposer">
          By: {proposal.proposerName || 'Anonymous'}
        </div>
        <div className="created-date">
          Proposed: {new Date(proposal.createdAt).toLocaleDateString()}
        </div>
        <div className="category">
          Category: {proposal.category}
        </div>
      </div>
      
      {proposal.imageUrl && (
        <div className="proposal-image">
          <img 
            src={proposal.imageUrl} 
            alt={proposal.title}
            width={800}
            height={400}
          />
        </div>
      )}
      
      <div className="proposal-summary">
        <h2>Summary</h2>
        <p>{proposal.summary}</p>
      </div>
      
      {/* Simple funding display */}
      <div className="funding-progress">
        <h3>Funding: ${proposal.fundingAmount} of ${proposal.fundingGoal}</h3>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ 
              width: `${Math.min(100, (proposal.fundingAmount / proposal.fundingGoal) * 100)}%`
            }}
          ></div>
        </div>
      </div>
      
      <div className="proposal-description">
        <h2>Description</h2>
        <div dangerouslySetInnerHTML={{ __html: proposal.description || '' }} />
      </div>
    </div>
  );
}