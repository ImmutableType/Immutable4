// lib/locations/hooks/useLocationProposals.ts
import { useState, useEffect, useRef } from 'react';
import { useProposals } from '../../hooks/proposals/useProposals';

interface LocationProposalFilters {
  category?: string;
  status?: string;
}

export function useLocationProposals(city: string, state: string, filters: LocationProposalFilters = {}) {
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Use a ref to track if this is the first render
  const isFirstRender = useRef(true);
  
  // Leverage the existing proposals hook
  const { proposals: allProposals, loading: proposalsLoading, error: proposalsError } = useProposals();
  
  useEffect(() => {
    // Skip processing if we're still loading the proposals
    if (proposalsLoading) {
      setLoading(true);
      return;
    }
    
    // Handle any errors from the proposals hook
    if (proposalsError) {
      setError(proposalsError);
      setLoading(false);
      return;
    }
    
    try {
      // Filter proposals for the specified location
      let locationProposals = allProposals.filter(proposal => {
        const proposalLocation = proposal.location?.split(', ');
        return proposalLocation?.[0] === city && proposalLocation?.[1] === state;
      });
      
      // Apply category filter if specified
      if (filters.category && filters.category !== 'all') {
        locationProposals = locationProposals.filter(proposal => 
          proposal.category === filters.category
        );
      }
      
      // Apply status filter if specified
      if (filters.status && filters.status !== 'all') {
        locationProposals = locationProposals.filter(proposal => 
          proposal.status === filters.status
        );
      }
      
      // Only update state if we're not in loading state and we have proposals to show
      if (!isFirstRender.current || allProposals.length > 0) {
        setProposals(locationProposals);
        setLoading(false);
        setError(null);
      }
    } catch (err) {
      setError('Error filtering proposals: ' + (err as Error).message);
      setLoading(false);
    }
    
    // Mark that the first render is complete
    isFirstRender.current = false;
  }, [allProposals, proposalsLoading, proposalsError, filters, city, state]);
  
  return { proposals, loading, error };
}