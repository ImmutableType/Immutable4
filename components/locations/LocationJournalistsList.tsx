// components/locations/LocationJournalistsList.tsx
'use client'
import React from 'react';
import { useProfiles } from '../../lib/profile/hooks/useProfiles';
import ProfileCard from '../profile/ProfileCard';

interface LocationJournalistsListProps {
  city: string;
  state: string;
}

export default function LocationJournalistsList({ city, state }: LocationJournalistsListProps) {
  // Match the actual properties returned by useProfiles
  const { profiles, isLoading, error, hasMore, loadMore } = useProfiles();
  
  // Filter profiles for this location
  const locationProfiles = profiles.filter(profile => {
    // Check if using the new locations structure
    if (profile.locations) {
      // Check primary location
      if (profile.locations.primary?.city === city && 
          profile.locations.primary?.state === state) {
        return true;
      }
      
      // Check coverage areas
      return profile.locations.coverage?.some(coverage => 
        coverage.city === city && coverage.state === state
      ) || false;
    }
    
    // Fallback to string location format
    return profile.location?.includes(`${city}`) || false;
  });
  
  if (isLoading) return (
    <div className="location-journalists-list">
      <div style={{ textAlign: 'center', padding: '32px' }}>
        Loading journalists...
      </div>
    </div>
  );
  
  if (error) return (
    <div className="location-journalists-list">
      <div style={{ textAlign: 'center', padding: '32px', color: '#B32211' }}>
        Error loading journalist profiles: {error.message}
      </div>
    </div>
  );
  
  return (
    <div className="location-journalists-list">
      <h2 style={{ 
        fontFamily: "'Special Elite', monospace",
        marginBottom: '16px' 
      }}>
        Journalists in {city}, {state}
      </h2>
      
      {locationProfiles.length === 0 ? (
        <div style={{ 
          textAlign: 'center',
          padding: '32px',
          backgroundColor: '#F4F1E8',
          borderRadius: '8px',
          margin: '16px 0'
        }}>
          <p>No journalists found covering this location.</p>
          <p style={{ fontSize: '0.9em', marginTop: '8px' }}>
            Be the first journalist to cover {city}, {state}!
          </p>
        </div>
      ) : (
        <div className="journalists-grid" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '20px'
        }}>
          {locationProfiles.map(profile => (
            <ProfileCard 
              key={profile.id} 
              profile={profile}
            />
          ))}
        </div>
      )}
      
      {hasMore && locationProfiles.length > 0 && (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button 
            onClick={() => loadMore()}
            style={{
              padding: '8px 16px',
              backgroundColor: '#F4F1E8',
              border: '1px solid #D9D9D9',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Load More Journalists
          </button>
        </div>
      )}
    </div>
  );
}