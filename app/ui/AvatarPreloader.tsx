'use client';

import { useEffect } from 'react';
import { preloadAvatars } from '../../utils/avatar';

/**
 * Client component that preloads avatar images after the page loads
 * This runs after initial page load to avoid blocking critical resources
 */
export function AvatarPreloader() {
  useEffect(() => {
    // Use requestIdleCallback if available, or setTimeout as fallback
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => preloadAvatars(), { timeout: 2000 });
    } else {
      setTimeout(preloadAvatars, 1000);
    }
  }, []);

  // This component doesn't render anything
  return null;
}
