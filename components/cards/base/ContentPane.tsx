// components/cards/base/ContentPane.tsx

import React from 'react';
import styles from './ContentPane.module.css'; // Add this import
import { ContentPaneProps } from '../../../lib/engagement/types/cardTypes';
import LocationTag from '../common/LocationTag';

interface ExtendedContentPaneProps extends ContentPaneProps {
  onClick?: () => void;
}

const ContentPane: React.FC<ExtendedContentPaneProps> = ({
  id,
  title,
  summary,
  imageUrl,
  createdAt,
  location,
  category,
  tags,
  badges = [],
  actionButtons = [],
  className = '',
  onClick,
}) => {
  return (
    <div className={`${styles.contentPane} ${className}`} onClick={onClick}>
      {/* Action Icons */}
      {actionButtons.length > 0 && (
        <div className={styles.contentActions}>
          {actionButtons.map((button, index) => (
            <React.Fragment key={`action-${index}`}>{button}</React.Fragment>
          ))}
        </div>
      )}

      {/* Image */}
{imageUrl && (
  <img 
    src={imageUrl} 
    alt={title} 
    className={styles.contentImage} // Change from "content-image" to styles.contentImage
  />
)}

      {/* Title */}
      <h2>{title}</h2>

      {/* Summary */}
      <p>{summary}</p>

      {/* Metadata */}
      <div className={styles.metadata}>
        <span>{createdAt}</span>
        {category && <span>{category}</span>}
        
        {/* Location Tag */}
        {location && (
          <span className={styles.locationTag}>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="12" 
              height="12" 
              fill="currentColor" 
              viewBox="0 0 16 16"
            >
              <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" />
            </svg>
            #{location.city}
          </span>
        )}
        
        {/* Badges */}
        {badges.map((badge, index) => (
          <React.Fragment key={`badge-${index}`}>{badge}</React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default ContentPane;