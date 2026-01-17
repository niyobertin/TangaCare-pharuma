import React from 'react';
import { Navigate, useLocation } from '@tanstack/react-router';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types/auth';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
    const { isAuthenticated, isLoading, user } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-healthcare-surface">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-healthcare-primary/20 border-t-healthcare-primary rounded-full animate-spin"></div>
                    <p className="text-healthcare-dark font-black text-sm animate-pulse">
                        VERIFYING SESSION...
                    </p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/auth/login" search={{ redirect: location.pathname }} />;
    }

    if (
        allowedRoles &&
        user &&
        !allowedRoles.some((role) => role.toUpperCase() === user.role.toUpperCase())
    ) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-healthcare-surface p-10">
                <div className="glass-card p-10 max-w-md w-full text-center space-y-4">
                    <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mx-auto">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-8 w-8"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                    </div>
                    <h2 className="text-xl font-black text-healthcare-dark">Access Denied</h2>
                    <p className="text-slate-500 text-sm">
                        You do not have the necessary permissions to access this pharmacy module.
                    </p>
                    <button
                        onClick={() => window.history.back()}
                        className="px-6 py-2 bg-healthcare-primary text-white rounded-lg text-xs font-black hover:bg-teal-700 transition-all shadow-md"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};
