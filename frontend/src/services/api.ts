import config from '../config';
import type { AuthContextProps } from 'react-oidc-context';

// Default request options
const defaultOptions = {
  headers: {
    'Content-Type': 'application/json',
  },
};

// Helper function to get access token from auth context
const getAccessToken = (auth?: AuthContextProps): string | null => {
  if (!auth?.isAuthenticated || !auth.user) {
    console.log('Auth not authenticated or no user object');
    return null;
  }
  
  // react-oidc-context stores the user as a special object
  // We need to try different approaches to get the token
  
  // Try direct property access first
  if (auth.user.access_token) {
    return auth.user.access_token;
  }
  
  // Use string indexer as a fallback - the access_token might be accessed this way
  try {
    const user = auth.user as any;
    if (user['access_token']) {
      return user['access_token'];
    }
    
    // Some implementations might store it as a getter
    if (typeof user.accessToken === 'string') {
      return user.accessToken;
    }
    
    // Last resort - log the object to help with debugging
    console.log('All user object keys:', Object.keys(user));
    console.log('User object:', user);
  } catch (error) {
    console.error('Error extracting token:', error);
  }
  
  return null;
};

// Core API functions
export const api = {
  // GET request
  async get(endpoint: string, auth?: AuthContextProps) {
    const headers = new Headers(defaultOptions.headers);
    
    // Add Authorization header if auth is provided and user is authenticated
    const token = getAccessToken(auth);
    if (token) {
      headers.append('Authorization', `Bearer ${token}`);
    }
    
    console.log('Auth object:', auth?.isAuthenticated);
    console.log('Authorization header:', headers.get('Authorization'));
    
    const response = await fetch(`${config.apiBaseUrl}${endpoint}`, {
      method: 'GET',
      headers,
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    return response.json();
  },
  
  // POST request
  async post<T>(endpoint: string, data: T, auth?: AuthContextProps) {
    const headers = new Headers(defaultOptions.headers);
    
    // Add Authorization header if auth is provided and user is authenticated
    const token = getAccessToken(auth);
    if (token) {
      headers.append('Authorization', `Bearer ${token}`);
    }
    
    const response = await fetch(`${config.apiBaseUrl}${endpoint}`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    // Check content type to determine how to handle the response
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    } else {
      // For text responses (like in the case of image upload request)
      return response.text();
    }
  },
  
  // PUT request
  async put<T>(endpoint: string, data: T, auth?: AuthContextProps) {
    const headers = new Headers(defaultOptions.headers);
    
    // Add Authorization header if auth is provided and user is authenticated
    const token = getAccessToken(auth);
    if (token) {
      headers.append('Authorization', `Bearer ${token}`);
    }
    
    const response = await fetch(`${config.apiBaseUrl}${endpoint}`, {
      method: 'PUT',
      headers,
      credentials: 'include',
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    return response.json();
  },
  
  // DELETE request
  async delete(endpoint: string, auth?: AuthContextProps) {
    const headers = new Headers(defaultOptions.headers);
    
    // Add Authorization header if auth is provided and user is authenticated
    const token = getAccessToken(auth);
    if (token) {
      headers.append('Authorization', `Bearer ${token}`);
    }
    
    const response = await fetch(`${config.apiBaseUrl}${endpoint}`, {
      method: 'DELETE',
      headers,
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    return response.status === 204 ? null : response.json();
  }
};