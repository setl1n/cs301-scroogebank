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
  async get(endpoint: string) {
    const response = await fetch(`${config.apiBaseUrl}${endpoint}`, {
      method: 'GET',
      headers: new Headers(defaultOptions.headers),
      credentials: 'include', // Explicitly include credentials for cookies
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    return response.json();
  },
  
  // POST request
  async post(endpoint: string, data: any) {
    const response = await fetch(`${config.apiBaseUrl}${endpoint}`, {
      method: 'POST',
      headers: new Headers(defaultOptions.headers),
      credentials: 'include', // Explicitly include credentials for cookies
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    return response.json();
  },
  
  // PUT request
  async put(endpoint: string, data: any) {
    const response = await fetch(`${config.apiBaseUrl}${endpoint}`, {
      method: 'PUT',
      headers: new Headers(defaultOptions.headers),
      credentials: 'include', // Explicitly include credentials for cookies
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    return response.json();
  },
  
  // DELETE request
  async delete(endpoint: string) {
    const response = await fetch(`${config.apiBaseUrl}${endpoint}`, {
      method: 'DELETE',
      headers: new Headers(defaultOptions.headers),
      credentials: 'include', // Explicitly include credentials for cookies
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    return response.status === 204 ? null : response.json();
  }
};