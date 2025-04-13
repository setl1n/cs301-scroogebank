import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "react-oidc-context";
import { getUserGroups, hasGroupAccess } from "@/utils/auth";
import { Loader2 } from "lucide-react";
import config from "@/config";

const OAuthRedirectHandler = () => {
  const auth = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Wait for authentication to complete and user data to be available
    if (!auth.isLoading) {
      if (auth.isAuthenticated && auth.user) {
        const userGroups = getUserGroups(auth);
        
        if (config.isDevelopment) {
          console.log("Authentication successful, user info:", {
            isAuthenticated: auth.isAuthenticated,
            username: auth.user.profile?.['cognito:username'] || auth.user.profile?.email,
            groups: userGroups,
          });
        }
        
        // Check user roles and redirect
        if (hasGroupAccess(auth, ['ADMIN'])) {
          console.log("Redirecting to ADMIN dashboard");
          navigate('/admin');
        } else if (hasGroupAccess(auth, ['AGENT'])) {
          console.log("Redirecting to AGENT dashboard");
          navigate('/agent');
        } else {
          // If no specific role is found, redirect to a default page
          console.log("No specific role found for user, available groups:", userGroups);
          navigate('/login');
        }
      } else {
        // If authentication failed, redirect to login
        console.log("Authentication failed or incomplete");
        if (auth.error) {
          console.error("Auth error:", auth.error);
        }
        navigate('/login');
      }
    }
  }, [auth.isLoading, auth.isAuthenticated, auth.user, auth.error, navigate]);

  // Show loading spinner while processing
  return (
    <div className="min-h-screen flex items-center justify-center bg-black dark">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-white">Completing authentication...</p>
        {auth.error && (
          <p className="text-red-500 mt-2">Error: {auth.error.message}</p>
        )}
      </div>
    </div>
  );
};

export default OAuthRedirectHandler; 