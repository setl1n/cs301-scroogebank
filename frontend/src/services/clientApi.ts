import { api } from './api';
import { AuthContextProps } from 'react-oidc-context';

// Base endpoint for client API
const CLIENT_ENDPOINT = '/clients';

// Interface for the client data
interface Client {
  id?: number;
  name: string;
  email: string;
  // Add other client properties as needed
  [key: string]: unknown; // Add index signature to make it compatible with Record<string, unknown>
}

export const clientApi = {
  // Get all clients
  getAllClients: (auth: AuthContextProps | null = null) => {
    return api.get(CLIENT_ENDPOINT, auth);
  },
  
  // Get client by ID
  getClientById: (id: number, auth: AuthContextProps | null = null) => {
    return api.get(`${CLIENT_ENDPOINT}/${id}`, auth);
  },
  
  // Create a new client
  createClient: (client: Client, auth: AuthContextProps | null = null) => {
    return api.post(CLIENT_ENDPOINT, client, auth);
  },
  
  // Update an existing client
  updateClient: (id: number, client: Client, auth: AuthContextProps | null = null) => {
    return api.put(`${CLIENT_ENDPOINT}/${id}`, client, auth);
  },
  
  // Delete a client
  deleteClient: (id: number, auth: AuthContextProps | null = null) => {
    return api.delete(`${CLIENT_ENDPOINT}/${id}`, auth);
  },
  
  // Request image upload
  requestImageUpload: (id: number, auth: AuthContextProps | null = null) => {
    return api.post(`${CLIENT_ENDPOINT}/${id}/request-image-upload`, {}, auth);
  }
};