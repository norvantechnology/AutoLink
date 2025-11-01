import { useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import axios from 'axios';

/**
 * Email Click Tracker Component
 * Automatically tracks email clicks when users land on site with tracking params
 */
function EmailClickTracker() {
  const [searchParams] = useSearchParams();
  const location = useLocation();

  useEffect(() => {
    const trackEmailClick = async () => {
      // Get tracking parameters from URL
      const email = searchParams.get('email');
      const source = searchParams.get('source');
      const campaign = searchParams.get('campaign');
      const ts = searchParams.get('ts');

      // Only track if email parameter exists (from email campaign)
      if (email && source === 'email') {
        try {
          // Determine landing page
          let page = 'home';
          if (location.pathname.includes('/signup')) page = 'signup';
          else if (location.pathname.includes('/login')) page = 'login';
          else if (location.pathname.includes('/app')) page = 'dashboard';

          // Send tracking data to backend
          await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/email-tracking/click`, {
            email,
            source,
            campaign,
            ts,
            page
          });

          // Remove tracking params from URL (clean URL for user)
          const newParams = new URLSearchParams(searchParams);
          newParams.delete('email');
          newParams.delete('source');
          newParams.delete('campaign');
          newParams.delete('ts');
          
          // Update URL without reloading
          const newSearch = newParams.toString();
          const newUrl = newSearch ? `${location.pathname}?${newSearch}` : location.pathname;
          window.history.replaceState({}, '', newUrl);

        } catch (error) {
          // Silent fail - don't break user experience
          console.error('Email tracking failed:', error);
        }
      }
    };

    trackEmailClick();
  }, [searchParams, location]);

  // This component doesn't render anything
  return null;
}

export default EmailClickTracker;

