import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * ProtectedRoute component - Protects routes that require authentication
 * Uses AuthContext to check authentication status
 * Redirects to /login if user is not authenticated
 */
export default function ProtectedRoute({ children }) {
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

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Render protected content if authenticated
    return children;
}

