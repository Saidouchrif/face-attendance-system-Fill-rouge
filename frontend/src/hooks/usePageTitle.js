import { useEffect } from 'react';

/**
 * Hook to update the page title dynamically
 * @param {string} title - The page title to set
 */
export const usePageTitle = (title) => {
  useEffect(() => {
    document.title = title;
  }, [title]);
};
