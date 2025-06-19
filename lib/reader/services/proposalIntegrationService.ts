// File: lib/reader/services/proposalIntegrationService.ts
import mockReaderService from './mockReaderService';

// This is a mock service that would be replaced with actual API calls
// to the News Proposals system in a real implementation
export const proposalIntegrationService = {
  // Get proposal details for an article
  getProposalDetailsForArticle: async (proposalId: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // For the MVP, we're using mock data
    // In a real implementation, this would call the News Proposals API
    return {
      proposalId: proposalId,
      fundingGoal: 0.75,
      fundingReceived: 0.75,
      contributorCount: 45,
      proposalDate: "2025-01-10T09:00:00Z",
      completionDate: "2025-04-15T16:00:00Z",
      proposalTitle: "Investigation into Miami-Dade County Water Quality",
      proposalSummary: "A three-month investigation into water quality across Miami-Dade County, with particular focus on areas near treatment facilities."
    };
  },
  
  // Get proposal summaries for the feed
  getActiveProposals: async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // For the MVP, we're using mock data
    // In a real implementation, this would call the News Proposals API
    return [
      {
        id: "proposal-001",
        title: "Investigation into Local School Funding Disparities",
        summary: "A data-driven analysis of funding differences between schools in different Miami neighborhoods.",
        proposer: "0x3d4e5f6g7h8i9j0k1l2m",
        proposerName: "Sarah Chen",
        proposerType: "Journalist", 
        createdAt: "2025-04-10T08:30:00Z",
        location: "Miami, Florida",
        category: "Education",
        status: "active",
        voteCount: 78,
        fundingAmount: 0.35,
        fundingGoal: 0.6,
        tags: ["education", "inequality", "local politics"]
      },
      {
        id: "proposal-002",
        title: "The Impact of Rising Sea Levels on Miami Real Estate",
        summary: "An investigation into how climate change is affecting property values and development in coastal areas.",
        proposer: "0x4e5f6g7h8i9j0k1l2m3n",
        proposerName: "Diego Vega",
        proposerType: "Journalist",
        createdAt: "2025-04-15T14:45:00Z",
        location: "Miami, Florida",
        category: "Environment",
        status: "active",
        voteCount: 112,
        fundingAmount: 0.45,
        fundingGoal: 0.8,
        tags: ["climate change", "real estate", "environment"]
      },
      {
        id: "proposal-003",
        title: "Local Tech Startups and Their Impact on Job Creation",
        summary: "A data-focused report on how the growing tech sector is influencing Miami's job market and economy.",
        proposer: "0x5f6g7h8i9j0k1l2m3n4o",
        proposerName: "Jamal Washington",
        proposerType: "Citizen",
        createdAt: "2025-04-18T11:20:00Z",
        location: "Miami, Florida",
        category: "Business",
        status: "active",
        voteCount: 65,
        fundingAmount: 0.2,
        fundingGoal: 0.5,
        tags: ["tech", "startups", "jobs", "local economy"]
      }
    ];
  }
};

export default proposalIntegrationService;