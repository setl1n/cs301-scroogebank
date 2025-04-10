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
  };
  apiBaseUrl: string;
}

// Default Cognito configuration
const cognitoRegion = 'ap-southeast-1';
const cognitoUserPoolId = 'ap-southeast-1_yb2KzXwYv';
const cognitoClientId = 'c4f3n7qokjeljtf8al4bsb3t';

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
  },
  
  apiBaseUrl: import.meta.env.VITE_APP_API_BASE_URL || 'http://localhost:8080',
};

export default config; 