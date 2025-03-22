import { useState, useEffect, useCallback, useRef } from 'react';

export function useFullscreenControls(hideDelay = 3000) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  let timeout = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timeout.current);
      timeout.current = setTimeout(() => setShowControls(false), hideDelay);
    };

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      clearTimeout(timeout.current);
    };
  }, [hideDelay]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);

  return {
    isFullscreen,
    showControls,
    toggleFullscreen,
  };
}
