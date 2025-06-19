// lib/mockData/cards.ts

// Test data for articles
export const mockArticles = [
    {
      id: 'article-1',
      title: 'Miami Announces New Climate Resilience Initiative',
      summary: 'The city of Miami unveiled a comprehensive climate resilience plan today, addressing sea level rise with innovative infrastructure projects and community preparedness measures...',
      imageUrl: 'https://images.unsplash.com/photo-1616763355548-1b606f439f86?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      author: {
        name: 'Sarah Martinez',
        id: 'author-1',
        type: 'Journalist',
        stats: {
          written: 42,
          proposed: 12,
          location: 'Miami, FL'
        }
      },
      proposer: {
        name: 'MiamiWatch',
        id: 'proposer-1'
      },
      createdAt: '2025-05-02T12:00:00Z',
      location: {
        city: 'Miami',
        state: 'Florida'
      },
      category: 'Local News',
      tags: ['Climate', 'Infrastructure', 'Policy'],
      contentHash: 'QmT8Z9FMn5uWmDPJBnkKtL93Q8pXewTZR6Lyx7GBN7JMuN',
      metrics: {
        views: 1200,
        comments: 45,
        tips: 12,
        reactions: {
          '👍': 42,
          '👏': 28,
          '🔥': 15,
          '🤔': 7
        },
        supporters: 92
      },
      distribution: {
        author: 45,
        platform: 25,
        proposer: 30
      },
      isVerified: true
    },
    {
      id: 'article-2',
      title: 'Tech Conference Brings Innovation Leaders to Downtown',
      summary: 'The annual TechMiami conference attracted over 5,000 attendees this week, featuring keynotes from industry leaders and showcasing the city\'s growing tech ecosystem...',
      imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      author: {
        name: 'Carlos Rodriguez',
        id: 'author-2',
        type: 'Journalist',
        stats: {
          written: 67,
          proposed: 8,
          location: 'Miami, FL'
        }
      },
      createdAt: '2025-05-01T10:30:00Z',
      location: {
        city: 'Miami',
        state: 'Florida'
      },
      category: 'Technology',
      tags: ['TechConference', 'Innovation', 'Startups'],
      contentHash: 'QmZX7FMn5uWmDPJBnkKtL93Q8pXewTZR6Lyx7GBN7JMuN',
      metrics: {
        views: 2500,
        comments: 83,
        tips: 31,
        reactions: {
          '👍': 96,
          '👏': 54,
          '🔥': 32,
          '🤔': 11
        },
        supporters: 143
      },
      distribution: {
        author: 70,
        platform: 30
      },
      isVerified: true
    }
  ];
  
  // Test data for proposals
  export const mockProposals = [
    {
      id: 'proposal-1',
      title: 'Proposal: Investigation into Beach Erosion Solutions',
      summary: 'This investigation will explore cutting-edge solutions to beach erosion affecting Miami\'s coastline, including interviews with environmental experts and analysis of successful models from other coastal cities...',
      imageUrl: 'https://images.unsplash.com/photo-1595756471015-9c1676c5b636?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      proposer: {
        name: 'OceanGuardian',
        id: 'proposer-2',
        stats: {
          written: 5,
          proposed: 28,
          location: 'Miami, FL'
        }
      },
      createdAt: '2025-04-28T09:15:00Z',
      location: {
        city: 'Miami',
        state: 'Florida'
      },
      category: 'Environmental',
      tags: ['Beach', 'Erosion', 'Climate Change'],
      status: 'active',
      funding: {
        amount: 750,
        goal: 1000,
        percentage: 75
      },
      metrics: {
        reactions: {
          '👍': 38,
          '👏': 12,
          '🔥': 9,
          '🤔': 22
        },
        supporters: 81,
        journalistInterest: 3
      },
      distribution: {
        proposer: 60,
        platform: 40,
        futureAuthor: 0
      },
      contentHash: 'QmYZ7FMn5uWmDPJBnkKtL93Q8pXewTZR6Lyx7GBN7HFdG'
    },
    {
      id: 'proposal-2',
      title: 'Proposal: The Hidden History of Miami\'s Art Deco Architecture',
      summary: 'This story will uncover the lesser-known stories behind Miami Beach\'s iconic Art Deco buildings, including previously unpublished historical photographs and interviews with architectural historians...',
      imageUrl: 'https://images.unsplash.com/photo-1575548126547-15db4da535e9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      proposer: {
        name: 'HistoryDetective',
        id: 'proposer-3',
        stats: {
          written: 12,
          proposed: 16,
          location: 'Miami, FL'
        }
      },
      createdAt: '2025-04-25T14:30:00Z',
      location: {
        city: 'Miami',
        state: 'Florida'
      },
      category: 'History',
      tags: ['Architecture', 'Art Deco', 'Miami Beach'],
      status: 'active',
      funding: {
        amount: 500,
        goal: 800,
        percentage: 62.5
      },
      metrics: {
        reactions: {
          '👍': 24,
          '👏': 18,
          '🔥': 7,
          '🤔': 5
        },
        supporters: 54,
        journalistInterest: 2
      },
      distribution: {
        proposer: 60,
        platform: 40,
        futureAuthor: 0
      },
      contentHash: 'QmRZ7FMn5uWmDPJBnkKtL93Q8pXewTZR6Lyx7GBN7JMuN'
    }
  ];
  
  // Test data for community curated content
  export const mockCommunityContent = [
    {
      id: 'community-1',
      title: 'Miami Art Week Dates Announced for 2025',
      summary: 'The annual Miami Art Week will return December 1-6, 2025, featuring expanded programming and new venues throughout the city\'s growing arts districts...',
      imageUrl: 'https://images.unsplash.com/photo-1533106418989-88406c7cc8ca?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      submitter: {
        name: 'ArtLover305',
        id: 'user-1',
        stats: {
          curated: 45,
          reliability: 90,
          location: 'Miami, FL'
        }
      },
      sourceUrl: 'https://miamiartguide.com/art-week-2025',
      sourceName: 'miamiartguide.com',
      createdAt: '2025-05-03T08:45:00Z',
      sharedAt: '2025-05-04T11:20:00Z',
      location: {
        city: 'Miami',
        state: 'Florida'
      },
      category: 'Arts & Culture',
      tags: ['Art Week', 'Events', 'Art Basel'],
      voting: {
        upvotes: 87,
        downvotes: 12,
        percentage: 88
      },
      metrics: {
        reactions: {
          '👍': 32,
          '👏': 28,
          '🔥': 19,
          '🤔': 5
        },
        supporters: 84
      },
      distribution: {
        submitter: 70,
        platform: 30,
        total: 100
      },
      contentHash: 'QmA95FMn5uWmDPJBnkKtL93Q8pXewTZR6Lyx7GBN7KLmn'
    },
    {
      id: 'community-2',
      title: 'New Restaurant Row Coming to Downtown Miami',
      summary: 'City officials have approved plans for a new Restaurant Row development in downtown Miami, featuring 12 chef-driven concepts and a central event space...',
      imageUrl: 'https://images.unsplash.com/photo-1592861956120-e524fc739696?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      submitter: {
        name: 'FoodieExplorer',
        id: 'user-2',
        stats: {
          curated: 28,
          reliability: 85,
          location: 'Miami, FL'
        }
      },
      sourceUrl: 'https://miamieater.com/restaurant-row-2025',
      sourceName: 'miamieater.com',
      createdAt: '2025-05-02T15:30:00Z',
      sharedAt: '2025-05-02T16:05:00Z',
      location: {
        city: 'Miami',
        state: 'Florida'
      },
      category: 'Food & Dining',
      tags: ['Restaurants', 'Development', 'Downtown'],
      voting: {
        upvotes: 65,
        downvotes: 8,
        percentage: 89
      },
      metrics: {
        reactions: {
          '👍': 28,
          '👏': 16,
          '🔥': 22,
          '🤔': 3
        },
        supporters: 69
      },
      distribution: {
        submitter: 70,
        platform: 30,
        total: 100
      },
      contentHash: 'QmB95FMn5uWmDPJBnkKtL93Q8pXewTZR6Lyx7GBN7KLmn'
    }
  ];