import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        // Scroll to top immediately without smooth scrolling
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        
        // Also force document scroll for Lenis compatibility
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
    }, [pathname]);

    return null;
};
