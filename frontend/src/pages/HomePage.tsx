import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "react-oidc-context";
import { hasGroupAccess } from "@/utils/auth";
import { Loader2 } from "lucide-react";

const HomePage = () => {
  const auth = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (auth.isAuthenticated) {
      // Check user roles and redirect accordingly
      if (hasGroupAccess(auth, ['ADMIN'])) {
        navigate('/admin');
      } else if (hasGroupAccess(auth, ['AGENT'])) {
        navigate('/agent');
      } else {
        // User doesn't have any recognized role
        // Could redirect to a default dashboard or profile page
        navigate('/login');
      }
    } else if (!auth.isLoading) {
      // Not authenticated and not loading, redirect to login
      navigate('/login');
    }
  }, [auth.isAuthenticated, auth.isLoading, navigate, auth]);

  // Show loading while checking authentication
  return (
    <div className="min-h-screen flex items-center justify-center bg-black dark">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
};

export default HomePage; 