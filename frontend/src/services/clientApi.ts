import { api } from './api';

// Interface for the client data
interface Client {
  id?: number;
  name: string;
  email: string;
  // Add other client properties as needed
}

export const clientApi = {
  // Get all clients
  getAllClients: () => {
    return api.get('/clients', true);
  },
  
  // Get client by ID
  getClientById: (id: number) => {
    return api.get(`/clients/${id}`, true);
  },
  
  // Create a new client
  createClient: (client: Client) => {
    return api.post('/clients', client, true);
  },
  
  // Update an existing client
  updateClient: (id: number, client: Client) => {
    return api.put(`/clients/${id}`, client, true);
  },
  
  // Delete a client
  deleteClient: (id: number) => {
    return api.delete(`/clients/${id}`, true);
  },
  
  // Request image upload
  requestImageUpload: (id: number) => {
    return api.post(`/clients/${id}/request-image-upload`, {}, true);
  }
};