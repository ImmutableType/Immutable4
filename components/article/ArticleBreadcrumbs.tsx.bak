// components/article/ArticleBreadcrumbs.tsx (UPDATE)
'use client';
import React from 'react';
import { Article } from '../../lib/reader/types/article';
import { urlOptimizer } from '../../lib/locations/seo/urlOptimizer';

interface BreadcrumbItem {
  label: string;
  href: string | null;
}

interface ArticleBreadcrumbsProps {
  city: string;
  state: string;
  category: string;
  article: Article;
}

const ArticleBreadcrumbs: React.FC<ArticleBreadcrumbsProps> = ({ 
  city, 
  state, 
  category, 
  article 
}) => {
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Reader', href: '/reader' },
    { 
      label: `${state.charAt(0).toUpperCase() + state.slice(1)}`, 
      href: `/locations/${state.toLowerCase()}` // ✅ Fixed: Points to existing Florida page
    },
    { 
      label: `${city.charAt(0).toUpperCase() + city.slice(1)}, ${state.toUpperCase()}`, 
      href: `/locations/${state.toLowerCase()}/${city.toLowerCase()}` 
    },
    { label: urlOptimizer.getCategoryDisplayName(category), href: null },
    { label: article.title, href: null }
  ];

  return (
    <nav 
      style={{
        marginBottom: '2rem',
        fontSize: '0.9rem',
        color: 'var(--color-digital-silver)'
      }}
      aria-label="Breadcrumb"
    >
      <ol style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '0.5rem',
        listStyle: 'none',
        margin: 0,
        padding: 0
      }}>
        {breadcrumbs.map((crumb: BreadcrumbItem, index: number) => (
          <li key={index} style={{ display: 'flex', alignItems: 'center' }}>
            {index > 0 && (
              <span style={{ 
                margin: '0 0.5rem',
                color: 'var(--color-digital-silver)'
              }}>
                →
              </span>
            )}
            {crumb.href ? (
              <a 
                href={crumb.href}
                style={{
                  color: 'var(--color-blockchain-blue)',
                  textDecoration: 'none'
                }}
                onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'}
                onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
              >
                {crumb.label}
              </a>
            ) : (
              <span style={{ 
                color: 'var(--color-black)',
                fontWeight: '500',
                wordBreak: 'break-word'
              }}>
                {crumb.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default ArticleBreadcrumbs;