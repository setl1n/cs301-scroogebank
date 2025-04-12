import { useAuth } from 'react-oidc-context';
import { Navigate, useLocation } from 'react-router-dom';
import { hasGroupAccess } from '@/utils/auth';
import { ReactNode } from 'react';
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: string[];
}

const ProtectedRoute = ({ children, requiredRoles }: ProtectedRouteProps) => {
  const auth = useAuth();
  const location = useLocation();

  // Show loading state while auth is initializing
  if (auth.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black dark">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!auth.isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If roles are required, check if user has necessary permissions
  if (requiredRoles && requiredRoles.length > 0) {
    const hasAccess = hasGroupAccess(auth, requiredRoles);
    
    if (!hasAccess) {
      // Redirect to unauthorized page or home
      return <Navigate to="/unauthorized" state={{ from: location }} replace />;
    }
  }

  // If authenticated and authorized, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute; 