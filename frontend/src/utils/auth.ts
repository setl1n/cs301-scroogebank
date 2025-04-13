import { AuthContextProps } from 'react-oidc-context';
import config from '../config';

/**
 * Authentication utilities for Cognito integration
 * This centralizes all auth-related functionality in one place
 */

/**
 * Initiates the sign-in flow by redirecting to Cognito login page
 * 
 * @param auth The auth context from useAuth()
 * @param customRedirectUri Optional URI to redirect after login (falls back to configured URI)
 */
export const signInWithCognito = (auth: AuthContextProps, customRedirectUri?: string) => {
  // Use the configured redirect URI or custom one if provided
  const redirectUri = customRedirectUri || config.cognitoConfig.redirect_uri;
  
  // Log the sign-in attempt in development
  if (config.isDevelopment) {
    console.log('Signing in with config:', config.cognitoConfig);
  }
  
  // Redirect to Cognito login
  auth.signinRedirect({
    redirect_uri: redirectUri
  }).catch(error => {
    console.error('Login redirect error:', error);
  });
};

/**
 * Alternative login method that directly redirects to Cognito hosted UI
 * This is useful when you need to bypass oidc-client handling
 */
export const redirectToCognitoLogin = () => {
  if (!config.cognitoConfig.domain) {
    console.error('Cognito domain is not configured. Cannot redirect to login page.');
    return;
  }

  const clientId = config.cognitoConfig.client_id;
  const redirectUri = config.cognitoConfig.redirect_uri;
  const region = 'ap-southeast-1';
  const domain = config.cognitoConfig.domain;
  
  // Construct the Cognito hosted UI URL
  const loginUrl = `https://${domain}.auth.${region}.amazoncognito.com/login?client_id=${clientId}&response_type=code&scope=${encodeURIComponent(config.cognitoConfig.scope)}&redirect_uri=${encodeURIComponent(redirectUri)}`;
  
  if (config.isDevelopment) {
    console.log('Redirecting to Cognito hosted UI:', loginUrl);
  }
  
  window.location.href = loginUrl;
};

/**
 * Properly signs out the user from Cognito by redirecting to the Cognito logout endpoint
 * This ensures both local state is cleared and the Cognito session is terminated
 * 
 * @param auth The auth context from useAuth()
 * @param customLogoutUri Optional custom logout URI (defaults to appropriate environment URL)
 */
export const signOutWithCognito = async (auth: AuthContextProps, customLogoutUri?: string) => {
  if (!config.cognitoConfig.domain) {
    console.error('Cognito domain is not configured. Performing local logout only.');
     await auth.removeUser();
    window.location.href = '/login';
    return;
  }

  // Get configuration values
  const clientId = config.cognitoConfig.client_id;
  const region = 'ap-southeast-1'; // Hard-coding region for now - ideally extract from config
  
  // Set the hardcoded production URL for logout redirect
  const productionLogoutUri = 'https://main-frontend.itsag2t1.com/login';
  
  // Use the production URL in production, or use localhost in development
  let defaultLogoutUri;
  if (config.isDevelopment) {
    const port = window.location.port || '5173'; // Default to 5173 if port is empty
    defaultLogoutUri = `http://localhost:${port}/login`;
  } else {
    defaultLogoutUri = productionLogoutUri;
  }
  
  // Use custom URI if provided, otherwise use default
  const finalLogoutUri = customLogoutUri || defaultLogoutUri;
  
  // First, remove user from local state
  await auth.removeUser();
  
  // Construct the Cognito domain directly
  const cognitoDomain = `https://${config.cognitoConfig.domain}.auth.${region}.amazoncognito.com`;
  
  // Log the sign-out process in development
  if (config.isDevelopment) {
    console.log('Signing out to:', {
      cognitoDomain,
      clientId,
      logoutUri: finalLogoutUri
    });
  }
  
  // Redirect to Cognito logout endpoint
  window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(finalLogoutUri)}`;
};

/**
 * Check if the user has the required group permissions
 * 
 * @param auth The auth context from useAuth()
 * @param allowedGroups Array of group names that are allowed
 * @returns Boolean indicating if user has access
 */
export const hasGroupAccess = (auth: AuthContextProps, allowedGroups?: string[]) => {
  if (!auth.isAuthenticated || !allowedGroups || allowedGroups.length === 0) {
    return false;
  }
  
  const userGroups = auth.user?.profile['cognito:groups'] || [];
  
  // Check if user has at least one of the required groups
  return Array.isArray(userGroups)
    ? userGroups.some(group => allowedGroups.includes(group))
    : allowedGroups.includes(userGroups as string);
};

/**
 * Get the user's Cognito groups/roles
 * 
 * @param auth The auth context from useAuth()
 * @returns Array of group names or empty array if not authenticated
 */
export const getUserGroups = (auth: AuthContextProps): string[] => {
  if (!auth.isAuthenticated || !auth.user) {
    return [];
  }
  
  const userGroups = auth.user.profile['cognito:groups'] || [];
  
  return Array.isArray(userGroups) ? userGroups : [userGroups as string];
};