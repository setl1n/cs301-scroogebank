import { log } from 'console';
import config from '../config';

// Default request options
const defaultOptions = {
  headers: {
    'Content-Type': 'application/json',
  },
};

// Core API functions
export const api = {
  // GET request
  async get(endpoint: string, useAlbAuth: boolean = false) {
    console.log('Cookies before request:', document.cookie);
    const headers = new Headers(defaultOptions.headers);
    
    // Add Authorization header for ALB-protected endpoints
    if (useAlbAuth) {
      const token = getCognitoToken();
      if (token) {
        headers.append('Authorization', `Bearer ${token}`);
      }
    }
    
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
  async post(endpoint: string, data: any, useAlbAuth: boolean = false) {
    const headers = new Headers(defaultOptions.headers);
    
    // Add Authorization header for ALB-protected endpoints
    if (useAlbAuth) {
      const token = getCognitoToken();
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
  async put(endpoint: string, data: any, useAlbAuth: boolean = false) {
    const headers = new Headers(defaultOptions.headers);
    
    // Add Authorization header for ALB-protected endpoints
    if (useAlbAuth) {
      const token = getCognitoToken();
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
  async delete(endpoint: string, useAlbAuth: boolean = false) {
    const headers = new Headers(defaultOptions.headers);
    
    // Add Authorization header for ALB-protected endpoints
    if (useAlbAuth) {
      const token = getCognitoToken();
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