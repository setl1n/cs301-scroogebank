import { useAuth } from 'react-oidc-context';
import { useEffect } from 'react';
import config from '../../config';

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
    return <div className="min-h-screen flex items-center justify-center bg-secondary-900">Loading...</div>;
  }

  if (auth.isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-900 p-4">
        <div className="max-w-md w-full space-y-8 bg-secondary-800 p-8 rounded-lg">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Welcome</h1>
            <p className="text-secondary-200 mb-4">You are logged in as {auth.user?.profile.email}</p>
            <button 
              onClick={() => auth.removeUser()}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-900 p-4">
      <div className="max-w-md w-full space-y-8 bg-secondary-800 p-8 rounded-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Login</h1>
          <p className="text-secondary-200 mb-4">Please sign in with your Cognito credentials</p>
          {auth.error && (
            <div className="bg-red-600 text-white p-3 mb-4 rounded">
              Error: {auth.error.message}
            </div>
          )}
          <button 
            onClick={handleLoginClick}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Sign In with Cognito
          </button>
          {config.isDevelopment && (
            <div className="mt-4 p-3 border border-secondary-700 rounded text-left text-xs text-secondary-300">
              <p className="font-bold">Debug Info:</p>
              <p>Environment: {config.env}</p>
              <p>Redirect URI: {config.cognitoConfig.redirect_uri}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoginPage
