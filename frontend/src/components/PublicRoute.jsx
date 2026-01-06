import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * PublicRoute component - For public routes (login, forgot password, etc.)
 * Uses AuthContext to check authentication status
 * Redirects to /dashboard if user is already authenticated
 */
export default function PublicRoute({ children }) {
    const { isAuthenticated, isLoading } = useAuth();

    // Show loading state while checking authentication
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-people-gold mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    // Redirect to dashboard if already authenticated
    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    // Render public content if not authenticated
    return children;
}

