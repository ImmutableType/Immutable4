// File: components/reader/FilterBar.tsx
import React, { useState } from 'react';
import { FeedFilters } from '../../lib/reader/types/feed';

interface FilterBarProps {
  filters: FeedFilters;
  onFilterChange: (filters: FeedFilters) => void;
  categories: string[];
  locations: string[];
}

const FilterBar: React.FC<FilterBarProps> = ({ 
  filters, 
  onFilterChange, 
  categories, 
  locations 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleContentTypeChange = (contentType: 'all' | 'articles' | 'proposals') => {
    onFilterChange({
      ...filters,
      contentType
    });
  };

  const handleCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({
      ...filters,
      category: event.target.value || undefined
    });
  };

  const handleLocationChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({
      ...filters,
      location: event.target.value || undefined
    });
  };

  const handleTagChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...filters,
      tag: event.target.value || undefined
    });
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div style={{
      padding: '1rem',
      backgroundColor: 'var(--color-white)',
      borderBottom: '1px solid var(--color-digital-silver)',
      marginBottom: '1.5rem'
    }}>
      {/* Content Type Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--color-digital-silver)',
        marginBottom: '1rem'
      }}>
        <div 
          onClick={() => handleContentTypeChange('all')}
          style={{
            padding: '0.5rem 1rem',
            cursor: 'pointer',
            fontFamily: 'var(--font-ui)',
            fontWeight: filters.contentType === 'all' ? 600 : 400,
            borderBottom: filters.contentType === 'all' ? '2px solid var(--color-typewriter-red)' : 'none',
            marginBottom: filters.contentType === 'all' ? '-1px' : '0'
          }}
        >
          All Content
        </div>
        <div 
          onClick={() => handleContentTypeChange('articles')}
          style={{
            padding: '0.5rem 1rem',
            cursor: 'pointer',
            fontFamily: 'var(--font-ui)',
            fontWeight: filters.contentType === 'articles' ? 600 : 400,
            borderBottom: filters.contentType === 'articles' ? '2px solid var(--color-typewriter-red)' : 'none',
            marginBottom: filters.contentType === 'articles' ? '-1px' : '0'
          }}
        >
          News Only
        </div>
        <div 
          onClick={() => handleContentTypeChange('proposals')}
          style={{
            padding: '0.5rem 1rem',
            cursor: 'pointer',
            fontFamily: 'var(--font-ui)',
            fontWeight: filters.contentType === 'proposals' ? 600 : 400,
            borderBottom: filters.contentType === 'proposals' ? '2px solid var(--color-typewriter-red)' : 'none',
            marginBottom: filters.contentType === 'proposals' ? '-1px' : '0'
          }}
        >
          Active Proposals
        </div>
        <div style={{ flex: 1 }} />
        <div 
          onClick={toggleExpanded}
          style={{
            padding: '0.5rem 1rem',
            cursor: 'pointer',
            fontFamily: 'var(--font-ui)',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          {isExpanded ? 'Hide Filters' : 'Show Filters'}
          <span style={{ marginLeft: '0.5rem' }}>
            {isExpanded ? '▲' : '▼'}
          </span>
        </div>
      </div>

      {/* Advanced Filters */}
      {isExpanded && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '1rem',
          marginTop: '1rem'
        }}>
          <div>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontFamily: 'var(--font-ui)',
              fontSize: '0.85rem'
            }}>
              Category
            </label>
            <select 
              value={filters.category || ''}
              onChange={handleCategoryChange}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid var(--color-digital-silver)',
                borderRadius: '4px',
                fontFamily: 'var(--font-ui)',
                fontSize: '0.9rem'
              }}
            >
              <option value="">All Categories</option>
              {categories.map((category, index) => (
                <option key={index} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontFamily: 'var(--font-ui)',
              fontSize: '0.85rem'
            }}>
              Location
            </label>
            <select 
              value={filters.location || ''}
              onChange={handleLocationChange}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid var(--color-digital-silver)',
                borderRadius: '4px',
                fontFamily: 'var(--font-ui)',
                fontSize: '0.9rem'
              }}
            >
              <option value="">All Locations</option>
              {locations.map((location, index) => (
                <option key={index} value={location}>{location}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontFamily: 'var(--font-ui)',
              fontSize: '0.85rem'
            }}>
              Tag
            </label>
            <input 
              type="text"
              value={filters.tag || ''}
              onChange={handleTagChange}
              placeholder="Filter by tag"
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid var(--color-digital-silver)',
                borderRadius: '4px',
                fontFamily: 'var(--font-ui)',
                fontSize: '0.9rem'
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterBar;