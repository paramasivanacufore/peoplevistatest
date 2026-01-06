import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NavigationGuard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    // Don't interfere during loading
    if (loading) return;

    const currentPath = location.pathname;
    
    // If user is authenticated and tries to access login/forgot password pages
    if (isAuthenticated && (currentPath === '/login' || currentPath === '/forgot-password' || currentPath === '/')) {
      // Replace the current history entry to prevent back navigation
      navigate('/dashboard', { replace: true });
      return;
    }

    // If user is not authenticated and tries to access protected routes
    // Only redirect if we're not already on a public route
    if (!isAuthenticated && !loading && 
        (currentPath === '/dashboard' || currentPath.startsWith('/attendance'))) {
      navigate('/login', { replace: true });
      return;
    }
  }, [isAuthenticated, loading, location.pathname, navigate]);

  // Prevent browser back button on authenticated pages
  useEffect(() => {
    if (!isAuthenticated || loading) return;

    const handlePopState = (event) => {
      const currentPath = window.location.pathname;
      
      // If user tries to go back to login/forgot password pages
      if (currentPath === '/login' || currentPath === '/forgot-password' || currentPath === '/') {
        event.preventDefault();
        navigate('/dashboard', { replace: true });
        return;
      }
    };

    // Add event listener
    window.addEventListener('popstate', handlePopState);

    // Cleanup
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isAuthenticated, loading, navigate]);

  // Push state to prevent back navigation on authenticated pages
  useEffect(() => {
    if (!isAuthenticated || loading) return;

    // Push a new state to prevent back navigation
    const pushState = () => {
      window.history.pushState(null, '', window.location.href);
    };

    // Initial push
    pushState();

    // Listen for popstate and handle accordingly
    const handlePopState = () => {
      const currentPath = window.location.pathname;
      
      if (currentPath === '/login' || currentPath === '/forgot-password' || currentPath === '/') {
        navigate('/dashboard', { replace: true });
      } else {
        // Push state again to prevent further back navigation
        pushState();
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isAuthenticated, loading, navigate]);

  return null; // This component doesn't render anything
};

export default NavigationGuard;
