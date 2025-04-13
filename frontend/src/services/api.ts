import config from '../config';
import { AuthContextProps } from 'react-oidc-context';

// Default request options
const defaultOptions = {
  headers: {
    'Content-Type': 'application/json',
  },
};

// Helper function to get token from auth context
const getToken = (auth: AuthContextProps | null): string | null => {
  if (!auth || !auth.isAuthenticated || !auth.user) {
    return null;
  }
  return auth.user.access_token;
};

// Core API functions
export const api = {
  // GET request
  async get<T>(endpoint: string, auth: AuthContextProps | null = null): Promise<T> {
    const headers = new Headers(defaultOptions.headers);
    
    // Add Authorization header if auth is provided
    if (auth) {
      const token = getToken(auth);
      if (token) {
        headers.append('Authorization', `Bearer ${token}`);
      }
    }
    
    console.log('Request headers:', headers.get('Authorization'));
    
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
  async post<T>(endpoint: string, data: Record<string, unknown>, auth: AuthContextProps | null = null): Promise<T> {
    const headers = new Headers(defaultOptions.headers);
    
    // Add Authorization header if auth is provided
    if (auth) {
      const token = getToken(auth);
      if (token) {
        headers.append('Authorization', `Bearer ${token}`);
      }
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
    
    return response.json();
  },
  
  // PUT request
  async put<T>(endpoint: string, data: Record<string, unknown>, auth: AuthContextProps | null = null): Promise<T> {
    const headers = new Headers(defaultOptions.headers);
    
    // Add Authorization header if auth is provided
    if (auth) {
      const token = getToken(auth);
      if (token) {
        headers.append('Authorization', `Bearer ${token}`);
      }
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
  async delete<T>(endpoint: string, auth: AuthContextProps | null = null): Promise<T | null> {
    const headers = new Headers(defaultOptions.headers);
    
    // Add Authorization header if auth is provided
    if (auth) {
      const token = getToken(auth);
      if (token) {
        headers.append('Authorization', `Bearer ${token}`);
      }
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