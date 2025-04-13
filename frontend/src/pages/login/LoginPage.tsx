import { useAuth } from 'react-oidc-context';
import { useEffect } from 'react';
import config from '../../config';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { signOutWithCognito } from '@/utils/auth';

const LoginPage = () => {
  const auth = useAuth();

  // Handler for login button click
  const handleLoginClick = () => {
    console.log('Attempting to sign in with config:', config.cognitoConfig);
    auth.signinRedirect().catch(error => {
      console.error('Login redirect error:', error);
    });
  };

  // Log auth state changes for debugging
  useEffect(() => {
    if (config.isDevelopment) {
      console.log('Auth state:', { 
        isLoading: auth.isLoading,
        isAuthenticated: auth.isAuthenticated,
        user: auth.user,
        error: auth.error
      });
    }
    
    // Handle auth errors
    if (auth.error) {
      console.error('Authentication error:', auth.error);
    }
  }, [auth.isLoading, auth.isAuthenticated, auth.error, auth.user]);

  // Check if user is already authenticated
  if (auth.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black dark">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (auth.isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black p-4 dark">
        <Card className="max-w-md w-full bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-center text-white">Welcome</CardTitle>
            <CardDescription className="text-center text-zinc-400">
              You are logged in as {auth.user?.profile.email}
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button 
              variant="destructive" 
              className="w-full" 
              onClick={() => signOutWithCognito(auth)}
            >
              Sign Out
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4 dark">
      <Card className="max-w-md w-full bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-center text-white">Login</CardTitle>
          <CardDescription className="text-center text-zinc-400">
            Please sign in with your Cognito credentials
          </CardDescription>
        </CardHeader>
        <CardContent>
          {auth.error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>
                Error: {auth.error.message}
              </AlertDescription>
            </Alert>
          )}
          <Button 
            className="w-full" 
            onClick={handleLoginClick}
          >
            Sign In with Cognito
          </Button>
        </CardContent>
        {config.isDevelopment && (
          <CardFooter className="flex flex-col items-start text-xs text-zinc-500">
            <p className="font-bold">Debug Info:</p>
            <p>Environment: {config.env}</p>
            <p>Redirect URI: {config.cognitoConfig.redirect_uri}</p>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}

export default LoginPage;
