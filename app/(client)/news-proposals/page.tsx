
// app/(client)/news-proposals/page.tsx
'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Proposal } from '../../../lib/types/proposal';
import { mockProposalService } from '../../../lib/mockData/mockService';
import ProposalCardGrid from '../../../components/proposals/cards/ProposalCardGrid';
import ProposalCardList from '../../../components/proposals/cards/ProposalCardList';

export default function NewsProposalsPage() {
 const router = useRouter();
 const [proposals, setProposals] = useState<Proposal[]>([]);
 const [loading, setLoading] = useState(true);
 const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
 const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

 // Fetch proposals on component mount
 useEffect(() => {
   const fetchProposals = async () => {
     try {
       const filters = categoryFilter ? { category: categoryFilter } : {};
       const data = await mockProposalService.getProposals(filters);
       setProposals(data);
     } catch (error) {
       console.error('Error fetching proposals:', error);
     } finally {
       setLoading(false);
     }
   };

   fetchProposals();
 }, [categoryFilter]);

 // Handle proposal card click for grid (expects Proposal object)
 const handleProposalClick = (proposal: Proposal) => {
   router.push(`/news-proposals/${proposal.id}`);
 };

 // Handle proposal card click for list (expects string id)
const handleProposalClickById = (id: string) => {
  window.location.href = `/news-proposals/${id}`;
};

 // Categories from our mock data
 const categories = [
   'All', 'Environment', 'Business', 'Education', 
   'Technology', 'Housing', 'Community', 'Arts & Culture'
 ];

 return (
   <div className="news-proposals-page">
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
         News Proposals
       </h1>
       <p style={{
         fontSize: '16px',
         lineHeight: '1.6',
         marginBottom: '16px'
       }}>
         Welcome to the News Proposals hub. This is where community members and journalists can submit news story ideas, collaborate on reporting, and vote on which stories should be covered next.
       </p>
       <p style={{
         fontSize: '16px',
         lineHeight: '1.6'
       }}>
         Connect your wallet to participate in the governance of community journalism.
       </p>
     </div>
     
     {/* Controls for filtering and view mode */}
     <div style={{
       display: 'flex',
       justifyContent: 'space-between',
       alignItems: 'center',
       marginBottom: '16px'
     }}>
       <div style={{
         display: 'flex',
         gap: '8px',
         overflowX: 'auto',
         padding: '4px 0'
       }}>
         {categories.map(category => (
           <button
             key={category}
             onClick={() => setCategoryFilter(category === 'All' ? null : category)}
             style={{
               padding: '6px 12px',
               borderRadius: '4px',
               border: '1px solid #D9D9D9',
               backgroundColor: 
                 (category === 'All' && categoryFilter === null) || 
                 category === categoryFilter 
                   ? '#000000' 
                   : 'white',
               color: 
                 (category === 'All' && categoryFilter === null) || 
                 category === categoryFilter 
                   ? 'white' 
                   : '#000000',
               cursor: 'pointer',
               whiteSpace: 'nowrap'
             }}
           >
             {category}
           </button>
         ))}
       </div>
       
       <div style={{
         display: 'flex',
         gap: '8px'
       }}>
         <button
           onClick={() => setViewMode('grid')}
           style={{
             padding: '6px 12px',
             borderRadius: '4px 0 0 4px',
             border: '1px solid #D9D9D9',
             borderRight: viewMode === 'grid' ? '1px solid #D9D9D9' : 'none',
             backgroundColor: viewMode === 'grid' ? '#000000' : 'white',
             color: viewMode === 'grid' ? 'white' : '#000000',
             cursor: 'pointer'
           }}
         >
           Grid
         </button>
         <button
           onClick={() => setViewMode('list')}
           style={{
             padding: '6px 12px',
             borderRadius: '0 4px 4px 0',
             border: '1px solid #D9D9D9',
             borderLeft: viewMode === 'list' ? '1px solid #D9D9D9' : 'none',
             backgroundColor: viewMode === 'list' ? '#000000' : 'white',
             color: viewMode === 'list' ? 'white' : '#000000',
             cursor: 'pointer'
           }}
         >
           List
         </button>
       </div>
     </div>
     
     <div style={{
       marginBottom: '32px'
     }}>
       <h2 style={{ 
         fontSize: '22px', 
         fontWeight: 'bold', 
         marginBottom: '16px',
         fontFamily: "'Special Elite', monospace"
       }}>
         {categoryFilter ? `${categoryFilter} Proposals` : 'Active Proposals'}
       </h2>
       
       {loading ? (
         <div style={{ textAlign: 'center', padding: '32px' }}>
           <p>Loading proposals...</p>
         </div>
       ) : proposals.length === 0 ? (
         <div style={{ textAlign: 'center', padding: '32px' }}>
           <p>No proposals found. Try adjusting your filters or create a new proposal.</p>
         </div>
       ) : viewMode === 'grid' ? (
         <div style={{
           display: 'grid',
           gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
           gap: '24px',
         }}>
           {proposals.map(proposal => (
             <ProposalCardGrid 
               key={proposal.id} 
               proposal={proposal} 
               onClick={handleProposalClick}  // This one gets Proposal object
             />
           ))}
         </div>
       ) : (
         <div style={{
           display: 'flex',
           flexDirection: 'column',
           gap: '16px',
         }}>
           {proposals.map(proposal => (
             <ProposalCardList 
               key={proposal.id} 
               proposal={proposal} 
               onClick={handleProposalClickById}  // This one gets string id
             />
           ))}
         </div>
       )}
     </div>
     
     <div style={{
       backgroundColor: 'white',
       padding: '20px',
       borderRadius: '8px',
       border: '1px solid #D9D9D9',
       display: 'flex',
       flexDirection: 'column',
       alignItems: 'center',
       textAlign: 'center'
     }}>
       <h2 style={{ 
         fontSize: '22px', 
         fontWeight: 'bold', 
         marginBottom: '12px',
         fontFamily: "'Special Elite', monospace"
       }}>
         Have a Story Idea?
       </h2>
       <p style={{ marginBottom: '20px', maxWidth: '600px' }}>
         Submit your own news proposal and let the community decide if it should be covered. Connect your wallet to get started.
       </p>
       <Link 
         href="/news-proposals/create"
         style={{
           padding: '12px 24px',
           backgroundColor: '#B3211E',
           color: 'white',
           border: 'none',
           borderRadius: '4px',
           fontSize: '16px',
           fontWeight: 'bold',
           cursor: 'pointer',
           textDecoration: 'none',
           display: 'inline-block'
         }}
       >
         Submit a Proposal
       </Link>
     </div>
   </div>
 );
}