// app/(client)/news-proposals/create/page.tsx
'use client'

import React from 'react';
import Link from 'next/link';
import ProposalForm from '../../../../components/proposals/forms/ProposalForm';
import ProposalTokenGate from '../../../../components/proposals/ProposalTokenGate';

export default function CreateProposalPage() {
  return (
    <ProposalTokenGate>
      <div className="create-proposal-page">
        {/* Breadcrumb Navigation */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          marginBottom: '24px',
          fontSize: '14px'
        }}>
          <Link 
            href="/news-proposals" 
            style={{ color: '#6c757d', textDecoration: 'none' }}
          >
            News Proposals
          </Link>
          <span style={{ margin: '0 8px' }}>/</span>
          <span style={{ color: '#000000', fontWeight: '500' }}>Create Proposal</span>
        </div>

        {/* Header */}
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '8px',
          border: '1px solid #D9D9D9',
          marginBottom: '24px'
        }}>
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: 'bold', 
            marginBottom: '16px',
            fontFamily: "'Special Elite', monospace"
          }}>
            Create a News Proposal
          </h1>
          <p style={{
            fontSize: '16px',
            lineHeight: '1.6',
            marginBottom: '8px'
          }}>
            Submit your idea for a news story that you'd like to see covered. Community members can vote and fund proposals they find interesting.
          </p>
          <p style={{
            fontSize: '14px',
            color: '#6c757d',
            padding: '8px',
            backgroundColor: 'rgba(0,0,0,0.05)',
            borderRadius: '4px'
          }}>
            Note: Your work will not be saved automatically. Please complete the form in one session.
          </p>
        </div>

        {/* Proposal Form */}
        <ProposalForm />
      </div>
    </ProposalTokenGate>
  );
}