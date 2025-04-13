import { useAuth } from 'react-oidc-context';
import { api } from '../services/api';

/**
 * Custom hook that combines the API service with the authentication context
 * Makes it easier to make authenticated API calls from components
 */
export function useApiAuth() {
  const auth = useAuth();
  
  return {
    // Pass auth context to all API methods
    get: (endpoint: string) => api.get(endpoint, auth),
    post: <T>(endpoint: string, data: T) => api.post(endpoint, data, auth),
    put: <T>(endpoint: string, data: T) => api.put(endpoint, data, auth),
    delete: (endpoint: string) => api.delete(endpoint, auth),
    
    // Expose auth state for convenience
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    user: auth.user,
    auth // Expose the full auth object in case it's needed
  };
} 