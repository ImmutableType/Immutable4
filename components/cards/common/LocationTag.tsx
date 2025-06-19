// components/cards/common/LocationTag.tsx

import React from 'react';

interface LocationTagProps {
  city: string;
  state?: string;
  neighborhood?: string;
  className?: string;
}

const LocationTag: React.FC<LocationTagProps> = ({
  city,
  state,
  neighborhood,
  className = '',
}) => {
  const displayLocation = neighborhood ? `${neighborhood}, ${city}` : city;
  
  return (
    <span className={`location-tag ${className}`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="12"
        height="12"
        fill="currentColor"
        viewBox="0 0 16 16"
      >
        <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" />
      </svg>
      #{displayLocation}
    </span>
  );
};

export default LocationTag;