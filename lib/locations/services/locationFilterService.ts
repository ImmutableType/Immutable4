// lib/locations/services/locationFilterService.ts
/**
 * Shared service for location-based filtering
 */
export const locationFilterService = {
    /**
     * Filter articles by city and state
     */
    filterArticlesByLocation(articles: any[], city: string, state: string, neighborhood?: string) {
      return articles.filter(article => {
        // Check if the article has location data
        if (!article.location) return false;
        
        // Extract location components
        const locationParts = article.location.split(', ');
        const articleCity = locationParts[0];
        const articleState = locationParts[1];
        
        // Check city and state match
        const locationMatch = articleCity === city && articleState === state;
        
        // If neighborhood is specified, check that too
        if (neighborhood && locationMatch) {
          return article.neighborhood === neighborhood;
        }
        
        return locationMatch;
      });
    },
    
    /**
     * Filter profiles by city and state
     */
    filterProfilesByLocation(profiles: any[], city: string, state: string, expertise?: string) {
      return profiles.filter(profile => {
        // Check if this is their primary location
        if (profile.locations?.primary?.city === city && profile.locations?.primary?.state === state) {
          // If expertise is specified, check if they have it
          if (expertise) {
            return profile.locations?.coverage?.some((coverage: any) => 
              coverage.city === city && 
              coverage.state === state && 
              coverage.expertise === expertise
            );
          }
          return true;
        }
        
        // Check if they cover this location
        const coverageMatch = profile.locations?.coverage?.some((coverage: any) => 
          coverage.city === city && coverage.state === state
        );
        
        // If expertise is specified, check if they have it
        if (expertise && coverageMatch) {
          return profile.locations?.coverage?.some((coverage: any) => 
            coverage.city === city && 
            coverage.state === state && 
            coverage.expertise === expertise
          );
        }
        
        return coverageMatch;
      });
    },
    
    /**
     * Filter proposals by city and state
     */
    filterProposalsByLocation(proposals: any[], city: string, state: string, category?: string) {
      return proposals.filter(proposal => {
        // Check if the proposal has location data
        if (!proposal.location) return false;
        
        // Extract location components
        const locationParts = proposal.location.split(', ');
        const proposalCity = locationParts[0];
        const proposalState = locationParts[1];
        
        // Check city and state match
        const locationMatch = proposalCity === city && proposalState === state;
        
        // If category is specified, check that too
        if (category && locationMatch) {
          return proposal.category === category;
        }
        
        return locationMatch;
      });
    }
  };