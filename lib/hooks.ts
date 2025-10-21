import { useState, useEffect } from 'react';

/**
 * Hook to detect if user is on a mobile device
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check user agent
    const userAgent = navigator.userAgent || navigator.vendor || (window as Window & { opera?: string }).opera || '';
    
    // Mobile device detection
    const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    const isMobileDevice = mobileRegex.test(userAgent);
    
    // Also check screen width as fallback
    const isSmallScreen = window.innerWidth < 768;
    
    // Check if device has camera support
    const hasMediaDevices = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    
    setIsMobile(isMobileDevice || (isSmallScreen && hasMediaDevices));

    // Listen for resize events
    const handleResize = () => {
      const isSmallScreen = window.innerWidth < 768;
      setIsMobile(isMobileDevice || (isSmallScreen && hasMediaDevices));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
}

