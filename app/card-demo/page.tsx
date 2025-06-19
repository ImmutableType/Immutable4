// app/card-demo/page.tsx

"use client";

import React from 'react';
import '../../styles/cards.css';
import { ArticleCard, ProposalCard, CommunityCard } from '../../components/cards';
import { mockArticles, mockProposals, mockCommunityContent } from '../../lib/mockData/cards';


export default function CardDemoPage() {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ marginBottom: '2rem' }}>Card Template System Demo</h1>
      
      <section>
        <h2 style={{ marginBottom: '1rem' }}>Article Cards</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {mockArticles.map(article => {
            // Ensure author.type is one of the allowed values
            const authorType = (article.author.type === 'Journalist' || 
                               article.author.type === 'Citizen' || 
                               article.author.type === 'Organization') 
                               ? article.author.type 
                               : 'Journalist';
                               
            return (
              <ArticleCard
                key={article.id}
                id={article.id}
                title={article.title}
                summary={article.summary}
                imageUrl={article.imageUrl}
                author={{
                  name: article.author.name,
                  id: article.author.id || '',
                  type: authorType, // Use the validated type
                  stats: article.author.stats
                }}
                proposer={article.proposer ? {
                  name: article.proposer.name,
                  id: article.proposer.id || ''
                } : undefined}
                createdAt={article.createdAt}
                location={article.location}
                category={article.category}
                tags={article.tags}
                contentHash={article.contentHash}
                metrics={article.metrics}
                distribution={article.distribution}
                isVerified={article.isVerified}
                onClick={() => console.log(`Clicked article: ${article.id}`)}
              />
            );
          })}
        </div>
      </section>
      
      <section style={{ marginTop: '4rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Proposal Cards</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {mockProposals.map(proposal => (
            <ProposalCard
              key={proposal.id}
              id={proposal.id}
              title={proposal.title}
              summary={proposal.summary}
              imageUrl={proposal.imageUrl}
              proposer={{
                name: proposal.proposer.name,
                id: proposal.proposer.id || '',
                stats: proposal.proposer.stats
              }}
              createdAt={proposal.createdAt}
              location={proposal.location}
              category={proposal.category}
              tags={proposal.tags}
              status={proposal.status as 'active' | 'completed' | 'canceled'}
              funding={proposal.funding}
              metrics={proposal.metrics}
              distribution={proposal.distribution}
              contentHash={proposal.contentHash}
              onClick={() => console.log(`Clicked proposal: ${proposal.id}`)}
            />
          ))}
        </div>
      </section>
      
      <section style={{ marginTop: '4rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Community Cards</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {mockCommunityContent.map(content => (
            <CommunityCard
              key={content.id}
              id={content.id}
              title={content.title}
              summary={content.summary}
              imageUrl={content.imageUrl}
              submitter={{
                name: content.submitter.name,
                id: content.submitter.id || '',
                stats: content.submitter.stats
              }}
              sourceUrl={content.sourceUrl}
              sourceName={content.sourceName}
              createdAt={content.createdAt}
              sharedAt={content.sharedAt}
              location={content.location}
              category={content.category}
              tags={content.tags}
              voting={content.voting}
              metrics={content.metrics}
              distribution={content.distribution}
              contentHash={content.contentHash}
              onClick={() => console.log(`Clicked community content: ${content.id}`)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}