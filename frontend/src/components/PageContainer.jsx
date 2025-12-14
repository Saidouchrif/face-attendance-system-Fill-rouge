import React from 'react';

/**
 * Standard container for admin pages
 * Provides consistent padding and max-width without double spacing
 */
const PageContainer = ({ children, className = '' }) => {
  return (
    <div className={`max-w-7xl mx-auto px-6 lg:px-10 py-6 lg:py-8 ${className}`}>
      {children}
    </div>
  );
};

export default PageContainer;
