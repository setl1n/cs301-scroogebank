// Environment configuration management
interface AppConfig {
  env: string;
  isProduction: boolean;
  isDevelopment: boolean;
  cognitoConfig: {
    authority: string;
    client_id: string;
    redirect_uri: string;
    response_type: string;
    scope: string;
    domain?: string; // Cognito domain name
  };
  apiBaseUrl: string;
}

// Default Cognito configuration
const cognitoRegion = 'ap-southeast-1';
const cognitoUserPoolId = 'ap-southeast-1_yb2KzXwYv';
// This client ID should be for a client WITHOUT a client secret (SPA client)
const cognitoClientId = import.meta.env.VITE_APP_COGNITO_CLIENT_ID || '3rvr3e49skqasnq9hmg8kvdq4n';
// Extract domain name from environment or use a default
const cognitoDomain = import.meta.env.VITE_APP_COGNITO_DOMAIN || 'cs301-g2-t1';

// Build configuration based on environment variables
const config: AppConfig = {
  env: import.meta.env.VITE_APP_ENV || 'development',
  isProduction: import.meta.env.VITE_APP_ENV === 'production',
  isDevelopment: import.meta.env.VITE_APP_ENV === 'development',
  
  
  cognitoConfig: {
    authority: `https://cognito-idp.${cognitoRegion}.amazonaws.com/${cognitoUserPoolId}`,
    client_id: cognitoClientId,
    redirect_uri: import.meta.env.VITE_APP_COGNITO_REDIRECT_URI || 'http://localhost:5173/login/oauth2/code/cognito',
    response_type: 'code',
    scope: 'email openid profile',
    domain: cognitoDomain,
  },
  
  apiBaseUrl: import.meta.env.VITE_APP_API_BASE_URL || 'http://localhost:8080',
};

export default config; 