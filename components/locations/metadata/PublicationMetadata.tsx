// components/locations/metadata/PublicationMetadata.tsx
import React from 'react';
import { formatDistanceToNow } from 'date-fns';

interface PublicationMetadataProps {
  createdAt: string;
  updatedAt?: string;
  author: string;
  authorType: string;
  location: string;
  category: string;
}

const PublicationMetadata: React.FC<PublicationMetadataProps> = ({
  createdAt,
  updatedAt,
  author,
  authorType,
  location,
  category
}) => {
  const publishDate = new Date(createdAt);
  const updateDate = updatedAt ? new Date(updatedAt) : null;
  const isUpdated = updateDate && updateDate > publishDate;
  
  return (
    <div className="publication-metadata">
      <div className="metadata-row">
        <time dateTime={publishDate.toISOString()}>
          Published: {publishDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZoneName: 'short'
          })}
        </time>
        <span className="timeago">({formatDistanceToNow(publishDate, { addSuffix: true })})</span>
      </div>
      
      {isUpdated && (
        <div className="metadata-row">
          <time dateTime={updateDate!.toISOString()}>
            Updated: {updateDate!.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              timeZoneName: 'short'
            })}
          </time>
          <span className="timeago">({formatDistanceToNow(updateDate!, { addSuffix: true })})</span>
        </div>
      )}
      
      <div className="metadata-row">
        <span className="author-type">{authorType}</span>
        <span className="author">{author}</span>
        <span className="location">{location}</span>
        <span className="category">{category}</span>
      </div>
    </div>
  );
};

export default PublicationMetadata;