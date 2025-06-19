// app/(client)/locations/florida/miami/journalists/[slug]/page.tsx
import React from 'react';
import { notFound } from 'next/navigation';
import Head from 'next/head';
import { LocationJournalistSchema } from '../../../../../../../components/locations/schema/LocationJournalistSchema';
import { urlOptimizer } from '../../../../../../../lib/locations/seo/urlOptimizer';
import { useProfile } from '../../../../../../../lib/profile/hooks/useProfile';
import { schemaGenerator } from '../../../../../../../lib/locations/seo/schemaGenerator';
import { metadataService } from '../../../../../../../lib/locations/seo/metadataService';
import { useLocationArticles } from '../../../../../../../lib/locations/hooks/useLocationArticles';
import ArticleCard from '@/components/cards/types/ArticleCard';

interface JournalistPageProps {
  params: {
    slug: string;
  };
}

export default function JournalistPage({ params }: JournalistPageProps) {
  // Extract the profile ID from the slug
  const profileId = urlOptimizer.extractIdFromSlug(params.slug);
  // Use the existing hook to fetch profile details
  const { profile, isLoading, error } = useProfile(profileId);
  if (isLoading) return <div>Loading journalist profile...</div>;
  if (error) return <div>Error loading profile: {error.message}</div>;
  if (!profile) return notFound();
  // Constants
  const city = 'Miami';
  const state = 'Florida';
  
  // Get articles by this journalist for Miami
  const { articles } = useLocationArticles(city, state, {});
  const journalistArticles = articles.filter(article => article.author === profile.id);
  // Get SEO metadata
  const metadata = metadataService.getLocationPageMetadata(city, state, 'journalists', profile.displayName || '');
  
  return (
    <>
      <Head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        <link rel="canonical" href={metadata.canonical} />
        <meta property="og:title" content={metadata.title} />
        <meta property="og:description" content={metadata.description} />
        <meta property="og:image" content={profile.avatarUrl || metadata.ogImage} />
        <meta property="og:type" content="profile" />
        <meta property="og:url" content={metadata.canonical} />
        
        {/* Add JSON-LD structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schemaGenerator.generateBreadcrumbSchema(
              city, state, 'journalists', profile.displayName
            ))
          }}
        />
      </Head>
      
      <div className="journalist-profile-page">
        <div className="profile-header">
        {profile.avatarUrl && (
  <img 
    src={profile.avatarUrl} 
    alt={profile.displayName}
    className="profile-image"
    width={200}
    height={200}
  />
)}
          <div className="profile-info">
            <h1 className="profile-name">{profile.displayName}</h1>
            
            <div className="profile-locations">
              <h3>Coverage Areas:</h3>
              <ul>
                {profile.locations?.coverage?.map((coverage: any, index: number) => (
                  <li key={index}>
                    {coverage.city}, {coverage.state} - {coverage.expertise}
                  </li>
                ))}
              </ul>
            </div>
            
            {profile.bio && (
              <div className="profile-bio">
                <h3>About:</h3>
                <p>{profile.bio}</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="journalist-articles">
          <h2>Recent Articles by {profile.displayName} in Miami</h2>
          
          {journalistArticles.length === 0 ? (
            <p>No recent articles found for Miami.</p>
          ) : (
            <div className="articles-grid">
              {journalistArticles.map(article => (
               
<ArticleCard 
  key={article.id}
  id={article.id}
  title={article.title}
  summary={article.summary}
  imageUrl={article.imageUrl}
  author={{
    name: article.author || article.authorName,
    id: article.authorId || article.author || '',
    type: article.authorType as 'Journalist' | 'Citizen' | 'Organization'
  }}
  location={{
    city: article.location?.split(', ')[0] || article.location || '',
    state: article.location?.split(', ')[1] || ''
  }}
  category={article.category}
  createdAt={article.createdAt}
  onClick={() => {
    // Handle click - you might need to add navigation logic here
    console.log('Article clicked:', article.id);
  }}
/>


              ))}
            </div>
          )}
        </div>
        
        {/* Add structured data for this journalist */}
        <LocationJournalistSchema 
          journalists={[profile]} 
          city={city} 
          state={state} 
        />
      </div>
    </>
  );
}